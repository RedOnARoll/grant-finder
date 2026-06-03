"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Check, Download, ExternalLink, RefreshCw, Send, Sparkles } from "lucide-react"
import type { Grant } from "@/lib/types"
import { getBrowserSupabase } from "@/lib/supabase-browser"

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
  const eligList = Array.isArray(grant.eligibility_criteria)
    ? grant.eligibility_criteria as string[]
    : Object.entries(grant.eligibility_criteria as Record<string, unknown>)
        .filter(([, v]) => v !== null && v !== undefined && v !== false)
        .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`)

  return (
    <div className="p-5 grid gap-4">
      {/* Meta row */}
      <div className="flex flex-wrap gap-3">
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex-1 min-w-32">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Funder</p>
          <p className="text-sm font-semibold text-slate-800 mt-0.5">{grant.agency}</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex-1 min-w-32">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Max Award</p>
          <p className="text-sm font-semibold text-blue-700 mt-0.5">{fmtAmt(grant.max_amount)}</p>
        </div>
        {grant.funding_source && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex-1 min-w-32">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Source</p>
            <p className="text-sm font-semibold text-slate-800 mt-0.5 capitalize">{grant.funding_source}</p>
          </div>
        )}
      </div>

      {/* Description */}
      {grant.description && (
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-1">About this grant</p>
          <p className="text-sm text-slate-600 leading-relaxed">{grant.description}</p>
        </div>
      )}

      {/* Eligibility checklist */}
      {eligList.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-2">Eligibility</p>
          <ul className="grid gap-1.5">
            {eligList.slice(0, 10).map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <Check className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" strokeWidth={2.5} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer row */}
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
  const [loadError, setLoadError] = useState("")
  const chatEndRef = useRef<HTMLDivElement>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Load existing draft from Supabase
  useEffect(() => {
    supabase.from("workspace_drafts").select("narrative_text")
      .eq("user_id", userId).eq("grant_id", grant.id).maybeSingle()
      .then(({ data }) => { if (data?.narrative_text) { setDraft(data.narrative_text); setLastSavedDraft(data.narrative_text) } })
  }, [grant.id, userId, supabase])

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [chatMsgs])

  const autoSave = useCallback(async (text: string) => {
    if (!text.trim()) return
    await supabase.from("workspace_drafts").upsert(
      { user_id: userId, grant_id: grant.id, narrative_text: text, generated_at: new Date().toISOString() },
      { onConflict: "user_id,grant_id" }
    )
    setLastSavedDraft(text)
    setSavedBadge(true)
    setTimeout(() => setSavedBadge(false), 2000)
  }, [supabase, userId, grant.id])

  function handleTextareaBlur() {
    if (draft === lastSavedDraft) return
    clearTimeout(saveTimerRef.current ?? undefined)
    saveTimerRef.current = setTimeout(() => autoSave(draft), 500)
  }

  async function handleGenerate() {
    const isDirty = draft.trim() && draft !== lastSavedDraft
    if (isDirty && !confirm("Regenerate will overwrite your current draft. Continue?")) return
    setIsGenerating(true)
    setLoadError("")
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
      const { narrative } = await res.json() as { narrative: string }
      setDraft(narrative)
      setLastSavedDraft(narrative)
      setChatMsgs([])
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Generation failed. Please try again.")
    }
    setIsGenerating(false)
  }

  async function handleSend() {
    const msg = chatInput.trim()
    if (!msg || isEditing || !draft.trim()) return
    const userMsg: ChatMsg = { role: "user", content: msg }
    setChatMsgs((m) => [...m, userMsg])
    setChatInput("")
    setIsEditing(true)
    const currentDraft = draft
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch("/api/workspace/edit-narrative", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token ?? ""}` },
        body: JSON.stringify({ grantId: grant.id, grantName: grant.name, currentDraft, userMessage: msg }),
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
    } catch (err) {
      setDraft(currentDraft)
      setChatMsgs((m) => [...m, { role: "ai", content: "Edit failed. Please try again.", isError: true }])
    }
    setIsEditing(false)
  }

  function exportPDF() {
    const orgName = ""
    const win = window.open("", "_blank")
    if (!win) return
    win.document.write(`<html><head><title>${grant.name} — Narrative</title><style>body{font-family:Georgia,serif;max-width:700px;margin:40px auto;line-height:1.7;font-size:13pt;color:#1e293b}h1{font-size:18pt;margin-bottom:4px}p.sub{color:#64748b;font-size:11pt;margin-top:0}hr{border:none;border-top:1px solid #e2e8f0;margin:24px 0}pre{white-space:pre-wrap;font-family:Georgia,serif;font-size:13pt;margin:0}</style></head><body><h1>${grant.name}</h1><p class="sub">${grant.agency}${orgName ? ` · ${orgName}` : ""}</p><hr/><pre>${draft.replace(/</g, "&lt;")}</pre></body></html>`)
    win.document.close()
    win.print()
  }

  if (!draft && !isGenerating) {
    return (
      <div className="p-5 flex flex-col items-center justify-center min-h-48 text-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 grid place-items-center">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">Generate Narrative</p>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">AI will research this grant's requirements and draft a narrative using your profile.</p>
        </div>
        {loadError && <p className="text-xs text-rose-600">{loadError}</p>}
        <button onClick={handleGenerate}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
          <Sparkles className="w-4 h-4" /> Generate Narrative
        </button>
      </div>
    )
  }

  if (isGenerating) {
    return (
      <div className="p-5 flex flex-col items-center justify-center min-h-48 gap-3 text-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-600">Researching grant requirements and drafting your narrative…</p>
        <p className="text-xs text-slate-400">This may take up to 30 seconds</p>
      </div>
    )
  }

  return (
    <div className="flex" style={{ minHeight: "480px" }}>
      {/* Left zone — editable narrative (65%) */}
      <div className="flex flex-col border-r border-slate-100" style={{ flex: "0 0 65%" }}>
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50">
          <span className="text-xs font-semibold text-slate-500">{grant.name} · draft</span>
          <div className="flex items-center gap-1.5">
            {savedBadge && <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Saved</span>}
            <button onClick={exportPDF} title="Export as PDF"
              className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md border border-slate-200 text-xs font-medium text-slate-600 hover:bg-white transition-colors">
              <Download className="w-3 h-3" /> PDF
            </button>
            <button onClick={handleGenerate} title="Regenerate from scratch"
              className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md border border-slate-200 text-xs font-medium text-slate-600 hover:bg-white transition-colors">
              <RefreshCw className="w-3 h-3" /> Regen
            </button>
          </div>
        </div>
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleTextareaBlur}
          disabled={isEditing}
          className="flex-1 resize-none p-4 text-sm leading-relaxed text-slate-800 bg-white outline-none font-[inherit] disabled:opacity-60"
          style={{ minHeight: "440px" }}
        />
      </div>
      {/* Right zone — AI chat panel (35%) */}
      <div className="flex flex-col" style={{ flex: "0 0 35%" }}>
        <div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50">
          <p className="text-xs font-semibold text-slate-500">Edit with AI</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ minHeight: "380px" }}>
          {chatMsgs.length === 0 && (
            <p className="text-xs text-slate-400 text-center pt-6">Ask AI to edit your narrative…<br />e.g. "Make the opening more concise"</p>
          )}
          {chatMsgs.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[90%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                m.role === "user" ? "bg-blue-600 text-white" :
                m.isError ? "bg-rose-50 text-rose-700 border border-rose-200" :
                "bg-slate-100 text-slate-700"
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {isEditing && (
            <div className="flex gap-1 px-1">
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="flex gap-2 p-3 border-t border-slate-100">
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
            className="self-end h-9 w-9 rounded-lg bg-blue-600 text-white grid place-items-center hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── FormsTab ───────────────────────────────────────────────────────────────

const PREFILL_FIELDS = ["Name", "Email", "Phone", "State", "ZIP code"]

export function FormsTab({ grant, userId }: { grant: Grant; userId: string }) {
  const supabase = getBrowserSupabase()
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set())
  const [downloading, setDownloading] = useState(false)
  const [dlError, setDlError] = useState("")

  useEffect(() => {
    supabase.from("workspace_checklist").select("checked_items")
      .eq("user_id", userId).eq("grant_id", grant.id).maybeSingle()
      .then(({ data }) => {
        if (Array.isArray(data?.checked_items)) setCheckedItems(new Set(data.checked_items as number[]))
      })
  }, [grant.id, userId, supabase])

  async function toggleItem(i: number) {
    setCheckedItems((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      const arr = [...next]
      supabase.from("workspace_checklist").upsert(
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

  return (
    <div className="p-5 grid gap-5">
      {/* Pre-filled PDF */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm font-semibold text-slate-800">Download Pre-filled PDF</p>
            <p className="text-xs text-slate-500 mt-0.5">Auto-populated from your profile</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {PREFILL_FIELDS.map((f) => (
                <span key={f} className="text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md">{f}</span>
              ))}
            </div>
            {dlError && <p className="text-xs text-rose-600 mt-2">{dlError}</p>}
          </div>
          <button onClick={handlePrefill} disabled={downloading}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex-none">
            {downloading ? <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating…</> : <><Download className="w-3.5 h-3.5" /> Download</>}
          </button>
        </div>
      </div>

      {/* Required documents checklist */}
      {grant.required_documents.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-800">Required Documents</p>
            <span className="text-xs font-semibold text-slate-400 tabular-nums">{checkedItems.size}/{grant.required_documents.length} ready</span>
          </div>
          <div className="grid gap-1.5">
            {grant.required_documents.map((doc, i) => (
              <button key={i} onClick={() => toggleItem(i)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-left">
                <span className={`w-5 h-5 rounded-md grid place-items-center flex-none border-2 transition-colors ${checkedItems.has(i) ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 bg-white"}`}>
                  {checkedItems.has(i) && <Check className="w-3 h-3" strokeWidth={3} />}
                </span>
                <span className={`text-sm flex-1 leading-tight ${checkedItems.has(i) ? "line-through text-slate-400" : "text-slate-700"}`}>{doc}</span>
              </button>
            ))}
          </div>
        </div>
      )}
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
    supabase.from("workspace_notes").select("content")
      .eq("user_id", userId).eq("grant_id", grant.id).maybeSingle()
      .then(({ data }) => { if (data?.content) { setNotes(data.content); setSavedNotes(data.content) } })
  }, [grant.id, userId, supabase])

  function handleBlur() {
    if (notes === savedNotes) return
    clearTimeout(saveTimerRef.current ?? undefined)
    saveTimerRef.current = setTimeout(async () => {
      await supabase.from("workspace_notes").upsert(
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
          <span className="text-xs font-semibold text-slate-500">Notes — {grant.name}</span>
          {savedBadge && <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Saved</span>}
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={handleBlur}
          placeholder="Jot down notes, deadlines, contact info, or anything else relevant to this application…"
          className="w-full p-4 text-sm leading-relaxed text-slate-800 bg-transparent outline-none resize-none font-[inherit]"
          style={{ minHeight: "320px" }}
        />
      </div>
    </div>
  )
}
