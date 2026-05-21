import { getGrants } from "@/lib/supabase"
import type { Grant } from "@/lib/types"
import SiteNav from "@/components/SiteNav"
import GrantsTableClient from "@/components/GrantsTableClient"

// State-specific private agencies — only shown when user is in those states
const AGENCY_STATES: Record<string, string[]> = {
  "New York Foundation for the Arts":    ["NY"],
  "Artist Trust":                         ["WA"],
  "New England Foundation for the Arts": ["CT", "ME", "MA", "NH", "RI", "VT"],
  "Western States Arts Federation":      ["AK", "AZ", "CO", "ID", "MT", "NV", "NM", "OR", "UT", "WA", "WY"],
}

export const dynamic = "force-dynamic"

function formatAmount(amount: number | null) {
  if (!amount) return "Varies"
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`
  return `$${amount}`
}


const CATEGORY_LABELS: Record<string, string> = {
  small_business: "Small Business",
  individual:     "Individual",
  agricultural:   "Agricultural",
  research:       "Research",
  veterans:       "Veterans",
  arts:           "Arts",
}

type GrantSort = "amount_desc" | "amount_asc" | "processing_asc" | "deadline_asc" | "name_asc"

function sortGrants(grants: Grant[], sort: GrantSort | undefined): Grant[] {
  const arr = [...grants]
  switch (sort) {
    case "amount_desc":  return arr.sort((a, b) => (b.max_amount ?? -1) - (a.max_amount ?? -1))
    case "amount_asc":   return arr.sort((a, b) => (a.max_amount ?? Infinity) - (b.max_amount ?? Infinity))
    case "processing_asc": return arr.sort((a, b) => (a.processing_time_days ?? Infinity) - (b.processing_time_days ?? Infinity))
    case "deadline_asc": return arr.sort((a, b) => {
      if (!a.deadline && !b.deadline) return 0
      if (!a.deadline) return 1
      if (!b.deadline) return -1
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    })
    case "name_asc":     return arr.sort((a, b) => a.name.localeCompare(b.name))
    default:             return arr
  }
}


const SOURCE_LABELS: Record<string, string> = {
  federal:  "Federal",
  state:    "State",
  local:    "Local",
  private:  "Private",
}

function buildGrantsUrl(p: { cats?: Set<string>; sources?: Set<string>; state?: string; zip?: string; q?: string; sort?: string; eligible?: string }) {
  const parts: string[] = []
  if (p.cats?.size) parts.push(`category=${Array.from(p.cats).join(",")}`)
  if (p.sources?.size) parts.push(`source=${Array.from(p.sources).join(",")}`)
  if (p.state) parts.push(`state=${p.state}`)
  if (p.zip)   parts.push(`zip=${p.zip}`)
  if (p.q) parts.push(`q=${encodeURIComponent(p.q)}`)
  if (p.sort) parts.push(`sort=${p.sort}`)
  if (p.eligible) parts.push(`eligible=${p.eligible}`)
  return `/grants${parts.length ? `?${parts.join("&")}` : ""}`
}


export default async function GrantsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; source?: string; q?: string }>
}) {
  const { category, source, q } = await searchParams
  const allGrants = await getGrants()

  return (
    <div className="flex flex-col min-h-full">
      <SiteNav active="grants" />
      <GrantsTableClient
        allGrants={allGrants}
        initialCategory={category}
        initialSource={source}
        initialQ={q}
      />
    </div>
  )
}
