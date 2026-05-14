"use client"

import { useState } from "react"
import { US_STATES } from "@/lib/state-programs"

interface Props {
  slug: string
  fallbackUrl: string
  stateUrls: Record<string, string>
  agencyName: string
}

export default function StateApplyButton({ slug, fallbackUrl, stateUrls, agencyName }: Props) {
  const [state, setState] = useState("")

  const applyUrl = state ? (stateUrls[state] ?? fallbackUrl) : null
  const selectedState = US_STATES.find((s) => s.code === state)

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6">
      <p className="font-semibold text-zinc-900 mb-1">This program is administered by your state.</p>
      <p className="text-sm text-zinc-500 mb-4">Select your state to get the exact application link.</p>

      <select
        value={state}
        onChange={(e) => setState(e.target.value)}
        className="w-full h-10 px-3 rounded-lg border border-zinc-300 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 mb-4"
      >
        <option value="">— Select your state —</option>
        {US_STATES.map((s) => (
          <option key={s.code} value={s.code}>{s.name}</option>
        ))}
      </select>

      {applyUrl && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-zinc-600 bg-white border border-zinc-200 rounded-lg px-3 py-2 break-all">
            <svg className="w-4 h-4 shrink-0 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span className="truncate">{applyUrl}</span>
          </div>
          <a
            href={applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 h-12 px-8 rounded-full bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 transition-colors w-full"
          >
            Apply in {selectedState?.name} →
          </a>
          {!stateUrls[state] && (
            <p className="text-xs text-zinc-400 text-center">
              No state-specific link on file — using the general program page.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
