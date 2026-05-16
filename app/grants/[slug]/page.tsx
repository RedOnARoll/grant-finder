import Link from "next/link"
import { notFound } from "next/navigation"
import { getGrants, getGrantBySlug } from "@/lib/supabase"
import SiteNav from "@/components/SiteNav"
import GrantEligibilityQuiz from "./GrantEligibilityQuiz"

export const dynamic = "force-dynamic"
export const dynamicParams = true

export async function generateStaticParams() {
  const grants = await getGrants()
  return grants.map((g) => ({ slug: g.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const grant = await getGrantBySlug(slug)
  if (!grant) return {}
  return {
    title: `${grant.name} – GrantFinder`,
    description: grant.description,
  }
}

function formatAmount(amount: number | null) {
  if (!amount) return "Varies"
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`
  return `$${amount}`
}

export default async function GrantDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const grant = await getGrantBySlug(slug)

  if (!grant) notFound()

  return (
    <div className="flex flex-col min-h-full">
      <SiteNav active="grants" />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
          <Link href="/grants" className="hover:text-zinc-900 transition-colors">
            Grants
          </Link>
          <span>/</span>
          <span className="text-zinc-900 truncate">{grant.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600 capitalize font-medium">
              {grant.category.replace("_", " ")}
            </span>
            {grant.subcategory && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600 capitalize font-medium">
                {grant.subcategory.replace("_", " ")}
              </span>
            )}
            {grant.is_recurring && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-700 font-medium">
                Recurring
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-zinc-900 mb-2 leading-tight">
            {grant.name}
          </h1>
          <p className="text-zinc-500 text-base mb-6">{grant.agency}</p>

          {/* Key stats row */}
          <div className="flex flex-wrap gap-8 mb-2">
            <div>
              <p className="text-xs text-zinc-400 uppercase tracking-wide font-medium mb-1">Max Amount</p>
              <p className="text-2xl font-bold text-zinc-900">{formatAmount(grant.max_amount)}</p>
            </div>
            {grant.deadline ? (
              <div>
                <p className="text-xs text-zinc-400 uppercase tracking-wide font-medium mb-1">Deadline</p>
                <p className="text-2xl font-bold text-zinc-900">
                  {new Date(grant.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-xs text-zinc-400 uppercase tracking-wide font-medium mb-1">Deadline</p>
                <p className="text-lg font-medium text-zinc-500">Open enrollment</p>
              </div>
            )}
            {grant.processing_time_days && (
              <div>
                <p className="text-xs text-zinc-400 uppercase tracking-wide font-medium mb-1">Processing Time</p>
                <p className="text-2xl font-bold text-zinc-900">{grant.processing_time_days} days</p>
              </div>
            )}
          </div>
        </div>

        <hr className="border-zinc-200 mb-8" />

        {/* Description */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-zinc-900 mb-3">About this grant</h2>
          <p className="text-zinc-600 leading-7">{grant.description}</p>
        </section>

        <hr className="border-zinc-200 mb-8" />

        {/* Eligibility quiz */}
        <section className="mb-10">
          <GrantEligibilityQuiz criteria={grant.eligibility_criteria} slug={grant.slug} />
        </section>
      </main>

      <footer className="border-t border-zinc-200 py-8 px-6 text-center text-sm text-zinc-500 mt-10">
        Grant information is for reference only. Verify eligibility with the issuing agency.
      </footer>
    </div>
  )
}
