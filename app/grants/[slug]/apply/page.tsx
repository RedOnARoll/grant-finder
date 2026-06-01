import Link from "next/link"
import { notFound } from "next/navigation"
import { Award, CalendarDays, ChevronRight, ClipboardCheck, ExternalLink, FileText, Target } from "lucide-react"
import { getGrantBySlug } from "@/lib/supabase"
import type { EligibilityCriteria, Grant } from "@/lib/types"
import SiteNav from "@/components/SiteNav"
import GrantHelperClient from "./GrantHelperClient"

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const grant = await getGrantBySlug(slug)
  if (!grant) return {}
  return { title: `Apply – ${grant.name} – GrantWay` }
}

const CATEGORY_LABELS: Record<string, string> = {
  small_business: "Small business grant",
  individual: "Individual grant",
  agricultural: "Agricultural grant",
  research: "Research grant",
  education: "Education grant",
  veterans: "Veterans grant",
  arts: "Arts grant",
  housing: "Housing grant",
  energy: "Energy grant",
  health: "Health grant",
}

function formatAmount(amount: number | null) {
  if (!amount) return "Varies"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDeadline(deadline: string | null) {
  if (!deadline) return "Check official source"
  return new Date(deadline).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function getHostname(url?: string | null) {
  if (!url) return null
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return null
  }
}

function criteriaToList(criteria: EligibilityCriteria | string[]) {
  if (Array.isArray(criteria)) return criteria.filter(Boolean)

  const items: string[] = []
  if (criteria.requires_us_business) items.push("Applicant should be a U.S.-based business or organization.")
  if (criteria.requires_us_ownership) items.push("U.S. ownership or control may be required.")
  if (criteria.requires_us_resident) items.push("Applicant should be based in the United States.")
  if (criteria.requires_us_citizen) items.push("U.S. citizen or eligible non-citizen status may be required.")
  if (criteria.requires_rural) items.push("Rural location or rural service area may be required.")
  if (criteria.requires_minority_owned) items.push("Minority-owned status may strengthen or be required for eligibility.")
  if (criteria.requires_woman_owned) items.push("Woman-owned status may strengthen or be required for eligibility.")
  if (criteria.requires_student) items.push("Student enrollment or education status may be required.")
  if (criteria.max_employees) items.push(`Business size may be limited to ${criteria.max_employees.toLocaleString()} employees or fewer.`)
  if (criteria.min_employees) items.push(`Applicant may need at least ${criteria.min_employees.toLocaleString()} employees.`)
  if (criteria.max_revenue) items.push(`Annual revenue may need to be at or below ${formatAmount(criteria.max_revenue)}.`)
  if (criteria.industries?.length) items.push(`Relevant industries: ${criteria.industries.join(", ")}.`)
  if (criteria.education_level) items.push(`Education requirement: ${criteria.education_level}.`)
  return items
}

function buildReviewFocus(grant: Grant) {
  const focusByCategory: Record<string, string[]> = {
    small_business: [
      "Show the business problem, customer demand, and how funding creates measurable growth.",
      "Use numbers: revenue, jobs, contracts, milestones, or market traction.",
    ],
    individual: [
      "Explain your need clearly and connect the grant to a specific, realistic next step.",
      "Include proof of eligibility, timeline, and the result the funding will make possible.",
    ],
    agricultural: [
      "Connect the project to farm viability, conservation, food systems, or rural economic impact.",
      "Include acreage, production data, equipment needs, or operating history when relevant.",
    ],
    research: [
      "Frame the research question, method, deliverables, and why the work is novel or useful.",
      "Name partners, facilities, prior work, publications, or technical readiness when relevant.",
    ],
    education: [
      "Focus on student outcomes, access, completion, training quality, or institutional impact.",
      "Include who will be served and how success will be measured.",
    ],
    veterans: [
      "Connect the project to veteran outcomes, transition support, employment, housing, health, or community reintegration.",
      "Include service population, partners, and measurable support provided.",
    ],
    arts: [
      "Explain the creative work, audience, community value, timeline, and public outcome.",
      "Include portfolio strength, collaborators, venue, distribution, or prior recognition.",
    ],
    housing: [
      "Show housing need, stability impact, affordability, location, and readiness to proceed.",
      "Include tenant, homeowner, community, or property details required by the program.",
    ],
    energy: [
      "Focus on energy savings, emissions reduction, resilience, weatherization, or equipment upgrades.",
      "Include utility data, project scope, contractor estimates, or site details when available.",
    ],
    health: [
      "Connect the request to patient access, public health outcomes, service delivery, or care quality.",
      "Include population served, clinical or community partners, and measurable health impact.",
    ],
  }

  const items = focusByCategory[grant.category] ?? [
    "Connect the request to the program purpose and show a specific, measurable result.",
    "Use concrete dates, costs, partners, and evidence that you are ready to execute.",
  ]

  const eligibility = criteriaToList(grant.eligibility_criteria)
  return [...items, ...eligibility.slice(0, 2)].slice(0, 4)
}

function buildApplicationSteps(grant: Grant) {
  const host = getHostname(grant.application_url) ?? getHostname(grant.official_source_url) ?? `${grant.agency} portal`
  return [
    `Confirm the current notice and deadline on ${host}.`,
    grant.required_documents.length > 0
      ? `Prepare the required documents: ${grant.required_documents.slice(0, 3).join(", ")}${grant.required_documents.length > 3 ? ", and more" : ""}.`
      : "Prepare core organization, budget, project, and eligibility documents.",
    grant.form_numbers.length > 0
      ? `Find the program forms: ${grant.form_numbers.slice(0, 3).join(", ")}.`
      : "Draft answers before opening the official application portal.",
    "Submit through the official portal and save a copy of the confirmation page or email.",
  ]
}

function DetailCard({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Award }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-6 text-slate-900">{value}</p>
    </div>
  )
}

