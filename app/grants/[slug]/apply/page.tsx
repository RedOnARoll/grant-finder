import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronRight, ExternalLink } from "lucide-react"
import { getGrantBySlug } from "@/lib/supabase"
import SiteNav from "@/components/SiteNav"
import GrantHelperClient from "./GrantHelperClient"

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const grant = await getGrantBySlug(slug)
  if (!grant) return {}
  return { title: `Apply – ${grant.name} – GrantWay` }
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

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-slate-400 mb-8 flex-wrap">
          <Link href="/grants" className="hover:text-slate-600 transition-colors">Grants</Link>
          <ChevronRight className="w-4 h-4 shrink-0" />
          <Link href={`/grants/${grant.slug}`} className="hover:text-slate-600 transition-colors truncate max-w-[200px]">
            {grant.name}
          </Link>
          <ChevronRight className="w-4 h-4 shrink-0" />
          <span className="text-slate-900">Grant Helper</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Grant Helper</h1>
          <p className="text-slate-500 mt-1">{grant.name} · {grant.agency}</p>
        </div>

        {/* Main helper (prep, forms, questions, draft) */}
        <GrantHelperClient
          grantName={grant.name}
          grantDescription={grant.description}
          requiredDocuments={grant.required_documents}
        />

        {/* Apply CTA */}
        <div className="mt-10 bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center justify-between gap-6 flex-wrap">
          <div>
            <p className="text-sm font-semibold text-slate-900 mb-1">Ready to submit?</p>
            <p className="text-sm text-slate-500">Opens the official {grant.agency} application portal.</p>
          </div>
          <a
            href={grant.application_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-lg px-6 py-3 text-sm font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            Apply Now
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </main>
    </div>
  )
}
