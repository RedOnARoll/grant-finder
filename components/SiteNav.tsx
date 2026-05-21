"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import AuthMenu from "@/components/AuthMenu"
import ProfileCompletionBanner from "@/components/ProfileCompletionBanner"
import { LogoMark } from "@/components/illustrations/GeoShapes"

type ActiveSection = "grants" | "benefits" | "programs" | "quiz" | "account"

const NAV_LINKS: { label: string; href: string; key: ActiveSection | "about" }[] = [
  { label: "All Programs", href: "/programs", key: "programs" },
  { label: "Grants",       href: "/grants",   key: "grants"   },
  { label: "Benefits",     href: "/benefits", key: "benefits" },
  { label: "Quiz",         href: "/quiz",     key: "quiz"     },
  { label: "About",        href: "/about",    key: "about"    },
]

function desktopLinkClass(isActive: boolean) {
  return isActive
    ? "text-sm font-medium text-blue-600 border-b-2 border-blue-600 pb-0.5 transition-colors"
    : "text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
}

function mobileLinkClass(isActive: boolean) {
  return isActive
    ? "block px-4 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg"
    : "block px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
}

export default function SiteNav({ active }: { active?: ActiveSection }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <LogoMark className="w-6 h-6" />
            <span className="text-xl font-bold text-slate-900">GrantWay</span>
          </Link>

          {/* Desktop nav links — center */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(({ label, href, key }) => (
              <Link key={key} href={href} className={desktopLinkClass(active === key)}>
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <AuthMenu />
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <ProfileCompletionBanner />

      {/* Mobile slide-down panel */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pb-4 pt-2 space-y-1">
          {NAV_LINKS.map(({ label, href, key }) => (
            <Link
              key={key}
              href={href}
              className={mobileLinkClass(active === key)}
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-100">
            <AuthMenu />
          </div>
        </div>
      )}
    </nav>
  )
}
