import Link from "next/link"
import { Sparkles } from "lucide-react"
import { getGrants } from "@/lib/supabase"
import type { Grant } from "@/lib/types"
import SortSelect from "@/components/SortSelect"
import SiteNav from "@/components/SiteNav"
import SaveInterestButton from "@/components/SaveInterestButton"
import ProgramGrid from "@/components/ProgramGrid"
import { Badge, StatusBadge } from "@/components/ui/Badge"
import { EmptyStateIllustration } from "@/components/illustrations/GeoShapes"
import EligibleGrantsFilter from "@/components/EligibleGrantsFilter"
import SmartSearchBar from "@/components/SmartSearchBar"
import ZipFilter from "@/components/ZipFilter"

// State-specific private agencies — only shown when user is in those states
const AGENCY_STATES: Record<string, string[]> = {
  "New York Foundation for the Arts":    ["NY"],
  "Artist Trust":                         ["WA"],
  "New England Foundation for the Arts": ["CT", "ME", "MA", "NH", "RI", "VT"],
  "Western States Arts Federation":      ["AK", "AZ", "CO", "ID", "MT", "NV", "NM", "OR", "UT", "WA", "WY"],
}

export const dynamic = "force-dynamic"

function formatAmount(amount: number | null) {
  if (!amount) return "Varies"
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`
  return `$${amount}`
}

function GrantCard({ grant }: { grant: Grant }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow relative flex flex-col h-full">
      <Link href={`/grants/${grant.slug}`} className="absolute inset-0 rounded-xl" aria-label={grant.name} />

      {/* Top row: status badge + save button */}
      <div className="flex items-center justify-between mb-1">
        <StatusBadge deadline={grant.deadline} isRecurring={grant.is_recurring} />
        <div className="relative z-10">
          <SaveInterestButton slug={grant.slug} type="grant" />
        </div>
      </div>

      {/* Agency */}
      <p className="text-xs text-slate-400 uppercase tracking-wide mt-1">{grant.agency}</p>

      {/* Grant name */}
      <h3 className="text-base font-semibold text-slate-900 line-clamp-2 mt-1">{grant.name}</h3>

      {/* Description */}
      <p className="text-sm text-slate-600 line-clamp-3 mt-2 flex-1">{grant.description}</p>

      {/* Bottom row */}
      <div className="mt-4 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900">
            Up to {formatAmount(grant.max_amount)}
          </span>
          <Badge variant="amber" className="capitalize">
            {grant.category.replace("_", " ")}
          </Badge>
        </div>
        <span className="text-blue-600 text-sm font-medium relative z-10 pointer-events-none">
          View Details →
        </span>
      </div>
    </div>
  )
}

const CATEGORY_LABELS: Record<string, string> = {
  small_business: "Small Business",
  individual:     "Individual",
  agricultural:   "Agricultural",
  research:       "Research",
  veterans:       "Veterans",
  arts:           "Arts",
}

type GrantSort = "amount_desc" | "amount_asc" | "processing_asc" | "deadline_asc" | "name_asc"

function sortGrants(grants: Grant[], sort: GrantSort | undefined): Grant[] {
  const arr = [...grants]
  switch (sort) {
    case "amount_desc":  return arr.sort((a, b) => (b.max_amount ?? -1) - (a.max_amount ?? -1))
    case "amount_asc":   return arr.sort((a, b) => (a.max_amount ?? Infinity) - (b.max_amount ?? Infinity))
    case "processing_asc": return arr.sort((a, b) => (a.processing_time_days ?? Infinity) - (b.processing_time_days ?? Infinity))
    case "deadline_asc": return arr.sort((a, b) => {
      if (!a.deadline && !b.deadline) return 0
      if (!a.deadline) return 1
      if (!b.deadline) return -1
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    })
    case "name_asc":     return arr.sort((a, b) => a.name.localeCompare(b.name))
    default:             return arr
  }
}

const SORT_LABELS: Record<GrantSort, string> = {
  amount_desc:     "Amount: High → Low",
  amount_asc:      "Amount: Low → High",
  processing_asc:  "Fastest processing",
  deadline_asc:    "Deadline: Soonest",
  name_asc:        "Name: A–Z",
}

const SOURCE_LABELS: Record<string, string> = {
  federal:  "Federal",
  state:    "State",
  local:    "Local",
  private:  "Private",
}

function buildGrantsUrl(p: { cats?: Set<string>; sources?: Set<string>; state?: string; zip?: string; q?: string; sort?: string; eligible?: string }) {
  const parts: string[] = []
  if (p.cats?.size) parts.push(`category=${Array.from(p.cats).join(",")}`)
  if (p.sources?.size) parts.push(`source=${Array.from(p.sources).join(",")}`)
  if (p.state) parts.push(`state=${p.state}`)
  if (p.zip)   parts.push(`zip=${p.zip}`)
  if (p.q) parts.push(`q=${encodeURIComponent(p.q)}`)
  if (p.sort) parts.push(`sort=${p.sort}`)
  if (p.eligible) parts.push(`eligible=${p.eligible}`)
  return `/grants${parts.length ? `?${parts.join("&")}` : ""}`
}

function toggleCat(selected: Set<string>, cat: string): Set<string> {
  const next = new Set(selected)
  if (next.has(cat)) {
    next.delete(cat)
  } else {
    next.add(cat)
  }
  return next
}

const chipBase = "shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors"
const chipActive = "bg-blue-600 text-white"
const chipInactive = "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
const chipSourceActive = "bg-indigo-600 text-white"

function Divider() {
  return <span className="shrink-0 w-px h-5 bg-slate-200 mx-0.5" />
}

export default async function GrantsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; source?: string; state?: string; zip?: string; q?: string; smart_q?: string; hint?: string; sort?: string; eligible?: string }>
}) {
  const { category, source, state, zip, q, smart_q, hint, sort, eligible } = await searchParams
  const isEligibleMode = eligible === "1"
  const selectedCategories = new Set((category ?? "").split(",").filter(Boolean))
  const selectedSources = new Set((source ?? "").split(",").filter(Boolean))
  const allGrants = await getGrants()
  const categories = Object.keys(CATEGORY_LABELS)

  // Smart search: use expanded keywords from Claude (pipe-separated) or fall back to literal query
  const searchTerms = smart_q
    ? smart_q.split("|").map((k) => k.trim()).filter(Boolean)
    : q
    ? [q]
    : []

  const filtered = allGrants.filter((g) => {
    if (selectedCategories.size > 0 && !selectedCategories.has(g.category)) return false
    if (selectedSources.size > 0 && !selectedSources.has(g.funding_source ?? "")) return false
    // Location filter — hide state-specific programs outside user's state
    if (state) {
      const agencyStates = AGENCY_STATES[g.agency]
      if (agencyStates && !agencyStates.includes(state)) return false
    }
    if (searchTerms.length > 0) {
      const haystack = `${g.name} ${g.description} ${g.agency}`.toLowerCase()
      if (!searchTerms.some((term) => haystack.includes(term.toLowerCase()))) return false
    }
    return true
  })

  const grants = sortGrants(filtered, sort as GrantSort | undefined)
  const hasActiveFilters = selectedCategories.size > 0 || selectedSources.size > 0 || !!state || !!q

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <SiteNav active="grants" />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Page header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Grants</h1>
            <p className="text-sm text-slate-600 mt-1">
              {allGrants.length} grants available — describe what you need and AI will find the best matches.
            </p>
          </div>
          <Link
            href="/quiz"
            className="hidden sm:block rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            Find my match →
          </Link>
        </div>

        {/* Smart search bar */}
        <SmartSearchBar type="grants" initialQuery={q ?? ""} initialHint={hint ?? ""} />

        {/* ── Filter bar ──────────────────────────────────────────────────── */}
        <div className="mb-6 space-y-2">

          {/* Row 1: quick filters + sort */}
          <div className="flex items-center gap-2 flex-wrap">
            <ZipFilter basePath="/grants" initialState={state} initialZip={zip} compact />
            <Link
              href={isEligibleMode
                ? buildGrantsUrl({ cats: selectedCategories, sources: selectedSources, state, zip, q, sort })
                : buildGrantsUrl({ cats: selectedCategories, sources: selectedSources, state, zip, q, sort, eligible: "1" })
              }
              className={`${chipBase} flex items-center gap-1.5 ${isEligibleMode ? chipActive : chipInactive}`}
            >
              <Sparkles className="w-3 h-3" />
              Eligible for me
            </Link>
            <SortSelect
              value={sort ?? ""}
              options={(Object.entries(SORT_LABELS) as [GrantSort, string][]).map(([val, label]) => ({ value: val, label }))}
            />
            {hasActiveFilters && (
              <Link href={buildGrantsUrl({ sort })} className="text-sm text-blue-600 hover:underline whitespace-nowrap">
                Clear all
              </Link>
            )}
          </div>

          {/* Row 2: funding source */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 -mx-4 px-4 sm:mx-0 sm:px-0">
            <span className="shrink-0 text-xs font-medium text-slate-400 uppercase tracking-wider mr-1">Source</span>
            {Object.entries(SOURCE_LABELS).map(([key, label]) => (
              <Link
                key={key}
                href={buildGrantsUrl({ cats: selectedCategories, sources: toggleCat(selectedSources, key), state, zip, q, sort })}
                className={`${chipBase} ${selectedSources.has(key) ? chipSourceActive : chipInactive}`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Row 3: category */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 -mx-4 px-4 sm:mx-0 sm:px-0">
            <span className="shrink-0 text-xs font-medium text-slate-400 uppercase tracking-wider mr-1">Category</span>
            <Link
              href={buildGrantsUrl({ sources: selectedSources, state, zip, q, sort })}
              className={`${chipBase} ${selectedCategories.size === 0 ? chipActive : chipInactive}`}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={buildGrantsUrl({ cats: toggleCat(selectedCategories, cat), sources: selectedSources, state, zip, q, sort })}
                className={`${chipBase} ${selectedCategories.has(cat) ? chipActive : chipInactive}`}
              >
                {CATEGORY_LABELS[cat] ?? cat.replace("_", " ")}
              </Link>
            ))}
          </div>

        </div>

        {/* Results */}
        {isEligibleMode ? (
          <EligibleGrantsFilter returnPath="/grants?eligible=1" />
        ) : (
          <>
            {/* Count */}
            <p className="text-sm text-slate-500 mb-5">
              <span className="font-medium text-slate-900">{grants.length}</span>{" "}
              {grants.length === 1 ? "grant" : "grants"}
              {state && <span className="text-slate-400"> · filtered by state</span>}
            </p>

            {/* Empty state */}
            {grants.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <EmptyStateIllustration className="w-24 h-20 mb-4" />
                <p className="text-base font-medium text-slate-900 mb-1">No grants found</p>
                <p className="text-sm text-slate-500">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <ProgramGrid itemLabel="grants">
                {grants.map((grant) => (
                  <GrantCard key={grant.id} grant={grant} />
                ))}
              </ProgramGrid>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        Grant information is for reference only. Verify eligibility with the issuing agency.
      </footer>
    </div>
  )
}
