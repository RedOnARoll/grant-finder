"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { Lock, Sparkles, Copy, Check, Download, RefreshCw, Square, CheckSquare2 } from "lucide-react"
import { getBrowserSupabase } from "@/lib/supabase-browser"
import DocumentGuide from "@/components/DocumentGuide"
import PaywallModal from "@/components/PaywallModal"

type AccessState = "loading" | "locked" | "unlocked" | "helper"
type GenState = "idle" | "generating" | "done" | "error"
type EditState = "idle" | "editing" | "error"

const MAX_EDITS = 3

const QUESTIONS = [
  { key: "orgDescription",    label: "Describe your organization",              placeholder: "What does your organization do, who do you serve, and what is your mission?",                              required: true  },
  { key: "projectDescription",label: "What project will this grant fund?",      placeholder: "Describe the specific project, program, or initiative you're seeking funding for.",                      required: true  },
  { key: "fundingUse",        label: "How will the funds be used?",             placeholder: "List the main expenses: staffing, equipment, marketing, operations, etc.",                              required: true  },
  { key: "expectedOutcomes",  label: "What outcomes or impact do you expect?",  placeholder: "Describe measurable goals — people served, jobs created, products launched, etc.",                      required: true  },
  { key: "additionalContext", label: "Anything else the reviewer should know?", placeholder: "Partnerships, past successes, unique qualifications, awards…",                                           required: false },
] as const

type AnswerKey = (typeof QUESTIONS)[number]["key"]

function getPrepItems(documents: string[]): string[] {
  const base = [
    "Organization name, address, EIN / Tax ID",
    "Mission statement (2–3 sentences)",
    "Project name, scope, and start/end dates",
    "Budget breakdown with estimated line items",
    "Expected outcomes and measurable metrics",
    "Key staff names, titles, and short bios",
  ]
  const docHints: Record<string, string> = {
    "financial statements":  "Last 2 years of audited or compiled financials",
    "business plan":         "Written business or project plan (current draft OK)",
    "tax return":            "Copies of federal tax returns (last 2 years)",
    "501(c)(3)":             "IRS determination letter confirming tax-exempt status",
    "w-9":                   "Completed W-9 form (can generate from IRS.gov)",
    "duns":                  "SAM.gov / UEI registration (federal grants)",
    "letter of support":     "Letters of support from partners or community leaders",
    "resume":                "Résumés for key project staff",
  }
  const extra: string[] = []
  for (const doc of documents) {
    const lower = doc.toLowerCase()
    for (const [pattern, hint] of Object.entries(docHints)) {
      if (lower.includes(pattern) && !extra.includes(hint)) {
        extra.push(hint)
        break
      }
    }
  }
  return [...base, ...extra.slice(0, 3)]
}

function SectionHead({ n, title, sub }: { n: number; title: string; sub: string }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <span className="flex-none w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center mt-0.5">{n}</span>
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500 mt-0.5">{sub}</p>
      </div>
    </div>
  )
}

function AccessGate({ onUnlock, grantName }: { onUnlock: () => void; grantName: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 flex flex-col items-center gap-4 text-center">
      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
        <Lock className="w-5 h-5 text-slate-500" />
      </div>
      <div>
        <p className="font-semibold text-slate-900">Unlock the AI Grant Writer</p>
        <p className="text-sm text-slate-500 mt-1 max-w-xs">
          Answer these questions once and get a tailored draft for {grantName}, with {MAX_EDITS} free edits.
        </p>
      </div>
      <p className="text-xs text-slate-400">1 generation · {MAX_EDITS} edits included · $19 one-time</p>
      <button
        onClick={onUnlock}
        className="bg-blue-600 text-white rounded-lg px-6 py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors"
      >
        Unlock Grant Helper
      </button>
    </div>
  )
}

interface Props {
  grantName: string
  grantDescription?: string
  requiredDocuments: string[]
}

