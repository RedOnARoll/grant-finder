import Link from "next/link"
import { Sparkles } from "lucide-react"
import { getBenefits } from "@/lib/supabase"
import type { Grant } from "@/lib/types"
import SiteNav from "@/components/SiteNav"
import SortSelect from "@/components/SortSelect"
import SaveInterestButton from "@/components/SaveInterestButton"
import ProgramGrid from "@/components/ProgramGrid"
import { Badge, StatusBadge } from "@/components/ui/Badge"
import { EmptyStateIllustration } from "@/components/illustrations/GeoShapes"
import EligibleBenefits from "@/components/EligibleBenefits"
import SmartSearchBar from "@/components/SmartSearchBar"
import ZipFilter from "@/components/ZipFilter"

const AGENCY_STATES: Record<string, string[]> = {
  "New York Foundation for the Arts":    ["NY"],
  "Artist Trust":                         ["WA"],
  "New England Foundation for the Arts": ["CT", "ME", "MA", "NH", "RI", "VT"],
  "Western States Arts Federation":      ["AK", "AZ", "CO", "ID", "MT", "NV", "NM", "OR", "UT", "WA", "WY"],
}

type BenefitSort = "name_asc" | "subcategory_asc" | "amount_desc"

function sortBenefits(benefits: Grant[], sort: BenefitSort | undefined): Grant[] {
  const arr = [...benefits]
  switch (sort) {
    case "name_asc":        return arr.sort((a, b) => a.name.localeCompare(b.name))
    case "subcategory_asc": return arr.sort((a, b) => (a.subcategory ?? "").localeCompare(b.subcategory ?? ""))
    case "amount_desc":     return arr.sort((a, b) => (b.max_amount ?? -1) - (a.max_amount ?? -1))
    default:                return arr
  }
}

const BENEFIT_SORT_LABELS: Record<BenefitSort, string> = {
  name_asc:        "Name: A–Z",
  subcategory_asc: "Category",
  amount_desc:     "Amount: High → Low",
}

export const dynamic = "force-dynamic"

