"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Globe, ArrowRight, Loader2 } from "lucide-react"

export default function WebsiteScanner() {
  const router = useRouter()
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = url.trim()
    if (!trimmed || loading) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/scrape-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      })
      const data = await res.json() as {
        keywords?: string[]
        categories?: string[]
        interpretation?: string
        domain?: string
        error?: string
      }
      if (!res.ok) {
        setError(data.error ?? "Could not reach that website — check the URL and try again")
        return
      }
      const { keywords = [], categories = [], interpretation = "", domain = trimmed } = data
      const params = new URLSearchParams()
      params.set("q", `Website: ${domain}`)
      if (keywords.length > 0) params.set("smart_q", keywords.join("|"))
      if (categories.length > 0) params.set("topic", categories.join(","))
      if (interpretation) params.set("hint", interpretation)
      params.set("type", "grants")
      router.push(`/ai-results?${params.toString()}`)
    } catch {
      setError("Something went wrong — check your connection and try again")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError("") }}
            placeholder="www.example.com"
            autoComplete="url"
            className={`w-full h-14 pl-12 pr-4 rounded-xl border-2 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 transition-all bg-white ${
              error
                ? "border-rose-400 focus:border-rose-500"
                : "border-transparent focus:border-blue-400"
            }`}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="h-14 px-7 rounded-xl bg-blue-600 text-white font-semibold text-base hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-40 flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
        >
          {loading
            ? <Loader2 className="w-5 h-5 animate-spin" />
            : <><span>Find Grants</span><ArrowRight className="w-4 h-4" /></>
          }
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-rose-300 pl-1">{error}</p>
      )}
      {loading && (
        <p className="mt-2 text-sm text-slate-400 pl-1 flex items-center gap-1.5">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Scanning {url.trim()}…
        </p>
      )}
    </form>
  )
}
