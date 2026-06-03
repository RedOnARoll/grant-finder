"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Check, Download } from "lucide-react"

// ── Types ──────────────────────────────────────────────────────────────────

type FieldType = "text" | "checkbox"

type PdfField = {
  name: string
  type: FieldType
  page: number   // 0-indexed
  left: number
  top: number
  width: number
  height: number
  multiline: boolean
}

type PageImage = { dataUrl: string; width: number; height: number }

// ── Seed key → known SF-424 AcroForm field names ──────────────────────────
// Normalized (lowercase, no separators) AcroForm name → seed key

const ACRO_SEED: Record<string, string> = {
  legalname: "legal_name",
  applicantlegalname: "legal_name",
  orgname: "legal_name",
  firstname: "contact_first",
  prefixfirstname: "contact_first",
  contactfirstname: "contact_first",
  applicantfirstname: "contact_first",
  lastname: "contact_last",
  suffixlastname: "contact_last",
  contactlastname: "contact_last",
  applicantlastname: "contact_last",
  phonenumber: "contact_tel",
  telephonenumber: "contact_tel",
  contactphone: "contact_tel",
  phone: "contact_tel",
  telephone: "contact_tel",
  email: "contact_email",
  emailaddress: "contact_email",
  contactemail: "contact_email",
  applicantemail: "contact_email",
  state: "addr_state",
  statecode: "addr_state",
  applicantstate: "addr_state",
  stateabbr: "addr_state",
  zipcode: "addr_zip",
  zip: "addr_zip",
  postalcode: "addr_zip",
  applicantzip: "addr_zip",
  title: "project_title",
  projecttitle: "project_title",
  federalagencyname: "federal_agency",
  agencyname: "federal_agency",
  federalagency: "federal_agency",
  agency: "federal_agency",
  signame: "sig_name",
  signature: "signature",
  authsignature: "auth_signature",
}

function norm(s: string) {
  return s.toLowerCase().replace(/[_\s\-\.]/g, "")
}

function seedValueForField(fieldName: string, seed: Record<string, string>): string {
  const n = norm(fieldName)
  const seedKey = ACRO_SEED[n]
  if (seedKey && seed[seedKey]) return seed[seedKey]
  // fallback: try direct normalised match on seed keys
  for (const [k, v] of Object.entries(seed)) {
    if (norm(k) === n) return v
  }
  return ""
}

// ── Form metadata ──────────────────────────────────────────────────────────

const FORM_TITLES: Record<string, string> = {
  "sf-424":  "SF-424 — Application for Federal Assistance",
  "sf-424a": "SF-424A — Budget Information (Non-Construction)",
  "sf-424b": "SF-424B — Assurances (Non-Construction Programs)",
  "sf-lll":  "SF-LLL — Disclosure of Lobbying Activities",
}

// PDFs are committed to public/forms/ — serve as static assets, no proxy needed
function formPdfUrl(formKey: string) {
  return `/forms/${formKey}.pdf`
}

const RENDER_SCALE = 1.5

// ── Component ──────────────────────────────────────────────────────────────

interface Props {
  formKey: string
  seedValues: Record<string, string>
  savedValues: Record<string, string>
  onValuesChange: (v: Record<string, string>) => void
  onReady: () => void
  isReady: boolean
}

