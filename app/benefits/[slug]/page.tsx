import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronRight, ExternalLink, HeartHandshake } from "lucide-react"
import { getBenefits, getBenefitBySlug } from "@/lib/supabase"
import { getBenefitStats } from "@/lib/benefit-stats"
import SiteNav from "@/components/SiteNav"
import SaveInterestButton from "@/components/SaveInterestButton"
import { Badge, StatusBadge } from "@/components/ui/Badge"
import ApplyButton from "@/components/ApplyButton"
import BenefitDetailGuide from "./BenefitDetailGuide"
import StateProgramBanner from "@/components/StateProgramBanner"
import AdminVerificationWarning from "@/components/AdminVerificationWarning"
import ScrollToTop from "@/components/ScrollToTop"

export const revalidate = 3600
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
    title: `${benefit.name} - GrantWay`,
    description: benefit.description,
  }
}

function isStale(lastVerifiedAt: string | null | undefined): boolean {
  if (!lastVerifiedAt) return true
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
  return new Date(lastVerifiedAt).getTime() < thirtyDaysAgo
}

function VerificationWarning({ isVerified, lastVerifiedAt }: { isVerified?: boolean; lastVerifiedAt?: string | null }) {
  const stale = isStale(lastVerifiedAt)
  if (isVerified && !stale) return null

  const message = !isVerified
    ? "This record has not been verified against an official source yet."
    : "This record was last verified more than 30 days ago and may be outdated."

  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
      <span>{message} Always verify details directly with the issuing agency before applying.</span>
    </div>
  )
}

const SUBCATEGORY_LABELS: Record<string, string> = {
  housing: "Housing Assistance",
  food: "Food Aid",
  disability: "Disability Support",
  education: "Education",
  childcare: "Childcare",
  energy: "Energy Assistance",
  health: "Healthcare",
  veterans: "Veterans Benefits",
  reentry: "Reentry & Recovery",
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

function getApplyHostname(applicationUrl?: string | null, officialSourceUrl?: string | null): string | null {
  const url = applicationUrl || officialSourceUrl
  if (!url) return null
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return null
  }
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
    : "Benefit"
  const stats = getBenefitStats(benefit.slug)
  const applyHostname = getApplyHostname(benefit.application_url, benefit.official_source_url)

  // Related programs: same subcategory, different slug, up to 3
  const allBenefits = await getBenefits()
  const relatedBenefits = allBenefits
    .filter(b => b.slug !== benefit.slug && b.subcategory === benefit.subcategory)
    .slice(0, 3)

  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      <ScrollToTop />
      <SiteNav active="benefits" />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-500" aria-label="Breadcrumb">
          <Link href="/benefits" className="text-blue-600 hover:text-blue-700">
            All benefits
          </Link>
          <ChevronRight className="h-4 w-4 text-slate-400" />
          <span>{subcategoryLabel}</span>
          <ChevronRight className="h-4 w-4 text-slate-400" />
          <span className="max-w-xs truncate text-slate-900">{benefit.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          <div className="min-w-0 space-y-6">
            <AdminVerificationWarning isVerified={benefit.is_verified} lastVerifiedAt={benefit.last_verified_at} />

            <StateProgramBanner slug={benefit.slug} />

            <section className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{benefit.agency}</p>
              <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                {benefit.name}
              </h1>
              <div className="mt-5 flex flex-wrap gap-2">
                <Badge variant="green">Benefit</Badge>
                <Badge variant="amber">{subcategoryLabel}</Badge>
                {benefit.is_recurring && <Badge variant="slate">Recurring</Badge>}
                <StatusBadge deadline={benefit.deadline} isRecurring={benefit.is_recurring ?? false} />
              </div>

              <div className="mt-6 grid gap-4 border-t border-amber-100 pt-6 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">What it may cover</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{amount ?? "Varies"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Enrollment</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{deadline ?? "Open enrollment"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Where available</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{stats?.availability ?? "Check locally"}</p>
                </div>
              </div>
            </section>

            <BenefitDetailGuide
              slug={benefit.slug}
              name={benefit.name}
              subcategory={benefit.subcategory}
              description={benefit.description}
              eligibilityCriteria={benefit.eligibility_criteria}
              documents={benefit.required_documents}
              processingTimeDays={benefit.processing_time_days}
            />

            {stats && (
              <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900">Program impact</h2>
                {stats.keyFact && (
                  <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 px-5 py-4">
                    <p className="text-sm leading-6 text-blue-800">{stats.keyFact}</p>
                  </div>
                )}
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <ImpactStat label="People helped" value={stats.recipientsLabel} note={stats.recipientsNote} />
                  <ImpactStat label="Annual federal budget" value={stats.annualBudget} />
                  {stats.avgBenefit && <ImpactStat label="Average benefit" value={stats.avgBenefit} />}
                  <ImpactStat label="Established" value={stats.yearEstablished ? String(stats.yearEstablished) : "Varies"} />
                </div>
              </section>
            )}

            {relatedBenefits.length > 0 && (
              <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900">You may also qualify for</h2>
                <p className="mt-1 text-sm text-slate-500">Other programs in the same category that often go hand-in-hand.</p>
                <div className="mt-4 flex flex-col gap-3">
                  {relatedBenefits.map(b => (
                    <Link
                      key={b.slug}
                      href={`/benefits/${b.slug}`}
                      className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 p-4 hover:border-blue-200 hover:bg-blue-50 transition-colors group"
                    >
                      <div className="min-w-0">
                        <p className="text-xs text-slate-400 mb-0.5">{b.agency}</p>
                        <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 leading-snug">{b.name}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 shrink-0 mt-0.5 group-hover:text-blue-600" />
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-20">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Key details</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Status</dt>
                  <dd className="mt-1">
                    <StatusBadge deadline={benefit.deadline} isRecurring={benefit.is_recurring ?? false} />
                  </dd>
                </div>
                <DetailRow label="Max benefit" value={amount ?? "Varies"} />
                <DetailRow label="Type" value={subcategoryLabel} />
                <DetailRow label="Enrollment" value={deadline ?? "Open enrollment"} />
                <DetailRow label="Administered by" value={benefit.agency} />
              </dl>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <SaveInterestButton slug={benefit.slug} type="benefit" />
              <ApplyButton
                slug={benefit.slug}
                type="benefit"
                name={benefit.name}
                agency={benefit.agency}
                applicationUrl={benefit.application_url}
                officialSourceUrl={benefit.official_source_url}
                requiredDocuments={benefit.required_documents}
                className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Learn How to Apply
                <ExternalLink className="h-4 w-4" />
              </ApplyButton>
              {applyHostname && (
                <p className="mt-1.5 text-center text-xs text-slate-400">Opens {applyHostname}</p>
              )}
              {benefit.official_source_url && (
                <a
                  href={benefit.official_source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Official Source
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              <p className="mt-4 text-xs leading-5 text-slate-500">
                GrantWay helps you prepare. The agency or local office decides eligibility and benefit amounts.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd>
    </div>
  )
}

function ImpactStat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
      {note && <p className="mt-1 text-xs text-slate-500">{note}</p>}
    </div>
  )
}
