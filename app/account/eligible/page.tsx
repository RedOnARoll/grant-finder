import Link from "next/link"
import EligibleBenefits from "@/components/EligibleBenefits"
import SiteNav from "@/components/SiteNav"

export const metadata = {
  title: "Eligible Benefits - GrantFinder",
}

export default function EligibleBenefitsPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteNav active="account" />
      <main className="flex-1 bg-zinc-50 px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Account matches
              </p>
              <h1 className="mb-3 text-3xl font-bold text-zinc-900">Eligible for</h1>
              <p className="max-w-2xl text-zinc-500">
                Benefits you may qualify for based on your saved profile details.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/account" className="h-10 rounded-full border border-zinc-300 px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-white">
                Dashboard
              </Link>
              <Link href="/account/profile" className="h-10 rounded-full border border-zinc-300 px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-white">
                Profile
              </Link>
            </div>
          </div>
          <EligibleBenefits />
        </div>
      </main>
    </div>
  )
}
