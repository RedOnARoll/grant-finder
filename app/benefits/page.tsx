import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { getBenefits } from "@/lib/supabase"
import type { Grant } from "@/lib/types"
import SiteNav from "@/components/SiteNav"
import SmartSearchBar from "@/components/SmartSearchBar"
import BenefitsStateFilter from "@/components/BenefitsStateFilter"
import { StatusBadge } from "@/components/ui/Badge"

const AGENCY_STATES: Record<string, string[]> = {
  "New York Foundation for the Arts":    ["NY"],
  "Artist Trust":                         ["WA"],
  "New England Foundation for the Arts": ["CT", "ME", "MA", "NH", "RI", "VT"],
  "Western States Arts Federation":      ["AK", "AZ", "CO", "ID", "MT", "NV", "NM", "OR", "UT", "WA", "WY"],
}

type BenefitSort = "name_asc" | "subcategory_asc" | "amount_desc"

function matchesSubcategory(b: Grant, cat: string): boolean {
  if (b.subcategory === cat) return true
  const lower = `${b.slug} ${b.name}`.toLowerCase()
  if (cat === "veterans") return lower.includes("veteran") || lower.includes("vash") || lower.includes("tricare") || lower.includes("military") || lower.includes("armed forces")
  if (cat === "reentry") return lower.includes("reentry") || lower.includes("re-entry") || lower.includes("formerly incarcerated") || lower.includes("second chance") || lower.includes("reintegration")
  return false
}

// Programs most people need first
const SUBCATEGORY_PRIORITY: Record<string, number> = {
  food:       1,
  health:     2,
  housing:    3,
  energy:     4,
  disability: 5,
  childcare:  6,
  education:  7,
  veterans:   8,
  reentry:    9,
}

function sortBenefits(benefits: Grant[], sort: BenefitSort | undefined): Grant[] {
  const arr = [...benefits]
  switch (sort) {
    case "name_asc":        return arr.sort((a, b) => a.name.localeCompare(b.name))
    case "subcategory_asc": return arr.sort((a, b) => (a.subcategory ?? "").localeCompare(b.subcategory ?? ""))
    case "amount_desc":     return arr.sort((a, b) => (b.max_amount ?? -1) - (a.max_amount ?? -1))
    default:
      return arr.sort((a, b) => {
        const pa = SUBCATEGORY_PRIORITY[a.subcategory ?? ""] ?? 99
        const pb = SUBCATEGORY_PRIORITY[b.subcategory ?? ""] ?? 99
        if (pa !== pb) return pa - pb
        return a.name.localeCompare(b.name)
      })
  }
}

export const dynamic = "force-dynamic"

const SUBCATEGORY_LABELS: Record<string, string> = {
  housing:    "Housing",
  food:       "Food Aid",
  disability: "Disability",
  education:  "Education",
  childcare:  "Childcare",
  energy:     "Energy",
  health:     "Healthcare",
  veterans:   "Veterans",
  reentry:    "Reentry & Recovery",
}

const WHAT_YOU_GET: Record<string, string> = {
  food:       "Help paying for groceries and nutrition support, usually through a card, meal program, or local provider.",
  housing:    "Help with rent, housing costs, or finding stable housing through a local housing agency or approved provider.",
  energy:     "Help paying heating, cooling, or past-due utility bills, often paid directly to the utility company.",
  health:     "Help paying for healthcare, prescriptions, coverage, or care services through a public program or approved provider.",
  childcare:  "Help paying for child care, meals, or services so parents and caregivers can work, study, or stabilize care.",
  disability: "Support for disability-related income, healthcare, services, equipment, or independent living needs.",
  education:  "Help paying for school, training, meals, or education-related services.",
}

const SOURCE_LABELS: Record<string, string> = {
  federal: "Federal",
  state:   "State",
  local:   "Local",
  private: "Private",
}

