import Link from "next/link"
import SiteNav from "@/components/SiteNav"

export default function BenefitNotFound() {
  return (
    <div className="flex flex-col min-h-full">
      <SiteNav active="benefits" />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        <nav className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
          <Link href="/benefits" className="hover:text-zinc-900 transition-colors">Benefits</Link>
          <span>/</span>
          <span className="text-zinc-900">Not found</span>
        </nav>

        <div className="text-center py-20">
          <p className="text-5xl font-bold text-zinc-200 mb-6">404</p>
          <h1 className="text-2xl font-bold text-zinc-900 mb-3">Benefit not found</h1>
          <p className="text-zinc-500 mb-8 max-w-sm mx-auto">
            This benefit may have been removed, renamed, or the link may be incorrect.
          </p>
          <Link
            href="/benefits"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 transition-colors"
          >
            Browse all benefits
          </Link>
        </div>
      </main>

    </div>
  )
}
