"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { X } from "lucide-react"
import { getBrowserSupabase } from "@/lib/supabase-browser"
import { profileCompletion } from "@/lib/profile"
import type { UserProfile } from "@/lib/profile"

export default function ProfileCompletionBanner() {
  const supabase = useMemo(() => getBrowserSupabase(), [])
  const pathname = usePathname()
  const [pct, setPct] = useState<number | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    let mounted = true

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()

      if (mounted) {
        setPct(profileCompletion(data as Partial<UserProfile> | null))
      }
    }

    load().catch(() => {})
    return () => { mounted = false }
  }, [supabase, pathname])

  // Don't show on profile page, when dismissed, or when complete
  if (dismissed || pct === null || pct >= 100 || pathname === "/account/profile") return null

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 w-24 h-1.5 bg-amber-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-sm text-amber-800 truncate">
            <span className="font-medium">{pct}% profile complete</span>
            <span className="hidden sm:inline text-amber-700"> — finish your profile to get better grant matches</span>
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/account/profile"
            className="text-xs font-semibold text-amber-800 hover:text-amber-900 underline underline-offset-2"
          >
            Complete profile
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="text-amber-500 hover:text-amber-700 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
