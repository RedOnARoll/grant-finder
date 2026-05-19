"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AlertTriangle, CheckCircle, Clock, FileQuestion } from "lucide-react"
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

function hasUsefulString(value: string | null | undefined) {
  return Boolean(value?.trim())
}

function hasHttpUrl(value: string | null | undefined) {
  const trimmed = value?.trim()
  return Boolean(trimmed && /^https?:\/\//i.test(trimmed))
}

function hasUsefulStringArray(value: unknown) {
  return Array.isArray(value) && value.some((item) => typeof item === "string" && item.trim().length > 0)
}

function hasEligibilityCriteria(g: Grant) {
  const criteria = g.eligibility_criteria
  if (Array.isArray(criteria)) return hasUsefulStringArray(criteria)
  return Boolean(criteria && typeof criteria === "object" && Object.keys(criteria).length > 0)
}

function missingDataReasons(g: Grant) {
  const reasons: string[] = []

  if (!hasUsefulString(g.agency)) reasons.push("Missing agency")
  if (!hasUsefulString(g.description)) reasons.push("Missing description")
  else if (g.description.trim().length < 80) reasons.push("Description too short")
  if (g.max_amount == null) reasons.push(g.type === "benefit" ? "Missing max benefit amount" : "Missing max award amount")
  if (!hasEligibilityCriteria(g)) reasons.push("Missing eligibility criteria")
  if (!hasUsefulStringArray(g.required_documents)) reasons.push("Missing required documents")
  if (!hasHttpUrl(g.application_url)) reasons.push("Missing application URL")
  if (!hasHttpUrl(g.official_source_url)) reasons.push("Missing official source URL")
  if (!g.is_recurring && !hasUsefulString(g.deadline)) reasons.push("Missing deadline or recurring/open enrollment status")

  return reasons
}

interface Stats {
  totalGrants: number
  totalBenefits: number
  pendingCriteria: Grant[]
  expiredDeadlines: Grant[]
  missingData: { program: Grant; reasons: string[] }[]
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
        missingData: all
          .map((program) => ({ program, reasons: missingDataReasons(program) }))
          .filter((item) => item.reasons.length > 0),
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
      description: "Programs missing core fields like agency, documents, criteria, URLs, amount, or deadline status.",
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
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm">{title}</span>
                        <Badge variant={badgeVariant}>{count}</Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">{description}</p>
                    </div>
                  </div>
                  {cta && href && (
                    <Link href={href} className="text-xs font-medium text-blue-600 hover:underline">
                      {cta} →
                    </Link>
                  )}
                </div>

                {/* Item list */}
                <div className="divide-y divide-slate-100">
                  {items.map((item) => {
                    const g = "program" in item ? item.program : item
                    const reasons = "reasons" in item ? item.reasons : []

                    return (
                    <div key={g.id} className="flex items-center justify-between gap-4 px-5 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{g.name}</p>
                        <p className="text-xs text-slate-500 truncate">{g.agency}</p>
                        {reasons.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {reasons.map((reason) => (
                              <span
                                key={reason}
                                className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                              >
                                {reason}
                              </span>
                            ))}
                          </div>
                        )}
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
                        <Link
                          href={`/admin/programs/${g.id}`}
                          className="text-xs font-medium text-blue-600 hover:underline"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                    )
                  })}
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
