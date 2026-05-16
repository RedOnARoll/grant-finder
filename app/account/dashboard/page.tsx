import AccountDashboard from "@/components/AccountDashboard"
import SiteNav from "@/components/SiteNav"

export const metadata = {
  title: "Dashboard - GrantFinder",
}

export default function AccountDashboardPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteNav active="account" />
      <main className="flex-1 bg-zinc-50 px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Account dashboard
            </p>
            <h1 className="mb-3 text-3xl font-bold text-zinc-900">Saved grants and benefits</h1>
            <p className="max-w-2xl text-zinc-500">
              Keep a short list of programs you care about and track each application from interest to award.
            </p>
          </div>
          <AccountDashboard />
        </div>
      </main>
    </div>
  )
}
