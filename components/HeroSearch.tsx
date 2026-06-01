"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, MapPin, Globe, ArrowRight, Loader2 } from "lucide-react"

const EXAMPLES = [
  "Single parent needing childcare help",
  "Veteran starting a small business",
  "Help paying rent or utilities",
]

type Tab = "ai" | "zip" | "website"

const TABS: { id: Tab; label: string }[] = [
  { id: "ai",      label: "AI Match" },
  { id: "zip",     label: "By ZIP"   },
  { id: "website", label: "Website"  },
]

function TabIcon({ id }: { id: Tab }) {
  if (id === "ai")      return <Sparkles className="w-3.5 h-3.5" />
  if (id === "zip")     return <MapPin    className="w-3.5 h-3.5" />
  return                       <Globe     className="w-3.5 h-3.5" />
}

export default function HeroSearch() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("ai")

  // ── AI search ────────────────────────────────────────────────────────
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [situation, setSituation] = useState("")
  const [aiLoading, setAiLoading] = useState(false)

  async function doAiSearch(q: string) {
    if (!q || aiLoading) return
    setAiLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=programs`)
      if (!res.ok) throw new Error("search failed")
      const { keywords, categories, interpretation } = await res.json() as {
        keywords: string[]
        categories: string[]
        interpretation: string
      }
      const params = new URLSearchParams()
      params.set("q", q)
      if (keywords.length > 0) params.set("smart_q", keywords.join("|"))
      if (categories.length > 0) params.set("topic", categories.join(","))
      if (interpretation) params.set("hint", interpretation)
      router.push(`/ai-results?${params.toString()}`)
    } catch {
      router.push(`/ai-results?q=${encodeURIComponent(q)}`)
    } finally {
      setAiLoading(false)
    }
  }

  function handleAiSubmit(e: React.FormEvent) {
    e.preventDefault()
    doAiSearch(situation.trim())
  }

  // ── ZIP search ───────────────────────────────────────────────────────
  const zipRef = useRef<HTMLInputElement>(null)
  const [zip, setZip] = useState("")
  const [zipLoading, setZipLoading] = useState(false)
  const [zipError, setZipError] = useState("")

  async function handleZipSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = zip.trim()
    if (!/^\d{5}$/.test(trimmed)) {
      setZipError("Please enter a valid 5-digit ZIP code")
      zipRef.current?.focus()
      return
    }
    setZipLoading(true)
    setZipError("")
    try {
      const res = await fetch(`https://api.zippopotam.us/us/${trimmed}`)
      if (!res.ok) { setZipError("ZIP code not found — please try another"); return }
      const data = await res.json()
      const place = data.places?.[0]
      if (!place) { setZipError("ZIP code not found — please try another"); return }
      const stateCode = (place["state abbreviation"] as string).toUpperCase()
      router.push(`/programs?zip=${trimmed}&state=${stateCode}`)
    } catch {
      setZipError("Couldn't look up ZIP — check your connection")
    } finally {
      setZipLoading(false)
    }
  }

  // ── Website scrape ───────────────────────────────────────────────────
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [websiteLoading, setWebsiteLoading] = useState(false)
  const [websiteError, setWebsiteError] = useState("")

  async function handleWebsiteSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = websiteUrl.trim()
    if (!trimmed) return
    setWebsiteLoading(true)
    setWebsiteError("")
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
        setWebsiteError(data.error ?? "Could not reach that website — check the URL and try again")
        return
      }
      const { keywords = [], categories = [], interpretation = "", domain = trimmed } = data
      const params = new URLSearchParams()
      params.set("q", `Website: ${domain}`)
      if (keywords.length > 0) params.set("smart_q", keywords.join("|"))
      if (categories.length > 0) params.set("topic", categories.join(","))
      if (interpretation) params.set("hint", interpretation)
      router.push(`/ai-results?${params.toString()}`)
    } catch {
      setWebsiteError("Something went wrong — check your connection and try again")
    } finally {
      setWebsiteLoading(false)
    }
  }

  // ────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-xl">

      {/* ── Tab switcher ──────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/10 w-fit mb-4">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              tab === id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <TabIcon id={id} /> {label}
          </button>
        ))}
      </div>

      {/* ── AI Match tab ──────────────────────────────────────────── */}
      {tab === "ai" && (
        <form onSubmit={handleAiSubmit}>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <textarea
              ref={textareaRef}
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  doAiSearch(situation.trim())
                }
              }}
              placeholder="Tell us about your situation — e.g. &quot;I&apos;m a veteran starting a small farm in Texas and need help with funding…&quot;"
              rows={3}
              className="w-full px-4 pt-4 pb-3 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed"
            />
            <div className="px-4 pb-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
              {/* Example chips */}
              <div className="flex flex-wrap gap-1.5 min-w-0">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => { setSituation(ex); textareaRef.current?.focus() }}
                    className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors whitespace-nowrap"
                  >
                    {ex}
                  </button>
                ))}
              </div>
              {/* Submit */}
              <button
                type="submit"
                disabled={aiLoading || !situation.trim()}
                className="shrink-0 h-9 px-4 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-40 flex items-center gap-2"
              >
                {aiLoading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <><Sparkles className="w-4 h-4" /><span className="hidden sm:inline">Find Programs</span><ArrowRight className="w-4 h-4 sm:hidden" /></>
                }
              </button>
            </div>
          </div>
          {aiLoading && (
            <p className="mt-2 text-sm text-slate-400 pl-1 flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Analyzing your situation…
            </p>
          )}
        </form>
      )}

      {/* ── By ZIP tab ────────────────────────────────────────────── */}
      {tab === "zip" && (
        <form onSubmit={handleZipSubmit}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                ref={zipRef}
                type="text"
                inputMode="numeric"
                maxLength={5}
                value={zip}
                onChange={(e) => { setZip(e.target.value.replace(/\D/g, "")); setZipError("") }}
                placeholder="Enter your ZIP code"
                className={`w-full h-14 pl-12 pr-4 rounded-xl border-2 text-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 transition-all bg-white ${
                  zipError
                    ? "border-rose-400 focus:border-rose-500"
                    : "border-transparent focus:border-blue-400"
                }`}
              />
            </div>
            <button
              type="submit"
              disabled={zipLoading || zip.length !== 5}
              className="h-14 px-6 rounded-xl bg-blue-500 text-white font-semibold text-base hover:bg-blue-400 active:bg-blue-600 transition-colors disabled:opacity-40 flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
            >
              {zipLoading
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <><span>Browse Programs</span><ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </div>
          {zipError && (
            <p className="mt-2 text-sm text-rose-300 pl-1">{zipError}</p>
          )}
        </form>
      )}

      {/* ── Website tab ───────────────────────────────────────────── */}
      {tab === "website" && (
        <form onSubmit={handleWebsiteSubmit}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={websiteUrl}
                onChange={(e) => { setWebsiteUrl(e.target.value); setWebsiteError("") }}
                placeholder="www.example.com"
                autoComplete="url"
                className={`w-full h-14 pl-12 pr-4 rounded-xl border-2 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 transition-all bg-white ${
                  websiteError
                    ? "border-rose-400 focus:border-rose-500"
                    : "border-transparent focus:border-blue-400"
                }`}
              />
            </div>
            <button
              type="submit"
              disabled={websiteLoading || !websiteUrl.trim()}
              className="h-14 px-6 rounded-xl bg-blue-500 text-white font-semibold text-base hover:bg-blue-400 active:bg-blue-600 transition-colors disabled:opacity-40 flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
            >
              {websiteLoading
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <><span>Find Grants</span><ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </div>
          {websiteError && (
            <p className="mt-2 text-sm text-rose-300 pl-1">{websiteError}</p>
          )}
          {websiteLoading && (
            <p className="mt-2 text-sm text-slate-400 pl-1 flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Scanning {websiteUrl.trim()}…
            </p>
          )}
        </form>
      )}
    </div>
  )
}
