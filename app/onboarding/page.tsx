"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { LogoMark } from "@/components/illustrations/GeoShapes"
import { getBrowserSupabase } from "@/lib/supabase-browser"
import { sanitizeNextPath } from "@/lib/auth"

const SITUATION_OPTIONS = [
  { value: "Personal financial assistance", label: "Personal financial assistance" },
  { value: "Housing assistance", label: "Housing or rental assistance" },
  { value: "Education funding", label: "Education or student aid" },
  { value: "Business funding", label: "Small business funding" },
  { value: "Healthcare assistance", label: "Healthcare coverage" },
  { value: "Agricultural funding", label: "Farming or rural programs" },
  { value: "Research funding", label: "Research or academic grants" },
  { value: "Arts funding", label: "Arts or creative funding" },
] as const

const HOUSEHOLD_SIZES = ["1", "2", "3", "4", "5", "6+"] as const

function OnboardingForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => getBrowserSupabase(), [])

  const [zipCode, setZipCode] = useState("")
  const [householdSize, setHouseholdSize] = useState("")
  const [situation, setSituation] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const next = sanitizeNextPath(searchParams.get("next"), "/grants")

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace(`/auth?mode=signup&next=${encodeURIComponent(next)}`)
        return
      }
      setUserId(user.id)
    })
  }, [router, supabase, next])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return
    setSaving(true)
    setError(null)
    try {
      const payload: Record<string, unknown> = { user_id: userId }
      if (zipCode.trim()) payload.zip_code = zipCode.trim()
      if (householdSize) payload.household_size = householdSize
      if (situation) payload.funding_interests = [situation]

      const { error: upsertError } = await (supabase as any)
        .from("profiles")
        .upsert(payload, { onConflict: "user_id" })
      if (upsertError) throw upsertError
      router.replace(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
      setSaving(false)
    }
  }

  function handleSkip() {
    router.replace(next)
  }

  const canSubmit = Boolean(zipCode.trim() || householdSize || situation)

  return (
    <main className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark className="h-6 w-6" />
            <span className="text-sm font-semibold text-slate-900">GrantWay</span>
          </Link>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-slate-900">Let&apos;s personalize your matches</h1>
            <p className="mt-2 text-slate-500">
              Three quick questions to surface the most relevant grants and benefits for you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            {/* Zip code */}
            <div>
              <label htmlFor="zip_code" className="mb-1.5 block text-sm font-medium text-slate-700">
                What&apos;s your zip code?
              </label>
              <input
                id="zip_code"
                type="text"
                inputMode="numeric"
                maxLength={5}
                placeholder="e.g. 90210"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ""))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-slate-400">Used to find local programs and estimate income limits</p>
            </div>

            {/* Household size */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                How many people are in your household?
              </label>
              <div className="flex flex-wrap gap-2">
                {HOUSEHOLD_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setHouseholdSize(size === householdSize ? "" : size)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      householdSize === size
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary situation */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                What are you primarily looking for?
              </label>
              <div className="space-y-2">
                {SITUATION_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors ${
                      situation === opt.value
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="situation"
                      value={opt.value}
                      checked={situation === opt.value}
                      onChange={() => setSituation(opt.value)}
                      className="sr-only"
                    />
                    <span
                      className={`h-4 w-4 shrink-0 rounded-full border-2 ${
                        situation === opt.value ? "border-blue-600 bg-blue-600" : "border-slate-300"
                      }`}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-rose-600">{error}</p>}

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={saving || !canSubmit || !userId}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Find my matches"}
              </button>
              <button
                type="button"
                onClick={handleSkip}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Skip
              </button>
            </div>
          </form>

          <p className="mt-4 text-center text-xs text-slate-400">
            You can always update these in your{" "}
            <Link href="/account/profile" className="text-blue-600 hover:underline">
              profile settings
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingForm />
    </Suspense>
  )
}
