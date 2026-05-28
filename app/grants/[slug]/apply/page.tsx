import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronRight, ExternalLink } from "lucide-react"
import { getGrantBySlug } from "@/lib/supabase"
import DocumentGuide from "@/components/DocumentGuide"
import SiteNav from "@/components/SiteNav"

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const grant = await getGrantBySlug(slug)
  if (!grant) return {}
  return { title: `Apply – ${grant.name} – GrantFinder` }
}

export default async function GrantApplyPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const grant = await getGrantBySlug(slug)

  if (!grant) notFound()

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <SiteNav active="grants" />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-slate-400 mb-8 flex-wrap">
          <Link href="/grants" className="hover:text-slate-600 transition-colors">
            Grants
          </Link>
          <ChevronRight className="w-4 h-4 shrink-0" />
          <Link
            href={`/grants/${grant.slug}`}
            className="hover:text-slate-600 transition-colors truncate max-w-[200px]"
          >
            {grant.name}
          </Link>
          <ChevronRight className="w-4 h-4 shrink-0" />
          <span className="text-slate-900">Apply</span>
        </nav>

        <div className="max-w-2xl space-y-8">
          {/* Page header */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-1">
              Apply for {grant.name}
            </h1>
            <p className="text-sm text-slate-500">{grant.agency}</p>
          </div>

          {/* Before You Start */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-base font-semibold text-slate-900 mb-2">Before You Start</h2>
            <p className="text-sm text-slate-600 leading-6">
              Gather all required documents before opening your application. Having everything ready upfront
              prevents delays and reduces the chance of your application being rejected.
            </p>
          </div>

          {/* Document guide */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <DocumentGuide documents={grant.required_documents} showGenerationActions />
          </div>

          {/* Apply Now CTA */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center justify-between gap-6 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-slate-900 mb-1">Ready? Submit your application</p>
              <p className="text-sm text-slate-500">
                You&apos;ll be taken to the official {grant.agency} application portal.
              </p>
            </div>
            <a
              href={grant.application_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-lg px-6 py-3 text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              Apply Now
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </main>

    </div>
  )
}
