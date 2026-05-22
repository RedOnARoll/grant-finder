"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Bookmark, X } from "lucide-react"

const DISMISS_KEY = "gw_save_banner_dismissed"

function readActivityCount() {
  try {
    const applications = JSON.parse(localStorage.getItem("gw_applications") ?? "[]")
    return Array.isArray(applications) ? applications.length : 0
  } catch {
    return 0
  }
}

export default function SaveProgressBanner({ threshold = 2 }: { threshold?: number }) {
  const [activityCount, setActivityCount] = useState(0)
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISS_KEY) === "1")
    setActivityCount(readActivityCount())

    const handleFocus = () => setActivityCount(readActivityCount())
    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [])

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1")
    setDismissed(true)
  }

  if (dismissed || activityCount < threshold) return null

  return (
    <aside className="fixed bottom-5 right-5 z-[80] w-[340px] max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
          <Bookmark className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-900">Don&apos;t lose your progress</h2>
            <button
              type="button"
              onClick={dismiss}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Dismiss progress reminder"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            You&apos;ve started on {activityCount} program{activityCount === 1 ? "" : "s"} on this device.
            Save to a free account so you can pick up anywhere.
          </p>
          <div className="mt-3 flex gap-2">
            <Link
              href="/auth"
              className="inline-flex h-8 items-center rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Create free account
            </Link>
            <button
              type="button"
              onClick={dismiss}
              className="inline-flex h-8 items-center rounded-lg px-3 text-xs font-medium text-slate-500 hover:bg-slate-50"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
