import Link from "next/link"
import { Search } from "lucide-react"
import { getGrants } from "@/lib/supabase"
import type { Grant } from "@/lib/types"
import SortSelect from "@/components/SortSelect"
import SiteNav from "@/components/SiteNav"
import SaveInterestButton from "@/components/SaveInterestButton"
import { Badge, StatusBadge } from "@/components/ui/Badge"
import { EmptyStateIllustration } from "@/components/illustrations/GeoShapes"

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

export default async function GrantsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; sort?: string }>
}) {
  const { category, q, sort } = await searchParams
  const allGrants = await getGrants()
  const categories = Object.keys(CATEGORY_LABELS)

  const filtered = allGrants.filter((g) => {
    if (category && g.category !== category) return false
    if (q && !g.name.toLowerCase().includes(q.toLowerCase()) &&
        !g.description.toLowerCase().includes(q.toLowerCase()) &&
        !g.agency.toLowerCase().includes(q.toLowerCase())) return false
    return true
  })

  const grants = sortGrants(filtered, sort as GrantSort | undefined)

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <SiteNav active="grants" />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Page header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Grants</h1>
            <p className="text-sm text-slate-600 mt-1">
              {allGrants.length} grants available — filter or search to narrow results.
            </p>
          </div>
          <Link
            href="/quiz"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            Find my match →
          </Link>
        </div>

        {/* Mobile: horizontal scrollable category chips */}
        <div className="lg:hidden mb-6 overflow-x-auto">
          <form>
            <div className="flex gap-2 pb-1 min-w-max">
              <input type="hidden" name="q" value={q ?? ""} />
              <Link
                href={`/grants${q ? `?q=${q}` : ""}${sort ? `${q ? "&" : "?"}sort=${sort}` : ""}`}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  !category
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/grants?category=${cat}${q ? `&q=${q}` : ""}${sort ? `&sort=${sort}` : ""}`}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    category === cat
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {CATEGORY_LABELS[cat] ?? cat.replace("_", " ")}
                </Link>
              ))}
              {(category || q) && (
                <Link
                  href={`/grants${sort ? `?sort=${sort}` : ""}`}
                  className="px-3 py-1.5 rounded-lg text-sm text-blue-600 hover:underline whitespace-nowrap"
                >
                  Clear
                </Link>
              )}
            </div>
          </form>
        </div>

        <div className="flex gap-8">
          {/* Sidebar — desktop only */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 p-4 sticky top-20">
              <h2 className="text-sm font-semibold text-slate-900 mb-4">Filters</h2>

              {/* Search input */}
              <form className="mb-5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="q"
                    defaultValue={q ?? ""}
                    placeholder="Search grants..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                  {category && <input type="hidden" name="category" value={category} />}
                  {sort && <input type="hidden" name="sort" value={sort} />}
                </div>
              </form>

              {/* Category */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Category</p>
                <div className="flex flex-col gap-1">
                  <Link
                    href={`/grants${q ? `?q=${q}` : ""}${sort ? `${q ? "&" : "?"}sort=${sort}` : ""}`}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      !category
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    All
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat}
                      href={`/grants?category=${cat}${q ? `&q=${q}` : ""}${sort ? `&sort=${sort}` : ""}`}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        category === cat
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {CATEGORY_LABELS[cat] ?? cat.replace("_", " ")}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Clear filters */}
              {(category || q) && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <Link
                    href={`/grants${sort ? `?sort=${sort}` : ""}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Clear Filters
                  </Link>
                </div>
              )}
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Top row: count + sort */}
            <div className="flex items-center justify-between gap-4 mb-5">
              <p className="text-sm text-slate-500">
                {grants.length} {grants.length === 1 ? "grant" : "grants"}
              </p>
              <SortSelect
                value={sort ?? ""}
                options={(Object.entries(SORT_LABELS) as [GrantSort, string][]).map(([val, label]) => ({ value: val, label }))}
              />
            </div>

            {/* Empty state */}
            {grants.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <EmptyStateIllustration className="w-24 h-20 mb-4" />
                <p className="text-base font-medium text-slate-900 mb-1">No grants found</p>
                <p className="text-sm text-slate-500">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {grants.map((grant) => (
                  <GrantCard key={grant.id} grant={grant} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        Grant information is for reference only. Verify eligibility with the issuing agency.
      </footer>
    </div>
  )
}
