"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogoMark } from "@/components/illustrations/GeoShapes"

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Use", href: "/terms" },
  { label: "Premium Plan Terms", href: "/refund-policy" },
  { label: "Contact", href: "/contact" },
]

const EXPLORE_LINKS = [
  { label: "All Programs", href: "/programs" },
  { label: "Grants", href: "/grants" },
  { label: "Benefits", href: "/benefits" },
  { label: "Eligibility Quiz", href: "/quiz" },
]

const ACCOUNT_LINKS = [
  { label: "Sign In", href: "/auth" },
  { label: "Dashboard", href: "/account" },
  { label: "Profile", href: "/account/profile" },
]

export default function SiteFooter() {
  const pathname = usePathname()
  if (pathname?.startsWith("/admin")) return null

  return (
    <footer className="border-t border-slate-800 bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12 text-sm text-slate-400 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <LogoMark className="h-6 w-6" />
              <span className="text-base font-bold text-white">GrantWay</span>
            </div>
            <p className="max-w-xs leading-6">
              Helping people and organizations discover grants and benefits they actually qualify for.
            </p>
          </div>

          <FooterColumn title="Explore" links={EXPLORE_LINKS} />
          <FooterColumn title="Account" links={ACCOUNT_LINKS} />
          <FooterColumn title="Legal" links={LEGAL_LINKS} />
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-center text-xs leading-6 text-slate-500">
          <p>
            © 2026 GrantWay. Built to help people find funding. GrantWay is an independent service and is not affiliated
            with, endorsed by, or operated by any government agency.
          </p>
          <p>
            Information is for reference only. Always verify eligibility, deadlines, required documents, and application
            instructions with the official program source before applying. Support:{" "}
            <a href="mailto:support@grantway.org" className="font-medium text-slate-300 hover:text-white">
              support@grantway.org
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold text-white">{title}</h2>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