export default async function GrantApplyPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const grant = await getGrantBySlug(slug)

  if (!grant) notFound()

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <SiteNav active="grants" />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-slate-400 mb-8 flex-wrap">
          <Link href="/grants" className="hover:text-slate-600 transition-colors">Grants</Link>
          <ChevronRight className="w-4 h-4 shrink-0" />
          <Link href={`/grants/${grant.slug}`} className="hover:text-slate-600 transition-colors truncate max-w-[200px]">
            {grant.name}
          </Link>
          <ChevronRight className="w-4 h-4 shrink-0" />
          <span className="text-slate-900">Grant Helper</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <div className="min-w-0 space-y-8">
            {/* Header */}
            <section className="rounded-xl bg-slate-900 p-6 text-white shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">{CATEGORY_LABELS[grant.category] ?? "Grant application"}</p>
              <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">
                Apply for {grant.name}
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300">
                This helper is tailored to {grant.agency}, the program requirements on file, and the documents listed for this grant.
              </p>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <DetailCard label="Max award" value={formatAmount(grant.max_amount)} icon={Award} />
              <DetailCard label="Deadline" value={formatDeadline(grant.deadline)} icon={CalendarDays} />
              <DetailCard label="Agency" value={grant.agency} icon={ClipboardCheck} />
              <DetailCard label="Source" value={grant.funding_source ? `${grant.funding_source} funding` : "Official source"} icon={FileText} />
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-bold text-slate-900">What this application should emphasize</h2>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Use these points to make your draft match this grant instead of sounding like a generic application.
              </p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {buildReviewFocus(grant).map((item) => (
                  <li key={item} className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-950">
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* Main helper (prep, forms, questions, draft) */}
            <GrantHelperClient
              grantName={grant.name}
              grantDescription={`${grant.description}\n\nApplication focus:\n${buildReviewFocus(grant).map((item) => `- ${item}`).join("\n")}`}
              requiredDocuments={grant.required_documents}
              category={grant.category}
              agency={grant.agency}
              maxAmount={grant.max_amount}
              deadline={grant.deadline}
              formNumbers={grant.form_numbers}
            />
          </div>

          <aside className="space-y-4 lg:sticky lg:top-20">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Application path</h2>
              <ol className="mt-4 space-y-4">
                {buildApplicationSteps(grant).map((step, index) => (
                  <li key={step} className="flex gap-3 text-sm leading-6 text-slate-700">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-900 mb-1">Ready to submit?</p>
              <p className="text-sm leading-6 text-slate-500">
                Opens the official {getHostname(grant.application_url) ?? grant.agency} application portal.
              </p>
              <a
                href={grant.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Apply Now
                <ExternalLink className="w-4 h-4" />
              </a>
              {grant.official_source_url && (
                <a
                  href={grant.official_source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Official source
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
