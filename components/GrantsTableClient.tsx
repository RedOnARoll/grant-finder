"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, ArrowRight, ArrowUpDown, Sparkles, MapPin } from "lucide-react"
import type { Grant } from "@/lib/types"

// ── Constants ────────────────────────────────────────────────────────

function matchesCategory(g: Grant, cat: string): boolean {
  if (g.category === cat) return true
  const lower = `${g.slug} ${g.name} ${g.description ?? ""}`.toLowerCase()
  if (cat === "nonprofit") return lower.includes("nonprofit") || lower.includes("non-profit") || lower.includes("501(c)(3)") || lower.includes("501c3") || lower.includes("charitable organization")
  return false
}

const CATEGORY_LABELS: Record<string, string> = {
  small_business: "Small Business",
  nonprofit:      "Nonprofit",
  individual:     "Individual",
  agricultural:   "Agricultural",
  research:       "Research",
  veterans:       "Veterans",
  arts:           "Arts",
}

const SOURCE_LABELS: Record<string, string> = {
  federal:  "Federal",
  state:    "State",
  local:    "Local",
  private:  "Private",
}

// ── Helpers ──────────────────────────────────────────────────────────
function formatAmount(amount: number | null | undefined): string {
  if (!amount) return "Varies"
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`
  return `$${amount}`
}

function formatDate(deadline: string | null | undefined): string {
  if (!deadline) return "Rolling"
  return new Date(deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function daysUntil(deadline: string | null | undefined): number | null {
  if (!deadline) return null
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000)
}

function urgencyBadge(days: number | null, isRecurring: boolean | null | undefined) {
  if (days === null) return { bg: "bg-slate-100", text: "text-slate-600", label: isRecurring ? "Rolling" : "—" }
  if (days < 0)    return { bg: "bg-rose-50",   text: "text-rose-600",  label: "Closed" }
  if (days <= 14)  return { bg: "bg-rose-50",   text: "text-rose-600",  label: `${days}d left` }
  if (days <= 60)  return { bg: "bg-amber-50",  text: "text-amber-700", label: `${days}d left` }
  return               { bg: "bg-emerald-50", text: "text-emerald-700", label: `${days}d left` }
}

function nextOpenEstimate(deadline: string | null | undefined, isRecurring: boolean | null | undefined): string | null {
  if (!deadline || !isRecurring) return null
  const d = new Date(deadline)
  if (d.getTime() > Date.now()) return null
  const next = new Date(d)
  next.setFullYear(next.getFullYear() + 1)
  return next.toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

// ── Component ────────────────────────────────────────────────────────
interface Props {
  allGrants: Grant[]
  initialCategory?: string
  initialSource?: string
  initialQ?: string
}

export default function GrantsTableClient({ allGrants, initialCategory, initialSource, initialQ }: Props) {
  const router = useRouter()
  const [aiDesc, setAiDesc] = useState("")
  const [aiZip, setAiZip] = useState("")

  // Filter state
  const [search, setSearch] = useState(initialQ ?? "")
  const [selectedSources, setSelectedSources] = useState<Set<string>>(
    new Set(initialSource ? initialSource.split(",").filter(Boolean) : [])
  )
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(initialCategory ? initialCategory.split(",").filter(Boolean) : [])
  )
  const [urgency, setUrgency] = useState<"any" | "30" | "90" | "180" | "rolling">("any")
  const [amountMin, setAmountMin] = useState(0)

  // Sort state
  const [sortKey, setSortKey] = useState<"name" | "agency" | "amount" | "deadline">("deadline")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortKey(key); setSortDir("asc") }
  }

  function toggleSet(set: Set<string>, key: string, setter: (s: Set<string>) => void) {
    const next = new Set(set)
    next.has(key) ? next.delete(key) : next.add(key)
    setter(next)
  }

  // Derived: filtered + sorted
  const filtered = useMemo(() => {
    return allGrants.filter(g => {
      if (selectedSources.size > 0 && !selectedSources.has(g.funding_source ?? "")) return false
      if (selectedCategories.size > 0 && !Array.from(selectedCategories).some(cat => matchesCategory(g, cat))) return false
      if (amountMin > 0 && (!g.max_amount || g.max_amount < amountMin)) return false
      if (search) {
        const hay = `${g.name} ${g.agency} ${g.description}`.toLowerCase()
        if (!hay.includes(search.toLowerCase())) return false
      }
      if (urgency !== "any") {
        const d = daysUntil(g.deadline)
        if (urgency === "rolling") return !g.deadline
        const cap = parseInt(urgency, 10)
        if (d === null || d < 0 || d > cap) return false
      }
      return true
    })
  }, [allGrants, selectedSources, selectedCategories, amountMin, search, urgency])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1
      if (sortKey === "name")   return a.name.localeCompare(b.name) * dir
      if (sortKey === "agency") return a.agency.localeCompare(b.agency) * dir
      if (sortKey === "amount") return ((a.max_amount ?? -1) - (b.max_amount ?? -1)) * dir
      if (sortKey === "deadline") {
        const ad = daysUntil(a.deadline), bd = daysUntil(b.deadline)
        if (ad === null && bd === null) return 0
        if (ad === null) return 1 * dir
        if (bd === null) return -1 * dir
        return (ad - bd) * dir
      }
      return 0
    })
  }, [filtered, sortKey, sortDir])

  // Facet counts
  const sourceFacets = Object.entries(SOURCE_LABELS).map(([k, lbl]) => ({
    key: k, label: lbl, count: allGrants.filter(g => g.funding_source === k).length,
  }))
  const categoryFacets = Object.entries(CATEGORY_LABELS).map(([k, lbl]) => ({
    key: k, label: lbl, count: allGrants.filter(g => matchesCategory(g, k)).length,
  }))

  // Live stats
  const totalValue = sorted.reduce((acc, g) => acc + (g.max_amount ?? 0), 0)
  const closingSoon = sorted.filter(g => { const d = daysUntil(g.deadline); return d !== null && d >= 0 && d <= 30 }).length

  function formatTotal(n: number) {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
    return `$${n}`
  }

  const hasFilters = selectedSources.size > 0 || selectedCategories.size > 0 || amountMin > 0 || urgency !== "any" || !!search

  function clearAll() {
    setSelectedSources(new Set()); setSelectedCategories(new Set()); setAmountMin(0); setUrgency("any"); setSearch("")
  }

  // Sort header cell
  function SortTh({ label, k, className }: { label: string; k: typeof sortKey; className?: string }) {
    return (
      <th
        className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 cursor-pointer hover:text-slate-200 select-none whitespace-nowrap ${className ?? ""}`}
        onClick={() => toggleSort(k)}
      >
        <span className="inline-flex items-center gap-1">
          {label}
          <ArrowUpDown className={`w-3 h-3 ${sortKey === k ? "opacity-100 text-white" : "opacity-40"}`} />
        </span>
      </th>
    )
  }

  return (
    <main className="flex-1 bg-slate-50 min-h-screen">

      {/* ── Dark header ────────────────────────────────────────── */}
      <section className="bg-slate-900 pb-6 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Top row: headline + stats */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-slate-400 mb-2">Grants database</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                Competitive funding for businesses,<br className="hidden sm:block" /> researchers &amp; organizations
              </h1>
            </div>
            <div className="flex gap-8 shrink-0">
              {[
                ["Programs",       String(sorted.length)],
                ["Total funding",  formatTotal(totalValue)],
                ["Closing in 30d", String(closingSoon)],
              ].map(([lbl, val]) => (
                <div key={lbl} className="text-right sm:text-left">
                  <p className="text-xl font-bold text-white tabular-nums">{val}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{lbl}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI search form */}
          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <p className="text-sm font-semibold text-white">Describe your business</p>
            </div>
            <textarea
              value={aiDesc}
              onChange={e => setAiDesc(e.target.value)}
              placeholder="e.g. We're a 5-person catering company in rural Georgia, minority-owned, looking for funding to buy commercial kitchen equipment and hire two staff."
              rows={3}
              className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none mb-3"
            />
            <div className="flex gap-3 items-center">
              <div className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-lg px-3 h-9 w-40 shrink-0">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  value={aiZip}
                  onChange={e => setAiZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                  placeholder="ZIP code"
                  inputMode="numeric"
                  maxLength={5}
                  className="flex-1 text-sm text-white placeholder-slate-400 outline-none bg-transparent w-full"
                />
              </div>
              <button
                onClick={() => {
                  if (!aiDesc.trim()) return
                  const params = new URLSearchParams({ q: aiDesc.trim() })
                  if (aiZip) params.set("zip", aiZip)
                  router.push(`/ai-results?${params.toString()}`)
                }}
                disabled={!aiDesc.trim()}
                className="flex-1 sm:flex-none h-9 px-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Find funding <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Keyword search + urgency tabs */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="flex-1 flex items-center gap-2 bg-white rounded-lg px-3 h-9">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Filter by keyword — program name, agency…"
                className="flex-1 text-sm text-slate-900 placeholder-slate-400 outline-none bg-transparent"
              />
            </div>

            {/* Urgency tabs */}
            <div className="flex gap-1 p-1 bg-white/10 rounded-lg shrink-0">
              {([
                ["any",     "Any"],
                ["30",      "≤ 30d"],
                ["90",      "≤ 90d"],
                ["180",     "≤ 6mo"],
                ["rolling", "Rolling"],
              ] as const).map(([k, lbl]) => (
                <button
                  key={k}
                  onClick={() => setUrgency(k)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    urgency === k ? "bg-white text-slate-900" : "text-slate-300 hover:text-white"
                  }`}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Body: facets + table ────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6 items-start">

          {/* Left facets rail */}
          <aside className="hidden lg:flex flex-col gap-5 w-52 shrink-0 sticky top-6">

            {/* Funding source */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Funding source</p>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {sourceFacets.map(f => (
                  <label key={f.key} className={`flex items-center gap-2.5 px-3 py-2.5 cursor-pointer ${selectedSources.has(f.key) ? "bg-blue-50" : "hover:bg-slate-50"}`}>
                    <input
                      type="checkbox"
                      checked={selectedSources.has(f.key)}
                      onChange={() => toggleSet(selectedSources, f.key, setSelectedSources)}
                      className="accent-blue-600 rounded"
                    />
                    <span className={`flex-1 text-sm ${selectedSources.has(f.key) ? "font-medium text-slate-900" : "text-slate-600"}`}>{f.label}</span>
                    <span className="text-xs text-slate-400 tabular-nums">{f.count}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Category</p>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {categoryFacets.map(f => (
                  <label key={f.key} className={`flex items-center gap-2.5 px-3 py-2.5 cursor-pointer ${selectedCategories.has(f.key) ? "bg-blue-50" : "hover:bg-slate-50"}`}>
                    <input
                      type="checkbox"
                      checked={selectedCategories.has(f.key)}
                      onChange={() => toggleSet(selectedCategories, f.key, setSelectedCategories)}
                      className="accent-blue-600 rounded"
                    />
                    <span className={`flex-1 text-sm ${selectedCategories.has(f.key) ? "font-medium text-slate-900" : "text-slate-600"}`}>{f.label}</span>
                    <span className="text-xs text-slate-400 tabular-nums">{f.count}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Min amount */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Minimum amount</p>
              <div className="bg-white border border-slate-200 rounded-xl p-3">
                <p className="text-sm font-bold text-slate-900 tabular-nums mb-2">${amountMin.toLocaleString()}+</p>
                <input
                  type="range" min={0} max={500000} step={5000}
                  value={amountMin}
                  onChange={e => setAmountMin(parseInt(e.target.value, 10))}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>$0</span><span>$500K+</span>
                </div>
              </div>
            </div>

            {hasFilters && (
              <button
                onClick={clearAll}
                className="text-sm text-blue-600 hover:underline text-left font-medium"
              >
                Clear all filters
              </button>
            )}
          </aside>

          {/* Table */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3 gap-4">
              <p className="text-sm text-slate-500">
                Showing <span className="font-semibold text-slate-900">{sorted.length}</span> of {allGrants.length} grants
              </p>
            </div>

            {sorted.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
                <p className="text-slate-500 text-sm mb-2">No grants match your filters.</p>
                <button onClick={clearAll} className="text-blue-600 text-sm font-medium hover:underline">Clear all</button>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-slate-900">
                    <tr>
                      <SortTh label="Program" k="name" />
                      <SortTh label="Source" k="agency" className="hidden md:table-cell" />
                      <SortTh label="Max award" k="amount" className="hidden sm:table-cell text-right" />
                      <SortTh label="Deadline" k="deadline" />
                      <th className="px-4 py-3 w-8" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sorted.map(g => {
                      const days = daysUntil(g.deadline)
                      const badge = urgencyBadge(days, g.is_recurring)
                      const catLabel = CATEGORY_LABELS[g.category] ?? g.category.replace(/_/g, " ")
                      const isClosed = days !== null && days < 0
                      const nextOpen = isClosed ? nextOpenEstimate(g.deadline, g.is_recurring) : null
                      return (
                        <tr key={g.id} className={`hover:bg-slate-50 transition-colors group cursor-pointer${isClosed ? " bg-slate-50/60" : ""}`}>
                          <td className="px-4 py-3.5">
                            <Link href={`/grants/${g.slug}`} className="block">
                              <div className="flex items-center gap-2">
                                <p className={`font-semibold leading-snug group-hover:text-blue-600 transition-colors${isClosed ? " text-slate-400" : " text-slate-900"}`}>{g.name}</p>
                                {isClosed && (
                                  <span className="shrink-0 text-xs font-semibold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">Closed</span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {g.agency} · <span className="capitalize">{catLabel}</span>
                              </p>
                            </Link>
                          </td>
                          <td className="px-4 py-3.5 hidden md:table-cell">
                            <span className="inline-block text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 capitalize">
                              {g.funding_source ?? "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right hidden sm:table-cell">
                            <span className={`font-bold tabular-nums${isClosed ? " text-slate-400" : " text-slate-900"}`}>{formatAmount(g.max_amount)}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <p className={`text-sm tabular-nums leading-snug${isClosed ? " text-slate-400 line-through" : " text-slate-700"}`}>{formatDate(g.deadline)}</p>
                            <span className={`inline-block text-xs font-semibold px-1.5 py-0.5 rounded mt-0.5 ${badge.bg} ${badge.text}`}>
                              {badge.label}
                            </span>
                            {nextOpen && (
                              <p className="text-xs text-slate-400 mt-0.5">Est. reopens {nextOpen}</p>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <Link
                              href={`/grants/${g.slug}`}
                              className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label={`View ${g.name}`}
                            >
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
