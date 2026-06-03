"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Check, Download } from "lucide-react"
import { PDFDocument } from "pdf-lib"

// ── Metadata ───────────────────────────────────────────────────────────────

const FORM_TITLES: Record<string, string> = {
  "sf-424":  "SF-424 — Application for Federal Assistance",
  "sf-424a": "SF-424A — Budget Information (Non-Construction)",
  "sf-424b": "SF-424B — Assurances (Non-Construction Programs)",
  "sf-lll":  "SF-LLL — Disclosure of Lobbying Activities",
}

// seed key → candidate AcroForm field names (priority order)
const SEED_FIELDS: Record<string, string[]> = {
  legal_name:    ["Legal_Name",          "legalName",       "Applicant_Legal_Name", "org_name"],
  contact_first: ["First_Name",          "firstName",       "Prefix_First_Name",    "contact_first_name"],
  contact_last:  ["Last_Name",           "lastName",        "Suffix_Last_Name",     "contact_last_name"],
  contact_email: ["Email",               "email",           "Email_Address",        "contact_email"],
  contact_tel:   ["Phone_Number",        "phoneNumber",     "Telephone_Number",     "contact_phone"],
  addr_state:    ["State",               "state",           "State_Code",           "applicant_state"],
  addr_zip:      ["Zip_Code",            "zipCode",         "Zip",                  "postal_code"],
  federal_agency:["Federal_Agency_Name", "agencyName",      "Agency_Name"],
  project_title: ["Title",               "project_title",   "Project_Title"],
}

function norm(s: string) {
  return s.toLowerCase().replace(/[_\s-]/g, "")
}

// ── Component ──────────────────────────────────────────────────────────────

interface Props {
  formKey:    string
  seedValues: Record<string, string>
  onReady:    () => void
  isReady:    boolean
}

export function PdfFormViewer({ formKey, seedValues, onReady, isReady }: Props) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [errorMsg, setErrorMsg] = useState("")
  const blobUrlRef = useRef<string | null>(null)
  const seedRef = useRef(seedValues)
  seedRef.current = seedValues

  useEffect(() => {
    let cancelled = false

    async function load() {
      setStatus("loading")

      try {
        const res = await fetch(`/forms/${formKey}.pdf`)
        if (!res.ok) throw new Error(`Could not load form (${res.status})`)
        const buffer = await res.arrayBuffer()
        if (cancelled) return

        // Attempt AcroForm pre-fill — silently skip if the PDF has no AcroForm layer
        let outputBytes: Uint8Array
        try {
          const doc = await PDFDocument.load(buffer, { ignoreEncryption: true })
          const form = doc.getForm()
          const fieldNames = form.getFields().map((f) => f.getName())

          for (const [seedKey, candidates] of Object.entries(SEED_FIELDS)) {
            const value = seedRef.current[seedKey]
            if (!value) continue
            // Try exact candidate names first, then normalised fuzzy match
            const match =
              candidates.find((c) => fieldNames.some((n) => n === c)) ??
              fieldNames.find((n) => candidates.some((c) => norm(n) === norm(c))) ??
              fieldNames.find((n) => norm(n).includes(norm(seedKey)) || norm(seedKey).includes(norm(n)))
            if (!match) continue
            try { form.getTextField(match).setText(value) } catch { /* radio / checkbox / read-only — skip */ }
          }

          outputBytes = await doc.save()
        } catch {
          // XFA / encrypted / unsupported — fall back to the original file
          outputBytes = new Uint8Array(buffer)
        }

        if (cancelled) return

        if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
        const url = URL.createObjectURL(new Blob([outputBytes.buffer as ArrayBuffer], { type: "application/pdf" }))
        blobUrlRef.current = url
        setBlobUrl(url)
        setStatus("ready")
      } catch (err) {
        if (!cancelled) {
          setErrorMsg(err instanceof Error ? err.message : "Failed to load form")
          setStatus("error")
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, [formKey]) // re-run only when the form changes, not on every seed update

  // Cleanup blob URL on unmount
  useEffect(() => () => { if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current) }, [])

  const handleDownload = useCallback(() => {
    if (!blobUrl) return
    Object.assign(document.createElement("a"), { href: blobUrl, download: `${formKey}-prefilled.pdf` }).click()
  }, [blobUrl, formKey])

  const title = FORM_TITLES[formKey] ?? formKey.toUpperCase()

  return (
    <div className="flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 bg-white border-b border-slate-200 sticky top-0 z-10 shrink-0">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Official Form</p>
          <p className="text-sm font-semibold text-slate-900 truncate">{title}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={handleDownload} disabled={status !== "ready"}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <Download className="w-3.5 h-3.5" />
            Download pre-filled PDF
          </button>
          <button onClick={onReady}
            className={`inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-xs font-semibold border transition-colors ${
              isReady
                ? "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                : "bg-emerald-600 border-transparent text-white hover:bg-emerald-700"
            }`}>
            {isReady ? <><Check className="w-3.5 h-3.5" /> Marked ready</> : "Mark ready"}
          </button>
        </div>
      </div>

      {/* Body */}
      {status === "loading" && (
        <div className="flex items-center justify-center gap-3 py-16 text-sm text-slate-500">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Loading form…
        </div>
      )}

      {status === "error" && (
        <div className="p-8 text-center">
          <p className="text-sm font-semibold text-rose-700 mb-1">Could not load PDF</p>
          <p className="text-xs text-rose-500">{errorMsg}</p>
        </div>
      )}

      {status === "ready" && blobUrl && (
        <iframe
          src={`${blobUrl}#toolbar=1&view=FitH`}
          title={title}
          className="w-full border-0 block"
          style={{ height: "720px" }}
        />
      )}
    </div>
  )
}
