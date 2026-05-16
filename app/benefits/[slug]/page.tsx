import Link from "next/link"
import { notFound } from "next/navigation"
import { getBenefits, getBenefitBySlug } from "@/lib/supabase"
import EligibilityQuiz from "./EligibilityQuiz"

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

  return (
    <div className="flex flex-col min-h-full">
      <nav className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold text-zinc-900">
            GrantFinder
          </Link>
          <div className="flex gap-6 text-sm font-medium text-zinc-600">
            <Link href="/grants" className="hover:text-zinc-900 transition-colors">Grants</Link>
            <Link href="/benefits" className="text-zinc-900 font-semibold">Benefits</Link>
            <Link href="/quiz" className="hover:text-zinc-900 transition-colors">Eligibility Quiz</Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
          <Link href="/benefits" className="hover:text-zinc-900 transition-colors">Benefits</Link>
          <span>/</span>
          <span className="text-zinc-900 truncate">{benefit.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">Benefit</span>
            {subcategoryLabel && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600 font-medium">{subcategoryLabel}</span>
            )}
            {benefit.is_recurring && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-700 font-medium">Ongoing</span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-zinc-900 mb-2 leading-tight">{benefit.name}</h1>
          <p className="text-zinc-500 text-base mb-6">{benefit.agency}</p>

          {/* Key stats */}
          <div className="flex flex-wrap gap-8">
            {amount && (
              <div>
                <p className="text-xs text-zinc-400 uppercase tracking-wide font-medium mb-1">Max Benefit</p>
                <p className="text-2xl font-bold text-zinc-900">{amount}</p>
              </div>
            )}
            {deadline && (
              <div>
                <p className="text-xs text-zinc-400 uppercase tracking-wide font-medium mb-1">Application Deadline</p>
                <p className="text-2xl font-bold text-zinc-900">{deadline}</p>
              </div>
            )}
            {!deadline && (
              <div>
                <p className="text-xs text-zinc-400 uppercase tracking-wide font-medium mb-1">Application Deadline</p>
                <p className="text-lg font-medium text-zinc-500">Open enrollment</p>
              </div>
            )}
          </div>
        </div>

        <hr className="border-zinc-200 mb-10" />

        {/* Description */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-zinc-900 mb-4">About this benefit</h2>
          <p className="text-zinc-600 leading-7">{benefit.description}</p>
        </section>

        {/* Inline eligibility quiz */}
        <section className="mb-10">
          <EligibilityQuiz criteria={benefit.eligibility_criteria} slug={benefit.slug} />
        </section>
      </main>

      <footer className="border-t border-zinc-200 py-8 px-6 text-center text-sm text-zinc-500 mt-10">
        Benefit information is for reference only. Verify eligibility with the issuing agency.
      </footer>
    </div>
  )
}
