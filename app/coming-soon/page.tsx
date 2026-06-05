"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ComingSoonPage() {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
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
        setError("Incorrect password.")
      }
    } catch {
      setError("Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4 relative">

      {/* Main content */}
      <div className="text-center max-w-lg">
        <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-4">
          GrantWay
        </p>
        <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
          Coming Soon
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed">
          We&apos;re putting the finishing touches on something great. Check back soon — we can&apos;t wait to show you what we&apos;ve built.
        </p>
      </div>

      {/* Developer button — bottom corner */}
      <button
        onClick={() => { setModalOpen(true); setError(""); setPassword("") }}
        className="absolute bottom-6 right-6 text-xs text-slate-600 hover:text-slate-400 transition-colors"
      >
        Developer
      </button>

      {/* Password modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false) }}
        >
          <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
            <h2 className="text-white font-semibold text-lg mb-1">Developer Access</h2>
            <p className="text-slate-400 text-sm mb-6">Enter the developer password to access the app.</p>
            <form onSubmit={handleUnlock} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoFocus
                className="w-full bg-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 text-slate-400 hover:text-white text-sm py-2.5 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !password}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
                >
                  {loading ? "Unlocking…" : "Unlock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
