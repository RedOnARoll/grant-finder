import { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { anthropic } from "@/lib/anthropic"
import { rateLimit, getClientIp, tooManyRequests, checkPayloadSize, sanitizeString } from "@/lib/rate-limit"

export const maxDuration = 30

interface GuidelineSection {
  heading: string
  items: string[]
}

// In-process cache keyed by URL — 24 h TTL
const cache = new Map<string, { sections: GuidelineSection[]; cachedAt: number }>()
const CACHE_TTL = 24 * 60 * 60 * 1000

const PRIVATE_IP_RE =
  /^(localhost|127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|::1|0\.0\.0\.0)/i

function isAllowedUrl(raw: string): boolean {
  try {
    const url = new URL(raw)
    if (url.protocol !== "https:" && url.protocol !== "http:") return false
    if (PRIVATE_IP_RE.test(url.hostname)) return false
    return true
  } catch {
    return false
  }
}

async function fetchPageText(url: string): Promise<string | null> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; GrantWay/1.0)" },
    signal: AbortSignal.timeout(10_000),
  })
  const ct = res.headers.get("content-type") ?? ""
  if (ct.includes("application/pdf") || !res.ok) return null
  const html = await res.text()
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, 12_000)
}

async function extractGuidelines(pageText: string, grantName: string): Promise<GuidelineSection[]> {
  const msg = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are reviewing the official grant page for "${grantName}".

Extract ONLY the requirements and instructions for writing the grant narrative (also called project narrative, program narrative, or application narrative). This includes:
- Required narrative sections and what each must cover
- Page or word limits for the narrative
- Review criteria and what reviewers score
- Specific content the funder requires applicants to address
- Any "what to include" or formatting instructions for the narrative

Do NOT include eligibility criteria, budget instructions, forms, SF-424, or administrative requirements unrelated to the narrative itself.

Return a JSON object with this exact shape (no markdown, raw JSON only):
{"sections":[{"heading":"Section name","items":["Specific guideline 1","Specific guideline 2"]}]}

If the page lacks enough narrative writing guidance, return {"sections":[]}.

Page content:
${pageText}`,
      },
    ],
  })

  const textBlock = msg.content.find((b) => b.type === "text")
  if (!textBlock || !("text" in textBlock)) return []

  const jsonMatch = (textBlock as { text: string }).text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return []

  try {
    const parsed = JSON.parse(jsonMatch[0]) as { sections?: GuidelineSection[] }
    if (!Array.isArray(parsed.sections)) return []
    return parsed.sections.filter(
      (s) => typeof s.heading === "string" && Array.isArray(s.items) && s.items.length > 0
    )
  } catch {
    return []
  }
}

async function getUser(token: string) {
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )
  const { data: { user } } = await client.auth.getUser()
  return user
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const ipRl = await rateLimit(`ws-guidelines-ip:${ip}`, 30, 60 * 60 * 1000)
  if (!ipRl.allowed) return tooManyRequests(ipRl.resetAt)

  const sizeCheck = checkPayloadSize(req, 4 * 1024)
  if (sizeCheck) return sizeCheck

  const token = req.headers.get("Authorization")?.replace("Bearer ", "") ?? ""
  if (!token) return new Response("Unauthorized", { status: 401 })

  const user = await getUser(token)
  if (!user) return new Response("Unauthorized", { status: 401 })

  let body: { officialSourceUrl?: string; grantName?: string }
  try { body = await req.json() } catch { return new Response("Invalid body", { status: 400 }) }

  const rawUrl = sanitizeString(String(body.officialSourceUrl ?? ""))
  const grantName = sanitizeString(String(body.grantName ?? "")).slice(0, 200)

  if (!rawUrl) return Response.json({ sections: [] })
  if (!isAllowedUrl(rawUrl)) return new Response("Invalid URL", { status: 400 })

  const cached = cache.get(rawUrl)
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL) {
    return Response.json({ sections: cached.sections })
  }

  try {
    const pageText = await fetchPageText(rawUrl)
    if (!pageText) return Response.json({ sections: [] })

    const sections = await extractGuidelines(pageText, grantName)
    cache.set(rawUrl, { sections, cachedAt: Date.now() })
    return Response.json({ sections })
  } catch (err) {
    console.error("[workspace/grant-guidelines]", err)
    return Response.json({ sections: [] })
  }
}
