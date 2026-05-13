import Link from "next/link"
import { getGrants } from "@/lib/supabase"

const CATEGORY_META: Record<string, { label: string; icon: string; description: string }> = {
  small_business: { label: "Small Business", icon: "🏢", description: "Grants for entrepreneurs, startups, and growing businesses." },
  individual:     { label: "Individual",     icon: "👤", description: "Benefits and assistance programs for individuals and families." },
  agricultural:   { label: "Agricultural",   icon: "🌾", description: "Funding for farmers, ranchers, and agricultural producers." },
  research:       { label: "Research",       icon: "🔬", description: "Grants for scientific research and innovation projects." },
  education:      { label: "Education",      icon: "🎓", description: "Scholarships and grants for students and educational programs." },
  veterans:       { label: "Veterans",       icon: "🎖️", description: "Benefits and scholarships for veterans and military families." },
  arts:           { label: "Arts",           icon: "🎨", description: "Grants supporting artists, performers, and cultural projects." },
  housing:        { label: "Housing",        icon: "🏠", description: "Assistance programs for housing, homeownership, and shelter." },
  energy:         { label: "Energy",         icon: "⚡", description: "Grants for clean energy, efficiency, and weatherization." },
  health:         { label: "Health",         icon: "❤️", description: "Funding for healthcare programs, research, and services." },
}

export default async function HomePage() {
  const grants = await getGrants()
  const totalFunding = grants.reduce((sum, g) => sum + (g.max_amount ?? 0), 0)

  const countByCategory: Record<string, number> = {}
  for (const g of grants) {
    countByCategory[g.category] = (countByCategory[g.category] ?? 0) + 1
  }
  const categories = Object.keys(countByCategory)

  return (
    <div className="flex flex-col min-h-full">
      <nav className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold text-zinc-900">
            GrantFinder
          </Link>
          <div className="flex gap-6 text-sm font-medium text-zinc-600">
            <Link href="/grants" className="hover:text-zinc-900 transition-colors">
              Browse Grants
            </Link>
            <Link href="/quiz" className="hover:text-zinc-900 transition-colors">
              Eligibility Quiz
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-zinc-50 border-b border-zinc-200 py-24 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold tracking-tight text-zinc-900 mb-6">
              Find grants you actually qualify for
            </h1>
            <p className="text-xl text-zinc-600 mb-10 max-w-2xl mx-auto">
              Stop wasting time on grants you&apos;re not eligible for. Browse our
              database or take a quick quiz to discover funding matched to your
              situation.
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
                Browse All Grants
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
              <p className="text-4xl font-bold text-zinc-900">
                ${(totalFunding / 1_000_000).toFixed(1)}M+
              </p>
              <p className="text-sm text-zinc-500 mt-1">Total funding</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-zinc-900">{categories.length}</p>
              <p className="text-sm text-zinc-500 mt-1">Categories</p>
            </div>
          </div>
        </section>

        {/* Category cards */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold text-zinc-900 mb-8">
              Browse by category
            </h2>
            <div className="grid grid-cols-2 gap-6">
              {categories.map((cat) => {
                const meta = CATEGORY_META[cat] ?? { label: cat.replace("_", " "), icon: "📋", description: "" }
                return (
                  <Link
                    key={cat}
                    href={`/grants?category=${cat}`}
                    className="group rounded-xl border border-zinc-200 p-8 hover:border-zinc-400 transition-colors"
                  >
                    <div className="text-3xl mb-3">{meta.icon}</div>
                    <h3 className="text-lg font-semibold text-zinc-900 mb-2 group-hover:text-zinc-700 capitalize">
                      {meta.label}
                    </h3>
                    <p className="text-sm text-zinc-500 mb-4">{meta.description}</p>
                    <p className="text-sm font-medium text-zinc-700">
                      {countByCategory[cat]} grants →
                    </p>
                  </Link>
                )
              })}
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
              Answer a few quick questions and we&apos;ll show you which grants you
              may be eligible for.
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
        Grant information is for reference only. Verify eligibility with the issuing agency.
      </footer>
    </div>
  )
}
