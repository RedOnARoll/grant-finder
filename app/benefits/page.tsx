import Link from "next/link"
import { Search } from "lucide-react"
import { getBenefits } from "@/lib/supabase"
import type { Grant } from "@/lib/types"
import SiteNav from "@/components/SiteNav"
import SaveInterestButton from "@/components/SaveInterestButton"
import { Badge, StatusBadge } from "@/components/ui/Badge"
import { EmptyStateIllustration } from "@/components/illustrations/GeoShapes"

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
  housing:    "Housing Assistance",
  food:       "Food Aid",
  disability: "Disability Support",
  education:  "Education",
  childcare:  "Childcare",
  energy:     "Energy Assistance",
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

export default async function BenefitsPage({
  searchParams,
}: {
  searchParams: Promise<{ subcategory?: string; q?: string; sort?: string }>
}) {
  const { subcategory, q, sort } = await searchParams
  const allBenefits = await getBenefits()

  const filtered = allBenefits.filter((b) => {
    if (subcategory && b.subcategory !== subcategory) return false
    if (q && !b.name.toLowerCase().includes(q.toLowerCase()) &&
        !b.description.toLowerCase().includes(q.toLowerCase()) &&
        !b.agency.toLowerCase().includes(q.toLowerCase())) return false
    return true
  })

  const benefits = sortBenefits(filtered, sort as BenefitSort | undefined)

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <SiteNav active="benefits" />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Benefits</h1>
          <p className="text-slate-600">
            Government assistance programs — housing, food, healthcare, and more.{" "}
            <span className="font-medium text-slate-900">{allBenefits.length} programs</span> available.
          </p>
        </div>

        <div className="flex gap-8 items-start">
          {/* Sidebar */}
          <aside className="hidden lg:flex flex-col gap-6 w-64 shrink-0">
            {/* Search */}
            <form>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  name="q"
                  defaultValue={q ?? ""}
                  placeholder="Search benefits…"
                  className="w-full h-10 pl-9 pr-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                {subcategory && <input type="hidden" name="subcategory" value={subcategory} />}
                {sort && <input type="hidden" name="sort" value={sort} />}
              </div>
              <button type="submit" className="sr-only">Search</button>
            </form>

            {/* Benefit Type filter */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Benefit Type
                </span>
                {subcategory && (
                  <Link
                    href={`/benefits${q ? `?q=${q}` : ""}${sort ? `${q ? "&" : "?"}sort=${sort}` : ""}`}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Clear
                  </Link>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Link
                  href={`/benefits${q ? `?q=${q}` : ""}${sort ? `${q ? "&" : "?"}sort=${sort}` : ""}`}
                  className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    !subcategory
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All Types
                </Link>
                {Object.entries(SUBCATEGORY_LABELS).map(([key, label]) => (
                  <Link
                    key={key}
                    href={`/benefits?subcategory=${key}${q ? `&q=${q}` : ""}${sort ? `&sort=${sort}` : ""}`}
                    className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      subcategory === key
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Sort By
              </label>
              <div className="flex flex-col gap-1.5">
                {(Object.entries(BENEFIT_SORT_LABELS) as [BenefitSort, string][]).map(([val, label]) => (
                  <Link
                    key={val}
                    href={`/benefits?sort=${val}${subcategory ? `&subcategory=${subcategory}` : ""}${q ? `&q=${q}` : ""}`}
                    className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      sort === val
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Clear all */}
            {(subcategory || q || sort) && (
              <Link href="/benefits" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Clear all filters
              </Link>
            )}
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Mobile: horizontal chip row */}
            <div className="lg:hidden mb-4">
              {/* Mobile search */}
              <form className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    name="q"
                    defaultValue={q ?? ""}
                    placeholder="Search benefits…"
                    className="w-full h-10 pl-9 pr-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  {subcategory && <input type="hidden" name="subcategory" value={subcategory} />}
                  {sort && <input type="hidden" name="sort" value={sort} />}
                </div>
                <button type="submit" className="sr-only">Search</button>
              </form>
              {/* Mobile subcategory chips */}
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
                <Link
                  href={`/benefits${q ? `?q=${q}` : ""}${sort ? `${q ? "&" : "?"}sort=${sort}` : ""}`}
                  className={`shrink-0 text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    !subcategory
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  All
                </Link>
                {Object.entries(SUBCATEGORY_LABELS).map(([key, label]) => (
                  <Link
                    key={key}
                    href={`/benefits?subcategory=${key}${q ? `&q=${q}` : ""}${sort ? `&sort=${sort}` : ""}`}
                    className={`shrink-0 text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      subcategory === key
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Results count */}
            {benefits.length > 0 && (
              <p className="text-sm text-slate-500 mb-4">
                Showing <span className="font-medium text-slate-900">{benefits.length}</span>{" "}
                {benefits.length === 1 ? "program" : "programs"}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {benefits.map((benefit) => (
                  <BenefitCard key={benefit.id} benefit={benefit} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-8 px-4 text-center text-sm text-slate-400 mt-10">
        Benefit information is for reference only. Verify eligibility with the issuing agency.
      </footer>
    </div>
  )
}
