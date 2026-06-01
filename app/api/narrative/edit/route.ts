import { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { anthropic } from "@/lib/anthropic"
import { rateLimit, getClientIp, tooManyRequests, checkPayloadSize, sanitizeString } from "@/lib/rate-limit"

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

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const ipRl = await rateLimit(`narrative-edit-ip:${ip}`, 30, 60 * 60 * 1000)
  if (!ipRl.allowed) return tooManyRequests(ipRl.resetAt)

  const sizeCheck = checkPayloadSize(req, 100 * 1024)
  if (sizeCheck) return sizeCheck

  const token = req.headers.get("Authorization")?.replace("Bearer ", "") ?? ""
  if (!token) return new Response("Unauthorized", { status: 401 })

  const user = await getUser(token)
  if (!user) return new Response("Unauthorized", { status: 401 })

  const userRl = await rateLimit(`narrative-edit-user:${user.id}`, 30, 60 * 60 * 1000)
  if (!userRl.allowed) return tooManyRequests(userRl.resetAt)

  const supabase = serviceClient()

  const { data: rawProfile } = await supabase
    .from("profiles")
    .select("is_premium, is_admin, subscription_tier")
    .eq("user_id", user.id)
    .maybeSingle()

  const profile = rawProfile as {
    is_premium?: boolean; is_admin?: boolean; subscription_tier?: string
  } | null

  const isAdmin = Boolean(profile?.is_admin)
  const tier = profile?.subscription_tier
  const isPremiumSubscription = Boolean(profile?.is_premium) && tier === "premium"
  const hasHelperTier = tier === "grant_helper"

  if (!isAdmin && !isPremiumSubscription && !hasHelperTier) {
    return new Response("Upgrade required", { status: 403 })
  }

  let body: { grantName: string; currentNarrative: string; editInstruction: string }
  try {
    body = await req.json()
  } catch {
    return new Response("Invalid request body", { status: 400 })
  }

  const grantName = sanitizeString(String(body.grantName ?? "")).slice(0, 200)
  const currentNarrative = sanitizeString(String(body.currentNarrative ?? "")).slice(0, 20000)
  const editInstruction = sanitizeString(String(body.editInstruction ?? "")).slice(0, 2000)

  if (!grantName || !currentNarrative || !editInstruction) {
    return new Response("grantName, currentNarrative, and editInstruction are required", { status: 400 })
  }

  const systemPrompt = `You are an expert grant writer revising an existing grant application narrative based on applicant feedback. Maintain the professional tone and structure of the original while incorporating the requested changes. Return the complete revised narrative with all sections intact.`

  const userPrompt = `Apply this edit to the narrative above for "${grantName}":

${editInstruction}

Return the complete revised narrative, incorporating the feedback while maintaining overall quality and completeness.`

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      try {
        const messageStream = anthropic.messages.stream({
          model: "claude-opus-4-7",
          max_tokens: 4096,
          thinking: { type: "adaptive" },
          system: [
            {
              type: "text",
              text: `${systemPrompt}\n\nCurrent narrative to edit:\n\n${currentNarrative}`,
              cache_control: { type: "ephemeral" },
            },
          ],
          messages: [{ role: "user", content: userPrompt }],
        })

        for await (const event of messageStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
      } catch (err) {
        console.error("[narrative/edit]", err)
        controller.enqueue(encoder.encode("\n\n[Error revising narrative. Please try again.]"))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "Transfer-Encoding": "chunked",
    },
  })
}
