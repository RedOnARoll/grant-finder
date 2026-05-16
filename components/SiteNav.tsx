"use client"

import Link from "next/link"
import AuthMenu from "@/components/AuthMenu"

type ActiveSection = "grants" | "benefits" | "quiz" | "account"

function navClass(active: boolean) {
  return active
    ? "text-zinc-900 font-semibold"
    : "hover:text-zinc-900 transition-colors"
}

export default function SiteNav({ active }: { active?: ActiveSection }) {
  return (
    <nav className="border-b border-zinc-200 bg-white px-6 py-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-6">
        <Link href="/" className="shrink-0 text-lg font-semibold text-zinc-900">
          GrantFinder
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-x-6 gap-y-3 text-sm font-medium text-zinc-600">
          <Link href="/grants" className={navClass(active === "grants")}>
            Grants
          </Link>
          <Link href="/benefits" className={navClass(active === "benefits")}>
            Benefits
          </Link>
          <Link href="/quiz" className={navClass(active === "quiz")}>
            Eligibility Quiz
          </Link>
          <AuthMenu />
        </div>
      </div>
    </nav>
  )
}
