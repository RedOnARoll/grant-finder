"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { BookOpen, Check, ChevronLeft, ChevronRight, Download, ExternalLink, RefreshCw, Send, Sparkles } from "lucide-react"
import type { Grant } from "@/lib/types"
import { getBrowserSupabase } from "@/lib/supabase-browser"
import { GovFormFiller } from "@/components/GovFormFiller"

// ── OverviewTab ────────────────────────────────────────────────────────────

function fmtAmt(n: number | null) {
  if (!n) return "Varies"
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

function fmtVerified(s: string | null) {
  if (!s) return null
  const diff = Math.round((Date.now() - new Date(s).getTime()) / 86400000)
  if (diff === 0) return "Verified today"
  if (diff === 1) return "Last verified yesterday"
  return `Last verified ${diff} days ago`
}

export function OverviewTab({ grant, onStartApplication }: { grant: Grant; onStartApplication: () => void }) {
  const verifiedText = fmtVerified(grant.last_verified_at)
  const eligList: string[] = Array.isArray(grant.eligibility_criteria)
    ? (grant.eligibility_criteria as string[])
    : Object.entries(grant.eligibility_criteria as Record<string, unknown>)
        .filter(([, v]) => v !== null && v !== undefined && v !== false)
        .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`)

  return (
    <div className="p-5 grid gap-5">
      <div className="flex flex-wrap gap-3">
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex-1 min-w-28">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Funder</p>
          <p className="text-sm font-semibold text-slate-800 mt-0.5">{grant.agency}</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex-1 min-w-28">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Max Award</p>
          <p className="text-sm font-semibold text-blue-700 mt-0.5">{fmtAmt(grant.max_amount)}</p>
        </div>
        {grant.funding_source && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex-1 min-w-28">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Source</p>
            <p className="text-sm font-semibold text-slate-800 mt-0.5 capitalize">{grant.funding_source}</p>
          </div>
        )}
      </div>

      {grant.description && (
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-1">About this grant</p>
          <p className="text-sm text-slate-600 leading-relaxed">{grant.description}</p>
        </div>
      )}

      {eligList.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-2">Eligibility</p>
          <ul className="grid gap-1.5">
            {eligList.slice(0, 12).map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <Check className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" strokeWidth={2.5} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-100">
        {verifiedText && (
          <span className="text-xs text-slate-400 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md">{verifiedText}</span>
        )}
        {grant.official_source_url && (
          <a href={grant.official_source_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:underline">
            Official source <ExternalLink className="w-3 h-3" />
          </a>
        )}
        <button onClick={onStartApplication}
          className="ml-auto inline-flex items-center gap-1.5 h-8 px-4 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors">
          Start Application →
        </button>
      </div>
    </div>
  )
}

// ── GrantGuidelines ────────────────────────────────────────────────────────

function GrantGuidelines({ grant }: { grant: Grant }) {
  const eligList: string[] = Array.isArray(grant.eligibility_criteria)
    ? (grant.eligibility_criteria as string[])
    : Object.entries(grant.eligibility_criteria as Record<string, unknown>)
        .filter(([, v]) => v !== null && v !== undefined && v !== false)
        .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`)

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Funder</p>
        <p className="text-sm font-semibold text-slate-800">{grant.agency}</p>
      </div>

      {grant.description && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">About</p>
          <p className="text-xs text-slate-600 leading-relaxed">{grant.description}</p>
        </div>
      )}

      {eligList.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Eligibility Requirements</p>
          <ul className="space-y-1.5">
            {eligList.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                <Check className="w-3 h-3 text-blue-500 mt-0.5 shrink-0" strokeWidth={2.5} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {grant.required_documents.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Required Documents</p>
          <ul className="space-y-1.5">
            {grant.required_documents.map((doc, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                <span className="w-3.5 h-3.5 rounded bg-slate-200 text-slate-500 text-[9px] font-bold grid place-items-center shrink-0 mt-0.5">{i + 1}</span>
                {doc}
              </li>
            ))}
          </ul>
        </div>
      )}

      {grant.official_source_url && (
        <div className="pt-1 border-t border-slate-100">
          <a href={grant.official_source_url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:underline">
            View official guidelines <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  )
}

// ── NarrativeBuilderTab ────────────────────────────────────────────────────

type ChatMsg = { role: "user" | "ai"; content: string; isError?: boolean }

export function NarrativeBuilderTab({ grant, userId }: { grant: Grant; userId: string }) {
  const supabase = getBrowserSupabase()
  const [draft, setDraft] = useState("")
  const [lastSavedDraft, setLastSavedDraft] = useState("")
  const [savedBadge, setSavedBadge] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([])
  const [chatInput, setChatInput] = useState("")
  const [genError, setGenError] = useState("")
  const [rightTab, setRightTab] = useState<"guidelines" | "ai-edit">("guidelines")
  const [manualMode, setManualMode] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(supabase as any).from("workspace_drafts").select("narrative_text")
      .eq("user_id", userId).eq("grant_id", grant.id).maybeSingle()
      .then(({ data }: { data: { narrative_text?: string } | null }) => {
        if (data?.narrative_text) { setDraft(data.narrative_text); setLastSavedDraft(data.narrative_text) }
      })
  }, [grant.id, userId, supabase])

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [chatMsgs])

  const persistDraft = useCallback(async (text: string) => {
    if (!text.trim()) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("workspace_drafts").upsert(
      { user_id: userId, grant_id: grant.id, narrative_text: text, generated_at: new Date().toISOString() },
      { onConflict: "user_id,grant_id" }
    )
    setLastSavedDraft(text)
    setSavedBadge(true)
    setTimeout(() => setSavedBadge(false), 2000)
  }, [supabase, userId, grant.id])

  function handleBlur() {
    if (draft === lastSavedDraft) return
    clearTimeout(saveTimerRef.current ?? undefined)
    saveTimerRef.current = setTimeout(() => persistDraft(draft), 500)
  }

  async function handleGenerate() {
    if (draft.trim() && draft !== lastSavedDraft) {
      if (!confirm("Regenerate will overwrite your current draft. Continue?")) return
    }
    setIsGenerating(true)
    setGenError("")
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch("/api/workspace/generate-narrative", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token ?? ""}` },
        body: JSON.stringify({
          grantId: grant.id, grantName: grant.name, agencyName: grant.agency,
          fundingSource: grant.funding_source, grantDescription: grant.description,
          eligibilityRequirements: Array.isArray(grant.eligibility_criteria) ? grant.eligibility_criteria : [],
          grantAmount: grant.max_amount, deadline: grant.deadline,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      const json = await res.json() as { narrative: string }
      setDraft(json.narrative)
      setLastSavedDraft(json.narrative)
      setManualMode(false)
      setChatMsgs([])
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "Generation failed. Please try again.")
    }
    setIsGenerating(false)
  }

  async function handleSend() {
    const msg = chatInput.trim()
    if (!msg || isEditing || !draft.trim()) return
    setChatMsgs((m) => [...m, { role: "user", content: msg }])
    setChatInput("")
    setIsEditing(true)
    const snapshotDraft = draft
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch("/api/workspace/edit-narrative", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token ?? ""}` },
        body: JSON.stringify({ grantId: grant.id, grantName: grant.name, currentDraft: snapshotDraft, userMessage: msg }),
      })
      if (!res.ok) throw new Error(await res.text())
      const reader = res.body?.getReader()
      if (!reader) throw new Error("No stream")
      const dec = new TextDecoder()
      let accumulated = ""
      setDraft("")
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += dec.decode(value, { stream: true })
        setDraft(accumulated)
      }
      setLastSavedDraft(accumulated)
      setChatMsgs((m) => [...m, { role: "ai", content: "✓ Applied" }])
    } catch {
      setDraft(snapshotDraft)
      setChatMsgs((m) => [...m, { role: "ai", content: "Edit failed. Please try again.", isError: true }])
    }
    setIsEditing(false)
  }

  function exportPDF() {
    const win = window.open("", "_blank")
    if (!win) return
    const escaped = draft.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    win.document.write(`<html><head><title>${grant.name} — Narrative</title><style>body{font-family:Georgia,serif;max-width:680px;margin:40px auto;line-height:1.75;font-size:13pt;color:#1e293b}h1{font-size:17pt;margin-bottom:4px}p.sub{color:#64748b;font-size:11pt;margin-top:0}hr{border:none;border-top:1px solid #e2e8f0;margin:24px 0}pre{white-space:pre-wrap;font-family:Georgia,serif;font-size:13pt;margin:0}</style></head><body><h1>${grant.name}</h1><p class="sub">${grant.agency}</p><hr/><pre>${escaped}</pre></body></html>`)
    win.document.close()
    win.print()
  }

  if (!draft && !isGenerating && !manualMode) {
    return (
      <div className="flex" style={{ minHeight: "500px" }}>
        <div className="flex flex-col items-center justify-center border-r border-slate-200 p-8 text-center gap-4" style={{ flex: "0 0 65%" }}>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 grid place-items-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Write your narrative</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Type directly below, or let AI draft a narrative based on this grant&apos;s requirements.</p>
          </div>
          {genError && <p className="text-xs text-rose-600 max-w-xs">{genError}</p>}
          <div className="flex flex-col gap-2 w-full max-w-xs">
            <button onClick={() => setManualMode(true)}
              className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors">
              Start writing
            </button>
            <button onClick={handleGenerate}
              className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
              <Sparkles className="w-4 h-4" /> Generate with AI
            </button>
          </div>
        </div>
        <div className="flex flex-col" style={{ flex: "0 0 35%" }}>
          <div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50 shrink-0 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <p className="text-xs font-semibold text-slate-500">Grant Guidelines</p>
          </div>
          <GrantGuidelines grant={grant} />
        </div>
      </div>
    )
  }

  if (isGenerating) {
    return (
      <div className="flex" style={{ minHeight: "500px" }}>
        <div className="flex flex-col items-center justify-center border-r border-slate-200 p-8 gap-3 text-center" style={{ flex: "0 0 65%" }}>
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-600">Researching grant requirements and drafting narrative…</p>
          <p className="text-xs text-slate-400">This may take up to 30 seconds</p>
        </div>
        <div className="flex flex-col" style={{ flex: "0 0 35%" }}>
          <div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50 shrink-0 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <p className="text-xs font-semibold text-slate-500">Grant Guidelines</p>
          </div>
          <GrantGuidelines grant={grant} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex" style={{ minHeight: "500px" }}>
      {/* Left zone — editable narrative 65% */}
      <div className="flex flex-col border-r border-slate-200" style={{ flex: "0 0 65%" }}>
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50 shrink-0">
          <span className="text-xs font-semibold text-slate-500 truncate mr-2">{grant.name} · draft</span>
          <div className="flex items-center gap-1.5 shrink-0">
            {savedBadge && <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Saved</span>}
            <button onClick={exportPDF}
              className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md border border-slate-200 bg-white text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              <Download className="w-3 h-3" /> Save as PDF
            </button>
            <button onClick={handleGenerate}
              className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md border border-slate-200 bg-white text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              <RefreshCw className="w-3 h-3" /> Regen
            </button>
          </div>
        </div>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleBlur}
          disabled={isEditing}
          className="flex-1 resize-none p-4 text-sm leading-relaxed text-slate-800 bg-white outline-none font-[inherit] disabled:opacity-60"
          style={{ minHeight: "460px" }}
        />
      </div>

      {/* Right zone — Guidelines / AI edit 35% */}
      <div className="flex flex-col" style={{ flex: "0 0 35%" }}>
        <div className="flex border-b border-slate-100 bg-slate-50 shrink-0">
          <button onClick={() => setRightTab("guidelines")}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-semibold border-b-2 transition-colors ${
              rightTab === "guidelines" ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}>
            <BookOpen className="w-3 h-3" /> Guidelines
          </button>
          <button onClick={() => setRightTab("ai-edit")}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-semibold border-b-2 transition-colors ${
              rightTab === "ai-edit" ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}>
            <Sparkles className="w-3 h-3" /> Edit with AI
          </button>
        </div>

        {rightTab === "guidelines" && <GrantGuidelines grant={grant} />}

        {rightTab === "ai-edit" && (
          <>
            <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ minHeight: "380px" }}>
              {chatMsgs.length === 0 && (
                <p className="text-xs text-slate-400 text-center pt-8 leading-relaxed px-2">
                  Ask AI to edit your narrative…<br />
                  e.g. &ldquo;Make the opening more concise&rdquo;
                </p>
              )}
              {chatMsgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[90%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                    m.role === "user" ? "bg-blue-600 text-white" :
                    m.isError ? "bg-rose-50 text-rose-700 border border-rose-200" :
                    "bg-slate-100 text-slate-700"
                  }`}>{m.content}</div>
                </div>
              ))}
              {isEditing && (
                <div className="flex gap-1 px-2 pt-1">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="flex gap-2 p-3 border-t border-slate-100 shrink-0">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                disabled={isEditing}
                placeholder="Ask AI to edit…"
                rows={2}
                className="flex-1 resize-none rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors disabled:opacity-60"
              />
              <button onClick={handleSend} disabled={!chatInput.trim() || isEditing || !draft.trim()}
                className="self-end h-9 w-9 rounded-lg bg-blue-600 text-white grid place-items-center hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── FormsTab ───────────────────────────────────────────────────────────────

const FORM_REGISTRY: Array<{ match: RegExp; key: string }> = [
  { match: /sf[-\s]?424\b(?![\s-]?[abcd])/i, key: "sf-424"  },
  { match: /sf[-\s]?424[\s-]?a\b/i,           key: "sf-424a" },
  { match: /sf[-\s]?424[\s-]?b\b/i,           key: "sf-424b" },
  { match: /sf[-\s]?lll\b/i,                  key: "sf-lll"  },
]

function matchFormKey(doc: string): string | null {
  for (const { match, key } of FORM_REGISTRY) {
    if (match.test(doc)) return key
  }
  return null
}

type ProfileSeed = { full_name?: string; email?: string; phone_number?: string; state?: string; zip_code?: string } | null

function buildSeed(profile: ProfileSeed, grant: Grant): Record<string, string> {
  const seed: Record<string, string> = {}
  if (!profile) return seed
  const fullName = (profile.full_name ?? "").trim()
  if (fullName) {
    const parts = fullName.split(/\s+/)
    seed.legal_name     = fullName
    seed.applicant_name = fullName
    seed.entity_name    = fullName
    seed.contact_first  = parts[0] ?? ""
    seed.contact_last   = parts.length > 1 ? parts[parts.length - 1] : ""
    seed.auth_first     = parts[0] ?? ""
    seed.auth_last      = parts.length > 1 ? parts[parts.length - 1] : ""
    seed.auth_signature = fullName
    seed.signature      = fullName
    seed.sig_name       = fullName
  }
  if (profile.email)        { seed.contact_email = profile.email; seed.auth_email = profile.email }
  if (profile.phone_number) { seed.contact_tel   = profile.phone_number; seed.auth_tel = profile.phone_number; seed.sig_tel = profile.phone_number }
  if (profile.state)        { seed.addr_state    = profile.state;  seed.entity_state = profile.state }
  if (profile.zip_code)     { seed.addr_zip      = profile.zip_code; seed.entity_zip = profile.zip_code }
  if (grant.agency)         { seed.federal_agency = grant.agency;  seed.fed_dept = grant.agency }
  if (grant.name)           { seed.cfda_title    = grant.name;     seed.foa_title = grant.name; seed.project_title = grant.name }
  return seed
}

export function FormsTab({ grant, userId }: { grant: Grant; userId: string }) {
  const supabase = getBrowserSupabase()
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set())
  const [downloading, setDownloading] = useState(false)
  const [dlError, setDlError] = useState("")
  const [step, setStep] = useState(0)
  const [seed, setSeed] = useState<Record<string, string>>({})
  const [formValues, setFormValues] = useState<Record<number, Record<string, string>>>({})

  const docs = grant.required_documents
  const total = docs.length

  // Load saved form values from localStorage
  useEffect(() => {
    const saved: Record<number, Record<string, string>> = {}
    for (let i = 0; i < docs.length; i++) {
      const raw = localStorage.getItem(`workspace:${grant.slug}:form:${i}`)
      if (raw) { try { saved[i] = JSON.parse(raw) } catch { /* ignore */ } }
    }
    if (Object.keys(saved).length) setFormValues(saved)
  }, [grant.slug, docs.length])

  function getFormValues(i: number): Record<string, string> {
    return { ...seed, ...formValues[i] }
  }

  function handleFormChange(i: number, k: string, v: string) {
    setFormValues(prev => {
      const next = { ...prev, [i]: { ...(prev[i] ?? {}), [k]: v } }
      localStorage.setItem(`workspace:${grant.slug}:form:${i}`, JSON.stringify(next[i]))
      return next
    })
  }

  // Checklist from Supabase
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(supabase as any).from("workspace_checklist").select("checked_items")
      .eq("user_id", userId).eq("grant_id", grant.id).maybeSingle()
      .then(({ data }: { data: { checked_items?: number[] } | null }) => {
        if (Array.isArray(data?.checked_items)) setCheckedItems(new Set(data.checked_items as number[]))
      })
  }, [grant.id, userId, supabase])

  // Profile autofill seed
  useEffect(() => {
    supabase.from("profiles")
      .select("full_name, email, phone_number, state, zip_code")
      .eq("user_id", userId).maybeSingle()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(({ data }: { data: any }) => setSeed(buildSeed(data as ProfileSeed, grant)))
  }, [userId, grant, supabase])

  async function toggleItem(i: number) {
    setCheckedItems((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      const arr = [...next]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(supabase as any).from("workspace_checklist").upsert(
        { user_id: userId, grant_id: grant.id, checked_items: arr, updated_at: new Date().toISOString() },
        { onConflict: "user_id,grant_id" }
      )
      return next
    })
  }

  async function handlePrefill() {
    setDownloading(true)
    setDlError("")
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch("/api/grants/prefill", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token ?? ""}` },
        body: JSON.stringify({ grantSlug: grant.slug }),
      })
      if (!res.ok) throw new Error(await res.text())
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = Object.assign(document.createElement("a"), { href: url, download: `${grant.slug}-prefilled.pdf` })
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setDlError(err instanceof Error ? err.message : "Download failed. Please try again.")
    }
    setDownloading(false)
  }

  // No required documents — just show the SF-424 download
  if (total === 0) {
    return (
      <div className="p-5">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm font-semibold text-slate-800">Download Pre-filled SF-424</p>
            <p className="text-xs text-slate-500 mt-0.5">Auto-populated from your profile</p>
            {dlError && <p className="text-xs text-rose-600 mt-2">{dlError}</p>}
          </div>
          <button onClick={handlePrefill} disabled={downloading}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors shrink-0">
            {downloading ? <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating…</> : <><Download className="w-3.5 h-3.5" /> Download</>}
          </button>
        </div>
      </div>
    )
  }

  const currentDoc = docs[step]
  const currentFormKey = matchFormKey(currentDoc)
  const allDone = checkedItems.size === total

  return (
    <div className="flex flex-col">
      {/* Step indicator */}
      <div className="px-5 pt-4 pb-3 border-b border-slate-100 bg-slate-50 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-slate-500">
            Step {step + 1} of {total}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 tabular-nums">{checkedItems.size}/{total} complete</span>
            <button onClick={handlePrefill} disabled={downloading}
              className="inline-flex items-center gap-1 h-6 px-2.5 rounded-md border border-slate-200 bg-white text-[11px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60 transition-colors">
              {downloading ? <span className="w-2.5 h-2.5 border border-slate-400 border-t-transparent rounded-full animate-spin" /> : <Download className="w-2.5 h-2.5" />}
              SF-424
            </button>
            {dlError && <span className="text-[10px] text-rose-500">{dlError}</span>}
          </div>
        </div>
        {/* Step dots */}
        <div className="flex items-center">
          {docs.map((_, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <button onClick={() => setStep(i)}
                className={`w-7 h-7 rounded-full text-[11px] font-bold transition-all flex-none grid place-items-center ${
                  i === step
                    ? "bg-blue-600 text-white ring-4 ring-blue-100"
                    : checkedItems.has(i)
                    ? "bg-emerald-500 text-white hover:bg-emerald-600"
                    : "bg-slate-200 text-slate-500 hover:bg-slate-300"
                }`}>
                {checkedItems.has(i) && i !== step ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : i + 1}
              </button>
              {i < docs.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 rounded-full ${checkedItems.has(i) ? "bg-emerald-400" : "bg-slate-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current step content */}
      <div className="flex-1">
        {currentFormKey ? (
          <GovFormFiller
            formKey={currentFormKey}
            values={getFormValues(step)}
            onChange={(k, v) => handleFormChange(step, k, v)}
            onReady={() => toggleItem(step)}
            isReady={checkedItems.has(step)}
          />
        ) : (
          <div className="p-6 flex flex-col gap-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Required Document</p>
              <p className="text-lg font-semibold text-slate-900 leading-snug">{currentDoc}</p>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Prepare this document, then mark it ready when it&apos;s complete.
            </p>
            <button onClick={() => toggleItem(step)}
              className={`self-start inline-flex items-center gap-2.5 h-10 px-5 rounded-xl text-sm font-semibold border-2 transition-colors ${
                checkedItems.has(step)
                  ? "bg-emerald-50 border-emerald-400 text-emerald-700"
                  : "bg-white border-slate-300 text-slate-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
              }`}>
              <span className={`w-5 h-5 rounded-md grid place-items-center border-2 flex-none transition-colors ${
                checkedItems.has(step) ? "bg-emerald-500 border-emerald-500 text-white" : "border-current"
              }`}>
                {checkedItems.has(step) && <Check className="w-3 h-3" strokeWidth={3} />}
              </span>
              {checkedItems.has(step) ? "Marked as ready" : "Mark as ready"}
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50 shrink-0">
        <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}
          className="inline-flex items-center gap-1 h-9 px-3.5 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        {step < total - 1 ? (
          <button onClick={() => setStep((s) => s + 1)}
            className="inline-flex items-center gap-1 h-9 px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <span className={`text-sm font-semibold ${allDone ? "text-emerald-600" : "text-slate-400"}`}>
            {allDone ? "All documents ready ✓" : `${total - checkedItems.size} remaining`}
          </span>
        )}
      </div>
    </div>
  )
}

// ── NotesTab ───────────────────────────────────────────────────────────────

export function NotesTab({ grant, userId }: { grant: Grant; userId: string }) {
  const supabase = getBrowserSupabase()
  const [notes, setNotes] = useState("")
  const [savedNotes, setSavedNotes] = useState("")
  const [savedBadge, setSavedBadge] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(supabase as any).from("workspace_notes").select("content")
      .eq("user_id", userId).eq("grant_id", grant.id).maybeSingle()
      .then(({ data }: { data: { content?: string } | null }) => {
        if (data?.content) { setNotes(data.content); setSavedNotes(data.content) }
      })
  }, [grant.id, userId, supabase])

  function handleBlur() {
    if (notes === savedNotes) return
    clearTimeout(saveTimerRef.current ?? undefined)
    saveTimerRef.current = setTimeout(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("workspace_notes").upsert(
        { user_id: userId, grant_id: grant.id, content: notes, updated_at: new Date().toISOString() },
        { onConflict: "user_id,grant_id" }
      )
      setSavedNotes(notes)
      setSavedBadge(true)
      setTimeout(() => setSavedBadge(false), 2000)
    }, 500)
  }

  return (
    <div className="p-4">
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50">
          <span className="text-xs font-semibold text-slate-500 truncate">Notes — {grant.name}</span>
          {savedBadge && <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0 ml-2">Saved</span>}
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={handleBlur}
          placeholder="Jot down notes, deadlines, contact info, or anything else relevant to this application…"
          className="w-full p-4 text-sm leading-relaxed text-slate-800 bg-transparent outline-none resize-none font-[inherit]"
          style={{ minHeight: "340px" }}
        />
      </div>
    </div>
  )
}
