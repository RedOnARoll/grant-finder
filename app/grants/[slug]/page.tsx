import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronRight, ExternalLink } from "lucide-react"
import { getGrants, getGrantBySlug } from "@/lib/supabase"
import SiteNav from "@/components/SiteNav"
import SaveInterestButton from "@/components/SaveInterestButton"
import { Badge, StatusBadge } from "@/components/ui/Badge"
import GrantEligibilityQuiz from "./GrantEligibilityQuiz"
import NarrativeGate from "@/components/NarrativeGate"
import ApplyButton from "@/components/ApplyButton"

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

  const formattedDeadline = grant.deadline
    ? new Date(grant.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Open enrollment"

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <SiteNav active="grants" />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-slate-400 mb-8">
          <Link href="/grants" className="hover:text-slate-600 transition-colors">
            Grants
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-900 truncate max-w-xs">{grant.name}</span>
        </nav>

        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Left main area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Page header */}
            <div>
              {/* Badge row */}
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="amber" className="capitalize">{grant.category.replace("_", " ")}</Badge>
                {grant.subcategory && (
                  <Badge variant="slate" className="capitalize">{grant.subcategory.replace("_", " ")}</Badge>
                )}
                {grant.is_recurring && (
                  <Badge variant="green">Recurring</Badge>
                )}
                <StatusBadge deadline={grant.deadline} isRecurring={grant.is_recurring} />
              </div>

              <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-1">{grant.name}</h1>
              <p className="text-sm text-slate-500">{grant.agency}</p>
            </div>

            {/* Key stats row */}
            <div className="flex flex-wrap gap-3">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 min-w-[120px]">
                <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-1">Max Amount</p>
                <p className="text-lg font-bold text-slate-900">{formatAmount(grant.max_amount)}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 min-w-[120px]">
                <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-1">Deadline</p>
                <p className="text-lg font-bold text-slate-900">{formattedDeadline}</p>
              </div>
              {grant.processing_time_days && (
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 min-w-[120px]">
                  <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-1">Processing Time</p>
                  <p className="text-lg font-bold text-slate-900">{grant.processing_time_days} days</p>
                </div>
              )}
            </div>

            {/* Mobile CTA — right after stats, before long-form content */}
            <div className="lg:hidden flex gap-3">
              <ApplyButton
                slug={grant.slug}
                type="grant"
                name={grant.name}
                agency={grant.agency}
                applicationUrl={grant.application_url}
                officialSourceUrl={grant.official_source_url}
                requiredDocuments={grant.required_documents}
                className="flex-1 text-center bg-blue-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Start Application
              </ApplyButton>
              <div className="shrink-0">
                <SaveInterestButton slug={grant.slug} type="grant" />
              </div>
            </div>

            {/* Description card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h2 className="text-base font-semibold text-slate-900 mb-3">About this grant</h2>
              <p className="text-sm text-slate-600 leading-7">{grant.description}</p>
            </div>

            {/* Eligibility quiz card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <GrantEligibilityQuiz criteria={grant.eligibility_criteria} slug={grant.slug} />
            </div>

            {/* AI narrative generator — gated for free users */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h2 className="text-base font-semibold text-slate-900 mb-4">Write My Application</h2>
              <NarrativeGate grantName={grant.name} grantDescription={grant.description} />
            </div>
          </div>

          {/* Right sidebar */}
          <div className="lg:col-span-1 mt-8 lg:mt-0">
            <div className="sticky top-20 space-y-4">
              {/* Key details card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <h2 className="text-sm font-semibold text-slate-900 mb-4">Key Details</h2>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-xs text-slate-400 uppercase tracking-wide font-medium">Amount</dt>
                    <dd className="text-slate-900 font-semibold mt-0.5">{formatAmount(grant.max_amount)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-400 uppercase tracking-wide font-medium">Deadline</dt>
                    <dd className="text-slate-900 mt-0.5">{formattedDeadline}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-400 uppercase tracking-wide font-medium">Category</dt>
                    <dd className="mt-0.5">
                      <Badge variant="amber" className="capitalize">{grant.category.replace("_", " ")}</Badge>
                    </dd>
                  </div>
                  {grant.official_source_url && (
                    <div>
                      <dt className="text-xs text-slate-400 uppercase tracking-wide font-medium">Official Source</dt>
                      <dd className="mt-0.5">
                        <a
                          href={grant.official_source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 text-sm hover:underline inline-flex items-center gap-1"
                        >
                          View source
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <div className="w-full">
                  <SaveInterestButton slug={grant.slug} type="grant" />
                </div>
                <ApplyButton
                  slug={grant.slug}
                  type="grant"
                  name={grant.name}
                  agency={grant.agency}
                  applicationUrl={grant.application_url}
                  officialSourceUrl={grant.official_source_url}
                  requiredDocuments={grant.required_documents}
                  className="block w-full text-center bg-blue-600 text-white rounded-lg px-6 py-3 text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Start Application
                </ApplyButton>
                <ApplyButton
                  slug={grant.slug}
                  type="grant"
                  name={grant.name}
                  agency={grant.agency}
                  applicationUrl={grant.application_url}
                  officialSourceUrl={grant.official_source_url}
                  requiredDocuments={grant.required_documents}
                  className="block w-full text-center rounded-lg border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  View Document Checklist
                </ApplyButton>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
