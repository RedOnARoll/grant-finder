"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { CreditCard, Check, ArrowRight, Sparkles } from "lucide-react"
import SiteNav from "@/components/SiteNav"
import { getBrowserSupabase } from "@/lib/supabase-browser"

type ProfileData = {
  is_premium?: boolean
  is_admin?: boolean
  subscription_tier?: string
  subscription_status?: string
  one_time_credits?: number
  stripe_customer_id?: string
} | null

const TIER_LABELS: Record<string, string> = {
  free: "Free",
  grant_helper: "Grant Helper",
  premium: "Premium",
}

const TIER_COLORS: Record<string, string> = {
  free: "bg-slate-100 text-slate-600",
  grant_helper: "bg-amber-100 text-amber-700",
  premium: "bg-blue-100 text-blue-700",
}

export default function BillingPage() {
  const supabase = useMemo(() => getBrowserSupabase(), [])
  const [profile, setProfile] = useState<ProfileData>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const [portalError, setPortalError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { if (mounted) setLoading(false); return }

      const { data } = await supabase
        .from("profiles")
        .select("is_premium, is_admin, subscription_tier, subscription_status, one_time_credits, stripe_customer_id")
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

  async function openPortal() {
    setPortalLoading(true)
    setPortalError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token ?? ""
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json() as { url?: string; error?: string }
      if (!res.ok || !json.url) throw new Error(json.error ?? "Could not open portal.")
      window.location.href = json.url
    } catch (err) {
      setPortalError(err instanceof Error ? err.message : "Something went wrong.")
      setPortalLoading(false)
    }
  }

  const tier = (profile?.subscription_tier as string | undefined) ?? "free"
  const isPremium = Boolean(profile?.is_premium) || Boolean(profile?.is_admin)
  const isAdmin = Boolean(profile?.is_admin)
  const credits = Number(profile?.one_time_credits ?? 0)
  const hasStripeAccount = Boolean(profile?.stripe_customer_id)

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
          <span className="text-sm text-slate-900 font-medium">Billing</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-8">Billing & Subscription</h1>

        {/* Current plan card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2">Current Plan</p>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${TIER_COLORS[tier] ?? TIER_COLORS.free}`}>
                  {isAdmin ? "Admin" : (TIER_LABELS[tier] ?? "Free")}
                </span>
                {profile?.subscription_status && profile.subscription_status !== "active" && (
                  <span className="text-xs text-slate-400 capitalize">{profile.subscription_status}</span>
                )}
              </div>
              {tier === "grant_helper" && (
                <p className="text-sm text-slate-500 mt-1">{credits} AI generation{credits !== 1 ? "s" : ""} remaining</p>
              )}
              {isPremium && !isAdmin && (
                <p className="text-sm text-slate-500 mt-1">Unlimited AI narrative generations</p>
              )}
              {isAdmin && (
                <p className="text-sm text-slate-500 mt-1">Full admin access</p>
              )}
              {tier === "free" && !isAdmin && (
                <p className="text-sm text-slate-500 mt-1">No active subscription</p>
              )}
            </div>
            <CreditCard className="w-6 h-6 text-slate-300 shrink-0 mt-1" />
          </div>

          {hasStripeAccount && !isAdmin && (
            <div className="mt-5 pt-5 border-t border-slate-100">
              {portalError && <p className="text-xs text-rose-600 mb-3">{portalError}</p>}
              <button
                onClick={openPortal}
                disabled={portalLoading}
                className="inline-flex items-center gap-2 h-9 rounded-lg bg-slate-900 text-white px-4 text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {portalLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Manage subscription <ArrowRight className="w-3.5 h-3.5" /></>
                )}
              </button>
              <p className="text-xs text-slate-400 mt-2">Update payment method, cancel, or change plan via Stripe.</p>
            </div>
          )}
        </div>

        {/* Upgrade prompt for free users */}
        {!isPremium && !isAdmin && tier !== "premium" && (
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
