import Link from "next/link"
import { getGrants, getBenefits } from "@/lib/supabase"
import SiteNav from "@/components/SiteNav"

export const dynamic = "force-dynamic"

const GRANT_CATEGORIES: Record<string, { label: string; icon: string; description: string }> = {
  small_business: { label: "Small Business",  icon: "🏢", description: "Grants for entrepreneurs, startups, and growing businesses." },
  agricultural:   { label: "Agricultural",    icon: "🌾", description: "Funding for farmers, ranchers, and agricultural producers." },
  research:       { label: "Research",        icon: "🔬", description: "Grants for scientific research and innovation projects." },
  veterans:       { label: "Veterans",        icon: "🎖️", description: "Scholarships and grants for veterans and military families." },
  arts:           { label: "Arts",            icon: "🎨", description: "Grants supporting artists, performers, and cultural projects." },
  individual:     { label: "Individual",      icon: "👤", description: "Competitive grants and awards open to individuals." },
}

const BENEFIT_SUBCATEGORIES: Record<string, { label: string; icon: string; description: string }> = {
  housing:    { label: "Housing Assistance", icon: "🏠", description: "Rental assistance, affordable housing, and homeownership programs." },
  food:       { label: "Food Aid",           icon: "🥗", description: "Nutrition programs, food assistance, and meal services." },
  disability: { label: "Disability Support", icon: "♿", description: "Income support, rehabilitation, and independent living services." },
  education:  { label: "Education",          icon: "🎓", description: "Pell Grants, student aid, and adult education programs." },
  childcare:  { label: "Childcare",          icon: "👶", description: "Subsidized child care, Head Start, and early learning programs." },
  energy:     { label: "Energy Assistance",  icon: "⚡", description: "Heating, cooling, and home weatherization assistance." },
  health:     { label: "Healthcare",         icon: "❤️", description: "Medicaid, Medicare, CHIP, and community health programs." },
}

export default async function HomePage() {
  const [grants, benefits] = await Promise.all([getGrants(), getBenefits()])

  const grantCountByCategory: Record<string, number> = {}
  for (const g of grants) {
    grantCountByCategory[g.category] = (grantCountByCategory[g.category] ?? 0) + 1
  }

  const benefitCountBySubcategory: Record<string, number> = {}
  for (const b of benefits) {
    if (b.subcategory) {
      benefitCountBySubcategory[b.subcategory] = (benefitCountBySubcategory[b.subcategory] ?? 0) + 1
    }
  }

  return (
    <div className="flex flex-col min-h-full">
      <SiteNav />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-zinc-50 border-b border-zinc-200 py-24 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold tracking-tight text-zinc-900 mb-6">
              Find grants and benefits you qualify for
            </h1>
            <p className="text-xl text-zinc-600 mb-10 max-w-2xl mx-auto">
              Browse competitive grants for businesses and researchers, or explore
              government assistance programs for housing, food, healthcare, and more.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/quiz"
                className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 transition-colors"
              >
                Take the Quiz →
              </Link>
              <Link
                href="/grants"
                className="inline-flex items-center justify-center h-12 px-8 rounded-full border border-zinc-300 text-zinc-900 text-sm font-medium hover:bg-zinc-100 transition-colors"
              >
                Browse Grants
              </Link>
              <Link
                href="/benefits"
                className="inline-flex items-center justify-center h-12 px-8 rounded-full border border-zinc-300 text-zinc-900 text-sm font-medium hover:bg-zinc-100 transition-colors"
              >
                Browse Benefits
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 px-6 border-b border-zinc-200">
          <div className="max-w-3xl mx-auto grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-zinc-900">{grants.length}</p>
              <p className="text-sm text-zinc-500 mt-1">Grants available</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-zinc-900">{benefits.length}</p>
              <p className="text-sm text-zinc-500 mt-1">Benefit programs</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-zinc-900">
                {Object.keys(GRANT_CATEGORIES).length + Object.keys(BENEFIT_SUBCATEGORIES).length}
              </p>
              <p className="text-sm text-zinc-500 mt-1">Categories</p>
            </div>
          </div>
        </section>

        {/* Grants section */}
        <section className="py-16 px-6 border-b border-zinc-200">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl font-semibold text-zinc-900 mb-1">Grants</h2>
                <p className="text-sm text-zinc-500">Competitive funding you apply for — one-time or project-based awards.</p>
              </div>
              <Link href="/grants" className="text-sm font-medium text-zinc-900 hover:underline">
                View all {grants.length} →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(GRANT_CATEGORIES).map(([cat, meta]) => (
                <Link
                  key={cat}
                  href={`/grants?category=${cat}`}
                  className="group rounded-xl border border-zinc-200 p-6 hover:border-zinc-400 transition-colors"
                >
                  <div className="text-2xl mb-2">{meta.icon}</div>
                  <h3 className="text-base font-semibold text-zinc-900 mb-1 group-hover:text-zinc-700">
                    {meta.label}
                  </h3>
                  <p className="text-xs text-zinc-500 mb-3">{meta.description}</p>
                  <p className="text-xs font-medium text-zinc-600">
                    {grantCountByCategory[cat] ?? 0} grants →
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits section */}
        <section className="py-16 px-6 border-b border-zinc-200">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl font-semibold text-zinc-900 mb-1">Benefits</h2>
                <p className="text-sm text-zinc-500">Ongoing government assistance programs — housing, food, healthcare, and more.</p>
              </div>
              <Link href="/benefits" className="text-sm font-medium text-zinc-900 hover:underline">
                View all {benefits.length} →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(BENEFIT_SUBCATEGORIES).map(([sub, meta]) => (
                <Link
                  key={sub}
                  href={`/benefits?subcategory=${sub}`}
                  className="group rounded-xl border border-zinc-200 p-6 hover:border-blue-200 transition-colors"
                >
                  <div className="text-2xl mb-2">{meta.icon}</div>
                  <h3 className="text-base font-semibold text-zinc-900 mb-1 group-hover:text-zinc-700">
                    {meta.label}
                  </h3>
                  <p className="text-xs text-zinc-500 mb-3">{meta.description}</p>
                  <p className="text-xs font-medium text-zinc-600">
                    {benefitCountBySubcategory[sub] ?? 0} programs →
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Quiz CTA */}
        <section className="py-16 px-6 bg-zinc-900">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Not sure where to start?
            </h2>
            <p className="text-zinc-400 mb-8">
              Answer a few quick questions and we&apos;ll show you which grants and
              benefits you may be eligible for.
            </p>
            <Link
              href="/quiz"
              className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-white text-zinc-900 text-sm font-medium hover:bg-zinc-100 transition-colors"
            >
              Start Eligibility Quiz
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 py-8 px-6 text-center text-sm text-zinc-500">
        Information is for reference only. Verify eligibility directly with each program.
      </footer>
    </div>
  )
}
