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

async function fetchGrantGuidance(funderType: string, agencyName: string): Promise<string> {
  try {
    const query = `Current official requirements and best practices for writing a grant narrative for ${funderType} grants${agencyName ? ` from ${agencyName}` : ""}. Include required sections and what funders look for.`
    const res = await (anthropic.messages as typeof anthropic.messages & { create: typeof anthropic.messages.create }).create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      tools: [{ type: "web_search_20250305", name: "web_search" } as Parameters<typeof anthropic.messages.create>[0]["tools"] extends (infer T)[] ? T : never],
      messages: [{ role: "user", content: query }],
    } as Parameters<typeof anthropic.messages.create>[0])
    const textBlock = res.content.find((b) => b.type === "text")
    return textBlock && "text" in textBlock ? textBlock.text.slice(0, 2000) : ""
  } catch {
    return ""
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const ipRl = await rateLimit(`ws-gen-ip:${ip}`, 20, 60 * 60 * 1000)
  if (!ipRl.allowed) return tooManyRequests(ipRl.resetAt)

  const sizeCheck = checkPayloadSize(req, 50 * 1024)
  if (sizeCheck) return sizeCheck

  const token = req.headers.get("Authorization")?.replace("Bearer ", "") ?? ""
  if (!token) return new Response("Unauthorized", { status: 401 })

  const user = await getUser(token)
  if (!user) return new Response("Unauthorized", { status: 401 })

  const userRl = await rateLimit(`ws-gen-user:${user.id}`, 10, 60 * 60 * 1000)
  if (!userRl.allowed) return tooManyRequests(userRl.resetAt)

  const supabase = serviceClient()

  const { data: rawProfile } = await supabase
    .from("profiles")
    .select("is_premium, is_admin, subscription_tier, full_name, state, zip_code, business_type, business_industry, employee_count, annual_revenue, years_in_operation, business_ownership_identities, veteran_status, disability_status")
    .eq("user_id", user.id)
    .maybeSingle()

  const profile = rawProfile as {
    is_premium?: boolean; is_admin?: boolean; subscription_tier?: string
    full_name?: string; state?: string; zip_code?: string
    business_type?: string; business_industry?: string; employee_count?: string
    annual_revenue?: string; years_in_operation?: string
    business_ownership_identities?: string[]; veteran_status?: boolean; disability_status?: boolean
  } | null

  const isAdmin = Boolean(profile?.is_admin)
  const isPremium = Boolean(profile?.is_premium) && profile?.subscription_tier === "premium"
  if (!isAdmin && !isPremium) return new Response("Upgrade required", { status: 403 })

  let body: {
    grantId: string; grantName: string; agencyName?: string; fundingSource?: string
    grantDescription?: string; eligibilityRequirements?: string[]; grantAmount?: number | null; deadline?: string | null
  }
  try { body = await req.json() } catch { return new Response("Invalid body", { status: 400 }) }

  const grantId = sanitizeString(String(body.grantId ?? ""))
  const grantName = sanitizeString(String(body.grantName ?? "")).slice(0, 200)
  const agencyName = sanitizeString(String(body.agencyName ?? "")).slice(0, 200)
  const fundingSource = sanitizeString(String(body.fundingSource ?? "")).slice(0, 50)
  const grantDescription = sanitizeString(String(body.grantDescription ?? "")).slice(0, 1000)
  const grantAmount = typeof body.grantAmount === "number" ? body.grantAmount : null
  const deadline = body.deadline ? sanitizeString(String(body.deadline)) : null

  if (!grantId || !grantName) return new Response("grantId and grantName required", { status: 400 })

  // Build profile context
  const profileLines: string[] = []
  if (profile?.full_name) profileLines.push(`Applicant/Org name: ${profile.full_name}`)
  if (profile?.state) profileLines.push(`State: ${profile.state}`)
  if (profile?.zip_code) profileLines.push(`ZIP: ${profile.zip_code}`)
  if (profile?.business_type) profileLines.push(`Organization type: ${profile.business_type}`)
  if (profile?.business_industry) profileLines.push(`Industry: ${profile.business_industry}`)
  if (profile?.employee_count) profileLines.push(`Employees: ${profile.employee_count}`)
  if (profile?.annual_revenue) profileLines.push(`Annual revenue: ${profile.annual_revenue}`)
  if (profile?.years_in_operation) profileLines.push(`Years in operation: ${profile.years_in_operation}`)
  if (profile?.veteran_status) profileLines.push("Veteran-owned")
  if (profile?.disability_status) profileLines.push("Disability-owned")
  if (Array.isArray(profile?.business_ownership_identities) && profile.business_ownership_identities.length > 0) {
    profileLines.push(`Ownership: ${profile.business_ownership_identities.join(", ")}`)
  }

  // Try web search for current funder guidance
  const searchContext = await fetchGrantGuidance(fundingSource || "federal", agencyName)

  const systemPrompt = `You are an expert grant writer with deep knowledge of US grant applications. You have researched the current official requirements and best practices for this funder type from authoritative sources. Write a compelling, accurate grant narrative tailored to this specific grant and funder. Structure the narrative with clearly labeled sections appropriate for this grant type (e.g. Executive Summary, Statement of Need, Project Description, Goals & Objectives, Evaluation Plan, Budget Justification). Be specific, professional, and tailor the tone and emphasis to what this funder prioritizes. Do not use generic filler — every sentence should serve the application.`

  const eligibilityText = Array.isArray(body.eligibilityRequirements) && body.eligibilityRequirements.length > 0
    ? `\nEligibility requirements: ${body.eligibilityRequirements.join("; ")}`
    : ""

  const userPrompt = `Write a professional grant application narrative for the following grant.

Grant: ${grantName}
Funder: ${agencyName || "Unknown funder"}
Funder type: ${fundingSource || "federal"}
${grantDescription ? `Description: ${grantDescription}` : ""}${eligibilityText}
${grantAmount ? `Award amount: $${grantAmount.toLocaleString()}` : ""}
${deadline ? `Deadline: ${deadline}` : ""}

Applicant profile:
${profileLines.length > 0 ? profileLines.map((l) => `- ${l}`).join("\n") : "- (No profile data provided)"}

${searchContext ? `Current guidance on ${fundingSource || "federal"} grant narratives (from official sources):\n${searchContext}\n` : ""}

Write the complete narrative now. Use clear section headers. Be specific, professional, and compelling.`

  let narrative = ""
  try {
    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: userPrompt }],
    })
    const textBlock = msg.content.find((b) => b.type === "text")
    narrative = textBlock && "text" in textBlock ? textBlock.text : ""
  } catch (err) {
    console.error("[workspace/generate-narrative]", err)
    return new Response("Generation failed", { status: 500 })
  }

  // Save to workspace_drafts
  await supabase.from("workspace_drafts").upsert(
    { user_id: user.id, grant_id: grantId, narrative_text: narrative, generated_at: new Date().toISOString() },
    { onConflict: "user_id,grant_id" }
  )

  return Response.json({ narrative })
}
