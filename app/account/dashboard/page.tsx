import AccountDashboard from "@/components/AccountDashboard"
import EligibleBenefits from "@/components/EligibleBenefits"
import SiteNav from "@/components/SiteNav"
import Link from "next/link"

export const metadata = {
  title: "Dashboard - GrantFinder",
}

export default function AccountDashboardPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteNav active="account" />
      <main className="flex-1 bg-zinc-50 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Account dashboard
              </p>
              <h1 className="mb-3 text-3xl font-bold text-zinc-900">Saved grants and benefits</h1>
              <p className="max-w-2xl text-zinc-500">
                Keep a short list of programs you care about and track each application from interest to award.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/account" className="h-10 rounded-full border border-zinc-300 px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-white">
                Account
              </Link>
              <Link href="/account/profile" className="h-10 rounded-full border border-zinc-300 px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-white">
                Profile
              </Link>
            </div>
          </div>
          <AccountDashboard />
          <section className="mt-8">
            <div className="mb-4">
              <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Eligible for
              </p>
              <h2 className="text-2xl font-bold text-zinc-900">Likely benefit matches</h2>
            </div>
            <EligibleBenefits />
          </section>
        </div>
      </main>
    </div>
  )
}
