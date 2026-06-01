"use client"

import { useState } from "react"
import { X, Check, X as XIcon, Shield } from "lucide-react"
import { getBrowserSupabase } from "@/lib/supabase-browser"

type Tier = "one_time" | "monthly" | "annual"

type Plan = {
  tier: Tier
  label: string
  price: string
  period: string
  savings?: string
  badge?: { text: string; color: "amber" | "green" }
  featured?: boolean
  cta: string
  features: { text: string; included: boolean }[]
}

const PREMIUM_FEATURES = [
  { text: "Unlimited grants — AI draft + 3 edits each", included: true },
  { text: "Full document checklist", included: true },
  { text: "PDF and Word export", included: true },
  { text: "Deadline alerts via email", included: true },
  { text: "Advanced profile matching", included: true },
  { text: "Priority support", included: true },
]

const PLANS: Plan[] = [
  {
    tier: "one_time",
    label: "Grant Helper",
    price: "$19",
    period: "one-time",
    cta: "Get Grant Helper — $19",
    features: [
      { text: "1 grant · 1 AI draft + 3 edits", included: true },
      { text: "Full document checklist", included: true },
      { text: "Copy & download export", included: true },
      { text: "Deadline alerts", included: false },
      { text: "Unlimited grants", included: false },
    ],
  },
  {
    tier: "monthly",
    label: "Premium",
    price: "$15",
    period: "/month",
    badge: { text: "Most Popular", color: "amber" },
    featured: true,
    cta: "Start Premium",
    features: PREMIUM_FEATURES,
  },
  {
    tier: "annual",
    label: "Premium Annual",
    price: "$99",
    period: "/year",
    savings: "Save $81 compared to monthly",
    badge: { text: "Best Value", color: "green" },
    cta: "Start Annual",
    features: PREMIUM_FEATURES,
  },
]

function PlanCard({
  plan,
  onCheckout,
  loading,
  error,
}: {
  plan: Plan
  onCheckout: (tier: Tier) => void
  loading: boolean
  error: string | null
}) {
  return (
    <div
      className={`relative bg-white rounded-xl p-5 flex flex-col gap-4 ${
        plan.featured
          ? "border-2 border-blue-600 shadow-lg scale-[1.02]"
          : "border border-slate-200"
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
          <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
          <span className="text-sm text-slate-400 mb-1">{plan.period}</span>
        </div>
        {plan.savings && (
          <p className="text-sm text-emerald-600 font-medium mt-0.5">{plan.savings}</p>
        )}
      </div>

      <ul className="space-y-2 flex-1">
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
        className={`w-full h-10 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
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

export { PLANS }
export type { Plan, Tier }

export default function PaywallModal({
  isOpen,
  onClose,
  grantName,
}: {
  isOpen: boolean
  onClose: () => void
  grantName?: string
}) {
  const [loadingTier, setLoadingTier] = useState<Tier | null>(null)
  const [errors, setErrors] = useState<Partial<Record<Tier, string>>>({})

  async function handleCheckout(tier: Tier) {
    setLoadingTier(tier)
    setErrors({})

    try {
      const supabase = getBrowserSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      const token = user ? ((await supabase.auth.getSession()).data.session?.access_token ?? "") : ""

      const returnTo = typeof window !== "undefined" ? window.location.pathname : "/account"

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tier, returnTo }),
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

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <span className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                Unlock Premium Features
              </span>
              <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                Write a winning grant application with AI
              </h2>
              <p className="mt-2 text-sm text-slate-500 leading-6">
                GrantWay's AI narrative generator creates a tailored, professional draft in
                minutes — based on your answers and the grant's specific requirements.
              </p>
              {grantName && (
                <p className="mt-2 text-xs text-slate-400">Currently viewing: {grantName}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <ul className="mt-4 space-y-2">
            {[
              "AI-generated narrative tailored to this specific grant",
              "Structured sections: Executive Summary, Project Description, Statement of Need, Goals and Objectives, Budget Justification",
              "Full document checklist for this grant",
              "Export your draft to PDF or Word",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Pricing cards */}
        <div className="px-6 pb-4 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
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

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Shield className="w-3.5 h-3.5" />
          Secure payment powered by Stripe. Cancel anytime. No hidden fees.
        </div>
      </div>
    </div>
  )
}
