"use client"

import { useEffect, useMemo, useState } from "react"
import { Lock, Sparkles, FileText } from "lucide-react"
import { getBrowserSupabase } from "@/lib/supabase-browser"
import PaywallModal from "@/components/PaywallModal"

type AccessState = "loading" | "locked" | "unlocked" | "helper"

export default function NarrativeGate({ grantName }: { grantName: string }) {
  const supabase = useMemo(() => getBrowserSupabase(), [])
  const [access, setAccess] = useState<AccessState>("loading")
  const [credits, setCredits] = useState(0)
  const [paywallOpen, setPaywallOpen] = useState(false)

  useEffect(() => {
    let mounted = true

    async function checkAccess() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { if (mounted) setAccess("locked"); return }

      const { data: rawData } = await supabase
        .from("profiles")
        .select("is_premium, is_admin, subscription_tier, one_time_credits")
        .eq("user_id", user.id)
        .maybeSingle()

      if (!mounted) return

      const data = rawData as { is_admin?: boolean; is_premium?: boolean; subscription_tier?: string; one_time_credits?: number } | null
      const isAdmin = Boolean(data?.is_admin)
      const isPremium = Boolean(data?.is_premium)
      const tier = data?.subscription_tier ?? null
      const creditCount = Number(data?.one_time_credits ?? 0)

      if (isAdmin || isPremium) {
        setAccess("unlocked")
      } else if (tier === "grant_helper" && creditCount > 0) {
        setCredits(creditCount)
        setAccess("helper")
      } else {
        setAccess("locked")
      }
    }

    checkAccess()
    return () => { mounted = false }
  }, [supabase])

  if (access === "loading") {
    return (
      <div className="flex items-center justify-center h-24">
        <div className="w-6 h-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (access === "unlocked" || access === "helper") {
    return (
      <div className="space-y-4">
        {access === "helper" && (
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5">
            <p className="text-sm text-amber-800 font-medium">
              {credits} generation{credits !== 1 ? "s" : ""} remaining
            </p>
            <button
              onClick={() => setPaywallOpen(true)}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Upgrade to unlimited
            </button>
          </div>
        )}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 text-center">
          <Sparkles className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-900 mb-1">AI Narrative Generator</h3>
          <p className="text-sm text-slate-500">
            Coming soon — answer a few questions and get a tailored draft in minutes.
          </p>
        </div>
        <PaywallModal
          isOpen={paywallOpen}
          onClose={() => setPaywallOpen(false)}
          grantName={grantName}
        />
      </div>
    )
  }

  // Locked state
  return (
    <>
      <div className="relative rounded-xl overflow-hidden">
        {/* Blurred teaser */}
        <div className="blur-sm pointer-events-none select-none opacity-60 space-y-3 p-1">
          {["What is your organization's primary mission?", "Describe the community you serve.", "What outcomes will this grant fund?"].map((q) => (
            <div key={q} className="bg-slate-50 rounded-lg border border-slate-200 p-4">
              <p className="text-sm font-medium text-slate-700 mb-2">{q}</p>
              <div className="h-10 bg-white rounded border border-slate-200" />
            </div>
          ))}
        </div>

        {/* Lock overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/70 backdrop-blur-[2px]">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
            <Lock className="w-6 h-6 text-slate-500" />
          </div>
          <div className="text-center px-4">
            <h3 className="font-bold text-slate-900 text-lg">Write My Application</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-xs">
              Let AI draft a professional narrative based on this grant's requirements and your profile.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <FileText className="w-3.5 h-3.5" />
            Executive Summary · Project Description · Budget Justification
          </div>
          <button
            onClick={() => setPaywallOpen(true)}
            className="bg-blue-600 text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Unlock with Premium
          </button>
        </div>
      </div>

      <PaywallModal
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        grantName={grantName}
      />
    </>
  )
}
