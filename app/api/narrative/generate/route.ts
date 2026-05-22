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
  // Rate limit by IP: 30 per hour (before auth check to stop unauthenticated floods)
  const ip = getClientIp(req)
  const ipRl = rateLimit(`narrative-ip:${ip}`, 30, 60 * 60 * 1000)
  if (!ipRl.allowed) return tooManyRequests(ipRl.resetAt)

  // Payload size limit: 50 KB
  const sizeCheck = checkPayloadSize(req, 50 * 1024)
  if (sizeCheck) return sizeCheck

  const token = req.headers.get("Authorization")?.replace("Bearer ", "") ?? ""
  if (!token) return new Response("Unauthorized", { status: 401 })

  const user = await getUser(token)
  if (!user) return new Response("Unauthorized", { status: 401 })

  // Per-user rate limit: 20 per hour
  const userRl = rateLimit(`narrative-user:${user.id}`, 20, 60 * 60 * 1000)
  if (!userRl.allowed) return tooManyRequests(userRl.resetAt)

  const supabase = serviceClient()

  // Load profile to check access tier + enrich prompt
  const { data: rawProfile } = await supabase
    .from("profiles")
    .select(
      "is_premium, is_admin, subscription_tier, one_time_credits, full_name, state, business_type, business_industry, employee_count, annual_revenue, years_in_operation, business_ownership_identities, veteran_status, disability_status"
    )
    .eq("user_id", user.id)
    .maybeSingle()

  const profile = rawProfile as {
    is_premium?: boolean; is_admin?: boolean; subscription_tier?: string
    one_time_credits?: number; full_name?: string; state?: string
    business_type?: string; business_industry?: string; employee_count?: string
    annual_revenue?: string; years_in_operation?: string
    business_ownership_identities?: string[]; veteran_status?: boolean
    disability_status?: boolean
  } | null

  const isAdmin = Boolean(profile?.is_admin)
  const tier = profile?.subscription_tier
  const isPremiumSubscription = Boolean(profile?.is_premium) && tier === "premium"
  const credits = Number(profile?.one_time_credits ?? 0)

  const canGenerate = isAdmin || isPremiumSubscription || (tier === "grant_helper" && credits > 0)
  if (!canGenerate) return new Response("Upgrade required", { status: 403 })

  // Decrement credits for grant_helper tier
  if (!isAdmin && !isPremiumSubscription && tier === "grant_helper") {
    const { data: updatedCreditRow, error: creditError } = await supabase
      .from("profiles")
      .update({
        one_time_credits: Math.max(0, credits - 1),
        ...(credits <= 1 ? { subscription_tier: "free" } : {}),
      })
      .eq("user_id", user.id)
      .gt("one_time_credits", 0)
      .select("one_time_credits")
      .maybeSingle()

    if (creditError || !updatedCreditRow) return new Response("Upgrade required", { status: 403 })
  }

  let body: { grantName: string; grantDescription?: string; answers: Record<string, string> }
  try {
    body = await req.json()
  } catch {
    return new Response("Invalid request body", { status: 400 })
  }

  const rawGrantName = sanitizeString(String(body.grantName ?? ""))
  const rawGrantDesc = sanitizeString(String(body.grantDescription ?? ""))
  const rawAnswers = body.answers as Record<string, string>

  const grantName = rawGrantName.slice(0, 200)
  const grantDescription = rawGrantDesc.slice(0, 500)
  const answers: Record<string, string> = {}
  if (rawAnswers && typeof rawAnswers === "object") {
    for (const [k, v] of Object.entries(rawAnswers)) {
      if (typeof v === "string") answers[sanitizeString(k).slice(0, 50)] = sanitizeString(v).slice(0, 2000)
    }
  }

  if (!grantName) return new Response("grantName is required", { status: 400 })

  // Build profile context string
  const profileLines: string[] = []
  if (profile?.full_name) profileLines.push(`Applicant name: ${profile.full_name}`)
  if (profile?.state) profileLines.push(`State/location: ${profile.state}`)
  if (profile?.business_type) profileLines.push(`Organization type: ${profile.business_type}`)
  if (profile?.business_industry) profileLines.push(`Industry: ${profile.business_industry}`)
  if (profile?.employee_count) profileLines.push(`Employees: ${profile.employee_count}`)
  if (profile?.annual_revenue) profileLines.push(`Annual revenue: ${profile.annual_revenue}`)
  if (profile?.years_in_operation) profileLines.push(`Years in operation: ${profile.years_in_operation}`)
  if (profile?.veteran_status) profileLines.push("Veteran-owned")
  if (profile?.disability_status) profileLines.push("Disability-owned")
  if (Array.isArray(profile?.business_ownership_identities) && profile.business_ownership_identities.length > 0) {
    profileLines.push(`Ownership identities: ${profile.business_ownership_identities.join(", ")}`)
  }
  const profileContext = profileLines.length > 0
    ? `\n\nApplicant profile:\n${profileLines.map(l => `- ${l}`).join("\n")}`
    : ""

  const systemPrompt = `You are an expert grant writer with 15+ years of experience helping small businesses, nonprofits, and entrepreneurs secure competitive funding. You write compelling, professional, and authentic grant application narratives that clearly communicate the applicant's mission, qualifications, and impact.

Your narratives are:
- Specific and concrete, avoiding generic filler language
- Structured clearly with headers for each section
- Written in a professional yet sincere first-person voice
- Tailored to the specific grant's likely priorities
- Realistic and credible — you don't over-promise

Always produce a complete, ready-to-submit draft that the applicant can refine and submit.`

  const userPrompt = `Write a professional grant application narrative for the following grant.

Grant name: ${grantName}${grantDescription ? `\nGrant description: ${grantDescription}` : ""}${profileContext}

The applicant has provided the following answers to help you write this application:

Organization/Business Description:
${answers.orgDescription || "(not provided)"}

Project or Program to be Funded:
${answers.projectDescription || "(not provided)"}

How Funds Will Be Used:
${answers.fundingUse || "(not provided)"}

Expected Outcomes and Impact:
${answers.expectedOutcomes || "(not provided)"}

${answers.additionalContext ? `Additional Context:\n${answers.additionalContext}\n\n` : ""}Please write a complete grant application narrative with the following sections:
1. **Executive Summary** (2-3 sentences)
2. **Organization Overview** (1-2 paragraphs)
3. **Project Description** (2-3 paragraphs)
4. **Need Statement / Problem** (1-2 paragraphs)
5. **Goals and Objectives** (bullet points)
6. **Implementation Plan** (1-2 paragraphs)
7. **Expected Outcomes and Evaluation** (1-2 paragraphs)
8. **Budget Justification** (1 paragraph)
9. **Conclusion** (1 paragraph)

Write the full narrative now, ready for the applicant to review and submit.`

  // Stream the response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      try {
        const messageStream = anthropic.messages.stream({
          model: "claude-opus-4-7",
          max_tokens: 4096,
          thinking: { type: "adaptive" },
          system: systemPrompt,
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
        console.error("[narrative/generate]", err)
        controller.enqueue(encoder.encode("\n\n[Error generating narrative. Please try again.]"))
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
