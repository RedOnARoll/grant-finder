"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { Award, Calendar, Check, ChevronDown, ChevronRight, ExternalLink, FileText, Flag, List, Sparkles } from "lucide-react"
import type { Grant } from "@/lib/types"
import type { SavedProgram } from "@/lib/dashboard"
import { getBrowserSupabase } from "@/lib/supabase-browser"
import { getSavedPrograms } from "@/lib/account-db"
import { DocEditor, NarrativeEditor, QUESTIONS } from "@/components/WorkspaceEditors"

// ── helpers ────────────────────────────────────────────────────────────────

function fmtAmt(n: number | null) {
  if (!n) return "Varies"
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

function fmtDL(s: string | null) {
  if (!s) return "Rolling"
  const d = new Date(s)
  const diff = Math.ceil((d.getTime() - Date.now()) / 86400000)
  const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  return diff > 0 && diff <= 90 ? `${label} · ${diff}d` : label
}

function usePersist<T>(key: string, init: T) {
  const [v, setV] = useState<T>(() => {
    if (typeof window === "undefined") return init
    try { const s = localStorage.getItem(key); return s !== null ? JSON.parse(s) : init } catch { return init }
  })
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)) } catch {} }, [key, v])
  return [v, setV] as const
}

const SAMPLE_NARRATIVE = `PROJECT SUMMARY

[Your organization] requests funding to support [describe your project] in [location/region]. This grant will enable us to [key activities], directly benefiting [who you serve].

STATEMENT OF NEED

[Describe the problem or gap you are addressing. Include relevant data, statistics, or community context that demonstrates why this project is necessary and timely.]

PROJECT GOALS & ACTIVITIES

1. [Primary activity or goal with timeline]
2. [Secondary activity or goal with timeline]
3. [How you will reach and serve your target population]

EXPECTED OUTCOMES

Over the project period we project [measurable results — people served, jobs created, outcomes achieved]. We will track progress through [how you will measure success] and report results to the funder as required.

BUDGET JUSTIFICATION

The requested funds support [briefly describe main expense categories]. [Describe any matching funds or in-kind contributions, if applicable.]`

function streamText(full: string, onChunk: (s: string) => void, onDone: () => void) {
  const words = full.split(/(\s+)/)
  let i = 0
  const id = setInterval(() => {
    i += 2 + Math.floor(Math.random() * 3)
    onChunk(words.slice(0, i).join(""))
    if (i >= words.length) { clearInterval(id); onChunk(full); onDone() }
  }, 30)
  return id
}

// ── ReadinessRing ──────────────────────────────────────────────────────────

