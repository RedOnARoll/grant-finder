import Link from "next/link"
import { getGrants } from "@/lib/supabase"
import type { Grant } from "@/lib/types"

export const dynamic = "force-dynamic"

function formatAmount(amount: number | null) {
  if (!amount) return "Varies"
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`
  return `$${amount}`
}

function GrantCard({ grant }: { grant: Grant }) {
  return (
    <div className="rounded-xl border border-zinc-200 p-6 hover:border-zinc-400 transition-colors">
      <div className="flex items-start justify-between gap-4 mb-3">
        <Link
          href={`/grants/${grant.slug}`}
          className="text-base font-semibold text-zinc-900 leading-snug hover:underline"
        >
          {grant.name}
        </Link>
        <span className="shrink-0 text-sm font-semibold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-full">
          {formatAmount(grant.max_amount)}
        </span>
      </div>
      <p className="text-sm text-zinc-500 mb-1">{grant.agency}</p>
      <p className="text-sm text-zinc-600 mb-4 line-clamp-2">{grant.description}</p>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 capitalize">
            {grant.category.replace("_", " ")}
          </span>
          {grant.subcategory && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 capitalize">
              {grant.subcategory.replace("_", " ")}
            </span>
          )}
          {grant.is_recurring && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700">
              Recurring
            </span>
          )}
        </div>
        <div className="flex gap-3 items-center">
          <Link
            href={`/grants/${grant.slug}`}
            className="text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors"
          >
            View details
          </Link>
          <a
            href={grant.application_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-zinc-900 hover:underline"
          >
            Apply →
          </a>
        </div>
      </div>
    </div>
  )
}

const CATEGORY_LABELS: Record<string, string> = {
  small_business: "Small Business",
  individual:     "Individual",
  agricultural:   "Agricultural",
  research:       "Research",
  education:      "Education",
  veterans:       "Veterans",
  arts:           "Arts",
  housing:        "Housing",
  energy:         "Energy",
  health:         "Health",
}

export default async function GrantsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>
}) {
  const { category, q } = await searchParams
  const allGrants = await getGrants()
  const categories = Object.keys(CATEGORY_LABELS)

  const grants = allGrants.filter((g) => {
    if (category && g.category !== category) return false
    if (q && !g.name.toLowerCase().includes(q.toLowerCase()) &&
        !g.description.toLowerCase().includes(q.toLowerCase()) &&
        !g.agency.toLowerCase().includes(q.toLowerCase())) return false
    return true
  })

  return (
    <div className="flex flex-col min-h-full">
      <nav className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold text-zinc-900">
            GrantFinder
          </Link>
          <div className="flex gap-6 text-sm font-medium text-zinc-600">
            <Link href="/grants" className="text-zinc-900 font-semibold">
              Browse Grants
            </Link>
            <Link href="/quiz" className="hover:text-zinc-900 transition-colors">
              Eligibility Quiz
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Browse Grants</h1>
          <p className="text-zinc-500">
            {allGrants.length} grants available. Filter or search to narrow results.
          </p>
        </div>

        {/* Filters */}
        <form className="flex gap-3 mb-8 flex-wrap">
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search grants..."
            className="h-10 px-4 rounded-lg border border-zinc-300 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 min-w-[220px]"
          />
          <div className="flex gap-2 flex-wrap">
            <Link
              href="/grants"
              className={`h-10 px-4 rounded-lg border text-sm font-medium transition-colors flex items-center ${
                !category
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "border-zinc-300 text-zinc-700 hover:border-zinc-500"
              }`}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/grants?category=${cat}`}
                className={`h-10 px-4 rounded-lg border text-sm font-medium transition-colors flex items-center ${
                  category === cat
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "border-zinc-300 text-zinc-700 hover:border-zinc-500"
                }`}
              >
                {CATEGORY_LABELS[cat] ?? cat.replace("_", " ")}
              </Link>
            ))}
          </div>
          <button
            type="submit"
            className="h-10 px-4 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 transition-colors"
          >
            Search
          </button>
        </form>

        {/* Results */}
        {grants.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            <p className="text-lg mb-2">No grants found</p>
            <p className="text-sm">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-zinc-500 mb-4">
              Showing {grants.length} {grants.length === 1 ? "grant" : "grants"}
            </p>
            <div className="grid gap-4">
              {grants.map((grant) => (
                <GrantCard key={grant.id} grant={grant} />
              ))}
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-zinc-200 py-8 px-6 text-center text-sm text-zinc-500">
        Grant information is for reference only. Verify eligibility with the issuing agency.
      </footer>
    </div>
  )
}
