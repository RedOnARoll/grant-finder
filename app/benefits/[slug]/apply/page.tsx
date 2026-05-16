import Link from "next/link"
import { notFound } from "next/navigation"
import { getBenefitBySlug } from "@/lib/supabase"
import DocumentGuide from "./DocumentGuide"
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
    <div className="flex flex-col min-h-full">
      <SiteNav active="benefits" />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
          <Link href="/benefits" className="hover:text-zinc-900 transition-colors">Benefits</Link>
          <span>/</span>
          <Link href={`/benefits/${benefit.slug}`} className="hover:text-zinc-900 transition-colors truncate max-w-[200px]">
            {benefit.name}
          </Link>
          <span>/</span>
          <span className="text-zinc-900">Apply</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2 leading-tight">
            Apply for {benefit.name}
          </h1>
          <p className="text-zinc-500 text-base">{benefit.agency}</p>
        </div>

        <hr className="border-zinc-200 mb-10" />

        {/* Intro */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-zinc-900 mb-2">Before you start</h2>
          <p className="text-zinc-600 leading-7">
            Gather all required documents before opening your application. Having everything ready upfront
            prevents delays and reduces the chance of your application being rejected or put on hold.
          </p>
        </section>

        {/* Document guide */}
        <section className="mb-12">
          <DocumentGuide documents={benefit.required_documents} />
        </section>

        {/* Apply Now button */}
        <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-6 flex items-center justify-between gap-6 flex-wrap">
          <div>
            <p className="font-semibold text-zinc-900 mb-1">Ready? Submit your application</p>
            <p className="text-sm text-zinc-500">
              You&apos;ll be taken to the official {benefit.agency} application portal.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center h-11 px-8 rounded-full bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 transition-colors whitespace-nowrap cursor-pointer"
          >
            Apply Now →
          </button>
        </div>
      </main>

      <footer className="border-t border-zinc-200 py-8 px-6 text-center text-sm text-zinc-500 mt-10">
        Benefit information is for reference only. Verify eligibility with the issuing agency.
      </footer>
    </div>
  )
}
