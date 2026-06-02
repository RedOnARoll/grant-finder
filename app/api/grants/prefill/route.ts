import { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { PDFDocument } from "pdf-lib"
import { rateLimit, getClientIp, tooManyRequests } from "@/lib/rate-limit"

const SF424_URL = "https://apply07.grants.gov/apply/forms/sample/SF424_4_0-V4.0.pdf"

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

function extractOpportunityId(slug: string): string | null {
  const match = slug.match(/^grants-gov-(.+)$/)
  return match ? match[1] : null
}

export const maxDuration = 30

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const ipRl = await rateLimit(`prefill-ip:${ip}`, 10, 60 * 60 * 1000)
  if (!ipRl.allowed) return tooManyRequests(ipRl.resetAt)

  const token = req.headers.get("Authorization")?.replace("Bearer ", "") ?? ""
  if (!token) return new Response("Unauthorized", { status: 401 })

  const user = await getUser(token)
  if (!user) return new Response("Unauthorized", { status: 401 })

  const userRl = await rateLimit(`prefill-user:${user.id}`, 5, 60 * 60 * 1000)
  if (!userRl.allowed) return tooManyRequests(userRl.resetAt)

  const supabase = serviceClient()

  // Fetch profile — only columns that actually exist in the profiles table
  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("is_premium, is_admin, subscription_tier, full_name, email, phone_number, state, zip_code")
    .eq("user_id", user.id)
    .maybeSingle()

  const profile = profileRaw as {
    is_premium?: boolean
    is_admin?: boolean
    subscription_tier?: string
    full_name?: string
    email?: string
    phone_number?: string
    state?: string
    zip_code?: string
  } | null

  const isPremium = Boolean(profile?.is_premium) && profile?.subscription_tier === "premium"
  const isAdmin = Boolean(profile?.is_admin)
  if (!isPremium && !isAdmin) {
    return new Response("Premium subscription required", { status: 403 })
  }

  let body: { grant_slug: string; project_title?: string }
  try {
    body = await req.json()
  } catch {
    return new Response("Invalid request body", { status: 400 })
  }

  const { grant_slug, project_title } = body
  if (!grant_slug || typeof grant_slug !== "string") {
    return new Response("grant_slug is required", { status: 400 })
  }

  // Fetch the grant to get agency name and derive opportunity_id
  const { data: grant } = await supabase
    .from("grants")
    .select("id, name, agency, slug")
    .eq("slug", grant_slug)
    .maybeSingle()

  if (!grant) return new Response("Grant not found", { status: 404 })

  const opportunityId = extractOpportunityId(grant.slug)

  // Try to get opportunity number (CFDA/listing number) from Grants.gov
  let opportunityNumber: string | null = null
  if (opportunityId) {
    try {
      const oppRes = await fetch(
        `https://apply07.grants.gov/grantsws/rest/opportunity/details?oppId=${encodeURIComponent(opportunityId)}`,
        { signal: AbortSignal.timeout(8000) }
      )
      if (oppRes.ok) {
        const oppData = await oppRes.json() as Record<string, unknown>
        opportunityNumber =
          (oppData.opportunityNumber as string | undefined) ??
          (oppData.number as string | undefined) ??
          null
      }
    } catch {
      // Grants.gov unreachable — continue with profile data only
    }
  }

  // Download the standard SF-424 v4.0 form
  let pdfBytes: ArrayBuffer
  try {
    const pdfRes = await fetch(SF424_URL, { signal: AbortSignal.timeout(15000) })
    if (!pdfRes.ok) throw new Error(`HTTP ${pdfRes.status}`)
    pdfBytes = await pdfRes.arrayBuffer()
  } catch (err) {
    console.error("[prefill] SF-424 download failed:", err)
    return new Response("Could not download SF-424 form template", { status: 502 })
  }

  let pdfDoc: PDFDocument
  try {
    pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true })
  } catch (err) {
    console.error("[prefill] PDF parse failed:", err)
    return new Response("Could not parse SF-424 form", { status: 502 })
  }

  const form = pdfDoc.getForm()
  const filled: string[] = []
  const skipped: string[] = []

  const fullName = (profile?.full_name ?? "").trim()
  const nameParts = fullName.split(/\s+/)
  const firstName = nameParts[0] ?? ""
  const lastName = nameParts.slice(1).join(" ")

  // Each entry: [candidate field names in priority order, value to set].
  // setFieldSafe tries each name and uses the first that exists in the PDF.
  const fieldMappings: [string[], string][] = [
    // Block 8c — Legal name of applicant (fallback to contact full name since profile lacks org_name)
    [["Legal_Name", "legalName", "Applicant_Legal_Name", "orgName", "org_name"], fullName],
    // Block 8 — Contact person name
    [["First_Name", "firstName", "Prefix_First_Name", "contact_first_name", "applicant_first_name"], firstName],
    [["Last_Name", "lastName", "Suffix_Last_Name", "contact_last_name", "applicant_last_name"], lastName],
    // Block 8 — Contact info (profile has phone_number and email)
    [["Phone_Number", "phoneNumber", "Telephone_Number", "contact_phone", "phone"], profile?.phone_number ?? ""],
    [["Email", "email", "Email_Address", "contact_email", "applicant_email"], profile?.email ?? ""],
    // Block 8f — Address (profile has state and zip_code; no street or city columns exist)
    [["State", "state", "State_Code", "applicant_state", "state_abbr"], profile?.state ?? ""],
    [["Zip_Code", "zipCode", "Zip", "postal_code", "applicant_zip"], profile?.zip_code ?? ""],
    // Block 12 — Project title (provided per-application)
    [["Title", "project_title", "Project_Title", "projectTitle", "title"], project_title ?? ""],
    // Block 11 — Federal agency
    [["Federal_Agency_Name", "agencyName", "Agency_Name", "federal_agency", "agency_name"], grant.agency],
    // Block 11 — Opportunity number
    [["Opportunity_Number", "opportunityNumber", "opportunity_number", "opp_number", "FON"], opportunityId ?? ""],
    // Block 10 — CFDA / assistance listing number
    [["CFDA_Number", "cfdaNumber", "cfda_number", "catalog_number", "assistance_listing"], opportunityNumber ?? ""],
  ]

  for (const [fieldNames, value] of fieldMappings) {
    if (!value) continue
    let didFill = false
    for (const name of fieldNames) {
      try {
        const field = form.getTextField(name)
        field.setText(value)
        filled.push(name)
        didFill = true
        break
      } catch {
        // try next variant
      }
    }
    if (!didFill) skipped.push(fieldNames[0])
  }

  console.log(
    `[prefill] grant=${grant_slug} opportunity=${opportunityId ?? "n/a"}` +
    ` filled=[${filled.join(", ")}] skipped=[${skipped.join(", ")}]`
  )

  const filledPdfBytes = await pdfDoc.save()
  const filledPdf = Buffer.from(filledPdfBytes)

  const orgSlug = fullName.replace(/[^a-z0-9]/gi, "-").toLowerCase() || "applicant"
  const oppSlug = opportunityId ?? grant.slug.slice(0, 24)
  const filename = `${orgSlug}-${oppSlug}-SF424.pdf`

  return new Response(filledPdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  })
}
