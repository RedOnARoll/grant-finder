import Link from "next/link"
import { getBenefits } from "@/lib/supabase"
import type { Grant } from "@/lib/types"
import SortSelect from "@/components/SortSelect"
import SiteNav from "@/components/SiteNav"

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

function BenefitCard({ benefit }: { benefit: Grant }) {
  const amount = formatAmount(benefit.max_amount)
  return (
    <div className="relative rounded-xl border border-zinc-200 p-6 hover:border-zinc-400 transition-colors">
      <Link href={`/benefits/${benefit.slug}`} className="absolute inset-0 rounded-xl" aria-label={benefit.name} />
      <div className="flex items-start justify-between gap-4 mb-3">
        <span className="text-base font-semibold text-zinc-900 leading-snug">
          {benefit.name}
        </span>
        {amount && (
          <span className="shrink-0 text-sm font-semibold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-full">
            {amount}
          </span>
        )}
      </div>
      <p className="text-sm text-zinc-500 mb-1">{benefit.agency}</p>
      <p className="text-sm text-zinc-600 mb-4 line-clamp-2">{benefit.description}</p>
      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {benefit.subcategory && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 capitalize font-medium">
              {SUBCATEGORY_LABELS[benefit.subcategory] ?? benefit.subcategory.replace("_", " ")}
            </span>
          )}
          {benefit.is_recurring && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700">
              Ongoing
            </span>
          )}
        </div>
        <a
          href={benefit.application_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-zinc-900 hover:underline relative z-10"
        >
          Apply →
        </a>
      </div>
    </div>
  )
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
    <div className="flex flex-col min-h-full">
      <SiteNav active="benefits" />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Browse Benefits</h1>
          <p className="text-zinc-500">
            Government assistance programs — housing, food, healthcare, and more.{" "}
            {allBenefits.length} programs available.
          </p>
        </div>

        {/* Filters */}
        <form className="flex gap-3 mb-8 flex-wrap items-center">
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search benefits..."
            className="h-10 px-4 rounded-lg border border-zinc-300 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 min-w-[220px]"
          />
          <SortSelect
            value={sort ?? ""}
            options={(Object.entries(BENEFIT_SORT_LABELS) as [BenefitSort, string][]).map(([val, label]) => ({ value: val, label }))}
          />
          <div className="flex gap-2 flex-wrap">
            <Link
              href={`/benefits${sort ? `?sort=${sort}` : ""}`}
              className={`h-10 px-4 rounded-lg border text-sm font-medium transition-colors flex items-center ${
                !subcategory
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "border-zinc-300 text-zinc-700 hover:border-zinc-500"
              }`}
            >
              All
            </Link>
            {Object.entries(SUBCATEGORY_LABELS).map(([key, label]) => (
              <Link
                key={key}
                href={`/benefits?subcategory=${key}${sort ? `&sort=${sort}` : ""}`}
                className={`h-10 px-4 rounded-lg border text-sm font-medium transition-colors flex items-center ${
                  subcategory === key
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "border-zinc-300 text-zinc-700 hover:border-zinc-500"
                }`}
              >
                {label}
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
        {benefits.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            <p className="text-lg mb-2">No benefits found</p>
            <p className="text-sm">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-zinc-500 mb-4">
              Showing {benefits.length} {benefits.length === 1 ? "program" : "programs"}
            </p>
            <div className="grid gap-4">
              {benefits.map((benefit) => (
                <BenefitCard key={benefit.id} benefit={benefit} />
              ))}
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-zinc-200 py-8 px-6 text-center text-sm text-zinc-500">
        Benefit information is for reference only. Verify eligibility with the issuing agency.
      </footer>
    </div>
  )
}
