import { createClient, SupabaseClient } from "@supabase/supabase-js"
import Anthropic from "@anthropic-ai/sdk"
import type { Grant } from "./types"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = SupabaseClient<any, any, any>

export interface RefreshSummary {
  total: number
  updated: number
  unchanged: number
  failed: number
  unverified: number
  errors: { slug: string; error: string }[]
  durationMs: number
}

function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// ── Grants.gov API ────────────────────────────────────────────────────
interface GrantsGovResult {
  found: boolean
  deadline?: string | null
  max_amount?: number | null
  application_url?: string | null
}

async function searchGrantsGov(grant: Grant): Promise<GrantsGovResult> {
  // Use first 4 significant words as keyword to avoid over-restriction
  const keyword = grant.name
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 3)
    .slice(0, 4)
    .join(" ")

  const res = await fetch(
    "https://apply07.grants.gov/grantsws/rest/opportunities/search/",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rows: 10,
        startRecordNum: 0,
        keyword,
        oppStatuses: "forecasted|posted",
      }),
    }
  )

  if (!res.ok) return { found: false }

  const data = await res.json() as {
    oppHits?: Array<{
      id: string
      title: string
      agencyName: string
      closeDate: string | null
      awardCeiling: number | null
      synopsisURL: string | null
    }>
  }

  const hits = data.oppHits ?? []

  // Find closest title match (simple normalized overlap)
  const normalizeTitle = (t: string) => t.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/)
  const grantWords = new Set(normalizeTitle(grant.name))

  let bestHit = null
  let bestScore = 0
  for (const hit of hits) {
    const hitWords = normalizeTitle(hit.title)
    const overlap = hitWords.filter(w => grantWords.has(w)).length
    const score = overlap / Math.max(grantWords.size, hitWords.length)
    if (score > bestScore) {
      bestScore = score
      bestHit = hit
    }
  }

  if (!bestHit || bestScore < 0.4) return { found: false }

  // Parse closeDate (Grants.gov format: MM/DD/YYYY)
  let deadline: string | null = null
  if (bestHit.closeDate) {
    const [month, day, year] = bestHit.closeDate.split("/")
    if (month && day && year) {
      deadline = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
    }
  }

  return {
    found: true,
    deadline,
    max_amount: bestHit.awardCeiling ?? null,
    application_url: bestHit.synopsisURL ?? null,
  }
}

// ── URL safety check ─────────────────────────────────────────────────
function isSafeUrl(urlString: string): boolean {
  let url: URL
  try { url = new URL(urlString) } catch { return false }

  if (url.protocol !== "https:") return false

  const h = url.hostname.toLowerCase()

  // Block bare IP addresses (all ranges — includes 169.254.x.x AWS metadata)
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(h)) return false
  // Block IPv6 addresses
  if (h.startsWith("[") || /^[0-9a-f:]+$/.test(h)) return false
  // Block internal hostnames
  if (h === "localhost" || h.endsWith(".local") || h.endsWith(".internal") || h.endsWith(".localhost")) return false
  // Must have at least one dot (real TLD)
  if (!h.includes(".")) return false

  return true
}

// ── Claude URL extraction ─────────────────────────────────────────────
interface ExtractedData {
  deadline: string | null
  max_amount: number | null
  required_documents: string[]
  application_url: string | null
  eligibility_summary: string | null
}

async function extractFromUrl(
  url: string,
  grantName: string,
  anthropic: Anthropic
): Promise<ExtractedData | null> {
  if (!isSafeUrl(url)) {
    console.warn(`[refresh] Skipping unsafe URL: ${url}`)
    return null
  }

  // Fetch page
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; GrantWay-Verifier/1.0; +https://grantway.org)",
      Accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) return null

  const html = await res.text()
  // Strip tags, compress whitespace, limit size
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 12000)

  const today = new Date().toISOString().slice(0, 10)

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Today is ${today}. Extract grant/benefit information for "${grantName}" from this webpage text. Return ONLY valid JSON with these fields:
- deadline: ISO date string (YYYY-MM-DD) or null. Look for phrases like "deadline", "due date", "apply by", "closes", "submissions due", "applications accepted through". If you find a month/day without a year (e.g. "May 30"), use the current or next upcoming occurrence based on today's date. For monthly recurring grants, return the next upcoming monthly deadline. Return null only if no deadline can be determined.
- max_amount: number (dollars) or null
- required_documents: array of strings (document names required to apply)
- application_url: the direct URL to apply or null
- eligibility_summary: one sentence plain-English eligibility statement or null

