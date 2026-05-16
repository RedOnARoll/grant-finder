"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import type { User } from "@supabase/supabase-js"
import SaveInterestButton from "@/components/SaveInterestButton"
import { matchEligibleBenefits } from "@/lib/eligible-benefits"
import type { EligibleBenefitMatch } from "@/lib/eligible-benefits"
import { profileCompletion, type UserProfile } from "@/lib/profile"
import { getBrowserSupabase } from "@/lib/supabase-browser"
import type { Grant } from "@/lib/types"

function formatAmount(amount: number | null) {
  if (!amount) return "Varies"
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`
  return `$${amount}`
}

function subcategoryLabel(value: string | null) {
  const labels: Record<string, string> = {
    housing: "Housing",
    food: "Food",
    disability: "Disability",
    education: "Education",
    childcare: "Childcare",
    energy: "Energy",
    health: "Healthcare",
  }
  return value ? labels[value] ?? value : "Benefit"
}

export default function EligibleBenefits() {
  const supabase = useMemo(() => getBrowserSupabase(), [])
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Partial<UserProfile> | null>(null)
  const [matches, setMatches] = useState<EligibleBenefitMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      const [{ data: userData }, { data: benefitData, error: benefitsError }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("grants").select("*").eq("type", "benefit").order("name"),
      ])

      if (!mounted) return

      const userProfile = userData.user?.user_metadata?.grantfinder_profile as Partial<UserProfile> | undefined
      setUser(userData.user)
      setProfile(userProfile ?? null)

      if (benefitsError) {
        setError(benefitsError.message)
      } else if (userProfile) {
        setMatches(matchEligibleBenefits(userProfile, (benefitData ?? []) as Grant[]))
      }

      setLoading(false)
    }

    load()

    return () => {
      mounted = false
    }
  }, [supabase])

  if (loading) {
    return <div className="rounded-xl border border-zinc-200 bg-white p-6 text-zinc-500 shadow-sm">Checking eligibility...</div>
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <h2 className="mb-3 text-2xl font-bold text-zinc-900">Log in to see eligible benefits</h2>
        <p className="mb-6 text-zinc-500">Your matches are based on your GrantFinder profile.</p>
        <Link href="/auth?next=/account/dashboard" className="inline-flex h-11 items-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white hover:bg-zinc-700">
          Log in or sign up
        </Link>
      </div>
    )
  }

  if (!profile || profileCompletion(profile) === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <h2 className="mb-3 text-2xl font-bold text-zinc-900">Complete your profile first</h2>
        <p className="mb-6 text-zinc-500">Add income, household, location, and status details so GrantFinder can find likely matches.</p>
        <Link href="/account/profile" className="inline-flex h-11 items-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white hover:bg-zinc-700">
          Complete profile
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-sm font-medium text-zinc-500">Based on your profile</p>
            <h2 className="mt-1 text-2xl font-bold text-zinc-900">
              {matches.length} likely benefit match{matches.length === 1 ? "" : "es"}
            </h2>
          </div>
          <Link href="/account/profile" className="h-10 rounded-full border border-zinc-300 px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50">
            Update profile
          </Link>
        </div>
        {error && <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</p>}
      </section>

      {matches.length === 0 ? (
        <section className="rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <h3 className="mb-2 text-lg font-semibold text-zinc-900">No likely matches yet</h3>
          <p className="mx-auto mb-6 max-w-md text-sm text-zinc-500">
            Try adding more profile details or browse all benefits manually.
          </p>
          <Link href="/benefits" className="text-sm font-medium text-zinc-900 hover:underline">
            Browse benefits
          </Link>
        </section>
      ) : (
        <section className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          {matches.map(({ benefit, reasons, score }) => (
            <article key={benefit.id} className="p-6">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="mb-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                      {subcategoryLabel(benefit.subcategory)}
                    </span>
                    <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                      Match score {score}
                    </span>
                  </div>
                  <Link href={`/benefits/${benefit.slug}`} className="text-lg font-semibold text-zinc-900 hover:underline">
                    {benefit.name}
                  </Link>
                  <p className="mt-1 text-sm text-zinc-500">{benefit.agency}</p>
                </div>
                <SaveInterestButton slug={benefit.slug} type="benefit" />
              </div>

              <p className="mb-4 line-clamp-2 text-sm leading-6 text-zinc-600">{benefit.description}</p>

              <div className="grid gap-4 sm:grid-cols-[1fr_1fr_2fr]">
                <div className="rounded-lg bg-zinc-50 p-3 text-sm">
                  <p className="font-semibold text-zinc-900">{formatAmount(benefit.max_amount)}</p>
                  <p className="text-zinc-500">Max benefit</p>
                </div>
                <div className="rounded-lg bg-zinc-50 p-3 text-sm">
                  <p className="font-semibold text-zinc-900">{benefit.deadline ? new Date(benefit.deadline).toLocaleDateString("en-US") : "Open enrollment"}</p>
                  <p className="text-zinc-500">Deadline</p>
                </div>
                <div className="rounded-lg bg-zinc-50 p-3 text-sm">
                  <p className="mb-1 font-semibold text-zinc-900">Why it matched</p>
                  <p className="text-zinc-600">{reasons.slice(0, 2).join(" · ")}</p>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  )
}
