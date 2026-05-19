import Link from "next/link"
import EligibleBenefits from "@/components/EligibleBenefits"
import SiteNav from "@/components/SiteNav"

export const metadata = {
  title: "Eligible Benefits - GrantWay",
}

export default function EligibleBenefitsPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteNav active="account" />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Programs You May Qualify For</h1>
              <p className="mt-1 text-slate-600">
                Benefits you may qualify for based on your saved profile details.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/account"
                className="inline-flex items-center h-9 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-white transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/account/profile"
                className="inline-flex items-center h-9 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-white transition-colors"
              >
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