Webpage text:
${text}

Return only the JSON object, no explanation.`,
      },
    ],
  })

  const raw =
    message.content[0].type === "text" ? message.content[0].text.trim() : ""

  // Extract JSON from response (may be wrapped in ```json blocks)
  const jsonMatch = raw.match(/```json\s*([\s\S]*?)\s*```/) || raw.match(/(\{[\s\S]*\})/)
  if (!jsonMatch) return null

  try {
    return JSON.parse(jsonMatch[1] ?? jsonMatch[0]) as ExtractedData
  } catch {
    return null
  }
}

// ── Concurrency limiter ───────────────────────────────────────────────
function withConcurrency<T>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<void>
): Promise<void> {
  return new Promise((resolve, reject) => {
    let idx = 0
    let active = 0
    let failed = false

    function next() {
      if (failed) return
      while (active < concurrency && idx < items.length) {
        const item = items[idx++]
        active++
        fn(item)
          .catch(reject)
          .finally(() => {
            active--
            if (idx < items.length) {
              next()
            } else if (active === 0) {
              resolve()
            }
          })
      }
      if (idx >= items.length && active === 0) resolve()
    }

    next()
  })
}

// ── Process a single grant ────────────────────────────────────────────
async function processGrant(
  grant: Grant,
  supabase: AnySupabase,
  anthropic: Anthropic,
  summary: RefreshSummary
): Promise<void> {
  try {
    const updates: Record<string, unknown> = {
      last_verified_at: new Date().toISOString(),
    }
    let dataSource = grant.data_source ?? "manual"
    let isVerified = false
    let verificationNotes: string | null = null
    let changed = false

    // ── Path A: Federal grants → Grants.gov ──────────────────────
    if (grant.funding_source === "federal") {
      const govResult = await searchGrantsGov(grant)

      if (govResult.found) {
        dataSource = "grants.gov"
        isVerified = true

        const changes: string[] = []

        if (govResult.deadline !== undefined && govResult.deadline !== grant.deadline) {
          updates.deadline = govResult.deadline
          changes.push(`deadline: ${grant.deadline ?? "null"} → ${govResult.deadline ?? "null"}`)
        }
        if (
          govResult.max_amount !== undefined &&
          govResult.max_amount !== null &&
          govResult.max_amount !== grant.max_amount
        ) {
          updates.max_amount = govResult.max_amount
          changes.push(`max_amount: ${grant.max_amount} → ${govResult.max_amount}`)
        }
        if (govResult.application_url && !grant.application_url) {
          updates.application_url = govResult.application_url
          changes.push(`application_url added`)
        }

        if (changes.length > 0) {
          verificationNotes = `grants.gov match. Changes: ${changes.join("; ")}`
          changed = true
        } else {
          verificationNotes = "grants.gov match. No changes needed."
        }
      } else {
        verificationNotes = "No grants.gov match found — manual review recommended."
      }
    }

    // ── Path B: Has source URL → scrape + Claude extract ─────────
    if (grant.official_source_url && !isVerified) {
      const extracted = await extractFromUrl(
        grant.official_source_url,
        grant.name,
        anthropic
      ).catch(() => null)

      if (extracted) {
        dataSource = "scraped"
        isVerified = true

        const changes: string[] = []

        if (extracted.deadline && extracted.deadline !== grant.deadline) {
          updates.deadline = extracted.deadline
          changes.push(`deadline: ${grant.deadline ?? "null"} → ${extracted.deadline}`)
        }
        if (
          extracted.max_amount !== null &&
          extracted.max_amount !== undefined &&
          extracted.max_amount !== grant.max_amount
        ) {
          updates.max_amount = extracted.max_amount
          changes.push(`max_amount: ${grant.max_amount} → ${extracted.max_amount}`)
        }
        if (
          extracted.required_documents?.length > 0 &&
          JSON.stringify(extracted.required_documents) !==
            JSON.stringify(grant.required_documents)
        ) {
          updates.required_documents = extracted.required_documents
          changes.push(`required_documents updated`)
        }
        if (extracted.application_url && !grant.application_url) {
          updates.application_url = extracted.application_url
          changes.push(`application_url added`)
        }

        if (changes.length > 0) {
          verificationNotes = `Scraped ${grant.official_source_url}. Changes: ${changes.join("; ")}`
          changed = true
        } else {
          verificationNotes = `Scraped ${grant.official_source_url}. No changes needed.`
        }
      } else {
        verificationNotes = `Failed to extract from ${grant.official_source_url}`
      }
    }

    // ── Path C: No source URL, not federal ──────────────────────
    if (!grant.official_source_url && grant.funding_source !== "federal") {
      isVerified = false
      verificationNotes = "No source URL and not a federal grant — flagged as unverified."
      summary.unverified++
    }

    // Apply updates
    updates.data_source = dataSource
    updates.is_verified = isVerified
    updates.verification_notes = verificationNotes

    const { error: updateError } = await supabase
      .from("grants")
      .update(updates)
      .eq("id", grant.id)

    if (updateError) throw new Error(updateError.message)

    if (changed) {
      summary.updated++
      console.log(`[refresh] ✓ updated: ${grant.slug}`)
    } else {
      summary.unchanged++
      console.log(`[refresh] — unchanged: ${grant.slug}`)
    }
  } catch (err) {
    summary.failed++
    const msg = err instanceof Error ? err.message : String(err)
    summary.errors.push({ slug: grant.slug, error: msg })
    console.error(`[refresh] ✗ failed: ${grant.slug} — ${msg}`)

    // Mark as failed but still update last_verified_at
    try {
      await supabase
        .from("grants")
        .update({
          last_verified_at: new Date().toISOString(),
          verification_notes: `Refresh failed: ${msg}`,
        })
        .eq("id", grant.id)
    } catch {
      // best-effort — ignore secondary failure
    }
  }
}

