"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { getBrowserSupabase } from "@/lib/supabase-browser"
import { getProfile, migrateAccountMetadata } from "@/lib/account-db"
import { matchEligibleGrants, type EligibleGrantMatch } from "@/lib/eligible-grants"
import { profileCompletion } from "@/lib/profile"
import { Badge, StatusBadge } from "@/components/ui/Badge"
import SaveInterestButton from "@/components/SaveInterestButton"
import ProgramGrid from "@/components/ProgramGrid"
import { EmptyStateIllustration } from "@/components/illustrations/GeoShapes"
import type { Grant } from "@/lib/types"

function formatAmount(amount: number | null) {
  if (!amount) return "Varies"
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`
  return `$${amount}`
}

export default function EligibleGrantsFilter({ returnPath }: { returnPath: string }) {
  const supabase = useMemo(() => getBrowserSupabase(), [])
  const [status, setStatus] = useState<"loading" | "signed_out" | "no_profile" | "ready">("loading")
  const [matches, setMatches] = useState<EligibleGrantMatch[]>([])

  useEffect(() => {
    let mounted = true
    async function load() {
      const [{ data: { user } }, { data: grantData }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("grants").select("*").eq("type", "grant").order("name"),
      ])

      if (!mounted) return

      if (!user) { setStatus("signed_out"); return }

      try {
        await migrateAccountMetadata(supabase, user)
        const p = await getProfile(supabase, user.id)
        if (!p || profileCompletion(p) === 0) { setStatus("no_profile"); return }
        setMatches(matchEligibleGrants(p, (grantData ?? []) as Grant[]))
        setStatus("ready")
      } catch {
        setStatus("no_profile")
      }
    }
    load()
    return () => { mounted = false }
  }, [supabase])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-7 h-7 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (status === "signed_out") {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Sign in to see your matches</h2>
        <p className="text-sm text-slate-600 mb-6">
          We&apos;ll compare your profile against every grant to find the ones you actually qualify for.
        </p>
        <Link
          href={`/auth?next=${encodeURIComponent(returnPath)}`}
          className="inline-flex items-center h-10 px-6 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Sign in or create account
        </Link>
      </div>
    )
  }

  if (status === "no_profile") {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Complete your profile first</h2>
        <p className="text-sm text-slate-600 mb-6">
          Add your location, income, and background so GrantWay can find grants that fit you.
        </p>
        <Link
          href="/account/profile"
          className="inline-flex items-center h-10 px-6 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Complete profile
        </Link>
      </div>
    )
  }

  const likelyCount = matches.filter((m) => m.confidence === "likely").length

  return (
    <div className="space-y-5">
      {/* Match summary */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Based on your profile</p>
          <p className="text-base font-semibold text-slate-900">
            {likelyCount} likely {likelyCount === 1 ? "match" : "matches"}
            {matches.length - likelyCount > 0 && `, ${matches.length - likelyCount} may qualify`}
          </p>
        </div>
        <Link href="/account/profile" className="text-xs text-blue-600 hover:underline font-medium">
          Update profile →
        </Link>
      </div>

      {matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <EmptyStateIllustration className="w-24 h-20 mb-4" />
          <p className="text-base font-medium text-slate-900 mb-1">No matches found</p>
          <p className="text-sm text-slate-500 mb-4">
            Try completing more of your profile to improve matching.
          </p>
          <Link href="/account/profile" className="text-sm text-blue-600 hover:underline font-medium">
            Update profile →
          </Link>
        </div>
      ) : (
        <ProgramGrid itemLabel="grants">
          {matches.map(({ grant, confidence, matchedReasons, possibleDisqualifiers }) => (
            <article
              key={grant.id}
              className="relative flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow h-full"
            >
              <Link href={`/grants/${grant.slug}`} className="absolute inset-0 rounded-xl" aria-label={grant.name} />

              {/* Top row */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge deadline={grant.deadline} isRecurring={grant.is_recurring} />
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                    confidence === "likely"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}>
                    {confidence === "likely" ? "Likely eligible" : "May qualify"}
                  </span>
                </div>
                <div className="relative z-10">
                  <SaveInterestButton slug={grant.slug} type="grant" />
                </div>
              </div>

              <p className="text-xs text-slate-400 uppercase tracking-wide mt-1">{grant.agency}</p>
              <h3 className="text-base font-semibold text-slate-900 line-clamp-2 mt-1">{grant.name}</h3>
              <p className="text-sm text-slate-600 line-clamp-2 mt-2 flex-1">{grant.description}</p>

              {/* Match reasons */}
              {matchedReasons.length > 0 && (
                <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2 text-xs text-emerald-800">
                  <span className="font-medium">Why this matches: </span>
                  {matchedReasons.slice(0, 2).join(" · ")}
                </div>
              )}
              {possibleDisqualifiers.length > 0 && (
                <div className="mt-2 text-xs text-slate-500">
                  Check: {possibleDisqualifiers.slice(0, 1).join(" ")}
                </div>
              )}

              {/* Bottom */}
              <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">
                    Up to {formatAmount(grant.max_amount)}
                  </span>
                  <Badge variant="amber" className="capitalize">
                    {grant.category.replace("_", " ")}
                  </Badge>
                </div>
                <span className="text-blue-600 text-sm font-medium relative z-10 pointer-events-none">
                  View Details →
                </span>
              </div>
            </article>
          ))}
        </ProgramGrid>
      )}
    </div>
  )
}
