import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { getBenefits, getBenefitBySlug } from "@/lib/supabase"
import { getBenefitStats } from "@/lib/benefit-stats"
import EligibilityQuiz from "./EligibilityQuiz"
import SiteNav from "@/components/SiteNav"
import SaveInterestButton from "@/components/SaveInterestButton"
import { Badge, StatusBadge } from "@/components/ui/Badge"

export const dynamic = "force-dynamic"
export const dynamicParams = true

export async function generateStaticParams() {
  const benefits = await getBenefits()
  return benefits.map((b) => ({ slug: b.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const benefit = await getBenefitBySlug(slug)
  if (!benefit) return {}
  return {
    title: `${benefit.name} – GrantFinder`,
    description: benefit.description,
  }
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

function formatAmount(amount: number | null) {
  if (!amount) return null
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`
  return `$${amount}`
}

function formatDeadline(deadline: string | null) {
  if (!deadline) return null
  return new Date(deadline).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export default async function BenefitDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const benefit = await getBenefitBySlug(slug)

  if (!benefit) notFound()

  const amount = formatAmount(benefit.max_amount)
  const deadline = formatDeadline(benefit.deadline)
  const subcategoryLabel = benefit.subcategory
    ? (SUBCATEGORY_LABELS[benefit.subcategory] ?? benefit.subcategory.replace("_", " "))
    : null
  const stats = getBenefitStats(benefit.slug)

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <SiteNav active="benefits" />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-8" aria-label="Breadcrumb">
          <Link href="/benefits" className="hover:text-slate-900 transition-colors">Benefits</Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-900 truncate">{benefit.name}</span>
        </nav>

        <div className="flex gap-8 items-start">
          {/* Left main column */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Header card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="green">Benefit</Badge>
                {subcategoryLabel && <Badge variant="blue">{subcategoryLabel}</Badge>}
                {benefit.is_recurring && <Badge variant="slate">Recurring</Badge>}
              </div>

              {/* Title + agency */}
              <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-1">{benefit.name}</h1>
              <p className="text-sm text-slate-500 mb-5">{benefit.agency}</p>

              {/* Key stats row */}
              <div className="flex flex-wrap gap-6 border-t border-slate-100 pt-5">
                {amount && (
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-1">Max Benefit</p>
                    <p className="text-2xl font-bold text-slate-900">{amount}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-1">Enrollment Period</p>
                  {deadline ? (
                    <p className="text-2xl font-bold text-slate-900">{deadline}</p>
                  ) : (
                    <p className="text-lg font-medium text-slate-500">Open enrollment</p>
                  )}
                </div>
                {stats?.yearEstablished && (
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-1">Established</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.yearEstablished}</p>
                  </div>
                )}
              </div>
            </div>

            {/* About section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">About this benefit</h2>
              <p className="text-slate-600 leading-7">{benefit.description}</p>
            </div>

            {/* Program Impact */}
            {stats && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Program Impact</h2>

                {stats.keyFact && (
                  <div className="rounded-xl bg-blue-50 border border-blue-100 px-5 py-4 mb-4">
                    <p className="text-sm text-blue-800 leading-6">{stats.keyFact}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-200 px-5 py-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-1">People Helped</p>
                    <p className="text-xl font-bold text-slate-900">{stats.recipientsLabel}</p>
                    {stats.recipientsNote && (
                      <p className="text-xs text-slate-500 mt-0.5">{stats.recipientsNote}</p>
                    )}
                  </div>
                  <div className="rounded-xl border border-slate-200 px-5 py-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-1">Annual Federal Budget</p>
                    <p className="text-xl font-bold text-slate-900">{stats.annualBudget}</p>
                  </div>
                  {stats.avgBenefit && (
                    <div className="rounded-xl border border-slate-200 px-5 py-4">
                      <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-1">Average Benefit</p>
                      <p className="text-base font-semibold text-slate-900">{stats.avgBenefit}</p>
                    </div>
                  )}
                  <div className="rounded-xl border border-slate-200 px-5 py-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-1">Where Available</p>
                    <p className="text-sm font-medium text-slate-900">{stats.availability}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Eligibility Quiz */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <EligibilityQuiz criteria={benefit.eligibility_criteria} slug={benefit.slug} />
            </div>
          </div>

          {/* Right sticky sidebar */}
          <aside className="hidden lg:flex flex-col gap-4 w-72 shrink-0 sticky top-6">
            {/* Key details card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Key Details</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-0.5">Status</dt>
                  <dd>
                    <StatusBadge deadline={benefit.deadline} isRecurring={benefit.is_recurring ?? false} />
                  </dd>
                </div>
                {amount && (
                  <div>
                    <dt className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-0.5">Max Benefit</dt>
                    <dd className="text-sm font-semibold text-slate-900">{amount}</dd>
                  </div>
                )}
                {subcategoryLabel && (
                  <div>
                    <dt className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-0.5">Type</dt>
                    <dd className="text-sm text-slate-600">{subcategoryLabel}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-0.5">Enrollment</dt>
                  <dd className="text-sm text-slate-600">{deadline ?? "Open enrollment"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-0.5">Administered by</dt>
                  <dd className="text-sm text-slate-600">{benefit.agency}</dd>
                </div>
              </dl>
            </div>

            {/* Save button */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <SaveInterestButton slug={benefit.slug} type="benefit" />
            </div>

            {/* Apply CTA */}
            <Link
              href={`/benefits/${benefit.slug}/apply`}
              className="flex items-center justify-center w-full h-11 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Learn How to Apply
            </Link>

            <p className="text-xs text-slate-400 text-center leading-relaxed px-1">
              You may qualify for this benefit. Review all eligibility requirements before applying.
            </p>
          </aside>
        </div>

        {/* Mobile apply CTA */}
        <div className="lg:hidden mt-6 space-y-3">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <SaveInterestButton slug={benefit.slug} type="benefit" />
          </div>
          <Link
            href={`/benefits/${benefit.slug}/apply`}
            className="flex items-center justify-center w-full h-11 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Learn How to Apply
          </Link>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-8 px-4 text-center text-sm text-slate-400 mt-10">
        Benefit information is for reference only. Verify eligibility with the issuing agency.
      </footer>
    </div>
  )
}
