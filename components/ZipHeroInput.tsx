"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { MapPin, ArrowRight, Loader2 } from "lucide-react"

export default function ZipHeroInput() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [zip, setZip] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = zip.trim()

    if (!/^\d{5}$/.test(trimmed)) {
      setError("Please enter a valid 5-digit ZIP code")
      inputRef.current?.focus()
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch(`https://api.zippopotam.us/us/${trimmed}`)
      if (!res.ok) {
        setError("ZIP code not found — please try another")
        return
      }
      const data = await res.json()
      const place = data.places?.[0]
      if (!place) {
        setError("ZIP code not found — please try another")
        return
      }
      const stateCode = (place["state abbreviation"] as string).toUpperCase()
      router.push(`/programs?zip=${trimmed}&state=${stateCode}`)
    } catch {
      setError("Couldn't look up ZIP — check your connection")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            maxLength={5}
            value={zip}
            onChange={(e) => { setZip(e.target.value.replace(/\D/g, "")); setError("") }}
            placeholder="Enter your ZIP code"
            className={`w-full h-14 pl-12 pr-4 rounded-xl border-2 text-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 transition-all bg-white ${
              error
                ? "border-rose-400 focus:border-rose-500"
                : "border-transparent focus:border-blue-400"
            }`}
          />
        </div>
        <button
          type="submit"
          disabled={loading || zip.length !== 5}
          className="h-14 px-6 rounded-xl bg-blue-500 text-white font-semibold text-base hover:bg-blue-400 active:bg-blue-600 transition-colors disabled:opacity-40 flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Browse Programs
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-rose-300 pl-1">{error}</p>
      )}
    </form>
  )
}
