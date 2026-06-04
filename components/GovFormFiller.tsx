"use client"

import { useCallback, useState } from "react"
import { Check, Download } from "lucide-react"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import { type AnyField, type TextField, type RadioField, type SelectField, FORM_SCHEMAS } from "@/components/form-schemas"

export { FORM_SCHEMAS }

// ── PDF generation ────────────────────────────────────────────────────────────

async function generateFilledPdf(title: string, fields: AnyField[], values: Record<string, string>) {
  const doc  = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)

  const PAGE_W = 612, PAGE_H = 792, MARGIN = 48, COL = PAGE_W - MARGIN * 2
  let page = doc.addPage([PAGE_W, PAGE_H])
  let y = PAGE_H - MARGIN

  function ensureSpace(needed: number) {
    if (y - needed < MARGIN) { page = doc.addPage([PAGE_W, PAGE_H]); y = PAGE_H - MARGIN }
  }

  page.drawRectangle({ x: MARGIN - 8, y: y - 22, width: COL + 16, height: 30, color: rgb(0.1, 0.24, 0.43) })
  page.drawText(title, { x: MARGIN, y: y - 14, font: bold, size: 11, color: rgb(1, 1, 1) })
  y -= 44

  for (const field of fields) {
    if (field.type === "section") {
      ensureSpace(30)
      page.drawRectangle({ x: MARGIN - 8, y: y - 15, width: COL + 16, height: 22, color: rgb(0.93, 0.95, 0.98) })
      page.drawText(field.label, { x: MARGIN, y: y - 9, font: bold, size: 8.5, color: rgb(0.1, 0.24, 0.43) })
      if (field.sub) {
        y -= 20; ensureSpace(14)
        page.drawText(field.sub, { x: MARGIN, y: y - 8, font, size: 7, color: rgb(0.45, 0.45, 0.45) })
      }
      y -= 26; continue
    }

    const leaves: Array<TextField | RadioField | SelectField> =
      field.type === "row" ? field.fields : [field as TextField | RadioField | SelectField]

    for (const f of leaves) {
      ensureSpace(34)
      if (f.label) page.drawText(f.label, { x: MARGIN, y: y - 9, font, size: 7, color: rgb(0.38, 0.38, 0.38) })
      const val = values[f.key] ?? ""
      page.drawRectangle({ x: MARGIN - 2, y: y - 26, width: COL + 4, height: 18, borderColor: rgb(0.72, 0.76, 0.82), borderWidth: 0.6 })
      page.drawText((val || "(not filled)").slice(0, 100), {
        x: MARGIN + 3, y: y - 17,
        font: val ? bold : font, size: 9,
        color: val ? rgb(0.06, 0.06, 0.06) : rgb(0.62, 0.62, 0.62),
      })
      y -= 36
    }
  }

  const bytes = await doc.save()
  const blob  = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" })
  const url   = URL.createObjectURL(blob)
  const a     = Object.assign(document.createElement("a"), {
    href: url,
    download: title.split("—")[0].trim().toLowerCase().replace(/\s+/g, "-") + "-filled.pdf",
  })
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

// ── Field renderers ───────────────────────────────────────────────────────────

