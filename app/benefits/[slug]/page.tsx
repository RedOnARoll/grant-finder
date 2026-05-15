import Link from "next/link"
import { notFound } from "next/navigation"
import { getBenefits, getBenefitBySlug } from "@/lib/supabase"
import type { Grant, EligibilityCriteria } from "@/lib/types"
import DocumentChecklist from "./DocumentChecklist"
import { STATE_APPLY_URLS } from "@/lib/state-programs"
import StateApplyButton from "@/app/grants/[slug]/StateApplyButton"

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

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n)
}

function eligibilityItems(criteria: EligibilityCriteria | string[]): string[] {
  if (Array.isArray(criteria)) return criteria

  const c = criteria
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

  return items
}

function applicationSteps(benefit: Grant): { title: string; body: string }[] {
  return [
    {
      title: "Confirm your eligibility",
      body: "Read through each eligibility requirement carefully before applying. Government benefit programs often have specific income, residency, and documentation requirements — confirming you qualify upfront saves time.",
    },
    {
      title: "Gather your required documents",
      body: benefit.required_documents.length > 0
        ? `You will need: ${benefit.required_documents.join(", ")}. Use the checklist below to track your progress.`
        : "Review the official program page for any documentation requirements before applying.",
    },
    {
      title: `Visit ${benefit.agency}'s official website`,
      body: `Go to ${benefit.official_source_url} to read the full program guidelines and confirm any current deadlines or enrollment periods.`,
    },
    {
      title: "Submit your application",
      body: `Complete and submit your application at ${benefit.application_url}. Many federal benefit programs accept applications online, by phone, or in person at a local office. Keep a copy of your submission confirmation.`,
    },
    {
      title: "Track your application status",
      body: `${benefit.processing_time_days ? `Processing typically takes around ${benefit.processing_time_days} days.` : "Check the program page for expected processing timelines."} After submission, follow up with ${benefit.agency} if you haven't received a decision within the expected window.`,
    },
    {
      title: "Renew annually if required",
      body: `${benefit.is_recurring ? "This is an ongoing benefit that typically requires annual renewal or redetermination. Mark your calendar and prepare your documents before your renewal date." : "This is a one-time benefit. Keep all approval documentation for your records."}`,
    },
  ]
}

export default async function BenefitDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const benefit = await getBenefitBySlug(slug)

  if (!benefit) notFound()

  const eligibility = eligibilityItems(benefit.eligibility_criteria)
  const steps = applicationSteps(benefit)
  const stateUrls = STATE_APPLY_URLS[benefit.slug] ?? null
  const amount = formatAmount(benefit.max_amount)
  const subcategoryLabel = benefit.subcategory
    ? (SUBCATEGORY_LABELS[benefit.subcategory] ?? benefit.subcategory.replace("_", " "))
    : null

  return (
    <div className="flex flex-col min-h-full">
      {/* Nav */}
      <nav className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold text-zinc-900">
            GrantFinder
          </Link>
          <div className="flex gap-6 text-sm font-medium text-zinc-600">
            <Link href="/grants" className="hover:text-zinc-900 transition-colors">
              Grants
            </Link>
            <Link href="/benefits" className="text-zinc-900 font-semibold">
              Benefits
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
          <Link href="/benefits" className="hover:text-zinc-900 transition-colors">
            Benefits
          </Link>
          <span>/</span>
          <span className="text-zinc-900 truncate">{benefit.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
              Benefit
            </span>
            {subcategoryLabel && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600 font-medium">
                {subcategoryLabel}
              </span>
            )}
            {benefit.is_recurring && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-700 font-medium">
                Ongoing
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-zinc-900 mb-2 leading-tight">
            {benefit.name}
          </h1>
          <p className="text-zinc-500 text-base mb-6">{benefit.agency}</p>

          {amount && (
            <div className="flex flex-wrap gap-6 mb-8">
              <div>
                <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wide font-medium">Max Benefit</p>
                <p className="text-2xl font-bold text-zinc-900">{amount}</p>
              </div>
            </div>
          )}

          {!stateUrls && (
            <a
              href={benefit.application_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 transition-colors"
            >
              Apply at {benefit.agency} →
            </a>
          )}
        </div>

        <hr className="border-zinc-200 mb-10" />

        {/* Description */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-zinc-900 mb-4">About this benefit</h2>
          <p className="text-zinc-600 leading-7">{benefit.description}</p>
        </section>

        {/* Eligibility */}
        {eligibility.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">Eligibility Requirements</h2>
            <ul className="space-y-3">
              {eligibility.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1 shrink-0 w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center">
                    <svg className="w-3 h-3 text-blue-600" fill="none" viewBox="0 0 12 12">
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
        {benefit.required_documents.length > 0 && (
          <section className="mb-10">
            <DocumentChecklist documents={benefit.required_documents} />
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

        {/* State-specific apply + iframe */}
        {stateUrls ? (
          <StateApplyButton
            slug={benefit.slug}
            fallbackUrl={benefit.application_url}
            stateUrls={stateUrls}
            agencyName={benefit.agency}
            officialSourceUrl={benefit.official_source_url}
          />
        ) : (
          <>
            <section className="mb-10">
              <h2 className="text-xl font-semibold text-zinc-900 mb-2">Official Program Page</h2>
              <p className="text-sm text-zinc-500 mb-4">
                <a href={benefit.official_source_url} target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-900">
                  {benefit.official_source_url}
                </a>
                {" "}— if the preview doesn&apos;t load, open in a new tab.
              </p>
              <div className="rounded-xl border border-zinc-200 overflow-hidden">
                <iframe
                  src={benefit.official_source_url}
                  title={`${benefit.name} – official program page`}
                  className="w-full h-[600px]"
                  loading="lazy"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              </div>
            </section>

            <div className="rounded-xl bg-blue-50 border border-blue-100 p-6 flex items-center justify-between gap-6 flex-wrap">
              <div>
                <p className="font-semibold text-zinc-900 mb-1">Ready to apply?</p>
                <p className="text-sm text-zinc-500">
                  Visit the official {benefit.agency} page to start your application.
                </p>
              </div>
              <a
                href={benefit.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-10 px-6 rounded-full bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 transition-colors whitespace-nowrap"
              >
                Start Application →
              </a>
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-zinc-200 py-8 px-6 text-center text-sm text-zinc-500 mt-10">
        Benefit information is for reference only. Verify eligibility with the issuing agency.
      </footer>
    </div>
  )
}
