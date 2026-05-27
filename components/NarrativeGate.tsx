"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Lock, Sparkles, Copy, Check, RefreshCw, Download, X, ChevronRight } from "lucide-react"
import { getBrowserSupabase } from "@/lib/supabase-browser"
import PaywallModal from "@/components/PaywallModal"

type AccessState = "loading" | "locked" | "unlocked" | "helper"
type GenState = "idle" | "generating" | "done" | "error"
type EditState = "idle" | "editing" | "error"

const MAX_EDITS = 3

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
  const [modalOpen, setModalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const [answers, setAnswers] = useState<Record<AnswerKey, string>>({
    orgDescription: "",
    projectDescription: "",
    fundingUse: "",
    expectedOutcomes: "",
    additionalContext: "",
  })

  const [genState, setGenState] = useState<GenState>("idle")
  const [narrative, setNarrative] = useState("")
  const [copied, setCopied] = useState(false)
  const narrativeRef = useRef<HTMLDivElement>(null)

  const [editsRemaining, setEditsRemaining] = useState(MAX_EDITS)
  const [editInstruction, setEditInstruction] = useState("")
  const [editState, setEditState] = useState<EditState>("idle")

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!modalOpen) return
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setModalOpen(false) }
    document.addEventListener("keydown", h)
    return () => document.removeEventListener("keydown", h)
  }, [modalOpen])

  useEffect(() => {
    document.body.style.overflow = modalOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [modalOpen])

  useEffect(() => {
    let alive = true
    async function checkAccess() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { if (alive) setAccess("locked"); return }

      const { data: rawData } = await supabase
        .from("profiles")
        .select("is_premium, is_admin, subscription_tier, one_time_credits")
        .eq("user_id", user.id)
        .maybeSingle()

      if (!alive) return

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
    checkAccess().catch(() => { if (alive) setAccess("locked") })
    return () => { alive = false }
  }, [supabase])

  async function handleGenerate() {
    if (access === "helper" && credits <= 0) { setPaywallOpen(true); return }
    if (QUESTIONS.filter(q => q.required).some(q => !answers[q.key].trim())) return

    setGenState("generating")
    setNarrative("")
    setEditsRemaining(MAX_EDITS)
    setEditInstruction("")
    setEditState("idle")

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token ?? ""

      const res = await fetch("/api/narrative/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ grantName, grantDescription, answers }),
      })
      if (!res.ok) throw new Error((await res.text()) || "Generation failed")

      const reader = res.body?.getReader()
      if (!reader) throw new Error("No stream")
      const decoder = new TextDecoder()
      let accumulated = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setNarrative(accumulated)
        if (narrativeRef.current) narrativeRef.current.scrollTop = narrativeRef.current.scrollHeight
      }
      setGenState("done")
      if (access === "helper") setCredits(c => Math.max(0, c - 1))
    } catch (err) {
      console.error(err)
      setGenState("error")
    }
  }

  async function handleEdit() {
    if (editsRemaining <= 0) return
    const instruction = editInstruction.trim()
    if (!instruction) return

    const prevNarrative = narrative
    setEditState("editing")
    setEditInstruction("")

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token ?? ""

      const res = await fetch("/api/narrative/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ grantName, currentNarrative: prevNarrative, editInstruction: instruction }),
      })
      if (!res.ok) throw new Error((await res.text()) || "Edit failed")

      const reader = res.body?.getReader()
      if (!reader) throw new Error("No stream")
      const decoder = new TextDecoder()
      let accumulated = ""
      setNarrative("")
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setNarrative(accumulated)
        if (narrativeRef.current) narrativeRef.current.scrollTop = narrativeRef.current.scrollHeight
      }
      setEditsRemaining(r => r - 1)
      setEditState("idle")
    } catch (err) {
      console.error(err)
      setNarrative(prevNarrative)
      setEditState("error")
    }
  }

  function handleExport() {
    const blob = new Blob([narrative], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${grantName.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-narrative.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(narrative)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleReset() {
    if (access === "helper" && credits <= 0) { setPaywallOpen(true); return }
    setGenState("idle")
    setNarrative("")
    setEditsRemaining(MAX_EDITS)
    setEditInstruction("")
    setEditState("idle")
  }

  if (access === "loading") {
    return (
      <div className="flex items-center justify-center h-24">
        <div className="w-6 h-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (access === "locked") {
    return (
      <>
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex flex-col items-center gap-4 py-8 px-6 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 text-slate-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Write My Application</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-xs">
                Let AI draft a professional narrative based on this grant&apos;s requirements and your profile.
              </p>
            </div>
            <p className="text-xs text-slate-400">1 generation · {MAX_EDITS} free edits included</p>
            <button
              onClick={() => setPaywallOpen(true)}
              className="bg-blue-600 text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Unlock Grant Helper
            </button>
          </div>
        </div>
        <PaywallModal isOpen={paywallOpen} onClose={() => setPaywallOpen(false)} grantName={grantName} />
      </>
    )
  }

  const helperOutOfCredits = access === "helper" && credits <= 0
  const allRequired = QUESTIONS.filter(q => q.required).every(q => answers[q.key].trim())
  const isActive = genState === "generating" || editState === "editing"

  return (
    <>
      {/* Compact sidebar trigger */}
      <div className="space-y-3">
        {access === "helper" && (
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5">
            <p className="text-sm text-amber-800 font-medium">
              {credits} generation{credits !== 1 ? "s" : ""} remaining
            </p>
            <button onClick={() => setPaywallOpen(true)} className="text-xs text-blue-600 hover:underline font-medium">
              Upgrade to unlimited
            </button>
          </div>
        )}
        <button
          onClick={() => {
            if (helperOutOfCredits) { setPaywallOpen(true); return }
            setModalOpen(true)
          }}
          className="w-full flex items-center justify-center gap-2 h-10 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          {genState === "done" ? "View / edit narrative" : "Open AI Writer"}
        </button>
        {genState === "done" && (
          <p className="text-xs text-slate-400 text-center">
            {editsRemaining} edit{editsRemaining !== 1 ? "s" : ""} remaining
          </p>
        )}
      </div>

      {/* Full-size modal */}
      {mounted && modalOpen && createPortal(
        <>
          <div
            className="fixed inset-0 z-[300] bg-slate-900/60"
            onClick={() => setModalOpen(false)}
            aria-hidden="true"
          />
          <div
            className="fixed z-[301] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
            style={{
              top: "50%", left: "50%", transform: "translate(-50%, -50%)",
              width: "680px", maxWidth: "calc(100vw - 32px)", maxHeight: "calc(100vh - 48px)",
            }}
            role="dialog"
            aria-modal="true"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900 text-white shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <Sparkles className="w-5 h-5 text-blue-300 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">AI Grant Writer</p>
                  <p className="text-sm font-semibold text-white truncate">{grantName}</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="ml-4 shrink-0 p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">

              {/* Output */}
              {(genState === "generating" || genState === "done" || genState === "error") && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-slate-900">
                        {isActive
                          ? (editState === "editing" ? "Revising your narrative…" : "Writing your narrative…")
                          : "Your grant narrative"}
                      </span>
                      {isActive && <span className="w-3 h-3 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />}
                    </div>
                    {genState === "done" && editState === "idle" && (
                      <div className="flex items-center gap-2">
                        <button onClick={handleExport} className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md px-2.5 py-1.5 bg-white hover:bg-slate-50 transition-colors">
                          <Download className="w-3.5 h-3.5" />
                          Export
                        </button>
                        <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md px-2.5 py-1.5 bg-white hover:bg-slate-50 transition-colors">
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          {copied ? "Copied!" : "Copy"}
                        </button>
                        <button onClick={handleReset} className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md px-2.5 py-1.5 bg-white hover:bg-slate-50 transition-colors">
                          <RefreshCw className="w-3.5 h-3.5" />
                          New draft
                        </button>
                      </div>
                    )}
                  </div>
                  {genState === "error" ? (
                    <div className="p-5 text-sm text-rose-600">
                      Something went wrong. <button onClick={handleReset} className="underline">Try again</button>
                    </div>
                  ) : (
                    <div
                      ref={narrativeRef}
                      className="p-5 max-h-[420px] overflow-y-auto text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-mono"
                    >
                      {narrative}
                      {isActive && <span className="inline-block w-0.5 h-4 bg-blue-600 animate-pulse ml-0.5 align-middle" />}
                    </div>
                  )}
                </div>
              )}

              {/* Edit interface */}
              {genState === "done" && editState !== "editing" && editsRemaining > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900">Request an edit</p>
                    <span className="text-xs text-slate-500 bg-slate-100 rounded-full px-2.5 py-0.5">
                      {editsRemaining} of {MAX_EDITS} edits remaining
                    </span>
                  </div>
                  <textarea
                    value={editInstruction}
                    onChange={e => setEditInstruction(e.target.value)}
                    placeholder="E.g., make it more concise, strengthen the budget section, focus more on community impact…"
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <button
                    onClick={handleEdit}
                    disabled={!editInstruction.trim()}
                    className="w-full flex items-center justify-center gap-2 h-9 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Apply edit
                  </button>
                  {editState === "error" && (
                    <p className="text-xs text-rose-600 text-center">Edit failed. Please try again.</p>
                  )}
                </div>
              )}

              {genState === "done" && editsRemaining === 0 && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                  You&apos;ve used all {MAX_EDITS} edits for this draft.{" "}
                  <button onClick={handleReset} className="font-medium underline">Start a new draft</button>
                  {access === "helper" && credits <= 0 && " (requires a new generation credit)"}.
                </div>
              )}

              {/* Form */}
              {genState === "idle" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                    <p className="text-sm font-medium text-slate-900">
                      Answer a few questions to generate a tailored draft
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
                </div>
              )}
            </div>

            {/* Footer — generate */}
            {genState === "idle" && (
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0 space-y-3">
                {access === "helper" && (
                  <p className="text-xs text-amber-700 text-center">
                    {credits} generation{credits !== 1 ? "s" : ""} remaining · includes {MAX_EDITS} free edits per draft
                  </p>
                )}
                <button
                  onClick={handleGenerate}
                  disabled={!allRequired || helperOutOfCredits}
                  className="w-full flex items-center justify-center gap-2 h-10 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate narrative
                  <ChevronRight className="w-4 h-4" />
                </button>
                {!allRequired && (
                  <p className="text-xs text-slate-400 text-center">Fill in all required fields to continue.</p>
                )}
              </div>
            )}
          </div>
        </>,
        document.body
      )}

      <PaywallModal isOpen={paywallOpen} onClose={() => setPaywallOpen(false)} grantName={grantName} />
    </>
  )
}
