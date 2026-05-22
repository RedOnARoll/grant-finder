import Link from "next/link"
import SiteNav from "@/components/SiteNav"

export default function GrantNotFound() {
  return (
    <div className="flex flex-col min-h-full">
      <SiteNav active="grants" />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        <nav className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
          <Link href="/grants" className="hover:text-zinc-900 transition-colors">Grants</Link>
          <span>/</span>
          <span className="text-zinc-900">Not found</span>
        </nav>

        <div className="text-center py-20">
          <p className="text-5xl font-bold text-zinc-200 mb-6">404</p>
          <h1 className="text-2xl font-bold text-zinc-900 mb-3">Grant not found</h1>
          <p className="text-zinc-500 mb-8 max-w-sm mx-auto">
            This grant may have been removed, renamed, or the link may be incorrect.
          </p>
          <Link
            href="/grants"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 transition-colors"
          >
            Browse all grants
          </Link>
        </div>
      </main>

    </div>
  )
}
