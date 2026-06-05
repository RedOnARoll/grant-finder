"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Link2, Loader2, Sparkles } from "lucide-react"

export default function ComingSoonPage() {
  const router = useRouter()

  // GrantMatch flow
  const [url, setUrl] = useState("")
  const [urlError, setUrlError] = useState("")
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Developer access
  const [devModalOpen, setDevModalOpen] = useState(false)
  const [password, setPassword] = useState("")
  const [devError, setDevError] = useState("")
  const [devLoading, setDevLoading] = useState(false)

  function handleFindGrants() {
    const trimmed = url.trim()
    if (!trimmed) { setUrlError("Please enter your website URL"); return }
    try {
      const withProtocol = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`
      new URL(withProtocol)
      setUrlError("")
      setEmailError("")
      setEmail("")
      setShowEmailModal(true)
    } catch {
      setUrlError("Please enter a valid URL (e.g. yourwebsite.com)")
    }
  }

  async function handleSubmitEmail(e: React.FormEvent) {
    e.preventDefault()
    const trimmedEmail = email.trim()
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError("Please enter a valid email address")
      return
    }
    setSubmitting(true)
    setEmailError("")
    try {
      const res = await fetch("/api/grantmatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), email: trimmedEmail }),
      })
      const data = await res.json() as {
        error?: string; keywords?: string[]; categories?: string[]; interpretation?: string
      }
      if (!res.ok) {
        setEmailError(data.error ?? "Something went wrong — try again")
        return
      }
      const params = new URLSearchParams({ q: data.interpretation ?? "" })
      if (data.keywords?.length) params.set("smart_q", data.keywords.join("|"))
      if (data.categories?.length) params.set("topic", data.categories.join(","))
      router.push(`/grantmatch/results?${params.toString()}`)
    } catch {
      setEmailError("Could not connect — try again")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDevUnlock(e: React.FormEvent) {
    e.preventDefault()
    setDevLoading(true)
    setDevError("")
    try {
      const res = await fetch("/api/dev-unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        router.push("/")
        router.refresh()
      } else {
        setDevError("Incorrect password.")
      }
    } catch {
      setDevError("Something went wrong. Try again.")
    } finally {
      setDevLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4 relative">

      <div className="w-full max-w-xl">
        {/* Branding + Coming Soon */}
        <div className="text-center mb-10">
          <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-4">GrantWay</p>
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4 leading-tight">Coming Soon</h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            We&apos;re putting the finishing touches on something great.
          </p>
        </div>

        {/* GrantMatch section */}
        <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-950/60 to-slate-900/80 p-6">
          <div className="flex items-start gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/40">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-base font-bold text-white">GrantMatch</h2>
                <span className="text-[10px] font-bold uppercase tracking-wide bg-amber-500 text-slate-900 px-1.5 py-0.5 rounded">
                  Beta
                </span>
              </div>
              <p className="text-sm text-slate-400">
                Paste your website — we&apos;ll find the grants you qualify for, free.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className={`flex-1 flex items-center gap-2.5 rounded-xl px-4 h-12 border transition-all ${
              urlError
                ? "bg-rose-950/40 border-rose-500/50"
                : "bg-white/10 border-white/20 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20"
            }`}>
              <Link2 className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                value={url}
                onChange={e => { setUrl(e.target.value); setUrlError("") }}
                onKeyDown={e => e.key === "Enter" && handleFindGrants()}
                placeholder="https://yourwebsite.com"
                type="url"
                className="flex-1 text-sm text-white placeholder-slate-500 outline-none bg-transparent min-w-0"
              />
            </div>
            <button
              onClick={handleFindGrants}
              disabled={!url.trim()}
              className="h-12 px-6 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors inline-flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-blue-900/30 whitespace-nowrap"
            >
              Find My Grants
            </button>
          </div>

          {urlError && (
            <p className="text-xs text-rose-400 mt-2.5 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-rose-400 inline-block" />
              {urlError}
            </p>
          )}
        </div>
      </div>

      {/* Developer button */}
      <button
        onClick={() => { setDevModalOpen(true); setDevError(""); setPassword("") }}
        className="absolute bottom-6 right-6 text-xs text-slate-600 hover:text-slate-400 transition-colors"
      >
        Developer
      </button>

      {/* Email modal */}
      {showEmailModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
          onClick={e => { if (e.target === e.currentTarget) setShowEmailModal(false) }}
        >
          <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-white font-bold text-lg mb-1">Where should we send your results?</h2>
            <p className="text-slate-400 text-sm mb-6">
              Enter your email to see your top grant matches. We&apos;ll also notify you when GrantWay launches.
            </p>
            <form onSubmit={handleSubmitEmail} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setEmailError("") }}
                placeholder="you@yourcompany.com"
                autoFocus
                className="w-full bg-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              {emailError && <p className="text-red-400 text-sm">{emailError}</p>}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="flex-1 text-slate-400 hover:text-white text-sm py-2.5 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !email.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold py-2.5 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
                >
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Scanning…</> : "See My Matches"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Developer password modal */}
      {devModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
          onClick={e => { if (e.target === e.currentTarget) setDevModalOpen(false) }}
        >
          <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
            <h2 className="text-white font-semibold text-lg mb-1">Developer Access</h2>
            <p className="text-slate-400 text-sm mb-6">Enter the developer password to access the app.</p>
            <form onSubmit={handleDevUnlock} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                autoFocus
                className="w-full bg-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              {devError && <p className="text-red-400 text-sm">{devError}</p>}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setDevModalOpen(false)}
                  className="flex-1 text-slate-400 hover:text-white text-sm py-2.5 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={devLoading || !password}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
                >
                  {devLoading ? "Unlocking…" : "Unlock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
