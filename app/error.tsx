"use client"

import Link from "next/link"
import { useEffect } from "react"
import SiteNav from "@/components/SiteNav"

export default function GlobalError({
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
      <SiteNav />

      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="text-center">
          <p className="text-4xl mb-4">⚠</p>
          <h1 className="text-2xl font-bold text-zinc-900 mb-3">Something went wrong</h1>
          <p className="text-zinc-500 mb-8 max-w-sm mx-auto">
            An unexpected error occurred. Please try again or return to the home page.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={reset}
              className="px-5 py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 transition-colors"
            >
              Try again
            </button>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-lg border border-zinc-300 text-zinc-700 text-sm font-medium hover:border-zinc-500 transition-colors"
            >
              Go home
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-200 py-8 px-6 text-center text-sm text-zinc-500">
        Grant information is for reference only. Verify eligibility with the issuing agency.
      </footer>
    </div>
  )
}
