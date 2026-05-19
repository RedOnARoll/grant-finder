import Link from "next/link"
import { ArrowRight } from "lucide-react"
import SiteNav from "@/components/SiteNav"
import { QuizIllustration } from "@/components/illustrations/GeoShapes"

export default function QuizLandingPage() {
  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <SiteNav active="quiz" />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Find Your Match</h1>
          <p className="text-lg text-slate-600">
            Answer a few questions to find out what you qualify for.
            Choose the quiz that matches what you&apos;re looking for.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/quiz/grants"
            className="group bg-slate-900 text-white rounded-xl p-8 hover:shadow-xl transition-shadow cursor-pointer flex flex-col gap-4"
          >
            <QuizIllustration className="w-full max-w-[160px] opacity-80" />
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">Find Grants</h2>
              <p className="text-slate-300 text-sm mb-4">
                For businesses, researchers, nonprofits &amp; individuals
              </p>
              <div className="flex flex-wrap gap-2">
                {["Small Business", "Research", "Agricultural", "Arts", "Veterans", "Individual"].map((cat) => (
                  <span key={cat} className="text-xs px-2.5 py-1 rounded-lg bg-white/10 text-slate-200 font-medium">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-blue-400 group-hover:text-blue-300 transition-colors">
              Get started <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link
            href="/quiz/benefits"
            className="group bg-blue-600 text-white rounded-xl p-8 hover:shadow-xl transition-shadow cursor-pointer flex flex-col gap-4"
          >
            <div className="w-full max-w-[160px] h-24 flex items-center justify-center">
              <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" aria-hidden="true">
                <rect x="20" y="20" width="160" height="120" rx="10" fill="#ffffff" opacity="0.1" />
                <circle cx="60" cy="60" r="20" fill="#F59E0B" opacity="0.4" />
                <rect x="90" y="46" width="70" height="8" rx="4" fill="#ffffff" opacity="0.3" />
                <rect x="90" y="62" width="50" height="6" rx="3" fill="#ffffff" opacity="0.2" />
                <rect x="30" y="100" width="60" height="24" rx="6" fill="#ffffff" opacity="0.2" />
                <rect x="100" y="100" width="60" height="24" rx="6" fill="#ffffff" opacity="0.15" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">Find Benefits</h2>
              <p className="text-blue-100 text-sm mb-4">
                For businesses, researchers, nonprofits &amp; individuals
              </p>
              <div className="flex flex-wrap gap-2">
                {["By Situation", "By Category", "Housing", "Food", "Healthcare", "Disability"].map((tag) => (
                  <span key={tag} className="text-xs px-2.5 py-1 rounded-lg bg-white/15 text-blue-100 font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-blue-100 group-hover:text-white transition-colors">
              Get started <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-6 px-6 text-center text-xs text-slate-400">
        Information is for reference only. Verify eligibility directly with each program.
      </footer>
    </div>
  )
}