export function PdfFormViewer({ formKey, seedValues, savedValues, onValuesChange, onReady, isReady }: Props) {
  const [pages, setPages] = useState<PageImage[]>([])
  const [fields, setFields] = useState<PdfField[]>([])
  const [values, setValues] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading")
  const [errorMsg, setErrorMsg] = useState("")
  const [downloading, setDownloading] = useState(false)
  const pdfBytesRef = useRef<ArrayBuffer | null>(null)

  // Load PDF + extract pages + field positions
  useEffect(() => {
    let cancelled = false

    async function load() {
      setStatus("loading")
      setErrorMsg("")
      try {
        const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist")
        GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"

        const res = await fetch(formPdfUrl(formKey))
        if (!res.ok) throw new Error(`PDF fetch failed: ${res.status}`)
        const buffer = await res.arrayBuffer()
        if (cancelled) return
        pdfBytesRef.current = buffer.slice(0)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pdfDoc = await getDocument({ data: buffer } as any).promise
        const pageImages: PageImage[] = []
        const allFields: PdfField[] = []

        for (let pn = 1; pn <= pdfDoc.numPages; pn++) {
          const page = await pdfDoc.getPage(pn)
          const vp = page.getViewport({ scale: RENDER_SCALE })

          const canvas = document.createElement("canvas")
          canvas.width = vp.width
          canvas.height = vp.height
          const ctx = canvas.getContext("2d")!
          await page.render({ canvas, viewport: vp }).promise

          pageImages.push({ dataUrl: canvas.toDataURL("image/jpeg", 0.92), width: vp.width, height: vp.height })

          const anns = await page.getAnnotations()
          for (const ann of anns) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const a = ann as any
            if (!a.fieldName) continue
            const ft: string = a.fieldType ?? ""
            if (ft !== "Tx" && ft !== "Btn") continue
            const vr: number[] = vp.convertToViewportRectangle(a.rect)
            const left   = Math.min(vr[0], vr[2])
            const top    = Math.min(vr[1], vr[3])
            const width  = Math.abs(vr[2] - vr[0])
            const height = Math.abs(vr[3] - vr[1])
            allFields.push({
              name: a.fieldName as string,
              type: ft === "Btn" ? "checkbox" : "text",
              page: pn - 1,
              left, top, width, height,
              multiline: Boolean(a.multiLine),
            })
          }
        }

        if (cancelled) return

        // Build initial values: saved > seed > empty
        const init: Record<string, string> = {}
        for (const f of allFields) {
          init[f.name] = savedValues[f.name] ?? seedValueForField(f.name, seedValues) ?? ""
        }

        setPages(pageImages)
        setFields(allFields)
        setValues(init)
        setStatus("ready")
      } catch (err) {
        if (!cancelled) {
          setErrorMsg(err instanceof Error ? err.message : "Failed to load PDF")
          setStatus("error")
        }
      }
    }

    load()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formKey])

  function handleChange(name: string, value: string) {
    setValues((prev) => {
      const next = { ...prev, [name]: value }
      onValuesChange(next)
      return next
    })
  }

  const handleDownload = useCallback(async () => {
    if (!pdfBytesRef.current) return
    setDownloading(true)
    try {
      const { PDFDocument } = await import("pdf-lib")
      const doc = await PDFDocument.load(pdfBytesRef.current, { ignoreEncryption: true })
      const form = doc.getForm()
      for (const [name, val] of Object.entries(values)) {
        if (!val) continue
        try { form.getTextField(name).setText(val) } catch { /* non-text field — skip */ }
      }
      const bytes = await doc.save()
      const url = URL.createObjectURL(new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" }))
      const a = Object.assign(document.createElement("a"), {
        href: url,
        download: `${formKey}-filled.pdf`,
      })
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 5000)
    } finally {
      setDownloading(false)
    }
  }, [formKey, values])

  const title = FORM_TITLES[formKey] ?? formKey.toUpperCase()

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 bg-white border-b border-slate-200 sticky top-0 z-10 shrink-0">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Official Form</p>
          <p className="text-sm font-semibold text-slate-900 truncate">{title}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={handleDownload} disabled={downloading || status !== "ready"}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <Download className="w-3.5 h-3.5" />
            {downloading ? "Saving…" : "Download filled PDF"}
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

      {status === "ready" && (
        <div className="bg-[#404040] p-4 overflow-auto">
          {pages.map((pg, pi) => (
            <div key={pi}
              className="relative mx-auto mb-4 last:mb-0 shadow-2xl"
              style={{ width: pg.width, height: pg.height }}>
              {/* PDF page rendered as image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pg.dataUrl}
                alt={`Page ${pi + 1}`}
                className="absolute inset-0 block w-full h-full pointer-events-none select-none"
                draggable={false}
              />

              {/* Editable overlays at exact AcroForm field positions */}
              {fields
                .filter((f) => f.page === pi)
                .map((f, fi) =>
                  f.type === "checkbox" ? (
                    <input
                      key={fi}
                      type="checkbox"
                      checked={values[f.name] === "Yes" || values[f.name] === "On"}
                      onChange={(e) => handleChange(f.name, e.target.checked ? "Yes" : "Off")}
                      className="absolute cursor-pointer opacity-80 hover:opacity-100"
                      style={{ left: f.left, top: f.top, width: f.width, height: f.height }}
                    />
                  ) : (
                    <input
                      key={fi}
                      type="text"
                      value={values[f.name] ?? ""}
                      onChange={(e) => handleChange(f.name, e.target.value)}
                      className="absolute bg-blue-100/50 hover:bg-blue-100/70 focus:bg-white/90 border-0 outline-none text-slate-900 px-0.5 transition-colors"
                      style={{
                        left: f.left,
                        top: f.top,
                        width: f.width,
                        height: f.height,
                        fontSize: Math.min(Math.max(f.height * 0.58, 7), 13),
                        lineHeight: `${f.height}px`,
                      }}
                    />
                  )
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
