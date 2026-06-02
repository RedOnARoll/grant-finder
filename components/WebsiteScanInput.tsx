"use client"

import { useState } from "react"
import { Link2, Loader2, CheckCircle2, ArrowRight, Sparkles } from "lucide-react"

interface ScanResult {
  interpretation: string
  categories: string[]
  keywords: string[]
}

interface Props {
  onScan: (result: ScanResult) => void
}

export default function WebsiteScanInput({ onScan }: Props) {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [scanned, setScanned] = useState<{ domain: string; interpretation: string } | null>(null)

  async function handleScan() {
    const trimmed = url.trim()
    if (!trimmed || loading) return
    setLoading(true)
    setError("")
    setScanned(null)
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
      const result: ScanResult = {
        interpretation: data.interpretation ?? "",
        categories: data.categories ?? [],
        keywords: data.keywords ?? [],
      }
      setScanned({ domain: data.domain ?? "", interpretation: result.interpretation })
      onScan(result)
    } catch {
      setError("Could not reach the server — try again")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative mb-4 rounded-2xl overflow-hidden border border-blue-500/30 bg-gradient-to-br from-blue-950/60 to-slate-900/80 p-5 sm:p-6">
      {/* Subtle glow */}
      <div className="pointer-events-none absolute inset-0 bg-blue-500/5 rounded-2xl" />

      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/40">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
            Instantly match grants to your business
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Paste your website — we'll read it and filter the database for you
          </p>
        </div>
      </div>

      {/* Input row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className={`flex-1 flex items-center gap-2.5 rounded-xl px-4 h-12 border transition-all ${
          error
            ? "bg-rose-950/40 border-rose-500/50 focus-within:border-rose-400"
            : "bg-white/10 border-white/20 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20"
        }`}>
          <Link2 className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            value={url}
            onChange={e => { setUrl(e.target.value); setError(""); setScanned(null) }}
            onKeyDown={e => e.key === "Enter" && handleScan()}
            placeholder="https://yourwebsite.com"
            type="url"
            className="flex-1 text-sm text-white placeholder-slate-500 outline-none bg-transparent min-w-0"
          />
          {scanned && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
        </div>

        <button
          onClick={handleScan}
          disabled={!url.trim() || loading}
          className="h-12 px-6 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-lg shadow-blue-900/30"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Scanning…</>
          ) : (
            <>Scan my website <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </div>

      {/* Feedback */}
      {error && (
        <p className="text-xs text-rose-400 mt-2.5 flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-rose-400 inline-block" />
          {error}
        </p>
      )}
      {scanned && !error && (
        <div className="mt-3 flex items-start gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span className="text-slate-300">
            <span className="font-semibold text-white">{scanned.domain}</span>
            {scanned.interpretation && (
              <> — <span className="text-slate-400 italic">{scanned.interpretation}</span></>
            )}
            <span className="text-emerald-400 ml-1">Filters applied ✓</span>
          </span>
        </div>
      )}
    </div>
  )
}
