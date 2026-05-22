import Link from "next/link"
import { notFound } from "next/navigation"
import { CalendarDays, ChevronRight, Clock, DollarSign, ExternalLink, Sparkles } from "lucide-react"
import { getGrants, getGrantBySlug } from "@/lib/supabase"
import type { Grant } from "@/lib/types"
import SiteNav from "@/components/SiteNav"
import SaveInterestButton from "@/components/SaveInterestButton"
import { Badge } from "@/components/ui/Badge"
import NarrativeGate from "@/components/NarrativeGate"
import ApplyButton from "@/components/ApplyButton"
import GrantDetailTabs from "./GrantDetailTabs"

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
    title: `${grant.name} - GrantWay`,
    description: grant.description,
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

  const daysAgo = lastVerifiedAt
    ? Math.floor((Date.now() - new Date(lastVerifiedAt).getTime()) / (24 * 60 * 60 * 1000))
    : null

  const message = !isVerified
    ? "This record has not been verified against an official source yet."
    : `This record was last verified ${daysAgo} days ago and may be outdated.`

  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
      <span>{message} Always verify details directly with the issuing agency before applying.</span>
    </div>
  )
}

function formatAmount(amount: number | null) {
  if (!amount) return "Varies"
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`
  return `$${amount}`
}

function formatDate(deadline: string | null) {
  if (!deadline) return "Rolling"
  return new Date(deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function getUrgency(grant: Grant) {
  if (grant.is_recurring || !grant.deadline) {
    return { label: "Rolling deadline", classes: "bg-slate-100 text-slate-700", dot: "bg-slate-400" }
  }

  const daysUntil = Math.ceil((new Date(grant.deadline).getTime() - Date.now()) / 86400000)
  if (daysUntil < 0) return { label: "Closed", classes: "bg-rose-50 text-rose-600", dot: "bg-rose-600" }
  if (daysUntil <= 14) return { label: `${daysUntil} days left - urgent`, classes: "bg-rose-50 text-rose-600", dot: "bg-rose-600" }
  if (daysUntil <= 60) return { label: `${daysUntil} days left`, classes: "bg-amber-50 text-amber-700", dot: "bg-amber-500" }
  return { label: `${daysUntil} days left`, classes: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-700" }
}

function StatCard({
  label,
  value,
  note,
  icon: Icon,
}: {
  label: string
  value: string
  note?: string
  icon: typeof DollarSign
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="mb-3 flex items-center gap-2 text-slate-400">
        <Icon className="h-4 w-4" />
        <p className="text-xs font-medium uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-xl font-bold tabular-nums text-white">{value}</p>
      {note && <p className="mt-1 text-xs text-slate-500">{note}</p>}
    </div>
  )
}

export default async function GrantDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const grant = await getGrantBySlug(slug)

  if (!grant) notFound()

  const urgency = getUrgency(grant)
  const category = grant.category.replace("_", " ")
  const reviewCycle = grant.processing_time_days ? `${grant.processing_time_days} days` : "Varies"

  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      <SiteNav active="grants" />

      <section className="bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 pb-8 pt-6 sm:px-6 lg:px-8">
          <nav className="mb-6 flex items-center gap-1 text-sm text-slate-400" aria-label="Breadcrumb">
            <Link href="/grants" className="text-blue-300 hover:text-white">
              Grants database
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="capitalize">{category}</span>
            <ChevronRight className="h-4 w-4" />
            <span className="max-w-xs truncate text-white">{grant.name}</span>
          </nav>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${urgency.classes}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${urgency.dot}`} />
                  {urgency.label}
                </span>
                <Badge variant="blue">Grant</Badge>
                <Badge variant="amber" className="capitalize">{category}</Badge>
                {grant.funding_source && <Badge variant="slate" className="capitalize">{grant.funding_source}</Badge>}
              </div>
              <h1 className="max-w-4xl text-3xl font-bold leading-tight tracking-tight text-white">{grant.name}</h1>
              <p className="mt-2 text-sm text-slate-400">{grant.agency}</p>
            </div>

            <div className="flex flex-wrap gap-2 lg:justify-end">
              <SaveInterestButton slug={grant.slug} type="grant" />
              <ApplyButton
                slug={grant.slug}
                type="grant"
                name={grant.name}
                agency={grant.agency}
                applicationUrl={grant.application_url}
                officialSourceUrl={grant.official_source_url}
                requiredDocuments={grant.required_documents}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Start Application
                <ExternalLink className="h-4 w-4" />
              </ApplyButton>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Max award" value={formatAmount(grant.max_amount)} icon={DollarSign} />
            <StatCard label="Deadline" value={formatDate(grant.deadline)} icon={CalendarDays} />
            <StatCard label="Match score" value="Profile needed" note="Take quiz for score" icon={Sparkles} />
            <StatCard label="Documents" value={`${grant.required_documents.length || 3}`} note="estimated items" icon={ExternalLink} />
            <StatCard label="Review cycle" value={reviewCycle} icon={Clock} />
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <VerificationWarning isVerified={grant.is_verified} lastVerifiedAt={grant.last_verified_at} />

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
            <div className="min-w-0">
              <div className="lg:hidden mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <ApplyButton
                  slug={grant.slug}
                  type="grant"
                  name={grant.name}
                  agency={grant.agency}
                  applicationUrl={grant.application_url}
                  officialSourceUrl={grant.official_source_url}
                  requiredDocuments={grant.required_documents}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Start Application
                  <ExternalLink className="h-4 w-4" />
                </ApplyButton>
              </div>

              <GrantDetailTabs
                description={grant.description}
                agency={grant.agency}
                eligibilityCriteria={grant.eligibility_criteria}
                documents={grant.required_documents}
                processingTimeDays={grant.processing_time_days}
              />
            </div>

            <aside className="space-y-4 lg:sticky lg:top-20">
              <div className="overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm">
                <div className="bg-slate-900 p-5 text-white">
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-300">
                    <Sparkles className="h-4 w-4 text-blue-300" />
                    GrantWay Pro
                  </div>
                  <h2 className="text-lg font-bold leading-snug">Draft this application with AI</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Generate a tailored proposal narrative using this grant and your answers.
                  </p>
                </div>
                <div className="p-5">
                  <NarrativeGate grantName={grant.name} grantDescription={grant.description} />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Key dates</h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-4 border-b border-dashed border-slate-100 pb-3">
                    <dt className="text-slate-500">Application deadline</dt>
                    <dd className="text-right font-medium tabular-nums text-slate-900">{formatDate(grant.deadline)}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-dashed border-slate-100 pb-3">
                    <dt className="text-slate-500">Review cycle</dt>
                    <dd className="text-right font-medium text-slate-900">{reviewCycle}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Source</dt>
                    <dd className="text-right font-medium capitalize text-slate-900">{grant.funding_source ?? "Not listed"}</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Resources</h2>
                <div className="mt-4 space-y-3">
                  {grant.official_source_url && (
                    <a
                      href={grant.official_source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-slate-50"
                    >
                      Official source
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  <ApplyButton
                    slug={grant.slug}
                    type="grant"
                    name={grant.name}
                    agency={grant.agency}
                    applicationUrl={grant.application_url}
                    officialSourceUrl={grant.official_source_url}
                    requiredDocuments={grant.required_documents}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    View Document Checklist
                  </ApplyButton>
                </div>
                <p className="mt-4 text-xs leading-5 text-slate-500">
                  Starting an application opens official agency guidance. GrantWay does not submit applications on your behalf.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  )
}
