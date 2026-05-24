"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { ArrowRight, X, CheckCircle } from "lucide-react"
import { getBrowserSupabase } from "@/lib/supabase-browser"
import { getSavedPrograms, saveProgram, updateProgramStatus } from "@/lib/account-db"

type AppEntry = { slug: string; type: string; name: string; intent: string; status: string }

function updateLocalStatus(slug: string, type: string, status: string) {
  try {
    const key = "gw_applications"
    const apps = JSON.parse(localStorage.getItem(key) ?? "[]") as AppEntry[]
    const updated = apps.map(a =>
      a.slug === slug && a.type === type ? { ...a, status } : a
    )
    localStorage.setItem(key, JSON.stringify(updated))
  } catch {}
}

async function syncAppliedToProfile(slug: string, type: "grant" | "benefit") {
  try {
    const supabase = getBrowserSupabase()
    const { data } = await supabase.auth.getUser()
    if (!data.user) return
    const saved = await getSavedPrograms(supabase, data.user.id)
    const existing = saved.find(p => p.slug === slug && p.type === type)
    if (existing) {
      await updateProgramStatus(supabase, data.user.id, slug, type, "applied")
    } else {
      await saveProgram(supabase, data.user.id, slug, type, "applied")
    }
  } catch {
    // Silently fail — localStorage is already updated
  }
}

export default function ReturningVisitorBanner() {
  const router = useRouter()
  const pathname = usePathname()
  const [activity, setActivity] = useState<{
    name: string; slug: string; type: string; intent: string
  } | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [feedback, setFeedback] = useState<"applied" | "dropped" | null>(null)

  useEffect(() => {
    try {
      const apps = JSON.parse(localStorage.getItem("gw_applications") ?? "[]") as AppEntry[]
      const wasDismissed = localStorage.getItem("gw_banner_dismissed") === "1"
      if (wasDismissed) return
      const inProgress = apps.find(a => a.status === "applying")
      if (inProgress) setActivity(inProgress)
    } catch {}
  }, [])

  const dismiss = () => {
    try { localStorage.setItem("gw_banner_dismissed", "1") } catch {}
    setDismissed(true)
  }

  const markApplied = () => {
    if (!activity) return
    const type = activity.type as "grant" | "benefit"
    updateLocalStatus(activity.slug, type, "applied")
    syncAppliedToProfile(activity.slug, type) // fire-and-forget
    setFeedback("applied")
    setTimeout(() => setDismissed(true), 1800)
  }

  const markDropped = () => {
    if (!activity) return
    updateLocalStatus(activity.slug, activity.type, "dropped")
    setFeedback("dropped")
    setTimeout(() => setDismissed(true), 1400)
  }

  const href = activity
    ? `/${activity.type === "grant" ? "grants" : "benefits"}/${activity.slug}`
    : null

  // Hide banner when already on the program's page
  if (!activity || dismissed || pathname === href) return null

  const intentLabels: Record<string, string> = {
    today: "today", this_week: "this week", this_month: "this month", just_looking: "soon"
  }

  // Brief confirmation state before hiding
  if (feedback) {
    return (
      <div className="bg-slate-900 border-b border-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="text-sm text-slate-300">
            {feedback === "applied"
              ? "Great work! We've marked that as applied."
              : "Got it — removed from your list."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 12a9 9 0 1 0 9-9"/><path d="M3 4v5h5"/>
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              Welcome back. Still applying to {activity.name}?
            </p>
            <p className="text-xs text-slate-400">
              You said you&apos;d apply {intentLabels[activity.intent] ?? "soon"}. Pick up where you left off.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => router.push(href!)}
            className="h-8 px-3 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            Resume <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={markApplied}
            className="h-8 px-3 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap"
          >
            I applied ✓
          </button>
          <button
            onClick={markDropped}
            className="h-8 px-3 border border-slate-700 text-slate-300 text-xs font-medium rounded-lg hover:border-slate-500 hover:text-white transition-colors whitespace-nowrap"
          >
            Not applying
          </button>
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="w-8 h-8 border border-slate-700 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
