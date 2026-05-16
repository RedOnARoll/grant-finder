"use client"

import { useEffect, useMemo, useState } from "react"
import { readDashboard } from "@/lib/dashboard"
import type { AccountDashboard } from "@/lib/dashboard"
import { getBrowserSupabase } from "@/lib/supabase-browser"

type SaveInterestButtonProps = {
  slug: string
  type: "grant" | "benefit"
  label?: "icon" | "full"
}

export default function SaveInterestButton({ slug, type, label = "full" }: SaveInterestButtonProps) {
  const supabase = useMemo(() => getBrowserSupabase(), [])
  const [saved, setSaved] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    let mounted = true

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return
      const dashboard = readDashboard(data.user?.user_metadata?.grantfinder_dashboard)
      setSaved(dashboard.saved_programs.some((item) => item.slug === slug && item.type === type))
      setLoaded(true)
    })

    return () => {
      mounted = false
    }
  }, [slug, supabase, type])

  async function toggleSaved() {
    setPending(true)
    const previousSaved = saved

    const { data } = await supabase.auth.getUser()
    const user = data.user

    if (!user) {
      const next = `${window.location.pathname}${window.location.search}`
      window.location.href = `/auth?next=${encodeURIComponent(next)}`
      return
    }

    const dashboard = readDashboard(user.user_metadata?.grantfinder_dashboard)
    const alreadySaved = dashboard.saved_programs.some((item) => item.slug === slug && item.type === type)
    setSaved(!alreadySaved)

    const nextDashboard: AccountDashboard = alreadySaved
      ? {
          saved_programs: dashboard.saved_programs.filter((item) => !(item.slug === slug && item.type === type)),
        }
      : {
          saved_programs: [
            ...dashboard.saved_programs,
            {
              slug,
              type,
              status: "interested",
              saved_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        }

    const { error } = await supabase.auth.updateUser({
      data: { grantfinder_dashboard: nextDashboard },
    })

    if (error) {
      setSaved(previousSaved)
    }

    setPending(false)
  }

  const text = saved ? "Saved" : "Interested"
  const symbol = saved ? "★" : "☆"
  const title = saved ? "Remove from dashboard" : "Save as interested"

  return (
    <button
      type="button"
      onClick={toggleSaved}
      disabled={!loaded || pending}
      title={title}
      aria-pressed={saved}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        saved
          ? "border-yellow-300 bg-yellow-50 text-zinc-900 hover:bg-yellow-100"
          : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500 hover:text-zinc-900"
      } ${label === "icon" ? "w-10 px-0" : ""}`}
    >
      <span className={`text-base leading-none ${saved ? "text-yellow-500" : "text-zinc-400"}`}>
        {symbol}
      </span>
      {label === "full" && <span>{text}</span>}
    </button>
  )
}
