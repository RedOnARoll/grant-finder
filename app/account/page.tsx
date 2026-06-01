import AccountSettings from "@/components/AccountSettings"
import SiteNav from "@/components/SiteNav"
import Link from "next/link"

export const metadata = {
  title: "Account Settings - GrantWay",
}

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteNav active="account" />
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
              <p className="mt-1 text-slate-600">Manage your name, password, profile, and subscription.</p>
            </div>
            <Link
              href="/account/dashboard"
              className="inline-flex items-center h-9 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              Go to dashboard
            </Link>
          </div>
          <AccountSettings />
        </div>
      </main>
    </div>
  )
}
