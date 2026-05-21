"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Sparkles, X, Loader2 } from "lucide-react"

type Props = {
  type: "grants" | "benefits" | "programs"
  initialQuery?: string
  initialHint?: string
}

export default function SmartSearchBar({ type, initialQuery = "", initialHint = "" }: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState(initialQuery)
  const [loading, setLoading] = useState(false)
  const [hint, setHint] = useState(initialHint)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()

    if (!trimmed) {
      setHint("")
      router.push(`/${type}`)
      return
    }

    setLoading(true)
    setHint("")

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}&type=${type}`)
      if (!res.ok) throw new Error("search failed")
      const { keywords, categories, interpretation } = await res.json() as {
        keywords: string[]
        categories: string[]
        interpretation: string
      }

      const params = new URLSearchParams()
      params.set("q", trimmed)
      if (keywords.length > 0) params.set("smart_q", keywords.join("|"))
      if (categories.length > 0) {
        const filterKey = type === "grants" ? "category" : type === "benefits" ? "subcategory" : "topic"
        params.set(filterKey, categories.join(","))
      }
      if (interpretation) params.set("hint", interpretation)

      router.push(`/${type}?${params.toString()}`)
    } catch {
      // Fallback to literal search
      router.push(`/${type}?q=${encodeURIComponent(trimmed)}`)
    } finally {
      setLoading(false)
    }
  }

  function handleClear() {
    setQuery("")
    setHint("")
    router.push(`/${type}`)
    inputRef.current?.focus()
  }

  const placeholder =
    type === "grants"
      ? "e.g. small business funding, low income housing, veteran support…"
      : "e.g. food assistance, housing help, childcare support…"

  return (
    <div className="w-full mb-8">
      <form onSubmit={handleSearch}>
        <div className="relative flex items-center shadow-sm">
          {/* Left icon */}
          <div className="absolute left-5 pointer-events-none z-10">
            {loading ? (
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-slate-400" />
            )}
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full h-14 pl-14 pr-14 sm:pr-36 rounded-2xl border border-slate-200 bg-white text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            autoComplete="off"
          />

          {/* Clear button */}
          {query && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-14 sm:right-[8.5rem] p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 h-10 px-3 sm:px-5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-60 flex items-center gap-2 whitespace-nowrap"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {loading ? "Searching…" : "Smart Search"}
            </span>
          </button>
        </div>
      </form>

      {/* Hint / interpretation */}
      {hint && !loading && (
        <p className="mt-2.5 text-sm text-slate-500 pl-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>
            <span className="font-medium text-slate-700">Showing results for:</span> {hint}
          </span>
        </p>
      )}
    </div>
  )
}
