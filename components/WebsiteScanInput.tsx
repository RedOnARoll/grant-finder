"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Link2, Loader2, Sparkles } from "lucide-react"

interface Props {
  onScan?: (result: { interpretation: string; categories: string[]; keywords: string[] }) => void
}

export default function WebsiteScanInput({ onScan }: Props) {
  const router = useRouter()
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleScan() {
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
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Could not scan website — try again")
        return
      }
      const interpretation: string = data.interpretation ?? ""
      const categories: string[] = data.categories ?? []
      const keywords: string[] = data.keywords ?? []

      onScan?.({ interpretation, categories, keywords })

      const params = new URLSearchParams({ q: interpretation })
      if (keywords.length > 0) params.set("smart_q", keywords.join("|"))
      if (categories.length > 0) params.set("topic", categories.join(","))
      router.push(`/ai-results?${params.toString()}`)
    } catch {
      setError("Could not reach the server — try again")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative mb-4 rounded-2xl overflow-hidden border border-blue-500/30 bg-gradient-to-br from-blue-950/60 to-slate-900/80 p-5 sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-blue-500/5 rounded-2xl" />

      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/40">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
            Instantly match grants to your business
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Paste your website — we&apos;ll read it and show you the best matches
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className={`flex-1 flex items-center gap-2.5 rounded-xl px-4 h-12 border transition-all ${
          error
            ? "bg-rose-950/40 border-rose-500/50"
            : "bg-white/10 border-white/20 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20"
        }`}>
          <Link2 className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            value={url}
            onChange={e => { setUrl(e.target.value); setError("") }}
            onKeyDown={e => e.key === "Enter" && handleScan()}
            placeholder="https://yourwebsite.com"
            type="url"
            className="flex-1 text-sm text-white placeholder-slate-500 outline-none bg-transparent min-w-0"
          />
        </div>

        <button
          onClick={handleScan}
          disabled={!url.trim() || loading}
          className="h-12 px-7 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-lg shadow-blue-900/30 whitespace-nowrap"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Scanning…</>
          ) : "Find grants"}
        </button>
      </div>

      {error && (
        <p className="text-xs text-rose-400 mt-2.5 flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-rose-400 inline-block" />
          {error}
        </p>
      )}
    </div>
  )
}
