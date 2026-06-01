import AccountDashboard from "@/components/AccountDashboard"
import SiteNav from "@/components/SiteNav"
import Link from "next/link"

export const metadata = {
  title: "Dashboard - GrantWay",
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteNav active="account" />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
              <p className="mt-1 text-slate-600">
                Track saved grants, monitor applications, and discover new matches.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/account/eligible"
                className="inline-flex items-center h-9 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
              >
                Eligible programs
              </Link>
              <Link
                href="/account"
                className="inline-flex items-center h-9 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
              >
                Account settings
              </Link>
            </div>
          </div>

          <AccountDashboard />
        </div>
      </main>
    </div>
  )
}
