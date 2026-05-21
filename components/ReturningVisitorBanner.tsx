"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, X } from "lucide-react"

export default function ReturningVisitorBanner() {
  const router = useRouter()
  const [activity, setActivity] = useState<{
    name: string; slug: string; type: string; intent: string
  } | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    try {
      const apps = JSON.parse(localStorage.getItem("gw_applications") ?? "[]") as Array<{
        slug: string; type: string; name: string; intent: string; status: string
      }>
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

  if (!activity || dismissed) return null

  const intentLabels: Record<string, string> = {
    today: "today", this_week: "this week", this_month: "this month", just_looking: "soon"
  }
  const href = `/${activity.type === "grant" ? "grants" : "benefits"}/${activity.slug}`

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
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => router.push(href)}
            className="h-8 px-3 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            Resume <ArrowRight className="w-3.5 h-3.5" />
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
