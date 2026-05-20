"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { CreditCard, Check, ArrowRight, Sparkles, AlertCircle } from "lucide-react"
import SiteNav from "@/components/SiteNav"
import { getBrowserSupabase } from "@/lib/supabase-browser"

type ProfileData = {
  is_premium?: boolean
  is_admin?: boolean
  subscription_tier?: string
  subscription_status?: string
  one_time_credits?: number
  stripe_subscription_id?: string
  cancel_at_period_end?: boolean
  current_period_end?: string
} | null

const TIER_LABELS: Record<string, string> = {
  free: "Free",
  grant_helper: "Grant Helper",
  premium: "Premium",
}

export default function BillingPage() {
  const supabase = useMemo(() => getBrowserSupabase(), [])
  const [profile, setProfile] = useState<ProfileData>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { if (mounted) setLoading(false); return }

      const { data } = await supabase
        .from("profiles")
        .select("is_premium, is_admin, subscription_tier, subscription_status, one_time_credits, stripe_subscription_id, cancel_at_period_end, current_period_end")
        .eq("user_id", user.id)
        .maybeSingle()

      if (mounted) {
        setProfile(data as ProfileData)
        setLoading(false)
      }
    }

    load().catch(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [supabase])

  async function callApi(endpoint: string) {
    setActionLoading(true)
    setError(null)
    setMessage(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token ?? ""
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json() as { ok?: boolean; error?: string; endsAt?: number }
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Something went wrong.")
      return json
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
      return null
    } finally {
      setActionLoading(false)
    }
  }

  async function handleCancel() {
    if (!confirm("Cancel your subscription? You'll keep access until the end of your billing period.")) return
    const result = await callApi("/api/stripe/cancel")
    if (result) {
      const endsAt = result.endsAt ? new Date(result.endsAt * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : null
      setProfile((p) => p ? { ...p, cancel_at_period_end: true, current_period_end: result.endsAt ? new Date(result.endsAt * 1000).toISOString() : p?.current_period_end } : p)
      setMessage(endsAt ? `Your subscription will end on ${endsAt}. You keep full access until then.` : "Cancellation scheduled.")
    }
  }

  async function handleResume() {
    const result = await callApi("/api/stripe/resume")
    if (result) {
      setProfile((p) => p ? { ...p, cancel_at_period_end: false, current_period_end: undefined } : p)
      setMessage("Your subscription has been resumed.")
    }
  }

  const tier = (profile?.subscription_tier as string | undefined) ?? "free"
  const isPremium = Boolean(profile?.is_premium)
  const isAdmin = Boolean(profile?.is_admin)
  const credits = Number(profile?.one_time_credits ?? 0)
  const hasSubscription = Boolean(profile?.stripe_subscription_id)
  const cancelAtPeriodEnd = Boolean(profile?.cancel_at_period_end)
  const periodEnd = profile?.current_period_end
    ? new Date(profile.current_period_end).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <SiteNav active="account" />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteNav active="account" />

      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className="mb-8 flex items-center gap-3">
          <Link href="/account" className="text-sm text-slate-500 hover:text-slate-700">Account</Link>
          <span className="text-slate-300">/</span>
          <span className="text-sm text-slate-900 font-medium">Manage Subscription</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-8">Manage Subscription</h1>

        {message && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 mb-6 text-sm text-emerald-800">
            {message}
          </div>
        )}

        {/* Current plan */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2">Current Plan</p>
              <p className="text-xl font-bold text-slate-900">
                {isAdmin ? "Admin" : (TIER_LABELS[tier] ?? "Free")}
              </p>

              {tier === "grant_helper" && (
                <p className="text-sm text-slate-500 mt-1">{credits} AI generation{credits !== 1 ? "s" : ""} remaining</p>
              )}
              {isPremium && !isAdmin && !cancelAtPeriodEnd && (
                <p className="text-sm text-slate-500 mt-1">Unlimited AI narrative generations · Active</p>
              )}
              {cancelAtPeriodEnd && periodEnd && (
                <div className="flex items-center gap-1.5 mt-2 text-sm text-amber-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Cancels on {periodEnd} — you keep full access until then
                </div>
              )}
              {tier === "free" && !isAdmin && (
                <p className="text-sm text-slate-500 mt-1">No active subscription</p>
              )}
            </div>
            <CreditCard className="w-6 h-6 text-slate-300 shrink-0 mt-1" />
          </div>

          {/* Actions for active subscribers */}
          {hasSubscription && !isAdmin && (
            <div className="mt-5 pt-5 border-t border-slate-100 space-y-3">
              {error && (
                <p className="text-xs text-rose-600">{error}</p>
              )}

              {!cancelAtPeriodEnd ? (
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 h-9 rounded-lg bg-blue-600 text-white px-4 text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Upgrade plan <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={handleCancel}
                    disabled={actionLoading}
                    className="inline-flex items-center h-9 rounded-lg border border-slate-200 text-slate-600 px-4 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {actionLoading ? <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> : "Cancel subscription"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleResume}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 h-9 rounded-lg bg-slate-900 text-white px-4 text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {actionLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Resume subscription <ArrowRight className="w-3.5 h-3.5" /></>}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Upgrade prompt for free/helper users without an active subscription */}
        {!isPremium && !isAdmin && !hasSubscription && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h2 className="font-semibold text-slate-900 mb-1">Unlock Premium Features</h2>
                <p className="text-sm text-slate-600 mb-4">
                  Get unlimited AI-generated grant narratives, document checklists, and deadline alerts.
                </p>
                <ul className="space-y-1.5 mb-5">
                  {["Unlimited AI narrative generations", "Full document checklist", "PDF & Word export", "Deadline alerts"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                      <Check className="w-4 h-4 text-blue-600 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 h-9 rounded-lg bg-blue-600 text-white px-4 text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  View plans <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
