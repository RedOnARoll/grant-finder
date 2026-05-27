"use client"

import { useRouter } from "next/navigation"
import { MapPin } from "lucide-react"
import { US_STATES } from "@/lib/state-programs"

interface Props {
  currentState?: string
  currentSubcategory?: string
  currentSource?: string
  currentQ?: string
  currentSort?: string
}

export default function BenefitsStateFilter({ currentState, currentSubcategory, currentSource, currentQ, currentSort }: Props) {
  const router = useRouter()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const parts: string[] = []
    if (currentSubcategory) parts.push(`subcategory=${currentSubcategory}`)
    if (currentSource) parts.push(`source=${currentSource}`)
    if (e.target.value) parts.push(`state=${e.target.value}`)
    if (currentQ) parts.push(`q=${encodeURIComponent(currentQ)}`)
    if (currentSort) parts.push(`sort=${currentSort}`)
    router.push(`/benefits${parts.length ? `?${parts.join("&")}` : ""}`)
  }

  return (
    <div className="relative inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 hover:border-blue-400 transition-colors shadow-sm">
      <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
      <select
        value={currentState ?? ""}
        onChange={handleChange}
        aria-label="Filter by state"
        className="appearance-none bg-transparent cursor-pointer focus:outline-none pr-4 font-medium text-slate-800"
      >
        <option value="">All states</option>
        {US_STATES.map((s) => (
          <option key={s.code} value={s.code}>{s.name}</option>
        ))}
      </select>
    </div>
  )
}