function buildBenefitsUrl(p: { cats?: Set<string>; sources?: Set<string>; state?: string; zip?: string; q?: string; sort?: string }) {
  const parts: string[] = []
  if (p.cats?.size) parts.push(`subcategory=${Array.from(p.cats).join(",")}`)
  if (p.sources?.size) parts.push(`source=${Array.from(p.sources).join(",")}`)
  if (p.state) parts.push(`state=${p.state}`)
  if (p.zip)   parts.push(`zip=${p.zip}`)
  if (p.q) parts.push(`q=${encodeURIComponent(p.q)}`)
  if (p.sort) parts.push(`sort=${p.sort}`)
  return `/benefits${parts.length ? `?${parts.join("&")}` : ""}`
}

function toggleSubcat(selected: Set<string>, cat: string): Set<string> {
  const next = new Set(selected)
  if (next.has(cat)) {
    next.delete(cat)
  } else {
    next.add(cat)
  }
  return next
}

const SITUATIONS = [
  { key: "housing",   label: "Housing",    Icon: () => <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><polygon points="2,11 12,3 22,11"/><rect x="6" y="11" width="12" height="10" rx="1" opacity="0.6"/></svg> },
  { key: "food",      label: "Food",       Icon: () => <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><circle cx="12" cy="13" r="8"/><rect x="11" y="3" width="2" height="6" rx="1" opacity="0.6"/></svg> },
  { key: "health",    label: "Healthcare", Icon: () => <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><rect x="10" y="4" width="4" height="16"/><rect x="4" y="10" width="16" height="4"/></svg> },
  { key: "energy",    label: "Utilities",  Icon: () => <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><polygon points="13,2 6,14 12,14 11,22 18,10 12,10"/></svg> },
  { key: "childcare", label: "Childcare",  Icon: () => <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><circle cx="12" cy="9" r="4"/><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" opacity="0.6"/></svg> },
  { key: "disability",label: "Disability", Icon: () => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="2"/><path d="M12 8v6l3 4M7 9h10"/></svg> },
  { key: "education", label: "Education",  Icon: () => <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><polygon points="2,8 12,3 22,8 12,13"/><polygon points="6,11 6,17 12,20 18,17 18,11 12,14" opacity="0.6"/></svg> },
  { key: "veterans",  label: "Veterans",   Icon: () => <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9" opacity="0.85"/></svg> },
  { key: "reentry",   label: "Reentry",    Icon: () => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2"/><polyline points="8,6 2,12 8,18"/><line x1="2" y1="12" x2="14" y2="12"/></svg> },
]

function BenefitRow({ benefit }: { benefit: Grant }) {
  const subcategoryLabel = benefit.subcategory
    ? (SUBCATEGORY_LABELS[benefit.subcategory] ?? benefit.subcategory.replace(/_/g, " "))
    : null
  const amount = benefit.max_amount
    ? (benefit.max_amount >= 1000 ? `$${(benefit.max_amount / 1000).toFixed(0)}K` : `$${benefit.max_amount}`)
    : null

  return (
    <article className="bg-white border border-amber-100 rounded-2xl px-6 sm:px-8 py-6 hover:border-emerald-200 transition-colors group relative">
      <Link href={`/benefits/${benefit.slug}`} className="absolute inset-0 rounded-2xl" aria-label={benefit.name} />

      {/* Top row */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0">
          <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-1">{benefit.agency}</p>
          <h2 className="text-xl font-bold text-slate-900 leading-snug">{benefit.name}</h2>
        </div>
        {subcategoryLabel && (
          <span className="shrink-0 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold whitespace-nowrap">
            {subcategoryLabel}
          </span>
        )}
      </div>

      {/* What you get — short scannable summary */}
      <p className="text-base text-slate-700 leading-relaxed mb-5">
        {WHAT_YOU_GET[benefit.subcategory ?? ""] ?? benefit.description}
      </p>

      {/* Footer row */}
      <div className="flex items-center justify-between gap-4 flex-wrap pt-4 border-t border-amber-50">
        <div className="flex items-center gap-4 text-sm text-slate-500">
          {amount && (
            <span className="font-semibold text-slate-900 tabular-nums">{amount}</span>
          )}
          <StatusBadge deadline={benefit.deadline} isRecurring={benefit.is_recurring ?? false} />
        </div>
        <span className="text-sm font-semibold text-emerald-700 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
          View details &amp; how to apply
          <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </article>
  )
}

export default async function BenefitsPage({
  searchParams,
}: {
  searchParams: Promise<{ subcategory?: string; source?: string; state?: string; zip?: string; q?: string; smart_q?: string; hint?: string; sort?: string }>
}) {
  const { subcategory, source, state, zip, q, smart_q, hint, sort } = await searchParams
  const selectedSubcategories = new Set((subcategory ?? "").split(",").filter(Boolean))
  const selectedSources = new Set((source ?? "").split(",").filter(Boolean))
  const allBenefits = await getBenefits()

  // Smart search: use expanded keywords from Claude (pipe-separated) or fall back to literal query
  const searchTerms = smart_q
    ? smart_q.split("|").map((k) => k.trim()).filter(Boolean)
    : q
    ? [q]
    : []

  const filtered = allBenefits.filter((b) => {
    if (selectedSubcategories.size > 0 && !Array.from(selectedSubcategories).some(cat => matchesSubcategory(b, cat))) return false
    if (selectedSources.size > 0 && !selectedSources.has(b.funding_source ?? "")) return false
    if (state) {
      const agencyStates = AGENCY_STATES[b.agency]
      if (agencyStates && !agencyStates.includes(state)) return false
    }
    if (searchTerms.length > 0) {
      const haystack = `${b.name} ${b.description} ${b.agency} ${b.subcategory ?? ""}`.toLowerCase()
      if (!searchTerms.some((term) => haystack.includes(term.toLowerCase()))) return false
    }
    return true
  })

  const benefits = sortBenefits(filtered, sort as BenefitSort | undefined)
  const hasActiveFilters = selectedSubcategories.size > 0 || selectedSources.size > 0 || !!state || !!q

  return (
    <div className="flex flex-col min-h-full bg-amber-50/30">
      <SiteNav active="benefits" />

      {/* Header section */}
      <section className="bg-amber-50 border-b border-amber-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            {/* Left — headline + AI search hint */}
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-3">
                Government assistance · Free to apply
              </p>
              <h1 className="text-4xl font-bold text-slate-900 leading-tight tracking-tight mb-3">
                Real help with everyday needs.
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed mb-5 max-w-lg">
                Benefits are ongoing programs you may qualify for based on your income, family size,
                or situation. Free to apply, funded by your taxes.
              </p>
              <SmartSearchBar type="benefits" initialQuery={q} initialHint={hint} />
            </div>

            {/* Right — quick stats card */}
            <div className="lg:w-72 shrink-0 bg-white border border-amber-200 rounded-2xl p-5">
              <div className="grid grid-cols-2 divide-x divide-y divide-amber-100 border border-amber-100 rounded-xl overflow-hidden">
                {([
                  [String(allBenefits.length), "Benefits indexed"],
                  ["$238B", "Distributed last year"],
                  ["~1 in 5", "Eligible Americans miss out"],
                  ["Free", "Always free, no ads"],
                ] as [string, string][]).map(([big, sub]) => (
                  <div key={sub} className="p-3 bg-white">
                    <p className="text-lg font-bold text-emerald-900 tabular-nums leading-tight">{big}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Mobile-only horizontal category strip */}
          <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4">
            <Link
              href="/benefits"
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors ${
                selectedSubcategories.size === 0
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white border-amber-200 text-slate-600 hover:bg-amber-50"
              }`}
            >
              All benefits
            </Link>
            {SITUATIONS.map(s => (
              <Link
                key={s.key}
                href={buildBenefitsUrl({ cats: new Set([s.key]), sources: selectedSources, state, zip, q, sort })}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors ${
                  selectedSubcategories.has(s.key)
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white border-amber-200 text-slate-600 hover:bg-amber-50"
                }`}
              >
                {s.label}
              </Link>
            ))}
          </div>

          <div className="flex gap-8 items-start">

            {/* Left rail — situation chips — sticky */}
            <aside className="hidden lg:flex flex-col gap-1.5 w-52 shrink-0 sticky top-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2 px-1">
                What do you need?
              </p>

              {/* "All" chip */}
              <Link
                href="/benefits"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  selectedSubcategories.size === 0
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "text-slate-600 hover:bg-amber-50"
                }`}
              >
                <span className="w-7 h-7 rounded-lg bg-white border border-amber-200 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9"/>
                  </svg>
                </span>
                <span>All benefits</span>
                <span className="ml-auto text-xs text-slate-400 tabular-nums">{allBenefits.length}</span>
              </Link>

              {/* Situation chips */}
              {SITUATIONS.map(s => {
                const isActive = selectedSubcategories.has(s.key)
                const count = allBenefits.filter(b => matchesSubcategory(b, s.key)).length
                const href = buildBenefitsUrl({ cats: new Set([s.key]), sources: selectedSources, state, zip, q, sort })
                return (
                  <Link
                    key={s.key}
                    href={href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "text-slate-600 hover:bg-amber-50"
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${
                      isActive ? "bg-emerald-100 border-emerald-300 text-emerald-700" : "bg-white border-amber-200 text-slate-500"
                    }`}>
                      <s.Icon />
                    </span>
                    <span>{s.label}</span>
                    <span className="ml-auto text-xs text-slate-400 tabular-nums">{count}</span>
                  </Link>
                )
              })}

              {/* Quiz nudge */}
              <div className="mt-4 p-4 bg-white border border-amber-200 rounded-xl">
                <p className="text-sm font-semibold text-slate-900 mb-1">Not sure where to start?</p>
                <p className="text-xs text-slate-500 leading-relaxed mb-2">
                  Answer a few questions and we&apos;ll show you what you qualify for.
                </p>
                <Link href="/quiz" className="text-xs font-semibold text-emerald-700 inline-flex items-center gap-1">
                  Take the 2-min quiz <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </aside>

            {/* Main list */}
            <div className="flex-1 min-w-0">
              {/* State + source filter row */}
              <div className="flex flex-wrap items-center gap-3 mb-5">
                {/* State selector */}
                <BenefitsStateFilter
                  currentState={state}
                  currentSubcategory={subcategory}
                  currentSource={source}
                  currentQ={q}
                  currentSort={sort}
                />
                {/* Source pills — compact */}
                <div className="flex items-center gap-1.5 overflow-x-auto flex-1">
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider shrink-0 mr-1">Source</span>
                  {Object.entries(SOURCE_LABELS).map(([key, label]) => (
                    <Link
                      key={key}
                      href={buildBenefitsUrl({ cats: selectedSubcategories, sources: toggleSubcat(selectedSources, key), state, zip, q, sort })}
                      className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                        selectedSources.has(key)
                          ? "bg-emerald-600 text-white"
                          : "bg-white border border-amber-200 text-slate-600 hover:bg-amber-50"
                      }`}
                    >
                      {label}
                    </Link>
                  ))}
                  {hasActiveFilters && (
                    <Link href="/benefits" className="text-xs text-blue-600 hover:underline whitespace-nowrap ml-1">
                      Clear all
                    </Link>
                  )}
                </div>
                <p className="text-sm text-slate-600 ml-auto whitespace-nowrap">
                  <span className="font-semibold text-slate-900">{benefits.length}</span>{" "}
                  {benefits.length === 1 ? "benefit" : "benefits"} shown
                </p>
              </div>

              {/* Vertical list */}
              {benefits.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-slate-500">No benefits found. <Link href="/benefits" className="text-blue-600 hover:underline">Clear filters</Link></p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {benefits.map(benefit => (
                    <BenefitRow key={benefit.id} benefit={benefit} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
