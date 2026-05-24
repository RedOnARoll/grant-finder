"use client"

import { type ChangeEvent, useEffect, useRef, useState } from "react"
import { MapPin, ChevronDown } from "lucide-react"
import { US_STATES } from "@/lib/state-programs"

type Props = {
  onStateChange: (code: string | null) => void
  className?: string
}

export default function StateSelector({ onStateChange, className = "" }: Props) {
  const [stateCode, setStateCode] = useState<string | null>(null)
  const [autoDetected, setAutoDetected] = useState(false)
  const [open, setOpen] = useState(false)
  const selectRef = useRef<HTMLSelectElement>(null)

  function lookupZip(zip: string) {
    fetch(`https://api.zippopotam.us/us/${zip}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        const place = data?.places?.[0]
        if (!place) return
        const code = (place["state abbreviation"] as string).toUpperCase()
        setStateCode(code)
        setAutoDetected(true)
        localStorage.setItem("gw_state", code)
        window.dispatchEvent(new Event("gw:state-updated"))
        onStateChange(code)
      })
      .catch(() => {/* ignore zip lookup errors */})
  }

  useEffect(() => {
    let cancelled = false

    const frame = requestAnimationFrame(() => {
      const saved = localStorage.getItem("gw_state")
      if (saved) {
        if (!cancelled) {
          setStateCode(saved)
          onStateChange(saved)
        }
        return
      }

      const zip = localStorage.getItem("gw_profile_zip") ?? localStorage.getItem("gw_zip")
      if (!zip) return
      lookupZip(zip)
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // React to ZIP being saved by another component on the same page
  useEffect(() => {
    function handleZipUpdated() {
      // Don't overwrite an explicit state selection
      if (localStorage.getItem("gw_state")) return
      const zip = localStorage.getItem("gw_profile_zip") ?? localStorage.getItem("gw_zip")
      if (!zip) return
      lookupZip(zip)
    }
    window.addEventListener("gw:zip-updated", handleZipUpdated)
    return () => window.removeEventListener("gw:zip-updated", handleZipUpdated)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleChange(e: ChangeEvent<HTMLSelectElement>) {
    const code = e.target.value || null
    setStateCode(code)
    setAutoDetected(false)
    if (code) {
      localStorage.setItem("gw_state", code)
    } else {
      localStorage.removeItem("gw_state")
    }
    window.dispatchEvent(new Event("gw:state-updated"))
    onStateChange(code)
    setOpen(false)
  }

  const stateName = stateCode
    ? (US_STATES.find((s) => s.code === stateCode)?.name ?? stateCode)
    : null

  return (
    <div className={`inline-flex flex-col items-start gap-0.5 ${className}`}>
      <div className="relative inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-slate-200 bg-white text-sm text-slate-700 hover:border-blue-400 transition-colors cursor-pointer shadow-sm">
        <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
        <select
          ref={selectRef}
          value={stateCode ?? ""}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          aria-label="Select your state"
          className="appearance-none bg-transparent cursor-pointer focus:outline-none pr-4 font-medium text-slate-800"
        >
          <option value="">Select your state</option>
          {US_STATES.map((s) => (
            <option key={s.code} value={s.code}>
              {s.name}
            </option>
          ))}
        </select>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>
      {autoDetected && stateName && (
        <span className="text-xs text-slate-400 pl-1">Based on your zip code</span>
      )}
    </div>
  )
}
