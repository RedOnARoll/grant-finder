import type { Metadata } from "next"
import Link from "next/link"
import SiteNav from "@/components/SiteNav"

export const metadata: Metadata = {
  title: "Contact - GrantWay",
  description: "Contact GrantWay support.",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteNav />
      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link href="/" className="text-sm font-medium text-blue-600 hover:text-blue-700">
          Back to GrantWay
        </Link>
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">Contact GrantWay</h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            For account help, billing questions, refund requests, incorrect program information, or privacy questions,
            email support and include the email address on your GrantWay account.
          </p>
          <a
            href="mailto:support@grantway.org"
            className="mt-6 inline-flex h-11 items-center rounded-lg bg-blue-600 px-5 text-sm font-medium text-white hover:bg-blue-700"
          >
            support@grantway.org
          </a>
        </div>

        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
          GrantWay cannot make eligibility decisions or submit official applications on your behalf. For program-specific
          questions, contact the agency or organization listed as the official source.
        </div>
      </main>
    </div>
  )
}
