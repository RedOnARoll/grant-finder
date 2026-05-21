"use client"

import { useEffect, useState } from "react"
import { X, ExternalLink } from "lucide-react"

interface PreApplyModalProps {
  program: {
    slug: string
    type: "grant" | "benefit"
    name: string
    agency: string
    applicationUrl?: string | null
    officialSourceUrl?: string | null
    requiredDocuments?: string[]
  }
  isOpen: boolean
  onClose: () => void
}

type Intent = "today" | "this_week" | "this_month" | "just_looking"

const INTENT_LABELS: Record<Intent, string> = {
  today: "Today",
  this_week: "This week",
  this_month: "This month",
  just_looking: "Just looking",
}

const DEFAULT_GRANT_DOCS = [
  "Cover letter / project abstract",
  "Project narrative",
  "Budget and budget justification",
  "EIN and organization information",
  "Letters of support",
]

const DEFAULT_BENEFIT_DOCS = [
  "Photo ID (driver's license, state ID, or passport)",
  "Proof of where you live (utility bill or lease)",
  "Income proof (pay stubs or tax return)",
  "Social Security numbers for everyone applying",
]

export default function PreApplyModal({ program, isOpen, onClose }: PreApplyModalProps) {
  const [intent, setIntent] = useState<Intent>("this_week")
  const [wantReminder, setWantReminder] = useState(false)
  const [email, setEmail] = useState("")

  const isGrant = program.type === "grant"
  const accentColor = isGrant ? "blue" : "emerald"
  const officialSite = isGrant ? "grants.gov" : "benefits.gov"

  const docs =
    program.requiredDocuments && program.requiredDocuments.length > 0
      ? program.requiredDocuments
      : isGrant
      ? DEFAULT_GRANT_DOCS
      : DEFAULT_BENEFIT_DOCS

  const docsNote = isGrant
    ? "Most applicants spend 25–40 hours on a first-time grant application."
    : "Missing one? Apply anyway — your caseworker can usually help you get it."

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [isOpen, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  if (!isOpen) return null

  function handleContinue() {
    const key = "gw_applications"
    const existing = JSON.parse(localStorage.getItem(key) ?? "[]")
    const entry = {
      slug: program.slug,
      type: program.type,
      name: program.name,
      agency: program.agency,
      intent,
      email: wantReminder ? email : null,
      startedAt: Date.now(),
      status: "applying",
    }
    const filtered = existing.filter(
      (e: { slug: string; type: string }) => !(e.slug === program.slug && e.type === program.type)
    )
    localStorage.setItem(key, JSON.stringify([entry, ...filtered]))

    const url = program.applicationUrl || program.officialSourceUrl
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer")
    }
    onClose()
  }

  const accentBg = isGrant ? "bg-blue-600" : "bg-emerald-600"
  const accentHover = isGrant ? "hover:bg-blue-700" : "hover:bg-emerald-700"
  const accentText = isGrant ? "text-blue-600" : "text-emerald-600"
  const accentBorder = isGrant ? "border-blue-500" : "border-emerald-500"
  const accentLightBg = isGrant ? "bg-blue-50" : "bg-emerald-50"
  const accentSelectedBg = isGrant ? "bg-blue-50 border-blue-500" : "bg-emerald-50 border-emerald-500"

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[300]"
        style={{ backgroundColor: "rgba(15,23,42,0.55)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed z-[301] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "560px",
          maxWidth: "calc(100vw - 32px)",
          maxHeight: "calc(100vh - 64px)",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pre-apply-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${accentText}`}>
              Before you apply
            </p>
            <h2 id="pre-apply-title" className="text-base font-semibold text-slate-900">
              {program.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="ml-4 mt-0.5 shrink-0 rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Destination notice */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">
              You&apos;re heading to {officialSite}
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              GrantWay helps you find and prepare for applications, but the actual application is
              submitted directly through the agency&apos;s official site. We&apos;ll open it in a new tab.
            </p>
          </div>

          {/* Have these handy */}
          <div className={`rounded-xl ${accentLightBg} border border-slate-200 px-4 py-4`}>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Have these handy
            </p>
            <ul className="space-y-2">
              {docs.map((doc) => (
                <li key={doc} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className={`mt-0.5 shrink-0 w-4 h-4 rounded-full ${accentBg} flex items-center justify-center`}>
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8">
                      <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {doc}
                </li>
              ))}
            </ul>
            <p className="text-xs text-slate-500 mt-3 leading-relaxed">{docsNote}</p>
          </div>

          {/* Intent picker */}
          <div>
            <p className="text-sm font-semibold text-slate-900 mb-2">When do you plan to apply?</p>
            <div className="grid grid-cols-2 gap-2">
              {(["today", "this_week", "this_month", "just_looking"] as Intent[]).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setIntent(opt)}
                  className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors text-left ${
                    intent === opt
                      ? `${accentSelectedBg} text-slate-900`
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {INTENT_LABELS[opt]}
                </button>
              ))}
            </div>
          </div>

          {/* Email reminder — hidden when just looking */}
          {intent !== "just_looking" && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wantReminder}
                  onChange={(e) => setWantReminder(e.target.checked)}
                  className={`rounded border-slate-300 ${isGrant ? "accent-blue-600" : "accent-emerald-600"}`}
                />
                <span className="text-sm text-slate-700">Send me an email reminder</span>
              </label>
              {wantReminder && (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 shrink-0">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white ${accentBg} ${accentHover} transition-colors`}
          >
            Continue to {officialSite}
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  )
}