function FieldInput({ f, values, onChange }: {
  f: TextField | SelectField
  values: Record<string, string>
  onChange: (k: string, v: string) => void
}) {
  const val  = values[f.key] ?? ""
  const base = "w-full border border-slate-400 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200 transition-colors placeholder:text-slate-300 rounded-none font-mono"
  if (f.type === "select") {
    return (
      <select value={val} onChange={e => onChange(f.key, e.target.value)} className={base + " appearance-none cursor-pointer"}>
        <option value="">— select —</option>
        {f.options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    )
  }
  return <input type="text" value={val} onChange={e => onChange(f.key, e.target.value)} placeholder={f.placeholder} className={base} />
}

function RadioInput({ f, values, onChange }: {
  f: RadioField
  values: Record<string, string>
  onChange: (k: string, v: string) => void
}) {
  const val = values[f.key] ?? ""
  return (
    <div className="flex flex-wrap gap-1.5">
      {f.options.map(opt => {
        const active = val === opt
        return (
          <label key={opt} className={`flex items-center gap-1.5 px-2.5 py-1.5 border text-xs font-medium cursor-pointer transition-colors rounded-none ${active ? "border-blue-600 bg-blue-50 text-blue-900" : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"}`}>
            <span className={`w-3.5 h-3.5 border-2 flex-none flex items-center justify-center rounded-full ${active ? "border-blue-600 bg-blue-600" : "border-slate-400"}`}>
              {active && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
            </span>
            {opt}
          </label>
        )
      })}
    </div>
  )
}

function renderLeaf(f: TextField | RadioField | SelectField, values: Record<string, string>, onChange: (k: string, v: string) => void) {
  return (
    <div key={f.key} className="flex flex-col gap-0.5 min-w-0">
      {f.label && (
        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide leading-tight">
          {f.label}
          {(f as TextField).hint && <span className="text-slate-400 font-normal normal-case tracking-normal"> — {(f as TextField).hint}</span>}
        </label>
      )}
      {f.type === "radio"
        ? <RadioInput f={f} values={values} onChange={onChange} />
        : <FieldInput f={f} values={values} onChange={onChange} />}
    </div>
  )
}

// ── GovFormFiller ─────────────────────────────────────────────────────────────

export function GovFormFiller({ formKey, values, onChange, onReady, isReady }: {
  formKey:  string
  values:   Record<string, string>
  onChange: (k: string, v: string) => void
  onReady:  () => void
  isReady:  boolean
}) {
  const schema = FORM_SCHEMAS[formKey]
  const [downloading, setDownloading] = useState(false)

  const handleDownload = useCallback(async () => {
    if (!schema) return
    setDownloading(true)
    try { await generateFilledPdf(schema.title, schema.fields, values) }
    finally { setDownloading(false) }
  }, [schema, values])

  if (!schema) return null

  return (
    <div className="flex flex-col min-h-0">
      <div className="flex items-center justify-between gap-3 px-5 py-3 bg-white border-b border-slate-200 sticky top-0 z-10">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Official Form</p>
          <p className="text-sm font-semibold text-slate-900">{schema.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleDownload} disabled={downloading}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
            <Download className="w-3.5 h-3.5" />
            {downloading ? "Generating…" : "Download filled PDF"}
          </button>
          <button onClick={onReady}
            className={`inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-xs font-semibold border transition-colors ${isReady ? "bg-white border-slate-200 text-slate-600 hover:bg-slate-50" : "bg-emerald-600 border-transparent text-white hover:bg-emerald-700"}`}>
            {isReady ? <><Check className="w-3.5 h-3.5" /> Marked ready</> : <>Mark ready</>}
          </button>
        </div>
      </div>

      <div className="overflow-y-auto bg-slate-200 p-4">
        <div className="max-w-3xl mx-auto bg-white shadow-lg">
          <div className="bg-[#1a3d6e] px-5 py-3">
            <p className="text-white/60 text-[9px] font-semibold uppercase tracking-widest">OMB-Approved Standard Form</p>
            <p className="text-white text-sm font-bold mt-0.5">{schema.title}</p>
          </div>
          <div>
            {schema.fields.map((field, i) => {
              if (field.type === "section") {
                return (
                  <div key={i} className="px-4 py-2 bg-slate-100 border-y border-slate-300">
                    <p className="text-[10px] font-bold text-[#1a3d6e] uppercase tracking-widest">{field.label}</p>
                    {field.sub && <p className="text-[11px] text-slate-500 mt-0.5">{field.sub}</p>}
                  </div>
                )
              }
              if (field.type === "row") {
                return (
                  <div key={i} className="px-4 py-3 border-b border-slate-100 grid gap-3"
                    style={{ gridTemplateColumns: `repeat(${Math.min(field.fields.length, 4)}, minmax(0, 1fr))` }}>
                    {field.fields.map(f => renderLeaf(f, values, onChange))}
                  </div>
                )
              }
              return <div key={i} className="px-4 py-3 border-b border-slate-100">{renderLeaf(field as TextField | RadioField | SelectField, values, onChange)}</div>
            })}
          </div>
        </div>
        <p className="text-center text-[11px] text-slate-500 mt-3 mb-1">
          Fill all fields, then click <strong>Download filled PDF</strong> to save your completed form.
        </p>
      </div>
    </div>
  )
}
