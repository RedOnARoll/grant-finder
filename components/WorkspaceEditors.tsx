"use client"

import { useRef, useState } from "react"
import { Check, ChevronDown, Copy, Download, FileText, RefreshCw, Sparkles } from "lucide-react"
import type { Grant } from "@/lib/types"

export const QUESTIONS = [
  { key: "org",      label: "Describe your organization and its mission",  placeholder: "Who you are, who you serve, how long you've operated, and why you're positioned to do this work.",    required: true  },
  { key: "project",  label: "What will this grant fund?",                  placeholder: "The specific project, activities, timeline, people involved, and how it fits this program's goals.",  required: true  },
  { key: "funding",  label: "How will the funds be used?",                 placeholder: "Main expense categories and why each cost is necessary. Include estimates, vendors, staffing, or materials.", required: true  },
  { key: "outcomes", label: "What outcomes do you expect?",                placeholder: "Concrete measurable results: people served, jobs created, outputs delivered, or other impacts.",        required: true  },
  { key: "extra",    label: "Anything else the reviewer should know?",     placeholder: "Eligibility details, partnerships, prior awards, matching funds, community support, or special circumstances.", required: false },
]

const EDIT_CHIPS = [
  "Make it more concise",
  "Strengthen the budget justification",
  "Add more community impact",
  "Use a more formal tone",
]

function docGuidance(title: string): { what: string; how: string } {
  const t = title.toLowerCase()
  if (t.includes("budget") || t.includes("matching funds")) return {
    what: "A line-item breakdown of how you plan to spend the grant funds.",
    how: "List all expense categories with amounts and justifications. Show any matching funds or in-kind contributions separately.",
  }
  if (t.includes("narrative") || t.includes("proposal") || t.includes("project description")) return {
    what: "The written case for your project: goals, activities, timeline, and expected impact.",
    how: "Follow the funder's review criteria as your outline. Answer each criterion directly and stay within any page limit.",
  }
  if (t.includes("sf-424") || t.includes("application form") || t.includes("cover")) return {
    what: "The standard application cover form with applicant info and project summary.",
    how: "Download the current version from the funder's portal. Complete it last — after your narrative and budget are final — so all totals match.",
  }
  if (t.includes("letter of support") || t.includes("letter of intent") || t.includes("partner")) return {
    what: "Signed letters from partners confirming their support or participation in your project.",
    how: "Ask partners for letters on official letterhead naming the grant, their role, and any committed resources. Request signatures at least two weeks before the deadline.",
  }
  if (t.includes("registration") || t.includes("incorporation") || t.includes("ein") || t.includes("organization")) return {
    what: "Proof your organization legally exists and is authorized to operate.",
    how: "Use your Secretary of State formation document plus your IRS EIN letter. Federal grants also require an active SAM.gov registration and UEI.",
  }
  if (t.includes("tax") || t.includes("990") || t.includes("financial statement")) return {
    what: "Your organization's financial records demonstrating fiscal health and responsibility.",
    how: "Use the most recently filed tax return or audited statement. Ensure figures are consistent with the budget you're submitting.",
  }
  if (t.includes("resume") || t.includes("biosketch") || t.includes("cv") || t.includes("staff")) return {
    what: "Brief professional profiles for key personnel who will lead the project.",
    how: "Keep each to two pages maximum. Highlight experience relevant to this grant's work. Use the funder's required format if one is specified.",
  }
  return {
    what: "A supporting document required for this grant application.",
    how: "Review the official grant announcement or program guidelines for specific format, length, and content requirements.",
  }
}

// ── DocEditor ──────────────────────────────────────────────────────────────

interface DocEditorProps {
  grant: Grant
  index: number
  isReady: boolean
  toggleReady: () => void
  text: string
  onTextChange: (v: string) => void
  attached: string | null
  onAttach: (name: string | null) => void
}

