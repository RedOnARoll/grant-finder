import Link from "next/link"
import { CheckCircle, ArrowRight, ChevronRight } from "lucide-react"
import { getGrants, getBenefits } from "@/lib/supabase"
import SiteNav from "@/components/SiteNav"
import { Badge } from "@/components/ui/Badge"
import { HeroIllustration, QuizIllustration, LogoMark } from "@/components/illustrations/GeoShapes"

export const dynamic = "force-dynamic"

const GRANT_CATEGORIES: Record<string, { label: string; description: string; accent: string }> = {
  small_business: { label: "Small Business",  description: "Grants for entrepreneurs, startups, and growing businesses.", accent: "bg-blue-100"   },
  agricultural:   { label: "Agricultural",    description: "Funding for farmers, ranchers, and agricultural producers.", accent: "bg-emerald-100" },
  research:       { label: "Research",        description: "Grants for scientific research and innovation projects.",    accent: "bg-indigo-100"  },
  veterans:       { label: "Veterans",        description: "Scholarships and grants for veterans and military families.", accent: "bg-amber-100"  },
  arts:           { label: "Arts",            description: "Grants supporting artists, performers, and cultural projects.", accent: "bg-rose-100" },
  individual:     { label: "Individual",      description: "Competitive grants and awards open to individuals.",         accent: "bg-slate-100"  },
}

const BENEFIT_SUBCATEGORIES: Record<string, { label: string; description: string; accent: string }> = {
  housing:    { label: "Housing Assistance", description: "Rental assistance, affordable housing, and homeownership programs.", accent: "bg-blue-100"    },
  food:       { label: "Food Aid",           description: "Nutrition programs, food assistance, and meal services.",            accent: "bg-emerald-100" },
  disability: { label: "Disability Support", description: "Income support, rehabilitation, and independent living services.",   accent: "bg-amber-100"   },
  education:  { label: "Education",          description: "Pell Grants, student aid, and adult education programs.",            accent: "bg-indigo-100"  },
  childcare:  { label: "Childcare",          description: "Subsidized child care, Head Start, and early learning programs.",    accent: "bg-rose-100"    },
  energy:     { label: "Energy Assistance",  description: "Heating, cooling, and home weatherization assistance.",              accent: "bg-orange-100"  },
  health:     { label: "Healthcare",         description: "Medicaid, Medicare, CHIP, and community health programs.",           accent: "bg-teal-100"    },
}

