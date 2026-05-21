import Link from "next/link"
import SiteNav from "@/components/SiteNav"

type Section = {
  title: string
  body: string[]
}

export default function LegalPage({
  title,
  description,
  sections,
}: {
  title: string
  description: string
  sections: Section[]
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteNav />
      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            Back to GrantWay
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">{title}</h1>
          <p className="mt-3 text-base leading-7 text-slate-600">{description}</p>
          <p className="mt-4 text-sm text-slate-500">Last updated: May 21, 2026</p>
        </div>

        <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
              <div className="mt-2 space-y-3 text-sm leading-6 text-slate-600">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
          GrantWay is not a government agency and does not make final eligibility or award decisions. Always use the
          official program website or agency contact information before submitting an application.
        </div>
      </main>
    </div>
  )
}
