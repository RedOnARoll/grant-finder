import AccountDashboard from "@/components/AccountDashboard"
import EligibleBenefits from "@/components/EligibleBenefits"
import SiteNav from "@/components/SiteNav"
import Link from "next/link"

export const metadata = {
  title: "Account Dashboard - GrantWay",
}

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteNav active="account" />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page header */}
          <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Your Dashboard</h1>
              <p className="mt-1 text-slate-600">
                Keep a short list of programs you care about, track each application, and review likely benefit matches.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/account/eligible"
                className="inline-flex items-center h-9 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-white transition-colors"
              >
                Eligible for
              </Link>
              <Link
                href="/account/profile"
                className="inline-flex items-center h-9 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-white transition-colors"
              >
                Profile
              </Link>
            </div>
          </div>

          <AccountDashboard />

          <section className="mt-10">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-900">Likely benefit matches</h2>
              <p className="mt-1 text-sm text-slate-600">Benefits you may qualify for based on your saved profile details.</p>
            </div>
            <EligibleBenefits hideSignedOutState previewLimit={3} />
          </section>
        </div>
      </main>
    </div>
  )
}
