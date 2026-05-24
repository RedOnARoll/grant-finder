"use client"

import { type FormEvent, useEffect, useState } from "react"
import { MapPin } from "lucide-react"
import StateSelector from "@/components/StateSelector"
import StateProgramInfo from "@/components/StateProgramInfo"
import { US_STATES } from "@/lib/state-programs"

type Props = {
  slug: string
}

export default function StateProgramBanner({ slug }: Props) {
  const [stateCode, setStateCode] = useState<string | null>(null)
  const [zipInput, setZipInput] = useState("")

  // Pre-fill ZIP input from any previously saved value
  useEffect(() => {
    const saved = localStorage.getItem("gw_zip") ?? localStorage.getItem("gw_profile_zip") ?? ""
    if (saved) setZipInput(saved)
  }, [])

  const stateName = stateCode
    ? (US_STATES.find((s) => s.code === stateCode)?.name ?? stateCode)
    : null

  function handleZipSubmit(e: FormEvent) {
    e.preventDefault()
    const clean = zipInput.replace(/\D/g, "").slice(0, 5)
    if (clean.length !== 5) return
    localStorage.setItem("gw_zip", clean)
    // Notify StateSelector (and any other listeners) that ZIP is now available
    window.dispatchEvent(new Event("gw:zip-updated"))
  }

  return (
    <div className="space-y-3 my-5">
      {!stateCode ? (
        /* No state detected yet — prompt for ZIP */
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-blue-600 shrink-0" />
            <span className="text-sm font-semibold text-slate-800">
              See details for your state
            </span>
          </div>
          <form onSubmit={handleZipSubmit} className="flex gap-2 flex-wrap items-center">
            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={zipInput}
              onChange={(e) => setZipInput(e.target.value.replace(/\D/g, "").slice(0, 5))}
              placeholder="Enter ZIP code"
              className="h-9 w-32 rounded-lg border border-slate-200 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              type="submit"
              disabled={zipInput.length !== 5}
              className="h-9 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Show my state info
            </button>
            <span className="text-xs text-slate-400">or</span>
            <StateSelector onStateChange={setStateCode} />
          </form>
        </div>
      ) : (
        /* State known — show selector + info */
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-slate-500 font-medium">Showing info for your state:</span>
            <StateSelector onStateChange={setStateCode} />
          </div>
          <StateProgramInfo slug={slug} stateCode={stateCode} stateName={stateName} />
        </div>
      )}
    </div>
  )
}