// ── Main refresh function ─────────────────────────────────────────────
export async function runRefresh(batchSize = 100, concurrency = 5): Promise<RefreshSummary> {
  const startedAt = Date.now()
  const supabase = serviceClient()
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const summary: RefreshSummary = {
    total: 0,
    updated: 0,
    unchanged: 0,
    failed: 0,
    unverified: 0,
    errors: [],
    durationMs: 0,
  }

  // Fetch the N most-stale rows (oldest last_verified_at first, nulls first)
  const { data: grants, error: fetchError } = await supabase
    .from("grants")
    .select("*")
    .order("last_verified_at", { ascending: true, nullsFirst: true })
    .limit(batchSize)

  if (fetchError) throw new Error(`Failed to fetch grants: ${fetchError.message}`)

  summary.total = grants?.length ?? 0
  console.log(
    `[refresh] Starting refresh for ${summary.total} rows (batch=${batchSize}, concurrency=${concurrency})`
  )

  // Process grants in parallel with a concurrency cap
  await withConcurrency(
    (grants ?? []) as Grant[],
    concurrency,
    (grant) => processGrant(grant, supabase, anthropic, summary)
  )

  summary.durationMs = Date.now() - startedAt

  console.log(`\n[refresh] ── Summary ──────────────────────`)
  console.log(`  Total:     ${summary.total}`)
  console.log(`  Updated:   ${summary.updated}`)
  console.log(`  Unchanged: ${summary.unchanged}`)
  console.log(`  Failed:    ${summary.failed}`)
  console.log(`  Unverified:${summary.unverified}`)
  console.log(`  Duration:  ${(summary.durationMs / 1000).toFixed(1)}s`)
  if (summary.errors.length > 0) {
    console.log(`  Errors:`)
    summary.errors.forEach(e => console.log(`    - ${e.slug}: ${e.error}`))
  }

  return summary
}
