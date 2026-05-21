"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const LEGAL_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Refunds", href: "/refund-policy" },
  { label: "Contact", href: "/contact" },
]

export default function SiteFooter() {
  const pathname = usePathname()
  if (pathname?.startsWith("/admin")) return null

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-8 text-sm text-slate-500 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <p className="font-semibold text-slate-900">GrantWay</p>
            <p className="mt-2 leading-6">
              GrantWay is an independent service and is not affiliated with, endorsed by, or operated by any government agency.
              Program information is provided for reference only. Always verify eligibility, deadlines, required documents, and
              application instructions with the official program source before applying.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 md:justify-end">
            {LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="font-medium text-slate-600 hover:text-slate-900">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p>Support: <a href="mailto:support@grantway.org" className="font-medium text-blue-600 hover:text-blue-700">support@grantway.org</a></p>
          <p>© 2026 GrantWay. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
