"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Check, X as XIcon, Shield } from "lucide-react"
import SiteNav from "@/components/SiteNav"
import { getBrowserSupabase } from "@/lib/supabase-browser"
import { PLANS, type Tier } from "@/components/PaywallModal"

function PlanCard({
  plan,
  onCheckout,
  loading,
  error,
}: {
  plan: (typeof PLANS)[number]
  onCheckout: (tier: Tier) => void
  loading: boolean
  error: string | null
}) {
  return (
    <div
      className={`relative bg-white rounded-xl p-6 flex flex-col gap-4 ${
        plan.featured
          ? "border-2 border-blue-600 shadow-lg"
          : "border border-slate-200 shadow-sm"
      }`}
    >
      {plan.badge && (
        <span
          className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${
            plan.badge.color === "amber"
              ? "bg-amber-100 text-amber-700"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {plan.badge.text}
        </span>
      )}

      <div>
        <p className="text-sm font-medium text-slate-500">{plan.label}</p>
        <div className="flex items-end gap-1 mt-1">
          <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
          <span className="text-sm text-slate-400 mb-1">{plan.period}</span>
        </div>
        {plan.savings && (
          <p className="text-sm text-emerald-600 font-medium mt-1">{plan.savings}</p>
        )}
      </div>

      <ul className="space-y-2.5 flex-1">
        {plan.features.map((f) => (
          <li key={f.text} className="flex items-center gap-2 text-sm">
            {f.included ? (
              <Check className="w-4 h-4 text-blue-600 shrink-0" />
            ) : (
              <XIcon className="w-4 h-4 text-slate-300 shrink-0" />
            )}
            <span className={f.included ? "text-slate-700" : "text-slate-400"}>{f.text}</span>
          </li>
        ))}
      </ul>

      {error && <p className="text-xs text-rose-600">{error}</p>}

      <button
        onClick={() => onCheckout(plan.tier)}
        disabled={loading}
        className={`w-full h-11 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
          plan.featured
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "border border-blue-600 text-blue-600 hover:bg-blue-50"
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Loading…
          </span>
        ) : (
          plan.cta
        )}
      </button>
    </div>
  )
}

function CancelledBanner() {
  const searchParams = useSearchParams()
  if (searchParams.get("cancelled") !== "true") return null

  return (
    <div className="text-center mb-12">
      <h1 className="text-3xl font-bold text-slate-900">No worries — your progress is saved</h1>
      <p className="mt-3 text-slate-500 max-w-md mx-auto">
        You were not charged. Come back anytime to unlock premium features.
      </p>
    </div>
  )
}

export default function PricingPage() {
  const [loadingTier, setLoadingTier] = useState<Tier | null>(null)
  const [errors, setErrors] = useState<Partial<Record<Tier, string>>>({})

  async function handleCheckout(tier: Tier) {
    setLoadingTier(tier)
    setErrors({})

    try {
      const { data: { session } } = await getBrowserSupabase().auth.getSession()
      const token = session?.access_token ?? ""

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tier }),
      })

      const json = await res.json() as { url?: string; error?: string }
      if (!res.ok || !json.url) throw new Error(json.error ?? "Could not start checkout.")

      window.location.href = json.url
    } catch (err) {
      setErrors((e) => ({
        ...e,
        [tier]: err instanceof Error ? err.message : "Something went wrong.",
      }))
      setLoadingTier(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteNav />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <Suspense fallback={null}>
          <CancelledBanner />
        </Suspense>

        <div className="text-center mb-12">
          <span className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            Unlock Premium Features
          </span>
          <h2 className="text-3xl font-bold text-slate-900">
            Write winning grant applications with AI
          </h2>
          <p className="mt-3 text-slate-500 max-w-lg mx-auto">
            Choose the plan that fits your needs. Cancel or upgrade anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.tier}
              plan={plan}
              onCheckout={handleCheckout}
              loading={loadingTier === plan.tier}
              error={errors[plan.tier] ?? null}
            />
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Shield className="w-4 h-4" />
            Secure payment powered by Stripe. Cancel anytime. No hidden fees.
          </div>
          <Link
            href="/grants"
            className="text-sm font-medium text-slate-600 border border-slate-200 rounded-lg px-5 py-2 hover:bg-white transition-colors"
          >
            Browse Grants for Free
          </Link>
        </div>
      </main>
    </div>
  )
}
