import Link from "next/link"
import SiteNav from "@/components/SiteNav"

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-full">
      <SiteNav />

      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="text-center">
          <p className="text-5xl font-bold text-zinc-200 mb-6">404</p>
          <h1 className="text-2xl font-bold text-zinc-900 mb-3">Page not found</h1>
          <p className="text-zinc-500 mb-8 max-w-sm mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/grants"
              className="px-5 py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 transition-colors"
            >
              Browse grants
            </Link>
            <Link
              href="/benefits"
              className="px-5 py-2.5 rounded-lg border border-zinc-300 text-zinc-700 text-sm font-medium hover:border-zinc-500 transition-colors"
            >
              Browse benefits
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
