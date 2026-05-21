import Link from "next/link"
import { Sparkles, Tag } from "lucide-react"
import { getAllPrograms } from "@/lib/supabase"
import type { Grant } from "@/lib/types"
import SiteNav from "@/components/SiteNav"
import SaveInterestButton from "@/components/SaveInterestButton"
import ProgramGrid from "@/components/ProgramGrid"
import { Badge, StatusBadge } from "@/components/ui/Badge"
import { EmptyStateIllustration } from "@/components/illustrations/GeoShapes"
import SmartSearchBar from "@/components/SmartSearchBar"
import ZipFilter from "@/components/ZipFilter"
import SortSelect from "@/components/SortSelect"

export const dynamic = "force-dynamic"

// State-specific private grants/benefits — filter out if user's state doesn't match
const AGENCY_STATES: Record<string, string[]> = {
  "New York Foundation for the Arts":     ["NY"],
  "Artist Trust":                          ["WA"],
  "New England Foundation for the Arts":  ["CT", "ME", "MA", "NH", "RI", "VT"],
  "Western States Arts Federation":       ["AK", "AZ", "CO", "ID", "MT", "NV", "NM", "OR", "UT", "WA", "WY"],
}

const SOURCE_LABELS: Record<string, string> = {
  federal: "Federal",
  state:   "State",
  local:   "Local",
  private: "Private",
}

// Unified topic labels covering both grant categories and benefit subcategories
const TOPIC_LABELS: Record<string, string> = {
  small_business: "Small Business",
  individual:     "Individual",
  agricultural:   "Agricultural",
  research:       "Research",
  veterans:       "Veterans",
  arts:           "Arts",
  housing:        "Housing",
  food:           "Food Aid",
  disability:     "Disability",
  education:      "Education",
  childcare:      "Childcare",
  energy:         "Energy",
  health:         "Healthcare",
}

type ProgramSort = "name_asc" | "amount_desc" | "deadline_asc"

const SORT_LABELS: Record<ProgramSort, string> = {
  name_asc:     "Name: A–Z",
  amount_desc:  "Amount: High → Low",
  deadline_asc: "Deadline: Soonest",
}

function formatAmount(amount: number | null) {
  if (!amount) return null
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`
  return `$${amount}`
}

function sortPrograms(programs: Grant[], sort: ProgramSort | undefined): Grant[] {
  const arr = [...programs]
  switch (sort) {
    case "amount_desc": return arr.sort((a, b) => (b.max_amount ?? -1) - (a.max_amount ?? -1))
    case "deadline_asc": return arr.sort((a, b) => {
      if (!a.deadline && !b.deadline) return 0
      if (!a.deadline) return 1
      if (!b.deadline) return -1
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    })
    case "name_asc":
    default: return arr.sort((a, b) => a.name.localeCompare(b.name))
  }
}

function buildUrl(p: {
  type?: string
  topics?: Set<string>
  sources?: Set<string>
  state?: string
  zip?: string
  q?: string
  sort?: string
}) {
  const parts: string[] = []
  if (p.type)         parts.push(`type=${p.type}`)
  if (p.topics?.size) parts.push(`topic=${Array.from(p.topics).join(",")}`)
  if (p.sources?.size) parts.push(`source=${Array.from(p.sources).join(",")}`)
  if (p.state)        parts.push(`state=${p.state}`)
  if (p.zip)          parts.push(`zip=${p.zip}`)
  if (p.q)            parts.push(`q=${encodeURIComponent(p.q)}`)
  if (p.sort)         parts.push(`sort=${p.sort}`)
  return `/programs${parts.length ? `?${parts.join("&")}` : ""}`
}

function toggle(set: Set<string>, key: string): Set<string> {
  const next = new Set(set)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  return next
}

function ProgramCard({ program }: { program: Grant }) {
  const href = `/${program.type === "grant" ? "grants" : "benefits"}/${program.slug}`
  const amount = formatAmount(program.max_amount)
  const topicKey = program.type === "grant" ? program.category : (program.subcategory ?? "")
  const topicLabel = TOPIC_LABELS[topicKey] ?? topicKey.replace("_", " ")

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow relative flex flex-col h-full">
      <Link href={href} className="absolute inset-0 rounded-xl" aria-label={program.name} />

      {/* Top row */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <StatusBadge deadline={program.deadline} isRecurring={program.is_recurring ?? false} />
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            program.type === "grant"
              ? "bg-blue-100 text-blue-700"
              : "bg-emerald-100 text-emerald-700"
          }`}>
            {program.type === "grant" ? "Grant" : "Benefit"}
          </span>
        </div>
        <div className="relative z-10">
          <SaveInterestButton slug={program.slug} type={program.type === "grant" ? "grant" : "benefit"} />
        </div>
      </div>

      {/* Agency */}
      <p className="text-xs text-slate-400 uppercase tracking-wide mt-1">{program.agency}</p>

      {/* Name */}
      <h3 className="text-base font-semibold text-slate-900 line-clamp-2 mt-1">{program.name}</h3>

      {/* Description */}
      <p className="text-sm text-slate-600 line-clamp-3 mt-2 flex-1">{program.description}</p>

      {/* Bottom row */}
      <div className="mt-4 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {amount && <span className="text-sm font-semibold text-slate-900">{amount}</span>}
          {topicLabel && (
            <Badge variant="amber" className="capitalize">{topicLabel}</Badge>
          )}
        </div>
        <span className="text-blue-600 text-sm font-medium relative z-10 pointer-events-none">
          View Details →
        </span>
      </div>
    </div>
  )
}