function ReadinessRing({ pct, ready }: { pct: number; ready: boolean }) {
  const size = 64, r = (size - 8) / 2, c = 2 * Math.PI * r, off = c * (1 - pct / 100)
  return (
    <div className="relative flex-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={7} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={ready ? "#16a34a" : "#2563eb"}
          strokeWidth={7} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
          style={{ transition: "stroke-dashoffset .5s cubic-bezier(.3,.8,.3,1)" }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        {ready
          ? <Check className="w-6 h-6 text-emerald-600" strokeWidth={2.4} />
          : <span className="text-lg font-bold tabular-nums text-slate-900 leading-none">{pct}<span className="text-[11px] text-slate-400">%</span></span>}
      </div>
    </div>
  )
}

// ── RailProgress ───────────────────────────────────────────────────────────

interface Stage { label: string; done: number; total: number; unit: string; hint?: string }

function RailProgress({ stages, pct, ready, onJump }: { stages: Stage[]; pct: number; ready: boolean; onJump: (i: number) => void }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
      <div className="flex items-center gap-3 mb-4">
        <ReadinessRing pct={pct} ready={ready} />
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Readiness</p>
          <p className="text-base font-semibold text-slate-900 leading-tight mt-0.5">{ready ? "Ready to submit" : pct === 0 ? "Let's get started" : "Keep going"}</p>
          <p className="text-xs text-slate-400 mt-0.5">{ready ? "Every stage complete." : "Complete each stage below."}</p>
        </div>
      </div>
      <div className="border-t border-slate-100 pt-3 grid gap-1">
        {stages.map((s, i) => {
          const done = s.done >= s.total && s.total > 0
          const started = s.done > 0
          return (
            <button key={s.label} onClick={() => onJump(i)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-slate-50 transition-colors w-full">
              <span className={`w-7 h-7 rounded-full grid place-items-center text-xs font-bold flex-none transition-colors ${done ? "bg-emerald-500 text-white" : started ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                {done ? <Check className="w-3.5 h-3.5" strokeWidth={2.6} /> : i + 1}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[13px] font-semibold text-slate-800 leading-tight">{s.label}</span>
                <span className="text-[11px] text-slate-400 tabular-nums">{s.total > 0 ? `${s.done} of ${s.total} ${s.unit}` : (s.hint ?? "")}</span>
              </span>
              {done && <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md flex-none">Done</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── RailFiles ──────────────────────────────────────────────────────────────

function RailFiles({ grant, docReady, selected, onSelect, narrativeReady }: {
  grant: Grant; docReady: Set<number>; selected: number | "narrative"
  onSelect: (v: number | "narrative") => void; narrativeReady: boolean
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-100">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Required documents</p>
        <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md tabular-nums">{docReady.size}/{grant.required_documents.length}</span>
      </div>
      <div className="p-2">
        {grant.required_documents.map((doc, i) => {
          const active = selected === i, ready = docReady.has(i)
          return (
            <button key={i} onClick={() => onSelect(i)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors ${active ? "bg-blue-50 border border-blue-200" : "hover:bg-slate-50 border border-transparent"}`}>
              <span className={`w-5 h-5 rounded-md grid place-items-center flex-none border transition-colors ${ready ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 bg-white"}`}>
                {ready && <Check className="w-3 h-3" strokeWidth={3} />}
              </span>
              <span className={`flex-1 text-[13px] font-medium leading-tight truncate ${ready ? "line-through text-slate-400" : active ? "text-blue-800 font-semibold" : "text-slate-700"}`}>{doc}</span>
              <ChevronRight className={`w-3.5 h-3.5 flex-none ${active ? "text-blue-500" : "text-slate-300"}`} />
            </button>
          )
        })}
      </div>
      <div className="border-t border-slate-100 p-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-3 pb-1.5 pt-1">Application</p>
        {(() => {
          const active = selected === "narrative"
          return (
            <button onClick={() => onSelect("narrative")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors ${active ? "bg-blue-50 border border-blue-200" : "hover:bg-slate-50 border border-transparent"}`}>
              <span className={`w-5 h-5 rounded-md grid place-items-center flex-none ${active ? "text-blue-600" : "text-slate-400"}`}><Sparkles className="w-3.5 h-3.5" /></span>
              <span className={`flex-1 text-[13px] font-medium leading-tight ${active ? "text-blue-800 font-semibold" : narrativeReady ? "line-through text-slate-400" : "text-slate-700"}`}>Application narrative</span>
              <span className="text-[10px] text-slate-400 flex-none">{narrativeReady ? "Drafted" : "AI-assisted"}</span>
            </button>
          )
        })()}
      </div>
    </div>
  )
}

// ── RailSubmit + HowItWorks ────────────────────────────────────────────────

function RailSubmit({ grant, ready }: { grant: Grant; ready: boolean }) {
  const url = grant.application_url || grant.official_source_url
  const domain = url ? new URL(url.startsWith("http") ? url : "https://" + url).hostname.replace("www.", "") : "official portal"
  return (
    <div className={`rounded-xl border shadow-sm p-4 relative overflow-hidden ${ready ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"}`}>
      <div className="flex items-center gap-2 mb-2">
        <Flag className={`w-4 h-4 ${ready ? "text-emerald-600" : "text-slate-400"}`} strokeWidth={2} />
        <p className="text-base font-semibold text-slate-900">Ready to submit?</p>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed mb-3">Opens <span className="font-semibold text-slate-700">{domain}</span>, the official application portal, in a new tab.</p>
      <a href={url || "#"} target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full h-10 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
        Apply on {domain} <ExternalLink className="w-3.5 h-3.5" />
      </a>
      <a href={grant.official_source_url || "#"} target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full h-9 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors mt-2">
        Official source <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  )
}

function RailHowItWorks() {
  const [open, setOpen] = useState(false)
  const steps = [
    "Confirm the current deadline and requirements on the official program page.",
    "Gather all required documents — check each one off in the file list above.",
    "Draft your answers in the workspace, then generate your narrative.",
    "Submit through the official portal and save a copy of the confirmation.",
  ]
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-2.5 px-4 py-3.5 text-left hover:bg-slate-50 transition-colors">
        <List className="w-4 h-4 text-slate-400" />
        <span className="flex-1 text-sm font-semibold text-slate-700">How submission works</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ol className="px-4 pb-4 grid gap-3">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-2.5 text-xs text-slate-600 leading-relaxed">
              <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 text-slate-400 text-[10px] font-bold grid place-items-center flex-none">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

const MAX_EDITS = 3

export default function WorkspaceClient() {
  const supabase = useMemo(() => getBrowserSupabase(), [])
  const [grants, setGrants] = useState<Grant[]>([])
  const [savedPrograms, setSavedPrograms] = useState<SavedProgram[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSlug, setSelectedSlug] = usePersist<string | null>("gw_ws_slug", null)

  const [docReady, setDocReady] = usePersist<number[]>("gw_ws_docready", [])
  const [docText, setDocTextMap] = usePersist<Record<string, string>>("gw_ws_text", {})
  const [attached, setAttachedMap] = usePersist<Record<string, string | null>>("gw_ws_attach", {})
  const [answers, setAnswersMap] = usePersist<Record<string, Record<string, string>>>("gw_ws_answers", {})
  const [wsSelected, setWsSelected] = usePersist<number | "narrative">("gw_ws_item", 0)

  const [gen, setGen] = useState<"idle" | "generating" | "done">("idle")
  const [narrative, setNarrative] = useState("")
  const [editsLeft, setEditsLeft] = useState(MAX_EDITS)
  const [editText, setEditText] = useState("")
  const [copied, setCopied] = useState(false)
  const streamRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      const [{ data: grantData }] = await Promise.all([
        supabase.from("grants").select("*").order("name"),
      ])
      setGrants((grantData ?? []) as Grant[])
      if (user) {
        const saved = await getSavedPrograms(supabase, user.id)
        setSavedPrograms(saved)
      }
      setLoading(false)
    }
    load()
  }, [supabase])

  const workingPrograms = grants.filter(g => savedPrograms.some(s => s.slug === g.slug))
  const grant = workingPrograms.find(g => g.slug === selectedSlug) ?? workingPrograms[0] ?? null

  const docReadySet = useMemo(() => new Set(docReady), [docReady])
  const toggleDoc = (i: number) => setDocReady(a => a.includes(i) ? a.filter(x => x !== i) : [...a, i])
  const getDocText = (i: number) => docText[`${grant?.slug}:${i}`] ?? ""
  const setDocText = (i: number, v: string) => setDocTextMap(m => ({ ...m, [`${grant?.slug}:${i}`]: v }))
  const getAttached = (i: number) => attached[`${grant?.slug}:${i}`] ?? null
  const setAttached = (i: number, v: string | null) => setAttachedMap(m => ({ ...m, [`${grant?.slug}:${i}`]: v }))
  const grantAnswers = answers[grant?.slug ?? ""] ?? {}
  const setAnswer = (k: string, v: string) => setAnswersMap(m => ({ ...m, [grant?.slug ?? ""]: { ...m[grant?.slug ?? ""], [k]: v } }))

  const reqQs = QUESTIONS.filter(q => q.required)
  const reqDone = reqQs.filter(q => grantAnswers[q.key]?.trim()).length
  const allAnswered = reqDone === reqQs.length
  const narrativeReady = gen === "done"

  function onGenerate() {
    if (!allAnswered) return
    clearInterval(streamRef.current ?? undefined)
    setGen("generating"); setNarrative(""); setEditsLeft(MAX_EDITS); setEditText("")
    streamRef.current = streamText(SAMPLE_NARRATIVE, setNarrative, () => setGen("done"))
  }
  function onEdit() {
    if (!editText.trim() || editsLeft <= 0) return
    clearInterval(streamRef.current ?? undefined)
    const prev = narrative; setNarrative(""); setEditText("")
    streamRef.current = streamText(prev, setNarrative, () => setEditsLeft(r => r - 1))
  }
  function onNewDraft() { clearInterval(streamRef.current ?? undefined); setGen("idle"); setNarrative(""); setEditsLeft(MAX_EDITS) }
  function onCopy() { navigator.clipboard?.writeText(narrative); setCopied(true); setTimeout(() => setCopied(false), 1800) }
  function onExport() {
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([narrative], { type: "text/plain" })),
      download: (grant?.name ?? "narrative").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) + ".txt",
    })
    a.click()
  }
  useEffect(() => () => clearInterval(streamRef.current ?? undefined), [])

  const stages = grant ? [
    { label: "Forms & documents",   done: docReadySet.size, total: grant.required_documents.length, unit: "ready" },
    { label: "Application answers", done: reqDone,          total: reqQs.length,                    unit: "answered" },
    { label: "Draft narrative",     done: gen === "done" ? 1 : 0, total: 1, unit: "drafted", hint: gen === "generating" ? "Writing…" : "Not started" },
  ] : []
  const readinessPct = grant ? Math.round(((docReadySet.size / Math.max(1, grant.required_documents.length)) + (reqDone / reqQs.length) + (gen === "done" ? 1 : 0)) / 3 * 100) : 0
  const allReady = readinessPct === 100

  function jumpStage(i: number) {
    if (i === 0) setWsSelected(0)
    else setWsSelected("narrative")
  }

  if (loading) {
    return <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
  }

  if (savedPrograms.length === 0) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 max-w-md w-full text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 grid place-items-center mx-auto mb-4"><FileText className="w-6 h-6" /></div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No saved programs yet</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">Save grants or benefits you're interested in, then come back here to work on your applications.</p>
          <Link href="/grants" className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
            Browse grants <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 pb-16">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 grid gap-5">

        {/* program picker */}
        {workingPrograms.length > 1 && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-500 flex-none">Working on:</span>
            <select value={grant?.slug ?? ""} onChange={e => setSelectedSlug(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
              {workingPrograms.map(g => <option key={g.slug} value={g.slug}>{g.name}</option>)}
            </select>
          </div>
        )}

        {grant && (
          <>
            {/* compact hero bar */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex items-center justify-between gap-4 px-5 py-4 flex-wrap relative overflow-hidden">
              <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ background: "radial-gradient(120% 140% at 100% 0%, #eff6ff 0%, transparent 50%)" }} />
              <div className="flex items-center gap-3 min-w-0 relative">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold flex-none capitalize">
                  {grant.type === "benefit" ? "Benefit" : grant.category.replace(/_/g, " ")}
                </span>
                <h1 className="text-lg font-bold text-slate-900 leading-tight truncate">{grant.name}</h1>
              </div>
              <div className="flex items-center gap-6 flex-none relative">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 grid place-items-center"><Award className="w-4 h-4" /></div>
                  <div><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Max award</p><p className="text-sm font-bold text-slate-900 tabular-nums mt-0.5">{fmtAmt(grant.max_amount)}</p></div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-amber-600 grid place-items-center"><Calendar className="w-4 h-4" /></div>
                  <div><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Deadline</p><p className="text-sm font-bold text-amber-700 tabular-nums mt-0.5">{fmtDL(grant.deadline)}</p></div>
                </div>
              </div>
            </div>

            {/* main grid */}
            <div className="grid gap-5 items-start" style={{ gridTemplateColumns: "minmax(0,1fr) 320px" }}>
              <div className="min-w-0">
                {wsSelected === "narrative"
                  ? <NarrativeEditor grant={grant} answers={grantAnswers} setAnswer={setAnswer}
                      gen={gen} narrative={narrative} editsLeft={editsLeft} maxEdits={MAX_EDITS}
                      editText={editText} setEditText={setEditText} copied={copied}
                      onGenerate={onGenerate} onEdit={onEdit} onCopy={onCopy} onExport={onExport} onNewDraft={onNewDraft} />
                  : <DocEditor grant={grant} index={wsSelected as number}
                      isReady={docReadySet.has(wsSelected as number)}
                      toggleReady={() => toggleDoc(wsSelected as number)}
                      text={getDocText(wsSelected as number)}
                      onTextChange={v => setDocText(wsSelected as number, v)}
                      attached={getAttached(wsSelected as number)}
                      onAttach={v => setAttached(wsSelected as number, v)} />
                }
              </div>
              <aside className="flex flex-col gap-3 sticky top-20">
                <RailProgress stages={stages} pct={readinessPct} ready={allReady} onJump={jumpStage} />
                <RailFiles grant={grant} docReady={docReadySet} selected={wsSelected} onSelect={setWsSelected} narrativeReady={narrativeReady} />
                <RailSubmit grant={grant} ready={allReady} />
                <RailHowItWorks />
              </aside>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
