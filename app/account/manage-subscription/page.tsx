"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { CreditCard, Check, ArrowRight, Sparkles, AlertCircle } from "lucide-react"
import SiteNav from "@/components/SiteNav"
import { getBrowserSupabase } from "@/lib/supabase-browser"

type SubInfo = {
  tier: string
  isPremium: boolean
  isAdmin: boolean
  credits: number
  hasSubscription: boolean
  cancelAtPeriodEnd: boolean
  periodEnd: string | null
  subscriptionId: string | null
  status: string | null
}

const TIER_LABELS: Record<string, string> = {
  free: "Free",
  grant_helper: "Grant Helper",
  premium: "Premium",
}

export default function ManageSubscriptionPage() {
  const supabase = useMemo(() => getBrowserSupabase(), [])
  const [info, setInfo] = useState<SubInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { if (mounted) setLoading(false); return }

      // 1. Always read tier/premium status from Supabase profile (fast, reliable)
      const { data: rawProfile } = await supabase
        .from("profiles")
        .select("is_premium, is_admin, subscription_tier, one_time_credits, stripe_subscription_id, cancel_at_period_end, current_period_end")
        .eq("user_id", user.id)
        .maybeSingle()

      const profile = rawProfile as {
        is_premium?: boolean; is_admin?: boolean; subscription_tier?: string
        one_time_credits?: number; stripe_subscription_id?: string
        cancel_at_period_end?: boolean; current_period_end?: string
      } | null

      if (!mounted) return

      const base: SubInfo = {
        tier: (profile?.subscription_tier as string) ?? "free",
        isPremium: Boolean(profile?.is_premium),
        isAdmin: Boolean(profile?.is_admin),
        credits: Number(profile?.one_time_credits ?? 0),
        hasSubscription: Boolean(profile?.stripe_subscription_id),
        cancelAtPeriodEnd: Boolean(profile?.cancel_at_period_end),
        periodEnd: profile?.current_period_end
          ? new Date(profile.current_period_end as string).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
          : null,
        subscriptionId: (profile?.stripe_subscription_id as string) ?? null,
        status: null,
      }
      setInfo(base)
      setLoading(false)

      // 2. Enrich with live Stripe data in the background (fills in hasSubscription if customer ID was missing)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session || !mounted) return
        const res = await fetch("/api/stripe/subscription", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        if (!mounted) return
        const data = await res.json() as SubInfo & { error?: string }
        if (!data.error) setInfo(data)
      } catch {
        // Stripe enrichment failed — profile data already shown, no need to error
      }
    }

    load().catch(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [supabase])

  async function handleSync() {
    setActionLoading(true)
    setError(null)
    setMessage(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch("/api/stripe/sync", {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token ?? ""}` },
      })
      const json = await res.json() as { ok?: boolean; error?: string; isPremium?: boolean; status?: string }
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Sync failed.")
      setMessage("Account synced successfully. Refreshing...")
      setTimeout(() => window.location.reload(), 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed.")
    } finally {
      setActionLoading(false)
    }
  }

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
      const endsAt = result.endsAt
        ? new Date(result.endsAt * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
        : info?.periodEnd
      setInfo((s) => s ? { ...s, cancelAtPeriodEnd: true, periodEnd: endsAt ?? s.periodEnd } : s)
      setMessage(endsAt ? `Your subscription will end on ${endsAt}. You keep full access until then.` : "Cancellation scheduled.")
    }
  }

  async function handleResume() {
    const result = await callApi("/api/stripe/resume")
    if (result) {
      setInfo((s) => s ? { ...s, cancelAtPeriodEnd: false } : s)
      setMessage("Your subscription has been resumed.")
    }
  }

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

  const { tier = "free", isPremium = false, isAdmin = false, credits = 0, hasSubscription = false, cancelAtPeriodEnd = false, periodEnd = null } = info ?? {}

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

          {hasSubscription && !isAdmin && (
            <div className="mt-5 pt-5 border-t border-slate-100 space-y-3">
              {error && <p className="text-xs text-rose-600">{error}</p>}

              {!cancelAtPeriodEnd ? (
                <div className="flex flex-wrap gap-3">
                  {tier !== "premium" && (
                    <Link
                      href="/pricing"
                      className="inline-flex items-center gap-2 h-9 rounded-lg bg-blue-600 text-white px-4 text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Upgrade plan <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                  <button
                    onClick={handleCancel}
                    disabled={actionLoading}
                    className="inline-flex items-center h-9 rounded-lg border border-slate-200 text-slate-600 px-4 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {actionLoading
                      ? <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                      : "Cancel subscription"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleResume}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 h-9 rounded-lg bg-slate-900 text-white px-4 text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {actionLoading
                    ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <>Resume subscription <ArrowRight className="w-3.5 h-3.5" /></>}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sync button — shown when subscription isn't reflected yet */}
        {!isAdmin && !hasSubscription && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 flex items-center justify-between gap-4">
            <p className="text-sm text-slate-600">Already subscribed but not seeing your plan?</p>
            <button
              onClick={handleSync}
              disabled={actionLoading}
              className="shrink-0 inline-flex items-center h-8 rounded-lg border border-slate-300 bg-white text-slate-700 px-3 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-60"
            >
              {actionLoading ? <span className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> : "Sync account"}
            </button>
          </div>
        )}

        {/* Upgrade prompt for free users */}
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
