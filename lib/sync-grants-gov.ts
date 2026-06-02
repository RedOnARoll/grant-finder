import { createClient } from "@supabase/supabase-js"
import type { GrantCategory } from "./types"

export interface SyncSummary {
  fetched: number
  upserted: number
  failed: number
  durationMs: number
  errors: string[]
}

interface GovHit {
  id: string | number
  number?: string
  title: string
  agencyName: string
  closeDate?: string | null
  awardCeiling?: number | null
  synopsisURL?: string | null
  applicationURL?: string | null
  description?: string | null
  fundingActivityCategories?: string | null
}

interface SearchResponse {
  hitCount?: number
  oppHits?: GovHit[]
}

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

const CATEGORY_MAP: Partial<Record<string, GrantCategory>> = {
  AG: "agricultural",
  AR: "arts",
  BC: "small_business",
  CD: "individual",
  CP: "individual",
  DPR: "individual",
  ED: "education",
  EM: "individual",
  EN: "energy",
  ENV: "research",
  HL: "health",
  HO: "housing",
  HU: "arts",
  IS: "research",
  LJL: "individual",
  NR: "research",
  O: "individual",
  RA: "individual",
  RD: "individual",
  ST: "research",
  T: "individual",
  ACA: "health",
}

function resolveCategory(categories: string | null | undefined): GrantCategory {
  if (!categories) return "research"
  for (const code of categories.split("|")) {
    const mapped = CATEGORY_MAP[code.trim()]
    if (mapped) return mapped
  }
  return "research"
}

function parseGovDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null
  const [month, day, year] = dateStr.split("/")
  if (!month || !day || !year) return null
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
}

async function fetchPage(startRecord: number, rows: number): Promise<SearchResponse> {
  const res = await fetch(
    "https://apply07.grants.gov/grantsws/rest/opportunities/search/",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rows,
        startRecordNum: startRecord,
        oppStatuses: "forecasted|posted",
        sortBy: "openDate",
        sortOrder: "desc",
      }),
      signal: AbortSignal.timeout(30000),
    }
  )
  if (!res.ok) throw new Error(`Grants.gov HTTP ${res.status}`)
  return res.json() as Promise<SearchResponse>
}

function mapToRow(hit: GovHit) {
  const now = new Date().toISOString()
  const oppId = String(hit.id)
  return {
    slug: `grants-gov-${oppId}`,
    name: hit.title,
    agency: hit.agencyName,
    category: resolveCategory(hit.fundingActivityCategories),
    subcategory: null as string | null,
    type: "grant" as const,
    funding_source: "federal" as const,
    description: hit.description ?? hit.title,
    max_amount: hit.awardCeiling ?? null,
    is_recurring: false,
    deadline: parseGovDate(hit.closeDate),
    eligibility_criteria: {},
    required_documents: [],
    application_url: hit.applicationURL ?? hit.synopsisURL ?? "",
    official_source_url: hit.synopsisURL ?? "",
    form_numbers: hit.number ? [hit.number] : [],
    processing_time_days: null as number | null,
    data_source: "grants.gov",
    is_verified: true,
    last_verified_at: now,
    verification_notes: `Synced from grants.gov opportunity ${oppId}`,
  }
}

export async function runSync(maxRows = 500): Promise<SyncSummary> {
  const startedAt = Date.now()
  const supabase = serviceClient()
  const PAGE_SIZE = 25
  const summary: SyncSummary = {
    fetched: 0,
    upserted: 0,
    failed: 0,
    durationMs: 0,
    errors: [],
  }

  for (let start = 0; start < maxRows; start += PAGE_SIZE) {
    let hits: GovHit[]

    try {
      const data = await fetchPage(start, PAGE_SIZE)
      hits = data.oppHits ?? []
      if (hits.length === 0) break
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      summary.errors.push(`Page at offset ${start}: ${msg}`)
      console.error(`[sync-grants] fetch error at offset ${start}:`, msg)
      break
    }

    summary.fetched += hits.length
    const rows = hits.map(mapToRow)

    const { data: upserted, error } = await supabase
      .from("grants")
      .upsert(rows, { onConflict: "slug" })
      .select("id")

    if (error) {
      summary.failed += rows.length
      summary.errors.push(`Upsert at offset ${start}: ${error.message}`)
      console.error(`[sync-grants] upsert error at offset ${start}:`, error.message)
    } else {
      const n = upserted?.length ?? rows.length
      summary.upserted += n
      console.log(`[sync-grants] offset=${start}: fetched ${hits.length}, upserted ${n}`)
    }

    if (hits.length < PAGE_SIZE) break

    // Brief pause to avoid hammering the Grants.gov API
    await new Promise(r => setTimeout(r, 200))
  }

  summary.durationMs = Date.now() - startedAt
  console.log(
    `[sync-grants] done — fetched=${summary.fetched} upserted=${summary.upserted}` +
    ` failed=${summary.failed} time=${(summary.durationMs / 1000).toFixed(1)}s`
  )
  return summary
}
