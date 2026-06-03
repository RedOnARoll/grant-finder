import { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { anthropic } from "@/lib/anthropic"
import { rateLimit, getClientIp, tooManyRequests, checkPayloadSize, sanitizeString } from "@/lib/rate-limit"

export const maxDuration = 60

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

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const ipRl = await rateLimit(`ws-edit-ip:${ip}`, 30, 60 * 60 * 1000)
  if (!ipRl.allowed) return tooManyRequests(ipRl.resetAt)

  const sizeCheck = checkPayloadSize(req, 100 * 1024)
  if (sizeCheck) return sizeCheck

  const token = req.headers.get("Authorization")?.replace("Bearer ", "") ?? ""
  if (!token) return new Response("Unauthorized", { status: 401 })

  const user = await getUser(token)
  if (!user) return new Response("Unauthorized", { status: 401 })

  const userRl = await rateLimit(`ws-edit-user:${user.id}`, 30, 60 * 60 * 1000)
  if (!userRl.allowed) return tooManyRequests(userRl.resetAt)

  const supabase = serviceClient()

  const { data: rawProfile } = await supabase
    .from("profiles")
    .select("is_premium, is_admin, subscription_tier")
    .eq("user_id", user.id)
    .maybeSingle()

  const profile = rawProfile as { is_premium?: boolean; is_admin?: boolean; subscription_tier?: string } | null
  const isAdmin = Boolean(profile?.is_admin)
  const isPremium = Boolean(profile?.is_premium) && profile?.subscription_tier === "premium"
  if (!isAdmin && !isPremium) return new Response("Upgrade required", { status: 403 })

  let body: { grantId: string; grantName: string; currentDraft: string; userMessage: string }
  try { body = await req.json() } catch { return new Response("Invalid body", { status: 400 }) }

  const grantId = sanitizeString(String(body.grantId ?? ""))
  const grantName = sanitizeString(String(body.grantName ?? "")).slice(0, 200)
  const currentDraft = sanitizeString(String(body.currentDraft ?? "")).slice(0, 20000)
  const userMessage = sanitizeString(String(body.userMessage ?? "")).slice(0, 2000)

  if (!grantId || !grantName || !currentDraft || !userMessage) {
    return new Response("grantId, grantName, currentDraft, and userMessage are required", { status: 400 })
  }

  const systemPrompt = `You are an expert grant writer helping a user refine their grant narrative. The user will give you a specific edit instruction. Apply only the requested change — preserve all other sections and the overall structure. Return the full updated narrative with the edit applied. Do not add commentary or explanation, only return the revised narrative text.`

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      let fullText = ""
      try {
        const messageStream = anthropic.messages.stream({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 4096,
          system: [{ type: "text", text: `${systemPrompt}\n\nCurrent narrative:\n\n${currentDraft}`, cache_control: { type: "ephemeral" } }],
          messages: [{ role: "user", content: `Grant: ${grantName}\n\nEdit instruction: ${userMessage}` }],
        })
        for await (const event of messageStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            fullText += event.delta.text
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
        // Save updated draft to workspace_drafts
        if (fullText) {
          await supabase.from("workspace_drafts").upsert(
            { user_id: user.id, grant_id: grantId, narrative_text: fullText, generated_at: new Date().toISOString() },
            { onConflict: "user_id,grant_id" }
          )
        }
      } catch (err) {
        console.error("[workspace/edit-narrative]", err)
        controller.enqueue(encoder.encode("\n\n[Error applying edit. Please try again.]"))
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