function formatAmount(amount: number | null) {
  if (!amount) return null
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`
  return `$${amount}`
}

const SUBCATEGORY_LABELS: Record<string, string> = {
  housing:    "Housing",
  food:       "Food Aid",
  disability: "Disability",
  education:  "Education",
  childcare:  "Childcare",
  energy:     "Energy",
  health:     "Healthcare",
}

function BenefitCard({ benefit }: { benefit: Grant }) {
  const amount = formatAmount(benefit.max_amount)
  const subcategoryLabel = benefit.subcategory
    ? (SUBCATEGORY_LABELS[benefit.subcategory] ?? benefit.subcategory.replace("_", " "))
    : null

  return (
    <div className="relative flex h-full flex-col bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5">
      <Link href={`/benefits/${benefit.slug}`} className="absolute inset-0 rounded-xl" aria-label={benefit.name} />

      {/* Top row: status + save */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <StatusBadge deadline={benefit.deadline} isRecurring={benefit.is_recurring ?? false} />
        <div className="relative z-10">
          <SaveInterestButton slug={benefit.slug} type="benefit" />
        </div>
      </div>

      {/* Agency */}
      <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">{benefit.agency}</p>

      {/* Name */}
      <h3 className="text-base font-semibold text-slate-900 leading-snug line-clamp-2 mb-2">
        {benefit.name}
      </h3>

      {/* Description */}
      <p className="text-sm text-slate-600 line-clamp-3 mb-4">{benefit.description}</p>

      {/* Bottom row */}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {amount && (
            <span className="text-sm font-semibold text-slate-900">{amount}</span>
          )}
          {subcategoryLabel && (
            <Badge variant="green">{subcategoryLabel}</Badge>
          )}
        </div>
        <Link
          href={`/benefits/${benefit.slug}`}
          className="relative z-10 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          View Details →
        </Link>
      </div>
    </div>
  )
}

const SOURCE_LABELS: Record<string, string> = {
  federal: "Federal",
  state:   "State",
  local:   "Local",
  private: "Private",
}

function buildBenefitsUrl(p: { cats?: Set<string>; sources?: Set<string>; state?: string; zip?: string; q?: string; sort?: string; eligible?: string }) {
  const parts: string[] = []
  if (p.cats?.size) parts.push(`subcategory=${Array.from(p.cats).join(",")}`)
  if (p.sources?.size) parts.push(`source=${Array.from(p.sources).join(",")}`)
  if (p.state) parts.push(`state=${p.state}`)
  if (p.zip)   parts.push(`zip=${p.zip}`)
  if (p.q) parts.push(`q=${encodeURIComponent(p.q)}`)
  if (p.sort) parts.push(`sort=${p.sort}`)
  if (p.eligible) parts.push(`eligible=${p.eligible}`)
  return `/benefits${parts.length ? `?${parts.join("&")}` : ""}`
}

function toggleSubcat(selected: Set<string>, cat: string): Set<string> {
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

export default async function BenefitsPage({
  searchParams,
}: {
  searchParams: Promise<{ subcategory?: string; source?: string; state?: string; zip?: string; q?: string; smart_q?: string; hint?: string; sort?: string; eligible?: string }>
}) {
  const { subcategory, source, state, zip, q, smart_q, hint, sort, eligible } = await searchParams
  const isEligibleMode = eligible === "1"
  const selectedSubcategories = new Set((subcategory ?? "").split(",").filter(Boolean))
  const selectedSources = new Set((source ?? "").split(",").filter(Boolean))
  const allBenefits = await getBenefits()

  // Smart search: use expanded keywords from Claude (pipe-separated) or fall back to literal query
  const searchTerms = smart_q
    ? smart_q.split("|").map((k) => k.trim()).filter(Boolean)
    : q
    ? [q]
    : []

  const filtered = allBenefits.filter((b) => {
    if (selectedSubcategories.size > 0 && !selectedSubcategories.has(b.subcategory ?? "")) return false
    if (selectedSources.size > 0 && !selectedSources.has(b.funding_source ?? "")) return false
    if (state) {
      const agencyStates = AGENCY_STATES[b.agency]
      if (agencyStates && !agencyStates.includes(state)) return false
    }
    if (searchTerms.length > 0) {
      const haystack = `${b.name} ${b.description} ${b.agency} ${b.subcategory ?? ""}`.toLowerCase()
      if (!searchTerms.some((term) => haystack.includes(term.toLowerCase()))) return false
    }
    return true
  })

  const benefits = sortBenefits(filtered, sort as BenefitSort | undefined)
  const hasActiveFilters = selectedSubcategories.size > 0 || selectedSources.size > 0 || !!state || !!q

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <SiteNav active="benefits" />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Benefits</h1>
          <p className="text-slate-600">
            Government assistance programs — housing, food, healthcare, and more.{" "}
            <span className="font-medium text-slate-900">{allBenefits.length} programs</span> available.
          </p>
        </div>

        {/* Smart search bar */}
        <SmartSearchBar type="benefits" initialQuery={q ?? ""} initialHint={hint ?? ""} />

        {/* ── Filter bar (2 rows) ─────────────────────────────────────────── */}
        <div className="mb-6 space-y-2">

          {/* Row 1: quick filters + sort */}
          <div className="flex items-center gap-2 flex-wrap">
            <ZipFilter basePath="/benefits" initialState={state} initialZip={zip} compact />
            <Link
              href={isEligibleMode
                ? buildBenefitsUrl({ cats: selectedSubcategories, sources: selectedSources, state, zip, q, sort })
                : buildBenefitsUrl({ cats: selectedSubcategories, sources: selectedSources, state, zip, q, sort, eligible: "1" })
              }
              className={`${chipBase} flex items-center gap-1.5 ${isEligibleMode ? chipActive : chipInactive}`}
            >
              <Sparkles className="w-3 h-3" />
              Eligible for me
            </Link>
            <div className="ml-auto flex items-center gap-2">
              <SortSelect
                value={sort ?? ""}
                options={(Object.entries(BENEFIT_SORT_LABELS) as [BenefitSort, string][]).map(([val, label]) => ({ value: val, label }))}
              />
              {hasActiveFilters && (
                <Link href={buildBenefitsUrl({ sort })} className="text-sm text-blue-600 hover:underline whitespace-nowrap">
                  Clear all
                </Link>
              )}
            </div>
          </div>

          {/* Row 2: source + category chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mr-1">Source</span>
            {Object.entries(SOURCE_LABELS).map(([key, label]) => (
              <Link
                key={key}
                href={buildBenefitsUrl({ cats: selectedSubcategories, sources: toggleSubcat(selectedSources, key), state, zip, q, sort })}
                className={`${chipBase} ${selectedSources.has(key) ? chipSourceActive : chipInactive}`}
              >
                {label}
              </Link>
            ))}

            <Divider />

            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mr-1">Category</span>
            <Link
              href={buildBenefitsUrl({ sources: selectedSources, state, zip, q, sort })}
              className={`${chipBase} ${selectedSubcategories.size === 0 ? chipActive : chipInactive}`}
            >
              All
            </Link>
            {Object.entries(SUBCATEGORY_LABELS).map(([key, label]) => (
              <Link
                key={key}
                href={buildBenefitsUrl({ cats: toggleSubcat(selectedSubcategories, key), sources: selectedSources, state, zip, q, sort })}
                className={`${chipBase} ${selectedSubcategories.has(key) ? chipActive : chipInactive}`}
              >
                {label}
              </Link>
            ))}
          </div>

        </div>

        {/* Results */}
        {isEligibleMode ? (
          <EligibleBenefits />
        ) : (
          <>
            {/* Count */}
            {benefits.length > 0 && (
              <p className="text-sm text-slate-500 mb-5">
                Showing <span className="font-medium text-slate-900">{benefits.length}</span>{" "}
                {benefits.length === 1 ? "program" : "programs"}
                {state && <span className="text-slate-400"> · filtered by state</span>}
              </p>
            )}

            {/* Grid or empty state */}
            {benefits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <EmptyStateIllustration />
                <p className="mt-4 text-base font-medium text-slate-900">No benefits found</p>
                <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filters.</p>
                <Link href="/benefits" className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Clear filters
                </Link>
              </div>
            ) : (
              <ProgramGrid itemLabel="programs">
                {benefits.map((benefit) => (
                  <BenefitCard key={benefit.id} benefit={benefit} />
                ))}
              </ProgramGrid>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-slate-200 py-8 px-4 text-center text-sm text-slate-400 mt-10">
        Benefit information is for reference only. Verify eligibility with the issuing agency.
      </footer>
    </div>
  )
}
