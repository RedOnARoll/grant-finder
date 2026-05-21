"use client"

import { useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { MapPin, X, Loader2 } from "lucide-react"

// US state code → full name
const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri",
  MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
  OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
  DC: "Washington D.C.",
}

type Props = {
  /** URL path to navigate to, e.g. "/grants" or "/programs" */
  basePath: string
  /** State code already active (from ?state= URL param) */
  initialState?: string
  /** ZIP already active (from ?zip= URL param) */
  initialZip?: string
}

export default function ZipFilter({ basePath, initialState = "", initialZip = "" }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)

  const [zip, setZip] = useState(initialZip)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const activeStateName = initialState ? (STATE_NAMES[initialState] ?? initialState) : ""

  function buildUrl(extras: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, val] of Object.entries(extras)) {
      if (val === null) params.delete(key)
      else params.set(key, val)
    }
    const qs = params.toString()
    return `${basePath}${qs ? `?${qs}` : ""}`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = zip.trim()

    if (!/^\d{5}$/.test(trimmed)) {
      setError("Enter a valid 5-digit ZIP")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch(`https://api.zippopotam.us/us/${trimmed}`)
      if (!res.ok) {
        setError("ZIP code not found")
        return
      }
      const data = await res.json()
      const place = data.places?.[0]
      if (!place) {
        setError("ZIP code not found")
        return
      }
      const stateCode = (place["state abbreviation"] as string).toUpperCase()
      router.push(buildUrl({ state: stateCode, zip: trimmed }))
    } catch {
      setError("Couldn't look up ZIP — check your connection")
    } finally {
      setLoading(false)
    }
  }

  function handleClear() {
    setZip("")
    setError("")
    router.push(buildUrl({ state: null, zip: null }))
    inputRef.current?.focus()
  }

  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
        Your Location
      </p>

      {/* Active state pill */}
      {initialState && (
        <div className="flex items-center gap-2 mb-2.5 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
          <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="text-sm font-medium text-blue-800 flex-1 truncate">
            {activeStateName}
            {initialZip && <span className="text-blue-500 font-normal"> ({initialZip})</span>}
          </span>
          <button
            type="button"
            onClick={handleClear}
            className="text-blue-400 hover:text-blue-600 transition-colors"
            aria-label="Clear location filter"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ZIP input form */}
      {!initialState && (
        <form onSubmit={handleSubmit}>
          <div className="relative flex items-center">
            <MapPin className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={zip}
              onChange={(e) => { setZip(e.target.value.replace(/\D/g, "")); setError("") }}
              placeholder="e.g. 90210"
              className="w-full h-9 pl-9 pr-16 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            <button
              type="submit"
              disabled={loading || zip.length !== 5}
              className="absolute right-1.5 h-6 px-2 rounded-md bg-blue-600 text-white text-xs font-medium disabled:opacity-40 hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Go"}
            </button>
          </div>
          {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
        </form>
      )}
    </div>
  )
}
