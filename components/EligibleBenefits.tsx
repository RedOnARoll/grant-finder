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

type EligibleSort = "score_desc" | "name_asc" | "category_asc" | "amount_desc" | "amount_asc"

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

export default function EligibleBenefits({ hideSignedOutState = false }: { hideSignedOutState?: boolean }) {
  const supabase = useMemo(() => getBrowserSupabase(), [])
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Partial<UserProfile> | null>(null)
  const [matches, setMatches] = useState<EligibleBenefitMatch[]>([])
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<EligibleSort>("score_desc")
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
    if (hideSignedOutState) return null

    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <h2 className="mb-3 text-2xl font-bold text-zinc-900">Log in to see eligible benefits</h2>
        <p className="mb-6 text-zinc-500">Your matches are based on your GrantFinder profile.</p>
        <Link href="/auth?next=/account/eligible" className="inline-flex h-11 items-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white hover:bg-zinc-700">
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

  const visibleMatches = matches
    .filter(({ benefit, matchedReasons, possibleDisqualifiers }) => {
      const query = search.trim().toLowerCase()
      if (!query) return true

      return (
        benefit.name.toLowerCase().includes(query) ||
        benefit.agency.toLowerCase().includes(query) ||
        benefit.description.toLowerCase().includes(query) ||
        subcategoryLabel(benefit.subcategory).toLowerCase().includes(query) ||
        matchedReasons.join(" ").toLowerCase().includes(query) ||
        possibleDisqualifiers.join(" ").toLowerCase().includes(query)
      )
    })
    .sort((a, b) => {
      switch (sort) {
        case "name_asc":
          return a.benefit.name.localeCompare(b.benefit.name)
        case "category_asc":
          return subcategoryLabel(a.benefit.subcategory).localeCompare(subcategoryLabel(b.benefit.subcategory)) ||
            a.benefit.name.localeCompare(b.benefit.name)
        case "amount_desc":
          return (b.benefit.max_amount ?? -1) - (a.benefit.max_amount ?? -1)
        case "amount_asc":
          return (a.benefit.max_amount ?? Infinity) - (b.benefit.max_amount ?? Infinity)
        case "score_desc":
        default:
          return b.score - a.score || a.benefit.name.localeCompare(b.benefit.name)
      }
    })

  const likelyCount = matches.filter((match) => match.confidence === "likely").length
  const possibleCount = matches.length - likelyCount

  return (
    <div className="grid gap-6">
      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-sm font-medium text-zinc-500">Based on your profile</p>
            <h2 className="mt-1 text-2xl font-bold text-zinc-900">
              {likelyCount} likely match{likelyCount === 1 ? "" : "es"}
              {possibleCount > 0 ? `, ${possibleCount} may qualify` : ""}
            </h2>
          </div>
          <Link href="/account/profile" className="h-10 rounded-full border border-zinc-300 px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50">
            Update profile
          </Link>
        </div>
        {error && <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</p>}
      </section>

      {matches.length > 0 && (
        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search eligible benefits..."
              className="h-11 min-w-0 rounded-lg border border-zinc-300 px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
            />
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as EligibleSort)}
              className="h-11 min-w-0 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
            >
              <option value="score_desc">Match score</option>
              <option value="name_asc">Name: A-Z</option>
              <option value="category_asc">Category</option>
              <option value="amount_desc">Max $: High to low</option>
              <option value="amount_asc">Max $: Low to high</option>
            </select>
          </div>
        </section>
      )}

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
      ) : visibleMatches.length === 0 ? (
        <section className="rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <h3 className="mb-2 text-lg font-semibold text-zinc-900">No matches for that search</h3>
          <p className="text-sm text-zinc-500">Try searching by program name, agency, category, or match reason.</p>
        </section>
      ) : (
        <section className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          {visibleMatches.map(({ benefit, matchedReasons, possibleDisqualifiers, confidence, score }) => (
            <article key={benefit.id} className="p-6">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="mb-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                      {subcategoryLabel(benefit.subcategory)}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      confidence === "likely" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      {confidence === "likely" ? "Likely eligible" : "May qualify"}
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

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_2fr]">
                <div className="rounded-lg bg-zinc-50 p-3 text-sm">
                  <p className="font-semibold text-zinc-900">{formatAmount(benefit.max_amount)}</p>
                  <p className="text-zinc-500">Max benefit</p>
                </div>
                <div className="rounded-lg bg-zinc-50 p-3 text-sm">
                  <p className="font-semibold text-zinc-900">{benefit.deadline ? new Date(benefit.deadline).toLocaleDateString("en-US") : "Open enrollment"}</p>
                  <p className="text-zinc-500">Deadline</p>
                </div>
                <div className="rounded-lg bg-zinc-50 p-3 text-sm sm:col-span-2 lg:col-span-1">
                  <p className="mb-1 font-semibold text-zinc-900">Why this may match</p>
                  <p className="text-zinc-600">{matchedReasons.slice(0, 2).join(" · ")}</p>
                </div>
              </div>
              <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50/60 p-3 text-sm">
                <p className="mb-1 font-semibold text-amber-900">Check before applying</p>
                <ul className="grid gap-1 text-amber-800">
                  {possibleDisqualifiers.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-amber-700">Score {score} is used only to sort recommendations.</p>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  )
}
