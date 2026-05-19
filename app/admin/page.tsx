"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AlertTriangle, CheckCircle, Clock, FileQuestion, TrendingUp } from "lucide-react"
import { getBrowserSupabase } from "@/lib/supabase-browser"
import type { Grant } from "@/lib/types"
import { Badge } from "@/components/ui/Badge"

const PLACEHOLDER_MARKER = "could not be verified as a stable universal rule"

function hasPlaceholderCriteria(g: Grant) {
  const c = g.eligibility_criteria
  return Array.isArray(c) && c.some((s) => typeof s === "string" && s.includes(PLACEHOLDER_MARKER))
}

function isExpired(g: Grant) {
  if (g.is_recurring || !g.deadline) return false
  return new Date(g.deadline).getTime() < Date.now()
}

function isMissingData(g: Grant) {
  return g.max_amount == null || !g.description || g.description.length < 20
}

interface Stats {
  totalGrants: number
  totalBenefits: number
  pendingCriteria: Grant[]
  expiredDeadlines: Grant[]
  missingData: Grant[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = getBrowserSupabase()
      const { data } = await supabase.from("grants").select("*").order("name")
      const all = (data ?? []) as Grant[]

      const grants = all.filter((g) => g.type === "grant")
      const benefits = all.filter((g) => g.type === "benefit")

      setStats({
        totalGrants: grants.length,
        totalBenefits: benefits.length,
        pendingCriteria: grants.filter(hasPlaceholderCriteria),
        expiredDeadlines: grants.filter(isExpired),
        missingData: all.filter(isMissingData),
      })
    }
    load()
  }, [])

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-7 h-7 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  const issues = [
    {
      icon: Clock,
      color: "amber",
      title: "Pending eligibility criteria",
      count: stats.pendingCriteria.length,
      description: "Grants still showing placeholder eligibility text.",
      cta: "Review",
      href: "/admin/pending",
      items: stats.pendingCriteria.slice(0, 5),
    },
    {
      icon: AlertTriangle,
      color: "coral",
      title: "Expired deadlines",
      count: stats.expiredDeadlines.length,
      description: "Non-recurring grants whose deadline has passed.",
      cta: "View all",
      href: null,
      items: stats.expiredDeadlines.slice(0, 5),
    },
    {
      icon: FileQuestion,
      color: "slate",
      title: "Missing data",
      count: stats.missingData.length,
      description: "Programs missing max amount or a full description.",
      cta: null,
      href: null,
      items: stats.missingData.slice(0, 5),
    },
  ] as const

  const allClear = issues.every((i) => i.count === 0)

  return (
    <div className="max-w-5xl space-y-8">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Overview of your GrantWay content and quality issues.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Grants",          value: stats.totalGrants,              accent: "text-blue-600"    },
          { label: "Benefits",        value: stats.totalBenefits,            accent: "text-emerald-600" },
          { label: "Pending criteria", value: stats.pendingCriteria.length,  accent: "text-amber-600"   },
          { label: "Expired deadlines", value: stats.expiredDeadlines.length, accent: "text-rose-600"   },
        ].map(({ label, value, accent }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{label}</p>
            <p className={`text-3xl font-bold ${accent}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* All clear banner */}
      {allClear && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 text-emerald-700 text-sm font-medium">
          <CheckCircle className="w-5 h-5 shrink-0" />
          No issues found — all content looks good.
        </div>
      )}

      {/* Issue panels */}
      {!allClear && (
        <div className="space-y-5">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Action items</h2>
          {issues.map(({ icon: Icon, color, title, count, description, cta, href, items }) => {
            if (count === 0) return null
            const badgeVariant = color === "amber" ? "amber" : color === "coral" ? "coral" : "slate"
            return (
              <div key={title} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Panel header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="font-semibold text-slate-900 text-sm">{title}</span>
                    <Badge variant={badgeVariant}>{count}</Badge>
                  </div>
                  {cta && href && (
                    <Link href={href} className="text-xs font-medium text-blue-600 hover:underline">
                      {cta} →
                    </Link>
                  )}
                </div>

                {/* Item list */}
                <div className="divide-y divide-slate-100">
                  {items.map((g) => (
                    <div key={g.id} className="flex items-center justify-between px-5 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{g.name}</p>
                        <p className="text-xs text-slate-500 truncate">{g.agency}</p>
                      </div>
                      <div className="flex items-center gap-3 ml-4 shrink-0">
                        {g.deadline && isExpired(g) && (
                          <span className="text-xs text-rose-600">
                            Due {new Date(g.deadline).toLocaleDateString()}
                          </span>
                        )}
                        <Link
                          href={`/${g.type === "benefit" ? "benefits" : "grants"}/${g.slug}`}
                          target="_blank"
                          className="text-xs text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          View ↗
                        </Link>
                      </div>
                    </div>
                  ))}
                  {count > 5 && (
                    <div className="px-5 py-3 text-xs text-slate-400">
                      +{count - 5} more
                      {href && (
                        <Link href={href} className="text-blue-600 hover:underline ml-1">
                          See all →
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Quick links */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">Quick links</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/grants" target="_blank" className="inline-flex items-center h-9 px-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 hover:border-slate-300 hover:shadow-sm transition-all">
            Browse grants ↗
          </Link>
          <Link href="/benefits" target="_blank" className="inline-flex items-center h-9 px-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 hover:border-slate-300 hover:shadow-sm transition-all">
            Browse benefits ↗
          </Link>
          <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="inline-flex items-center h-9 px-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 hover:border-slate-300 hover:shadow-sm transition-all">
            Supabase dashboard ↗
          </a>
        </div>
      </div>
    </div>
  )
}
