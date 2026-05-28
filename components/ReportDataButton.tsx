"use client"

import { useMemo, useRef, useState } from "react"
import { Flag, X } from "lucide-react"
import { getBrowserSupabase } from "@/lib/supabase-browser"

type Issue = "wrong_deadline" | "wrong_amount" | "program_closed" | "broken_link" | "other"

const ISSUE_LABELS: Record<Issue, string> = {
  wrong_deadline: "Deadline is wrong",
  wrong_amount: "Award amount is wrong",
  program_closed: "Program is closed / no longer active",
  broken_link: "Apply or source link is broken",
  other: "Other issue",
}

interface Props {
  slug: string
  type: "grant" | "benefit"
}

export default function ReportDataButton({ slug, type }: Props) {
  const [open, setOpen] = useState(false)
  const [issue, setIssue] = useState<Issue | "">("")
  const [note, setNote] = useState("")
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle")
  const supabase = useMemo(() => getBrowserSupabase(), [])
  const formRef = useRef<HTMLDivElement>(null)

  async function submit() {
    if (!issue) return
    setStatus("sending")

    const { data: { user } } = await supabase.auth.getUser()

    const res = await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        program_slug: slug,
        program_type: type,
        issue,
        note: note.trim() || null,
        user_id: user?.id ?? null,
      }),
    })

    if (res.ok) {
      setStatus("done")
    } else {
      setStatus("error")
    }
  }

  function reset() {
    setOpen(false)
    setIssue("")
    setNote("")
    setStatus("idle")
  }

  return (
    <div className="mt-1">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          <Flag className="h-3 w-3" />
          Report incorrect data
        </button>
      ) : (
        <div
          ref={formRef}
          className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="font-medium text-slate-700">What&apos;s incorrect?</span>
            <button onClick={reset} className="text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>

          {status === "done" ? (
            <div className="text-emerald-700">
              Thanks — we&apos;ll review this and update the record.
            </div>
          ) : (
            <>
              <div className="space-y-1.5 mb-3">
                {(Object.entries(ISSUE_LABELS) as [Issue, string][]).map(([value, label]) => (
                  <label key={value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="report-issue"
                      value={value}
                      checked={issue === value}
                      onChange={() => setIssue(value)}
                      className="accent-blue-600"
                    />
                    <span className="text-slate-700">{label}</span>
                  </label>
                ))}
              </div>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional: add details (e.g. correct deadline, correct URL)"
                rows={2}
                maxLength={500}
                className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 placeholder-slate-400 focus:border-blue-400 focus:outline-none resize-none mb-3"
              />

              {status === "error" && (
                <p className="mb-2 text-xs text-rose-600">Something went wrong — please try again.</p>
              )}

              <button
                onClick={submit}
                disabled={!issue || status === "sending"}
                className="rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700 disabled:opacity-40"
              >
                {status === "sending" ? "Sending…" : "Submit report"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
