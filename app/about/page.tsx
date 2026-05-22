import Link from "next/link"
import { CheckCircle, Search, FileText, Users } from "lucide-react"
import SiteNav from "@/components/SiteNav"
import { LogoMark } from "@/components/illustrations/GeoShapes"

export const metadata = {
  title: "About – GrantWay",
  description: "Learn how GrantWay helps people find grants and benefits they actually qualify for.",
}

const VALUES = [
  {
    icon: Search,
    title: "Free, always",
    description:
      "Every grant and benefit on GrantWay is publicly funded. We never charge to search, match, or apply — and we never will.",
  },
  {
    icon: CheckCircle,
    title: "Accurate information",
    description:
      "We source criteria directly from official government and agency publications and update them as programs change.",
  },
  {
    icon: FileText,
    title: "No jargon",
    description:
      "Government program language is dense by design. We translate requirements into plain English so you can self-assess in minutes.",
  },
  {
    icon: Users,
    title: "Built for real people",
    description:
      "Most grant aggregators target professionals. GrantWay is built for individuals, small businesses, and families who don't have a grants consultant on retainer.",
  },
]

export default function AboutPage() {
  return (
    <>
      <SiteNav />

      <main>
        {/* Hero */}
        <section className="bg-slate-900 text-white py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <LogoMark className="w-12 h-12" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5">
              Funding is out there.<br />
              <span className="text-blue-400">We help you find it.</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              GrantWay indexes hundreds of federal, state, and private funding programs and matches
              you to the ones you actually qualify for — in minutes, for free.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-5">Why we built this</h2>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                Billions of dollars in grants and benefits go unclaimed every year — not because
                people don&apos;t need them, but because the process of finding and applying for them is
                overwhelming. Programs are scattered across dozens of agencies, requirements are
                written in bureaucratic language, and most directories just dump a raw list on you
                with no guidance.
              </p>
              <p>
                GrantWay was built to fix that. We aggregate programs from trusted official sources,
                translate their requirements into clear questions, and surface only the opportunities
                that match your actual situation. No spam, no subscriptions, no upsells — just a
                faster path from &quot;I need funding&quot; to &quot;here&apos;s what to apply for.&quot;
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 px-4 bg-slate-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-10 text-center">What we stand for</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {VALUES.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900">{title}</h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-10 text-center">How GrantWay works</h2>
            <ol className="space-y-8">
              {[
                {
                  step: 1,
                  title: "Tell us about yourself",
                  body: "Answer a short set of questions about your situation — location, income, business type, or whatever's relevant to the programs you're exploring. No account required to start.",
                },
                {
                  step: 2,
                  title: "We match you to real programs",
                  body: "GrantWay compares your answers against the eligibility criteria of every program in our database. You see only the programs you have a genuine shot at, ranked by relevance.",
                },
                {
                  step: 3,
                  title: "Apply with a clear roadmap",
                  body: "Each program page lists exactly what documents you'll need, what the application process looks like, and a direct link to the official application. No dead ends.",
                },
              ].map(({ step, title, body }) => (
                <li key={step} className="flex gap-5">
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-slate-900 text-white text-sm font-bold flex items-center justify-center">
                    {step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 bg-slate-900 text-white text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Ready to find funding?</h2>
            <p className="text-slate-300 mb-8">
              It takes about two minutes to see which grants and benefits you qualify for.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/quiz"
                className="inline-flex items-center justify-center h-11 px-6 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                Take the quiz
              </Link>
              <Link
                href="/grants"
                className="inline-flex items-center justify-center h-11 px-6 rounded-lg border border-slate-600 text-slate-200 font-medium hover:border-slate-400 hover:text-white transition-colors"
              >
                Browse grants
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
