"use client"

import { useState } from "react"
import { Link2, Loader2, CheckCircle2 } from "lucide-react"

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
  const [scannedDomain, setScannedDomain] = useState("")

  async function handleScan() {
    const trimmed = url.trim()
    if (!trimmed) return
    setLoading(true)
    setError("")
    setScannedDomain("")
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
      setScannedDomain(data.domain ?? "")
      onScan({
        interpretation: data.interpretation ?? "",
        categories: data.categories ?? [],
        keywords: data.keywords ?? [],
      })
    } catch {
      setError("Could not reach the server — try again")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-3">
      <p className="text-xs text-slate-400 mb-1.5">
        Or paste your website URL to auto-fill
      </p>
      <div className="flex gap-2 items-center">
        <div className="flex-1 flex items-center gap-2 bg-white/10 border border-white/15 rounded-lg px-3 h-9 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
          <Link2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            value={url}
            onChange={e => { setUrl(e.target.value); setError(""); setScannedDomain("") }}
            onKeyDown={e => e.key === "Enter" && !loading && handleScan()}
            placeholder="https://yourwebsite.com"
            type="url"
            className="flex-1 text-sm text-white placeholder-slate-400 outline-none bg-transparent"
          />
          {scannedDomain && (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          )}
        </div>
        <button
          onClick={handleScan}
          disabled={!url.trim() || loading}
          className="h-9 px-4 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          {loading ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Scanning…</>
          ) : "Scan"}
        </button>
      </div>
      {error && <p className="text-xs text-rose-400 mt-1.5">{error}</p>}
      {scannedDomain && !error && (
        <p className="text-xs text-emerald-400 mt-1.5">
          Scanned <span className="font-medium">{scannedDomain}</span> — description and categories updated
        </p>
      )}
    </div>
  )
}
