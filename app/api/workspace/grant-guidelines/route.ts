import { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { anthropic } from "@/lib/anthropic"
import { rateLimit, getClientIp, tooManyRequests, checkPayloadSize, sanitizeString } from "@/lib/rate-limit"

export const maxDuration = 30

interface GuidelineSection {
  heading: string
  items: string[]
}

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

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
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
        content: `You are reading the official grant page for "${grantName}". Extract specific, factual requirements — report only what is explicitly stated on this page.

Look for and extract ONLY what is stated:

1. **Formatting Requirements** — exact page limit, word limit, font name and size, margin size, line spacing, file format.
2. **Review Criteria** — the actual criteria reviewers score, with weights or points if stated (e.g. "Significance: 30 pts").
3. **Required Narrative Sections** — specific section names the narrative must include and what each must address.
4. **Content Requirements** — specific topics, questions, or data the funder explicitly requires applicants to cover.

Rules:
- Only report facts present on this page. If a requirement is not stated, omit it entirely.
- Do NOT include eligibility, budget, SF-424, forms, or submission steps.
- Do NOT add generic writing advice, tips, or anything not on the page.
- Do NOT say "check the NOFO", "verify", or "review requirements" — only facts found here.

Return raw JSON only (no markdown):
{"sections":[{"heading":"Exact heading","items":["Specific fact 1","Specific fact 2"]}]}

If no qualifying requirements are found, return {"sections":[]}.

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

  let body: { grantId?: string; officialSourceUrl?: string; grantName?: string }
  try { body = await req.json() } catch { return new Response("Invalid body", { status: 400 }) }

  const grantId = sanitizeString(String(body.grantId ?? ""))
  const rawUrl = sanitizeString(String(body.officialSourceUrl ?? ""))
  const grantName = sanitizeString(String(body.grantName ?? "")).slice(0, 200)

  if (!rawUrl) return Response.json({ sections: [] })
  if (!isAllowedUrl(rawUrl)) return new Response("Invalid URL", { status: 400 })

  const supabase = serviceClient()

  // Return cached result from DB if already fetched
  if (grantId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any).from("grants")
      .select("narrative_guidelines")
      .eq("id", grantId)
      .maybeSingle() as { data: { narrative_guidelines?: GuidelineSection[] | null } | null }

    if (data?.narrative_guidelines != null) {
      return Response.json({ sections: data.narrative_guidelines })
    }
  }

  // Not in DB yet — scrape, extract, persist
  try {
    const pageText = await fetchPageText(rawUrl)
    if (!pageText) {
      if (grantId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from("grants")
          .update({ narrative_guidelines: [], guidelines_fetched_at: new Date().toISOString() })
          .eq("id", grantId)
      }
      return Response.json({ sections: [] })
    }

    const sections = await extractGuidelines(pageText, grantName)

    if (grantId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("grants")
        .update({ narrative_guidelines: sections, guidelines_fetched_at: new Date().toISOString() })
        .eq("id", grantId)
    }

    return Response.json({ sections })
  } catch (err) {
    console.error("[workspace/grant-guidelines]", err)
    return Response.json({ sections: [] })
  }
}