export default function GrantHelperClient({ grantName, grantDescription, requiredDocuments }: Props) {
  const supabase = useMemo(() => getBrowserSupabase(), [])
  const [access, setAccess]   = useState<AccessState>("loading")
  const [credits, setCredits] = useState(0)
  const [paywallOpen, setPaywallOpen] = useState(false)

  const [checked, setChecked] = useState<Set<number>>(new Set())
  const prepItems = useMemo(() => getPrepItems(requiredDocuments), [requiredDocuments])

  const [answers, setAnswers] = useState<Record<AnswerKey, string>>({
    orgDescription: "", projectDescription: "", fundingUse: "", expectedOutcomes: "", additionalContext: "",
  })

  const [genState,  setGenState]  = useState<GenState>("idle")
  const [narrative, setNarrative] = useState("")
  const [copied,    setCopied]    = useState(false)
  const narrativeRef = useRef<HTMLDivElement>(null)

  const [editsRemaining,  setEditsRemaining]  = useState(MAX_EDITS)
  const [editInstruction, setEditInstruction] = useState("")
  const [editState,       setEditState]       = useState<EditState>("idle")

  useEffect(() => {
    let alive = true
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { if (alive) setAccess("locked"); return }
      const { data } = await supabase
        .from("profiles")
        .select("is_premium,is_admin,subscription_tier,one_time_credits")
        .eq("user_id", user.id)
        .maybeSingle()
      if (!alive) return
      const d = data as { is_admin?: boolean; is_premium?: boolean; subscription_tier?: string; one_time_credits?: number } | null
      if (Boolean(d?.is_admin) || (Boolean(d?.is_premium) && d?.subscription_tier === "premium")) {
        setAccess("unlocked")
      } else if (d?.subscription_tier === "grant_helper" && Number(d?.one_time_credits ?? 0) > 0) {
        setCredits(Number(d?.one_time_credits))
        setAccess("helper")
      } else {
        setAccess("locked")
      }
    }
    check().catch(() => { if (alive) setAccess("locked") })
    return () => { alive = false }
  }, [supabase])

  async function handleGenerate() {
    if (access === "helper" && credits <= 0) { setPaywallOpen(true); return }
    if (QUESTIONS.filter(q => q.required).some(q => !answers[q.key].trim())) return
    setGenState("generating"); setNarrative(""); setEditsRemaining(MAX_EDITS); setEditInstruction(""); setEditState("idle")
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch("/api/narrative/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token ?? ""}` },
        body: JSON.stringify({ grantName, grantDescription, answers }),
      })
      if (!res.ok) throw new Error()
      const reader = res.body?.getReader()
      if (!reader) throw new Error()
      const dec = new TextDecoder(); let buf = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += dec.decode(value, { stream: true })
        setNarrative(buf)
        if (narrativeRef.current) narrativeRef.current.scrollTop = narrativeRef.current.scrollHeight
      }
      setGenState("done")
      if (access === "helper") setCredits(c => Math.max(0, c - 1))
    } catch { setGenState("error") }
  }

  async function handleEdit() {
    if (editsRemaining <= 0 || !editInstruction.trim()) return
    const prev = narrative
    setEditState("editing"); setEditInstruction("")
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch("/api/narrative/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token ?? ""}` },
        body: JSON.stringify({ grantName, currentNarrative: prev, editInstruction: editInstruction.trim() }),
      })
      if (!res.ok) throw new Error()
      const reader = res.body?.getReader()
      if (!reader) throw new Error()
      const dec = new TextDecoder(); let buf = ""
      setNarrative("")
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += dec.decode(value, { stream: true })
        setNarrative(buf)
        if (narrativeRef.current) narrativeRef.current.scrollTop = narrativeRef.current.scrollHeight
      }
      setEditsRemaining(r => r - 1); setEditState("idle")
    } catch { setNarrative(prev); setEditState("error") }
  }

  function handleExport() {
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([narrative], { type: "text/plain" })),
      download: `${grantName.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-narrative.txt`,
    })
    a.click()
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(narrative)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const allRequired  = QUESTIONS.filter(q => q.required).every(q => answers[q.key].trim())
  const isGenerating = genState === "generating" || editState === "editing"
  const canGenerate  = access === "unlocked" || (access === "helper" && credits > 0)

  return (
    <div className="space-y-10">

      {/* ─── 1. Preparation ──────────────────────────────────────────── */}
      <section>
        <SectionHead n={1} title="Preparation" sub="Check off each item as you gather it — have these ready before you open the application." />
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {prepItems.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setChecked(s => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n })}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
            >
              {checked.has(i)
                ? <CheckSquare2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                : <Square className="w-4.5 h-4.5 text-slate-300 shrink-0" />
              }
              <span className={`text-sm ${checked.has(i) ? "line-through text-slate-400" : "text-slate-700"}`}>{item}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-2 pl-1">{checked.size} of {prepItems.length} items ready</p>
      </section>

      {/* ─── 2. Forms & Documents ────────────────────────────────────── */}
      <section>
        <SectionHead n={2} title="Required Forms & Documents" sub="Download, complete, and save each item before submitting." />
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <DocumentGuide documents={requiredDocuments} showGenerationActions />
        </div>
      </section>

      {/* ─── 3. Application Questions ────────────────────────────────── */}
      <section>
        <SectionHead n={3} title="Application Questions" sub="Answer these once — your responses will be used to generate the draft in the next step." />
        {access === "loading" && (
          <div className="flex justify-center py-10">
            <span className="w-6 h-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          </div>
        )}
        {access === "locked" && (
          <AccessGate onUnlock={() => setPaywallOpen(true)} grantName={grantName} />
        )}
        {(access === "unlocked" || access === "helper") && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-5">
            {access === "helper" && (
              <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5">
                <p className="text-sm text-amber-800 font-medium">{credits} generation{credits !== 1 ? "s" : ""} remaining</p>
                <button onClick={() => setPaywallOpen(true)} className="text-xs text-blue-600 hover:underline font-medium">Upgrade</button>
              </div>
            )}
            {QUESTIONS.map(q => (
              <div key={q.key}>
                <label className="block text-sm font-medium text-slate-800 mb-1.5">
                  {q.label}
                  {!q.required && <span className="text-slate-400 font-normal ml-1">(optional)</span>}
                </label>
                <textarea
                  value={answers[q.key]}
                  onChange={e => setAnswers(a => ({ ...a, [q.key]: e.target.value }))}
                  placeholder={q.placeholder}
                  rows={3}
                  disabled={isGenerating}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-60"
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── 4. Draft ────────────────────────────────────────────────── */}
      {(access === "unlocked" || access === "helper") && (
        <section>
          <SectionHead n={4} title="Application Draft" sub={`Generate a full narrative from your answers above. Includes ${MAX_EDITS} free edits.`} />

          {/* Draft output */}
          {(genState === "generating" || genState === "done" || genState === "error") && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-4">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-slate-900">
                    {isGenerating ? (editState === "editing" ? "Revising…" : "Writing your draft…") : "Your grant narrative"}
                  </span>
                  {isGenerating && <span className="w-3.5 h-3.5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />}
                </div>
                {genState === "done" && !isGenerating && (
                  <div className="flex items-center gap-2">
                    <button onClick={handleExport} className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md px-2.5 py-1.5 bg-white hover:bg-slate-50 transition-colors">
                      <Download className="w-3.5 h-3.5" /> Export
                    </button>
                    <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md px-2.5 py-1.5 bg-white hover:bg-slate-50 transition-colors">
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                    <button onClick={() => { setGenState("idle"); setNarrative(""); setEditsRemaining(MAX_EDITS) }} className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md px-2.5 py-1.5 bg-white hover:bg-slate-50 transition-colors">
                      <RefreshCw className="w-3.5 h-3.5" /> New draft
                    </button>
                  </div>
                )}
              </div>
              {genState === "error" ? (
                <div className="p-5 text-sm text-rose-600">Something went wrong. <button onClick={() => setGenState("idle")} className="underline">Try again</button></div>
              ) : (
                <div ref={narrativeRef} className="p-5 max-h-[500px] overflow-y-auto text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-mono">
                  {narrative}
                  {isGenerating && <span className="inline-block w-0.5 h-4 bg-blue-600 animate-pulse ml-0.5 align-middle" />}
                </div>
              )}
            </div>
          )}

          {/* Edit interface */}
          {genState === "done" && !isGenerating && editsRemaining > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-900">Request an edit</p>
                <span className="text-xs text-slate-500 bg-slate-100 rounded-full px-2.5 py-0.5">{editsRemaining} of {MAX_EDITS} edits remaining</span>
              </div>
              <textarea
                value={editInstruction}
                onChange={e => setEditInstruction(e.target.value)}
                placeholder="E.g., make it more concise, strengthen the budget section, add more detail about community impact…"
                rows={2}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <button
                onClick={handleEdit}
                disabled={!editInstruction.trim()}
                className="w-full h-9 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Apply edit
              </button>
              {editState === "error" && <p className="text-xs text-rose-600 text-center">Edit failed — try again.</p>}
            </div>
          )}

          {genState === "done" && editsRemaining === 0 && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 mb-4">
              All {MAX_EDITS} edits used.{" "}
              <button onClick={() => { setGenState("idle"); setNarrative(""); setEditsRemaining(MAX_EDITS) }} className="font-medium underline">Start a new draft</button>
              {access === "helper" && credits <= 0 && " (requires a new generation credit)"}.
            </div>
          )}

          {/* Generate button */}
          {genState === "idle" && (
            <button
              onClick={handleGenerate}
              disabled={!allRequired || !canGenerate}
              className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4" />
              Generate draft
            </button>
          )}
          {genState === "idle" && !allRequired && (
            <p className="text-xs text-slate-400 text-center mt-2">Answer all required questions above to generate.</p>
          )}
        </section>
      )}

      <PaywallModal isOpen={paywallOpen} onClose={() => setPaywallOpen(false)} grantName={grantName} />
    </div>
  )
}
