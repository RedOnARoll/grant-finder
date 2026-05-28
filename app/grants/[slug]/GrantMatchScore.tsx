"use client"

import { useEffect, useMemo, useState } from "react"
import { Sparkles } from "lucide-react"
import { getBrowserSupabase } from "@/lib/supabase-browser"
import { getProfile } from "@/lib/account-db"
import { matchEligibleGrants } from "@/lib/eligible-grants"
import type { Grant } from "@/lib/types"

type ScoreState =
  | { kind: "loading" }
  | { kind: "no_auth" }
  | { kind: "no_profile" }
  | { kind: "strong"; note: string }
  | { kind: "possible"; note: string }
  | { kind: "low" }

export default function GrantMatchScore({ grant }: { grant: Grant }) {
  const supabase = useMemo(() => getBrowserSupabase(), [])
  const [state, setState] = useState<ScoreState>({ kind: "loading" })

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        setState({ kind: "no_auth" })
        return
      }
      try {
        const profile = await getProfile(supabase, user.id)
        if (!profile) {
          setState({ kind: "no_profile" })
          return
        }

        const hasData = Object.entries(profile).some(([, v]) =>
          Array.isArray(v) ? v.length > 0 : Boolean(v)
        )
        if (!hasData) {
          setState({ kind: "no_profile" })
          return
        }

        const matches = matchEligibleGrants(profile, [grant])
        if (matches.length === 0) {
          setState({ kind: "low" })
        } else {
          const m = matches[0]
          const note = m.matchedReasons[0] ?? ""
          if (m.confidence === "likely") {
            setState({ kind: "strong", note })
          } else {
            setState({ kind: "possible", note })
          }
        }
      } catch {
        setState({ kind: "no_profile" })
      }
    })
  }, [grant, supabase])

  let label: string
  let labelClass: string
  let note: string | undefined

  switch (state.kind) {
    case "loading":
      label = "Checking…"
      labelClass = "text-slate-500"
      break
    case "no_auth":
      label = "Sign in"
      labelClass = "text-slate-400"
      note = "to see your match score"
      break
    case "no_profile":
      label = "Profile needed"
      labelClass = "text-slate-400"
      note = "Complete profile for score"
      break
    case "strong":
      label = "Strong match"
      labelClass = "text-emerald-400"
      note = state.note || undefined
      break
    case "possible":
      label = "Possible match"
      labelClass = "text-amber-400"
      note = state.note || undefined
      break
    case "low":
      label = "Low match"
      labelClass = "text-rose-400"
      note = "May not meet all criteria"
      break
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="mb-3 flex items-center gap-2 text-slate-400">
        <Sparkles className="h-4 w-4" />
        <p className="text-xs font-medium uppercase tracking-wide">Match score</p>
      </div>
      <p className={`text-xl font-bold tabular-nums ${labelClass}`}>{label}</p>
      {note && <p className="mt-1 text-xs text-slate-500">{note}</p>}
    </div>
  )
}