export default async function ProgramsPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string
    topic?: string
    source?: string
    state?: string
    zip?: string
    q?: string
    smart_q?: string
    hint?: string
    sort?: string
  }>
}) {
  const { type, topic, source, state, zip, q, smart_q, hint, sort } = await searchParams

  const selectedTopics  = new Set((topic  ?? "").split(",").filter(Boolean))
  const selectedSources = new Set((source ?? "").split(",").filter(Boolean))

  const allPrograms = await getAllPrograms()

  const searchTerms = smart_q
    ? smart_q.split("|").map((k) => k.trim()).filter(Boolean)
    : q ? [q] : []

  const filtered = allPrograms.filter((p) => {
    // Type filter
    if (type === "grant"   && p.type !== "grant")   return false
    if (type === "benefit" && p.type !== "benefit") return false

    // Topic filter — checks both grant category and benefit subcategory
    if (selectedTopics.size > 0) {
      const topicKey = p.type === "grant" ? p.category : (p.subcategory ?? "")
      if (!selectedTopics.has(topicKey)) return false
    }

    // Funding source filter
    if (selectedSources.size > 0 && !selectedSources.has(p.funding_source ?? "")) return false

    // State / location filter
    if (state) {
      const agencyStates = AGENCY_STATES[p.agency]
      if (agencyStates && !agencyStates.includes(state)) return false
    }

    // Smart / keyword search
    if (searchTerms.length > 0) {
      const haystack = `${p.name} ${p.description} ${p.agency}`.toLowerCase()
      if (!searchTerms.some((term) => haystack.includes(term.toLowerCase()))) return false
    }

    return true
  })

  const programs = sortPrograms(filtered, sort as ProgramSort | undefined)
  const grantCount   = allPrograms.filter((p) => p.type === "grant").length
  const benefitCount = allPrograms.filter((p) => p.type === "benefit").length

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <SiteNav active="programs" />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">All Programs</h1>
          <p className="text-sm text-slate-600 mt-1">
            {grantCount} grants + {benefitCount} benefits —{" "}
            {allPrograms.length} programs total. Use AI search to find what fits your situation.
          </p>
        </div>

        {/* Smart search bar */}
        <SmartSearchBar type="programs" initialQuery={q ?? ""} initialHint={hint ?? ""} />

        {/* Mobile filter chips */}
        <div className="lg:hidden mb-6 overflow-x-auto">
          <div className="flex gap-2 pb-1 min-w-max">
            {/* Type chips */}
            {(["grant", "benefit"] as const).map((t) => (
              <Link
                key={t}
                href={buildUrl({ type: type === t ? undefined : t, topics: selectedTopics, sources: selectedSources, state, zip, q, sort })}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  type === t ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t === "grant" ? "Grants" : "Benefits"}
              </Link>
            ))}
            {/* Source chips */}
            {Object.entries(SOURCE_LABELS).map(([key, label]) => (
              <Link
                key={key}
                href={buildUrl({ type, topics: selectedTopics, sources: toggle(selectedSources, key), state, zip, q, sort })}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedSources.has(key) ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {label}
              </Link>
            ))}
            {(type || selectedTopics.size > 0 || selectedSources.size > 0 || state) && (
              <Link href="/programs" className="shrink-0 px-3 py-1.5 rounded-lg text-sm text-blue-600 hover:underline whitespace-nowrap">
                Clear
              </Link>
            )}
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 p-4 sticky top-20 space-y-5">
              <h2 className="text-sm font-semibold text-slate-900">Filters</h2>

              {/* ZIP / Location */}
              <ZipFilter basePath="/programs" initialState={state} initialZip={zip} />

              {/* Program type */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Program Type</p>
                <div className="flex flex-col gap-1">
                  {[
                    { key: undefined, label: "All Programs" },
                    { key: "grant",   label: `Grants` },
                    { key: "benefit", label: `Benefits` },
                  ].map(({ key, label }) => (
                    <Link
                      key={label}
                      href={buildUrl({ type: key, topics: selectedTopics, sources: selectedSources, state, zip, q, sort })}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        type === key
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Funding Source */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Funding Source</p>
                <div className="flex flex-col gap-1">
                  {Object.entries(SOURCE_LABELS).map(([key, label]) => (
                    <Link
                      key={key}
                      href={buildUrl({ type, topics: selectedTopics, sources: toggle(selectedSources, key), state, zip, q, sort })}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        selectedSources.has(key)
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Topic */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Topic</p>
                <div className="flex flex-col gap-1">
                  {Object.entries(TOPIC_LABELS).map(([key, label]) => (
                    <Link
                      key={key}
                      href={buildUrl({ type, topics: toggle(selectedTopics, key), sources: selectedSources, state, zip, q, sort })}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        selectedTopics.has(key)
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Clear */}
              {(type || selectedTopics.size > 0 || selectedSources.size > 0 || state || q) && (
                <div className="pt-3 border-t border-slate-100">
                  <Link href="/programs" className="text-sm text-blue-600 hover:underline">
                    Clear all filters
                  </Link>
                </div>
              )}
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Count + sort */}
            <div className="flex items-center justify-between gap-4 mb-5">
              <p className="text-sm text-slate-500">
                <span className="font-medium text-slate-900">{programs.length}</span>{" "}
                {programs.length === 1 ? "program" : "programs"}
                {state && <span className="text-slate-400"> · filtered by state</span>}
              </p>
              <SortSelect
                value={sort ?? ""}
                options={(Object.entries(SORT_LABELS) as [ProgramSort, string][]).map(([val, label]) => ({ value: val, label }))}
              />
            </div>

            {programs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <EmptyStateIllustration className="w-24 h-20 mb-4" />
                <p className="text-base font-medium text-slate-900 mb-1">No programs found</p>
                <p className="text-sm text-slate-500 mb-4">Try a different search or adjust your filters.</p>
                <Link href="/programs" className="text-sm text-blue-600 hover:underline">
                  Clear filters
                </Link>
              </div>
            ) : (
              <ProgramGrid itemLabel="programs">
                {programs.map((p) => (
                  <ProgramCard key={p.id} program={p} />
                ))}
              </ProgramGrid>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400 mt-10">
        Program information is for reference only. Verify eligibility with the issuing agency.
      </footer>
    </div>
  )
}
