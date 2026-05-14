import Link from "next/link"
import { notFound } from "next/navigation"
import { getGrants, getGrantBySlug } from "@/lib/supabase"
import type { Grant, EligibilityCriteria } from "@/lib/types"
import DocumentChecklist from "./DocumentChecklist"

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

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n)
}

function eligibilityItems(c: EligibilityCriteria): string[] {
  const items: string[] = []

  if (c.requires_us_citizen) items.push("Must be a US citizen")
  if (c.requires_us_resident) items.push("Must be a US resident or permanent resident")
  if (c.requires_student) items.push("Must be enrolled as an undergraduate student")
  if (c.education_level) items.push(`Must be pursuing an ${c.education_level} degree`)
  if (c.max_household_income)
    items.push(`Annual household income must not exceed ${formatCurrency(c.max_household_income)}`)
  if (c.max_household_income_percent_poverty)
    items.push(`Household income must be at or below ${c.max_household_income_percent_poverty}% of the federal poverty level`)
  if (c.max_household_income_percent_ami)
    items.push(`Household income must be at or below ${c.max_household_income_percent_ami}% of Area Median Income (AMI)`)

  if (c.requires_us_ownership) items.push("Business must be majority US-owned")
  if (c.requires_us_business) items.push("Must be a US-registered business")
  if (c.requires_minority_owned) items.push("Must be a minority-owned business")
  if (c.requires_woman_owned) items.push("Must be a woman-owned business")
  if (c.requires_rural) items.push("Must be located in a qualifying rural area")

  if (c.min_employees !== undefined && c.max_employees !== undefined)
    items.push(`Business must have between ${c.min_employees} and ${c.max_employees} employees`)
  else if (c.min_employees !== undefined)
    items.push(`Business must have at least ${c.min_employees} employee${c.min_employees === 1 ? "" : "s"}`)
  else if (c.max_employees !== undefined)
    items.push(`Business must have no more than ${c.max_employees} employees`)

  if (c.max_revenue)
    items.push(`Annual revenue must not exceed ${formatCurrency(c.max_revenue)}`)

  if (c.industries?.length)
    items.push(`Business must operate in: ${c.industries.map((i) => i.charAt(0).toUpperCase() + i.slice(1)).join(", ")}`)

  return items
}

function applicationSteps(grant: Grant): { title: string; body: string }[] {
  return [
    {
      title: "Review all eligibility requirements",
      body: "Read through every requirement carefully. Even one disqualifying criterion means the application won't succeed — confirm your situation matches before investing time.",
    },
    {
      title: "Gather your required documents",
      body: grant.required_documents.length > 0
        ? `You will need: ${grant.required_documents.join(", ")}. Use the checklist below to track your progress.`
        : "Review the official program page for any documentation requirements before applying.",
    },
    {
      title: `Visit ${grant.agency}'s official website`,
      body: `Go to the official source at ${grant.official_source_url} to read the full program guidelines, confirm deadlines, and download any official application forms.`,
    },
    {
      title: "Complete the application",
      body: `Fill out all required fields at ${grant.application_url}. Double-check that your information is accurate and consistent across all documents. Incomplete or inconsistent applications are a leading cause of rejection.`,
    },
    {
      title: "Submit and track your application",
      body: `Submit before any listed deadline${grant.deadline ? ` (${new Date(grant.deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })})` : ""}. Keep a copy of your submission confirmation. ${grant.processing_time_days ? `Processing typically takes around ${grant.processing_time_days} days.` : "Check the program page for expected processing timelines."}`,
    },
    {
      title: "Follow up if needed",
      body: `If you don't hear back within the expected window, contact ${grant.agency} directly through the contact information on their official website. Be ready to provide your application reference number.`,
    },
  ]
}

export default async function GrantDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const grant = await getGrantBySlug(slug)

  if (!grant) notFound()

  const eligibility = eligibilityItems(grant.eligibility_criteria)
  const steps = applicationSteps(grant)

  return (
    <div className="flex flex-col min-h-full">
      {/* Nav */}
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
        <div className="mb-10">
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

          <div className="flex flex-wrap gap-6 mb-8">
            <div>
              <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wide font-medium">Max Amount</p>
              <p className="text-2xl font-bold text-zinc-900">{formatAmount(grant.max_amount)}</p>
            </div>
            {grant.deadline && (
              <div>
                <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wide font-medium">Deadline</p>
                <p className="text-2xl font-bold text-zinc-900">
                  {new Date(grant.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            )}
            {grant.processing_time_days && (
              <div>
                <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wide font-medium">Processing Time</p>
                <p className="text-2xl font-bold text-zinc-900">{grant.processing_time_days} days</p>
              </div>
            )}
          </div>

          <a
            href={grant.application_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 transition-colors"
          >
            Apply at {grant.agency} →
          </a>
        </div>

        <hr className="border-zinc-200 mb-10" />

        {/* Description */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-zinc-900 mb-4">About this grant</h2>
          <p className="text-zinc-600 leading-7">{grant.description}</p>
        </section>

        {/* Eligibility */}
        {eligibility.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">Eligibility Requirements</h2>
            <ul className="space-y-3">
              {eligibility.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1 shrink-0 w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center">
                    <svg className="w-3 h-3 text-zinc-600" fill="none" viewBox="0 0 12 12">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-sm text-zinc-700 leading-5">{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Document checklist */}
        {grant.required_documents.length > 0 && (
          <section className="mb-10">
            <DocumentChecklist documents={grant.required_documents} />
          </section>
        )}

        {/* Application guide */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-zinc-900 mb-6">How to Apply</h2>
          <ol className="space-y-6">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-4">
                <div className="shrink-0 w-8 h-8 rounded-full bg-zinc-900 text-white text-sm font-semibold flex items-center justify-center">
                  {i + 1}
                </div>
                <div className="pt-1">
                  <h3 className="font-semibold text-zinc-900 mb-1">{step.title}</h3>
                  <p className="text-sm text-zinc-600 leading-6">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Official source iframe */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-zinc-900 mb-2">Official Program Page</h2>
          <p className="text-sm text-zinc-500 mb-4">
            Preview of{" "}
            <a href={grant.official_source_url} target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-900">
              {grant.official_source_url}
            </a>
            . If the preview doesn&apos;t load, visit the link directly.
          </p>
          <div className="rounded-xl border border-zinc-200 overflow-hidden">
            <iframe
              src={grant.official_source_url}
              title={`${grant.name} – official program page`}
              className="w-full h-[600px]"
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        </section>

        {/* Footer CTA */}
        <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-6 flex items-center justify-between gap-6 flex-wrap">
          <div>
            <p className="font-semibold text-zinc-900 mb-1">Ready to apply?</p>
            <p className="text-sm text-zinc-500">
              Visit the official {grant.agency} page to start your application.
            </p>
          </div>
          <a
            href={grant.application_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-10 px-6 rounded-full bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 transition-colors whitespace-nowrap"
          >
            Start Application →
          </a>
        </div>
      </main>

      <footer className="border-t border-zinc-200 py-8 px-6 text-center text-sm text-zinc-500 mt-10">
        Grant information is for reference only. Verify eligibility with the issuing agency.
      </footer>
    </div>
  )
}
