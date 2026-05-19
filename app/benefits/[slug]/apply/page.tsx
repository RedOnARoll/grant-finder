import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronRight, BookOpen, ExternalLink } from "lucide-react"
import { getBenefitBySlug } from "@/lib/supabase"
import DocumentGuide from "@/components/DocumentGuide"
import SiteNav from "@/components/SiteNav"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const benefit = await getBenefitBySlug(slug)
  if (!benefit) return {}
  return { title: `Apply – ${benefit.name} – GrantFinder` }
}

export default async function BenefitApplyPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const benefit = await getBenefitBySlug(slug)

  if (!benefit) notFound()

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <SiteNav active="benefits" />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-8" aria-label="Breadcrumb">
          <Link href="/benefits" className="hover:text-slate-900 transition-colors">Benefits</Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <Link
            href={`/benefits/${benefit.slug}`}
            className="hover:text-slate-900 transition-colors truncate max-w-[200px]"
          >
            {benefit.name}
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-900">Apply</span>
        </nav>

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-1">
            Apply for {benefit.name}
          </h1>
          <p className="text-sm text-slate-500">{benefit.agency}</p>
        </div>

        <div className="max-w-2xl space-y-6">
          {/* Before You Start */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">Before You Start</h2>
            </div>
            <p className="text-slate-600 leading-7">
              Gather all required documents before opening your application. Having everything ready upfront
              prevents delays and reduces the chance of your application being rejected or put on hold.
            </p>
          </div>

          {/* Document guide */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <DocumentGuide documents={benefit.required_documents} />
          </div>

          {/* Learn How to Apply CTA */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div>
                <p className="font-semibold text-slate-900 mb-1">Ready to apply?</p>
                <p className="text-sm text-slate-500">
                  You&apos;ll be taken to the official {benefit.agency} application portal.
                </p>
              </div>
              <a
                href={benefit.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                Learn How to Apply
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-8 px-4 text-center text-sm text-slate-400 mt-10">
        Benefit information is for reference only. Verify eligibility with the issuing agency.
      </footer>
    </div>
  )
}
