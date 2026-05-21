"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Lock, Sparkles, FileText, Copy, Check, RefreshCw, ChevronRight } from "lucide-react"
import { getBrowserSupabase } from "@/lib/supabase-browser"
import PaywallModal from "@/components/PaywallModal"

type AccessState = "loading" | "locked" | "unlocked" | "helper"
type GenState = "idle" | "generating" | "done" | "error"

const QUESTIONS = [
  {
    key: "orgDescription",
    label: "Describe your organization",
    placeholder: "What does your organization do, who do you serve, and what is your mission?",
    required: true,
  },
  {
    key: "projectDescription",
    label: "What project or program will this grant fund?",
    placeholder: "Describe the specific project, program, or initiative you're seeking funding for.",
    required: true,
  },
  {
    key: "fundingUse",
    label: "How will the funds be used?",
    placeholder: "List the main expenses: staffing, equipment, marketing, operations, etc.",
    required: true,
  },
  {
    key: "expectedOutcomes",
    label: "What outcomes or impact do you expect?",
    placeholder: "Describe measurable goals — people served, jobs created, revenue growth, etc.",
    required: true,
  },
  {
    key: "additionalContext",
    label: "Anything else the reviewer should know? (optional)",
    placeholder: "Awards, partnerships, past successes, unique qualifications…",
    required: false,
  },
] as const

type AnswerKey = (typeof QUESTIONS)[number]["key"]

export default function NarrativeGate({
  grantName,
  grantDescription,
}: {
  grantName: string
  grantDescription?: string
}) {
  const supabase = useMemo(() => getBrowserSupabase(), [])
  const [access, setAccess] = useState<AccessState>("loading")
  const [credits, setCredits] = useState(0)
  const [paywallOpen, setPaywallOpen] = useState(false)

  // Form state
  const [answers, setAnswers] = useState<Record<AnswerKey, string>>({
    orgDescription: "",
    projectDescription: "",
    fundingUse: "",
    expectedOutcomes: "",
    additionalContext: "",
  })

  // Generation state
  const [genState, setGenState] = useState<GenState>("idle")
  const [narrative, setNarrative] = useState("")
  const [copied, setCopied] = useState(false)
  const narrativeRef = useRef<HTMLDivElement>(null)

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

      const data = rawData as {
        is_admin?: boolean; is_premium?: boolean
        subscription_tier?: string; one_time_credits?: number
      } | null

      const isAdmin = Boolean(data?.is_admin)
      const tier = data?.subscription_tier ?? null
      const isPremiumSubscription = Boolean(data?.is_premium) && tier === "premium"
      const creditCount = Number(data?.one_time_credits ?? 0)

      if (isAdmin || isPremiumSubscription) {
        setAccess("unlocked")
      } else if (tier === "grant_helper" && creditCount > 0) {
        setCredits(creditCount)
        setAccess("helper")
      } else {
        setAccess("locked")
      }
    }

    checkAccess().catch(() => { if (mounted) setAccess("locked") })
    return () => { mounted = false }
  }, [supabase])

  async function handleGenerate() {
    const required = QUESTIONS.filter(q => q.required)
    const missing = required.filter(q => !answers[q.key].trim())
    if (missing.length > 0) return

    setGenState("generating")
    setNarrative("")

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token ?? ""

      const res = await fetch("/api/narrative/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ grantName, grantDescription, answers }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || "Generation failed")
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error("No stream")

      const decoder = new TextDecoder()
      let accumulated = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setNarrative(accumulated)
        // Auto-scroll to bottom as content streams in
        if (narrativeRef.current) {
          narrativeRef.current.scrollTop = narrativeRef.current.scrollHeight
        }
      }

      setGenState("done")

      // Decrement local credit display for grant_helper tier
      if (access === "helper") {
        setCredits(c => Math.max(0, c - 1))
      }
    } catch (err) {
      console.error(err)
      setGenState("error")
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(narrative)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleReset() {
    setGenState("idle")
    setNarrative("")
  }

  if (access === "loading") {
    return (
      <div className="flex items-center justify-center h-24">
        <div className="w-6 h-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (access === "unlocked" || access === "helper") {
    const allRequired = QUESTIONS.filter(q => q.required).every(q => answers[q.key].trim())

    return (
      <div className="space-y-4">
        {/* Credit banner for grant_helper */}
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

        {/* Narrative output */}
        {(genState === "generating" || genState === "done" || genState === "error") && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-slate-900">
                  {genState === "generating" ? "Writing your narrative…" : "Your grant narrative"}
                </span>
                {genState === "generating" && (
                  <span className="w-3 h-3 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                )}
              </div>
              {genState === "done" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md px-2.5 py-1.5 bg-white hover:bg-slate-50 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md px-2.5 py-1.5 bg-white hover:bg-slate-50 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    New draft
                  </button>
                </div>
              )}
            </div>

            {genState === "error" ? (
              <div className="p-5 text-sm text-rose-600">
                Something went wrong generating your narrative. Please try again.
                <button onClick={handleReset} className="ml-2 underline">Try again</button>
              </div>
            ) : (
              <div
                ref={narrativeRef}
                className="p-5 max-h-[600px] overflow-y-auto text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-mono"
              >
                {narrative}
                {genState === "generating" && (
                  <span className="inline-block w-0.5 h-4 bg-blue-600 animate-pulse ml-0.5 align-middle" />
                )}
              </div>
            )}
          </div>
        )}

        {/* Form — shown when idle or after reset */}
        {genState === "idle" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <p className="text-sm font-medium text-slate-900">
                Answer a few questions to generate a tailored draft for <span className="text-blue-700">{grantName}</span>
              </p>
            </div>

            {QUESTIONS.map(q => (
              <div key={q.key}>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {q.label}
                  {!q.required && <span className="text-slate-400 font-normal ml-1">(optional)</span>}
                </label>
                <textarea
                  value={answers[q.key]}
                  onChange={e => setAnswers(a => ({ ...a, [q.key]: e.target.value }))}
                  placeholder={q.placeholder}
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                />
              </div>
            ))}

            <button
              onClick={handleGenerate}
              disabled={!allRequired}
              className="w-full flex items-center justify-center gap-2 h-10 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4" />
              Generate narrative
              <ChevronRight className="w-4 h-4" />
            </button>

            {!allRequired && (
              <p className="text-xs text-slate-400 text-center">
                Fill in all required fields to generate your narrative.
              </p>
            )}
          </div>
        )}

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
          {[
            "What is your organization's primary mission?",
            "Describe the community you serve.",
            "What outcomes will this grant fund?",
          ].map((q) => (
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
