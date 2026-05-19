"use client"

import Link from "next/link"
import { useEffect } from "react"
import SiteNav from "@/components/SiteNav"

export default function GrantError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col min-h-full">
      <SiteNav active="grants" />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        <nav className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
          <Link href="/grants" className="hover:text-zinc-900 transition-colors">Grants</Link>
          <span>/</span>
          <span className="text-zinc-900">Error</span>
        </nav>

        <div className="text-center py-20">
          <p className="text-4xl mb-4">⚠</p>
          <h1 className="text-2xl font-bold text-zinc-900 mb-3">Something went wrong</h1>
          <p className="text-zinc-500 mb-8 max-w-sm mx-auto">
            We couldn&apos;t load this grant. This may be a temporary issue — please try again.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={reset}
              className="px-5 py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 transition-colors"
            >
              Try again
            </button>
            <Link
              href="/grants"
              className="px-5 py-2.5 rounded-lg border border-zinc-300 text-zinc-700 text-sm font-medium hover:border-zinc-500 transition-colors"
            >
              Back to grants
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-200 py-8 px-6 text-center text-sm text-zinc-500 mt-10">
        Grant information is for reference only. Verify eligibility with the issuing agency.
      </footer>
    </div>
  )
}