export function DocEditor({ grant, index, isReady, toggleReady, text, onTextChange, attached, onAttach }: DocEditorProps) {
  const title = grant.required_documents[index] ?? ""
  const docCount = grant.required_documents.length
  const { what, how } = docGuidance(title)
  const [guideOpen, setGuideOpen] = useState(true)
  const fileRef = useRef<HTMLInputElement>(null)

  function exportTxt() {
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([`${title}\n\n${text}`], { type: "text/plain" })),
      download: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) + ".txt",
    })
    a.click()
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white grid place-items-center flex-none">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Document {index + 1} of {docCount}</p>
            <p className="text-sm font-semibold text-slate-900 truncate">{title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-none">
          <button onClick={exportTxt} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-white transition-colors">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button onClick={toggleReady} className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold transition-colors ${isReady ? "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
            {isReady ? <><Check className="w-3.5 h-3.5" /> Ready</> : <>Mark ready</>}
          </button>
        </div>
      </div>

      <div className="border-b border-slate-100">
        <button onClick={() => setGuideOpen(o => !o)} className="w-full flex items-center gap-2.5 px-5 py-3 text-left hover:bg-slate-50 transition-colors">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span className="flex-1 text-xs font-semibold text-slate-700">What this is &amp; how to get it</span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${guideOpen ? "rotate-180" : ""}`} />
        </button>
        {guideOpen && (
          <div className="px-5 pb-4 grid gap-3">
            {([["What it is", what, "bg-blue-500"], ["How to get it", how, "bg-amber-400"]] as const).map(([label, body, dot]) => (
              <div key={label} className="flex gap-2.5">
                <span className="flex-none mt-2"><span className={`block w-1.5 h-1.5 rounded-full ${dot}`} /></span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">{label}</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-5 bg-slate-50">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden max-w-2xl mx-auto">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-400">Working draft</span>
            <span className="text-xs text-slate-400 tabular-nums">{text.trim() ? text.trim().split(/\s+/).length : 0} words</span>
          </div>
          <textarea value={text} onChange={e => onTextChange(e.target.value)}
            placeholder={`Draft or paste notes for "${title}" — what you'll need, field values, or content you'll transfer to the official form.`}
            className="w-full min-h-[260px] resize-y p-4 text-sm leading-relaxed text-slate-800 bg-transparent outline-none font-[inherit]" />
        </div>

        <div className="max-w-2xl mx-auto mt-3">
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) onAttach(f.name) }} />
          {attached ? (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 grid place-items-center flex-none"><FileText className="w-4 h-4" /></div>
              <span className="flex-1 text-sm font-semibold text-slate-800 truncate">{attached}</span>
              <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md">Attached</span>
              <button onClick={() => onAttach(null)} className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors">Remove</button>
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed border-slate-200 bg-white text-sm font-semibold text-slate-400 hover:border-blue-400 hover:text-blue-600 transition-colors">
              <Download className="w-4 h-4 rotate-180" /> Attach the completed file
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── NarrativeEditor ────────────────────────────────────────────────────────

export interface NarrativeEditorProps {
  grant: Grant
  answers: Record<string, string>
  setAnswer: (k: string, v: string) => void
  gen: "idle" | "generating" | "done"
  narrative: string
  editsLeft: number
  maxEdits: number
  editText: string
  setEditText: (v: string) => void
  copied: boolean
  onGenerate: () => void
  onEdit: () => void
  onCopy: () => void
  onExport: () => void
  onNewDraft: () => void
}

export function NarrativeEditor({ grant, answers, setAnswer, gen, narrative, editsLeft, maxEdits, editText, setEditText, copied, onGenerate, onEdit, onCopy, onExport, onNewDraft }: NarrativeEditorProps) {
  const reqDone = QUESTIONS.filter(q => q.required && answers[q.key]?.trim()).length
  const reqTotal = QUESTIONS.filter(q => q.required).length
  const allAnswered = reqDone === reqTotal
  const busy = gen === "generating"

  return (
    <div className="grid gap-5">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Application questions</h2>
            <p className="text-sm text-slate-500 mt-0.5">Answer these once — your responses feed the AI draft.</p>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg flex-none ${allAnswered ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
            {reqDone}/{reqTotal} answered
          </span>
        </div>
        <div className="p-5 grid gap-5">
          {QUESTIONS.map((q, i) => {
            const filled = (answers[q.key] ?? "").trim().length > 0
            return (
              <div key={q.key}>
                <label className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-800">
                  <span className={`w-5 h-5 rounded-full grid place-items-center text-[11px] font-bold flex-none transition-colors ${filled ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-400"}`}>
                    {filled ? <Check className="w-3 h-3" strokeWidth={3} /> : i + 1}
                  </span>
                  {q.label}
                  {!q.required && <span className="font-normal text-slate-400 text-xs">· optional</span>}
                </label>
                <textarea rows={3} value={answers[q.key] ?? ""} onChange={e => setAnswer(q.key, e.target.value)}
                  placeholder={q.placeholder}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 leading-relaxed resize-none outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors" />
              </div>
            )
          })}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white grid place-items-center flex-none"><Sparkles className="w-4 h-4" /></div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Application draft</h2>
              <p className="text-xs text-slate-500">{maxEdits} AI edit rounds included</p>
            </div>
          </div>
          {gen === "done" && (
            <div className="flex items-center gap-1.5 flex-none">
              <button onClick={onExport} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-white transition-colors"><Download className="w-3.5 h-3.5" /> Export</button>
              <button onClick={onCopy} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-white transition-colors">
                {copied ? <><Check className="w-3.5 h-3.5 text-emerald-600" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
              </button>
              <button onClick={onNewDraft} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-white transition-colors"><RefreshCw className="w-3.5 h-3.5" /> New</button>
            </div>
          )}
        </div>

        {gen === "idle" ? (
          <div className="p-5">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-6 text-center mb-4">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 grid place-items-center mx-auto mb-3 text-slate-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-slate-600">{allAnswered ? "Ready to generate your draft" : "Answer the required questions to unlock your draft"}</p>
            </div>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <ul className="flex flex-wrap gap-4 text-xs text-slate-500">
                {["Summary · need · goals", "Budget justification", `${maxEdits} AI edit rounds`].map(f => (
                  <li key={f} className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-500" strokeWidth={2.5} />{f}</li>
                ))}
              </ul>
              <button onClick={onGenerate} disabled={!allAnswered}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <Sparkles className="w-4 h-4" /> Generate draft
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="px-5 py-3 flex items-center justify-between bg-slate-50 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500">{grant.name} — draft narrative</span>
              {gen === "done" && <span className="text-xs text-slate-400 tabular-nums">{narrative.trim().split(/\s+/).length} words</span>}
            </div>
            <div className="max-h-96 overflow-y-auto p-6">
              <div className="max-w-2xl text-[15px] leading-[1.75] text-slate-800 whitespace-pre-wrap">
                {narrative.split(/\n\n+/).map((block, i, arr) => {
                  const isHead = /^[A-Z][A-Z0-9 &\-/]{3,}$/.test(block.split("\n")[0].trim()) && block.split("\n").length === 1
                  return isHead
                    ? <div key={i} className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 mt-5 mb-1 first:mt-0">{block}</div>
                    : <p key={i} className="mt-3 first:mt-0">{block}{busy && i === arr.length - 1 && <span className="inline-block w-0.5 h-[1em] bg-blue-600 ml-0.5 align-text-bottom rounded-sm animate-pulse" />}</p>
                })}
              </div>
            </div>
          </div>
        )}

        {gen === "done" && !busy && editsLeft > 0 && (
          <div className="p-5 border-t border-slate-100 bg-slate-50">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-blue-500" /> Refine with AI</span>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                Edits left
                <span className="flex gap-1 ml-1">{Array.from({ length: maxEdits }).map((_, i) => <span key={i} className={`w-2 h-2 rounded-full ${i < editsLeft ? "bg-blue-500" : "bg-slate-200"}`} />)}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {EDIT_CHIPS.map(c => (
                <button key={c} onClick={() => setEditText(c)}
                  className="text-xs font-medium px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600 hover:border-blue-400 hover:text-blue-700 transition-colors">
                  {c}
                </button>
              ))}
            </div>
            <div className="flex gap-2 items-end">
              <textarea rows={2} value={editText} onChange={e => setEditText(e.target.value)}
                placeholder="Describe a change — e.g. tighten the statement of need and lead with the jobs number."
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 resize-none outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors" />
              <button onClick={onEdit} disabled={!editText.trim()}
                className="h-[70px] px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-none">
                Apply →
              </button>
            </div>
          </div>
        )}
        {gen === "done" && editsLeft === 0 && (
          <div className="px-5 py-3 border-t border-slate-100 text-sm text-amber-700 bg-amber-50 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> All {maxEdits} edits used.{" "}
            <button onClick={onNewDraft} className="font-bold underline text-slate-800">Start a new draft</button>
          </div>
        )}
      </div>
    </div>
  )
}