const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Complete Your Profile",
    description: "Answer a few questions about your situation — takes about 2 minutes and requires no account.",
  },
  {
    step: 2,
    title: "Get Matched",
    description: "We compare your profile against 500+ programs to surface the grants and benefits most relevant to you.",
  },
  {
    step: 3,
    title: "Apply with Confidence",
    description: "Get step-by-step guidance, required documents, and direct links to each program's official application.",
  },
]

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

        {/* ── HERO ─────────────────────────────────────────────────── */}
        <section className="bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
            <div className="flex flex-col lg:flex-row items-center gap-12">

              {/* Left — text */}
              <div className="flex-1 lg:max-w-[60%]">
                <div className="mb-5">
                  <Badge variant="amber">Free Grant &amp; Benefits Matching</Badge>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-5">
                  Find grants and benefits<br className="hidden sm:block" /> you qualify for
                </h1>
                <p className="text-lg text-slate-300 mb-8 max-w-xl">
                  Browse competitive grants for businesses and researchers, or explore
                  government assistance programs for housing, food, healthcare, and more.
                </p>

                {/* CTA buttons */}
                <div className="flex flex-wrap gap-3 mb-8">
                  <Link
                    href="/programs"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-medium rounded-lg px-5 py-2.5 hover:bg-blue-700 transition-colors"
                  >
                    Browse All Programs
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/grants"
                    className="inline-flex items-center gap-2 border border-slate-600 text-white text-sm font-medium rounded-lg px-5 py-2.5 hover:border-white transition-colors"
                  >
                    Grants Only
                  </Link>
                  <Link
                    href="/quiz"
                    className="inline-flex items-center gap-2 border border-slate-600 text-white text-sm font-medium rounded-lg px-5 py-2.5 hover:border-white transition-colors"
                  >
                    Take the Quiz
                  </Link>
                </div>

                {/* Trust row */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-400">
                  {["500+ programs", "Updated regularly", "No account required to browse"].map((item) => (
                    <span key={item} className="flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right — illustration */}
              <div className="hidden lg:flex flex-1 items-center justify-center">
                <HeroIllustration className="w-full max-w-sm opacity-90" />
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS BAR ────────────────────────────────────────────── */}
        <section className="bg-white py-8 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-2xl font-bold text-slate-900">{grants.length + benefits.length}+</p>
                <p className="text-sm text-slate-500 mt-0.5">Grants &amp; Benefits</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">Fed, State &amp; Private</p>
                <p className="text-sm text-slate-500 mt-0.5">Funding Sources</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">Free</p>
                <p className="text-sm text-slate-500 mt-0.5">Always Free to Use</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">2 min</p>
                <p className="text-sm text-slate-500 mt-0.5">Average Quiz Time</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
        <section className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section title */}
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-slate-900">How GrantWay Works</h2>
              <p className="text-slate-600 mt-2">Three simple steps from profile to application</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {HOW_IT_WORKS.map(({ step, title, description }, idx) => (
                <div key={step} className="relative flex gap-4 md:flex-col md:gap-0">
                  {/* Card */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow flex-1">
                    {/* Step circle */}
                    <div className="w-9 h-9 rounded-lg bg-blue-600 text-white text-sm font-bold flex items-center justify-center mb-4">
                      {step}
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 mb-2">{title}</h3>
                    <p className="text-sm text-slate-600">{description}</p>
                  </div>

                  {/* Arrow connector — shown on desktop between cards */}
                  {idx < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden md:flex absolute top-1/2 -right-4 -translate-y-1/2 z-10">
                      <ChevronRight className="w-5 h-5 text-slate-300" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BROWSE BY CATEGORY ───────────────────────────────────── */}
        <section className="bg-slate-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-bold text-slate-900">Browse by Category</h2>
              <p className="text-slate-600 mt-2">Explore programs by the topics that matter most to you</p>
            </div>

            {/* Grants sub-section */}
            <div className="mb-10">
              <div className="flex items-end justify-between mb-5">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Grants</h3>
                  <p className="text-sm text-slate-500">Competitive funding — one-time or project-based awards</p>
                </div>
                <Link
                  href="/grants"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                >
                  View all {grants.length}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(GRANT_CATEGORIES).map(([cat, meta]) => (
                  <Link
                    key={cat}
                    href={`/grants?category=${cat}`}
                    className="group bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className={`w-8 h-8 rounded-md ${meta.accent} mb-3`} />
                    <h4 className="text-sm font-semibold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {meta.label}
                    </h4>
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">{meta.description}</p>
                    <p className="text-xs font-medium text-blue-600">
                      {grantCountByCategory[cat] ?? 0} programs →
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Benefits sub-section */}
            <div>
              <div className="flex items-end justify-between mb-5">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Benefits</h3>
                  <p className="text-sm text-slate-500">Ongoing government assistance — housing, food, healthcare &amp; more</p>
                </div>
                <Link
                  href="/benefits"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                >
                  View all {benefits.length}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(BENEFIT_SUBCATEGORIES).map(([sub, meta]) => (
                  <Link
                    key={sub}
                    href={`/benefits?subcategory=${sub}`}
                    className="group bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className={`w-8 h-8 rounded-md ${meta.accent} mb-3`} />
                    <h4 className="text-sm font-semibold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {meta.label}
                    </h4>
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">{meta.description}</p>
                    <p className="text-xs font-medium text-blue-600">
                      {benefitCountBySubcategory[sub] ?? 0} programs →
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── QUIZ CTA ─────────────────────────────────────────────── */}
        <section className="bg-slate-900 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center gap-10">
              {/* Left — text */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-3">Not sure where to start?</h2>
                <p className="text-slate-400 mb-7 max-w-md">
                  Answer a few quick questions and we&apos;ll show you which grants and
                  benefits you may be eligible for — no account needed.
                </p>
                <Link
                  href="/quiz"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-medium rounded-lg px-5 py-2.5 hover:bg-blue-700 transition-colors"
                >
                  Take the 2-minute quiz
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Right — illustration */}
              <div className="flex-shrink-0">
                <QuizIllustration className="w-48 h-auto opacity-90" />
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">

            {/* Column 1 — Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <LogoMark className="w-6 h-6" />
                <span className="text-base font-bold text-white">GrantWay</span>
              </div>
              <p className="text-sm text-slate-400 max-w-xs">
                Helping people and organizations discover grants and benefits they actually qualify for.
              </p>
            </div>

            {/* Column 2 — Explore */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Explore</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li><Link href="/programs" className="hover:text-white transition-colors">All Programs</Link></li>
                <li><Link href="/grants"   className="hover:text-white transition-colors">Grants</Link></li>
                <li><Link href="/benefits" className="hover:text-white transition-colors">Benefits</Link></li>
                <li><Link href="/quiz"     className="hover:text-white transition-colors">Eligibility Quiz</Link></li>
              </ul>
            </div>

            {/* Column 3 — Account */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Account</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li><Link href="/auth"    className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/account" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/account" className="hover:text-white transition-colors">Profile</Link></li>
              </ul>
            </div>

            {/* Column 4 — Legal */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms of Use</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-slate-800 pt-6 text-sm text-slate-500 text-center">
            © 2025 GrantWay. Built to help people find funding. Information is for reference only — verify eligibility directly with each program.
          </div>
        </div>
      </footer>
    </div>
  )
}
