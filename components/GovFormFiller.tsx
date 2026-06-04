"use client"

import { useCallback, useState } from "react"
import { Check, Download } from "lucide-react"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

// ── Field schema ─────────────────────────────────────────────────────────────

type TextField   = { type: "text";    key: string; label: string; placeholder?: string; hint?: string }
type RadioField  = { type: "radio";   key: string; label: string; options: string[] }
type SelectField = { type: "select";  key: string; label: string; options: string[] }
type GroupRow    = { type: "row";     fields: Array<TextField | RadioField | SelectField> }
type SectionHead = { type: "section"; label: string; sub?: string }
type AnyField = TextField | RadioField | SelectField | GroupRow | SectionHead

// ── SF-424 ────────────────────────────────────────────────────────────────────

const SF424: AnyField[] = [
  { type: "section", label: "1 · Type of Submission" },
  { type: "radio", key: "submission_type", label: "", options: ["Application", "Pre-Application", "Changed/Corrected Application"] },
  { type: "section", label: "2 · Type of Application" },
  { type: "radio", key: "application_type", label: "", options: ["New", "Continuation", "Revision"] },
  { type: "text", key: "revision_type", label: "If Revision, select appropriate letter(s)", placeholder: "e.g. A, B, C, D, E, or F" },
  { type: "row", fields: [
    { type: "text", key: "date_received_state",   label: "3. Date Received by State", placeholder: "MM/DD/YYYY" },
    { type: "text", key: "state_app_identifier",  label: "State Application Identifier" },
  ]},
  { type: "row", fields: [
    { type: "text", key: "date_received_federal", label: "4a. Date Received by Federal Agency", placeholder: "MM/DD/YYYY" },
    { type: "text", key: "federal_identifier",    label: "4b. Federal Identifier" },
  ]},
  { type: "section", label: "5 · Applicant Information" },
  { type: "text", key: "legal_name", label: "a. Legal Name of Applicant", placeholder: "Full legal name of the applying organization" },
  { type: "row", fields: [
    { type: "text", key: "dept_name", label: "b. Department Name" },
    { type: "text", key: "div_name",  label: "Division Name" },
  ]},
  { type: "text", key: "uei", label: "c. Unique Entity Identifier (UEI)", placeholder: "12-character alphanumeric UEI from SAM.gov" },
  { type: "text", key: "addr_street1", label: "d. Street Address 1", placeholder: "Street address" },
  { type: "text", key: "addr_street2", label: "Street Address 2", placeholder: "Suite, floor, unit (optional)" },
  { type: "row", fields: [
    { type: "text", key: "addr_city",   label: "City" },
    { type: "text", key: "addr_county", label: "County" },
    { type: "text", key: "addr_state",  label: "State / Province" },
    { type: "text", key: "addr_zip",    label: "Zip / Postal Code" },
  ]},
  { type: "text", key: "addr_country", label: "Country", placeholder: "USA" },
  { type: "section", label: "f · Primary Contact", sub: "Person to contact on matters involving this application" },
  { type: "row", fields: [
    { type: "text", key: "contact_first",  label: "First Name" },
    { type: "text", key: "contact_middle", label: "Middle Name" },
    { type: "text", key: "contact_last",   label: "Last Name" },
    { type: "text", key: "contact_suffix", label: "Suffix" },
  ]},
  { type: "text", key: "contact_title", label: "Title" },
  { type: "row", fields: [
    { type: "text", key: "contact_tel",   label: "Telephone Number", placeholder: "(555) 555-5555" },
    { type: "text", key: "contact_fax",   label: "Fax Number" },
    { type: "text", key: "contact_email", label: "Email Address" },
  ]},
  { type: "section", label: "6 · Employer Identification Number (EIN / TIN)" },
  { type: "text", key: "ein", label: "EIN / TIN", placeholder: "XX-XXXXXXX" },
  { type: "section", label: "7 · Type of Applicant" },
  { type: "select", key: "applicant_type", label: "Select the most appropriate type", options: [
    "State Government", "County Government", "City or Township Government",
    "Special District Government", "Regional Organization",
    "Indian/Native American Tribal Government (Federally Recognized)",
    "Indian/Native American Tribal Government (Other than Federally Recognized)",
    "Indian/Native American Tribally Designated Organization",
    "Public/State Controlled Institution of Higher Education",
    "Private Institution of Higher Education",
    "Individual", "For-Profit Organization (Other than Small Business)",
    "Small Business", "Nonprofit with 501C3 IRS Status", "Nonprofit without 501C3 IRS Status",
    "Other (specify below)",
  ]},
  { type: "text", key: "applicant_type_other", label: "If Other, specify" },
  { type: "section", label: "8 · Name of Federal Agency" },
  { type: "text", key: "federal_agency", label: "Federal Agency Name", placeholder: "e.g. Department of Health and Human Services" },
  { type: "section", label: "9 · CFDA Number & Program Title" },
  { type: "row", fields: [
    { type: "text", key: "cfda_number", label: "CFDA Number", placeholder: "XX.XXX" },
    { type: "text", key: "cfda_title",  label: "Program Title" },
  ]},
  { type: "section", label: "10 · Funding Opportunity" },
  { type: "row", fields: [
    { type: "text", key: "foa_number", label: "Funding Opportunity Number" },
    { type: "text", key: "foa_title",  label: "Title" },
  ]},
  { type: "section", label: "11 · Competition Identification" },
  { type: "row", fields: [
    { type: "text", key: "comp_id_number", label: "Competition ID Number" },
    { type: "text", key: "comp_id_title",  label: "Title" },
  ]},
  { type: "section", label: "12 · Areas Affected by Project" },
  { type: "text", key: "areas_affected", label: "Cities, counties, states, and/or countries", placeholder: "List all affected jurisdictions" },
  { type: "section", label: "13 · Descriptive Title of Applicant's Project" },
  { type: "text", key: "project_title", label: "Project Title", placeholder: "Brief descriptive title of the proposed project" },
  { type: "section", label: "14 · Congressional Districts" },
  { type: "row", fields: [
    { type: "text", key: "congress_applicant", label: "a. Applicant Congressional District", placeholder: "e.g. TX-05" },
    { type: "text", key: "congress_project",   label: "b. Program/Project Congressional Districts" },
  ]},
  { type: "section", label: "15 · Project Period" },
  { type: "row", fields: [
    { type: "text", key: "project_start", label: "Start Date", placeholder: "MM/DD/YYYY" },
    { type: "text", key: "project_end",   label: "End Date",   placeholder: "MM/DD/YYYY" },
  ]},
  { type: "section", label: "16 · Estimated Funding ($)" },
  { type: "row", fields: [
    { type: "text", key: "fund_federal",   label: "a. Federal",   placeholder: "0.00" },
    { type: "text", key: "fund_applicant", label: "b. Applicant", placeholder: "0.00" },
    { type: "text", key: "fund_state",     label: "c. State",     placeholder: "0.00" },
  ]},
  { type: "row", fields: [
    { type: "text", key: "fund_local",   label: "d. Local",          placeholder: "0.00" },
    { type: "text", key: "fund_other",   label: "e. Other",          placeholder: "0.00" },
    { type: "text", key: "fund_income",  label: "f. Program Income", placeholder: "0.00" },
  ]},
  { type: "text", key: "fund_total", label: "g. TOTAL", placeholder: "0.00", hint: "Sum of a–f" },
  { type: "section", label: "17 · Delinquency on Federal Debt" },
  { type: "radio", key: "fed_debt", label: "Is the applicant delinquent on any Federal debt?", options: ["Yes", "No"] },
  { type: "text", key: "fed_debt_explanation", label: "If Yes, provide explanation", placeholder: "Explain the nature and status of the delinquency" },
  { type: "section", label: "18 · Authorized Representative" },
  { type: "row", fields: [
    { type: "text", key: "auth_prefix", label: "Prefix" },
    { type: "text", key: "auth_first",  label: "First Name" },
    { type: "text", key: "auth_middle", label: "Middle Name" },
    { type: "text", key: "auth_last",   label: "Last Name" },
    { type: "text", key: "auth_suffix", label: "Suffix" },
  ]},
  { type: "text", key: "auth_title", label: "Title" },
  { type: "row", fields: [
    { type: "text", key: "auth_tel",   label: "Telephone", placeholder: "(555) 555-5555" },
    { type: "text", key: "auth_fax",   label: "Fax" },
    { type: "text", key: "auth_email", label: "Email" },
  ]},
  { type: "text", key: "auth_signature",   label: "Signature of Authorized Representative", placeholder: "Type full legal name as signature" },
  { type: "text", key: "auth_date_signed", label: "Date Signed", placeholder: "MM/DD/YYYY" },
]

// ── SF-424A ───────────────────────────────────────────────────────────────────

const SF424A: AnyField[] = [
  { type: "section", label: "Section A · Budget Summary" },
  { type: "text", key: "grant_program", label: "Grant Program / Activity / Project", placeholder: "Name of the program" },
  { type: "row", fields: [
    { type: "text", key: "catalog_cfda",           label: "Catalog No. (CFDA)", placeholder: "XX.XXX" },
    { type: "text", key: "est_unobligated_fed",    label: "Unobligated Funds — Federal ($)" },
    { type: "text", key: "est_unobligated_nonfed", label: "Non-Federal ($)" },
    { type: "text", key: "new_revised_federal",    label: "New/Revised Budget — Federal ($)" },
    { type: "text", key: "new_revised_nonfed",     label: "Non-Federal ($)" },
    { type: "text", key: "total_budget",           label: "Total ($)" },
  ]},
  { type: "section", label: "Section B · Budget Categories" },
  { type: "row", fields: [
    { type: "text", key: "personnel",    label: "Personnel ($)" },
    { type: "text", key: "fringe",       label: "Fringe Benefits ($)" },
    { type: "text", key: "travel",       label: "Travel ($)" },
    { type: "text", key: "equipment",    label: "Equipment ($)" },
  ]},
  { type: "row", fields: [
    { type: "text", key: "supplies",     label: "Supplies ($)" },
    { type: "text", key: "contractual",  label: "Contractual ($)" },
    { type: "text", key: "construction", label: "Construction ($)" },
    { type: "text", key: "other",        label: "Other ($)" },
  ]},
  { type: "row", fields: [
    { type: "text", key: "total_direct", label: "Total Direct Charges ($)" },
    { type: "text", key: "indirect",     label: "Indirect Charges ($)" },
    { type: "text", key: "totals",       label: "Totals ($)" },
  ]},
  { type: "section", label: "Section C · Non-Federal Resources" },
  { type: "row", fields: [
    { type: "text", key: "nonfed_applicant", label: "Applicant ($)" },
    { type: "text", key: "nonfed_state",     label: "State ($)" },
    { type: "text", key: "nonfed_other",     label: "Other Sources ($)" },
    { type: "text", key: "nonfed_total",     label: "TOTAL ($)" },
  ]},
  { type: "section", label: "Section D · Forecasted Cash Needs" },
  { type: "row", fields: [
    { type: "text", key: "cash_fed_q1",    label: "Federal Q1 ($)" },
    { type: "text", key: "cash_fed_q2",    label: "Federal Q2 ($)" },
    { type: "text", key: "cash_fed_q3",    label: "Federal Q3 ($)" },
    { type: "text", key: "cash_fed_q4",    label: "Federal Q4 ($)" },
    { type: "text", key: "cash_fed_total", label: "Federal Total ($)" },
  ]},
  { type: "row", fields: [
    { type: "text", key: "cash_nonfed_q1",    label: "Non-Fed Q1 ($)" },
    { type: "text", key: "cash_nonfed_q2",    label: "Non-Fed Q2 ($)" },
    { type: "text", key: "cash_nonfed_q3",    label: "Non-Fed Q3 ($)" },
    { type: "text", key: "cash_nonfed_q4",    label: "Non-Fed Q4 ($)" },
    { type: "text", key: "cash_nonfed_total", label: "Non-Fed Total ($)" },
  ]},
  { type: "section", label: "Section E · Future Federal Funds Needed" },
  { type: "row", fields: [
    { type: "text", key: "future_year1", label: "Future Period 1 ($)" },
    { type: "text", key: "future_year2", label: "Future Period 2 ($)" },
    { type: "text", key: "future_year3", label: "Future Period 3 ($)" },
  ]},
  { type: "section", label: "Section F · Other Budget Information" },
  { type: "text", key: "direct_charges",   label: "Direct Charges explanation", placeholder: "Describe direct charges if needed" },
  { type: "text", key: "indirect_charges", label: "Indirect Charges basis",     placeholder: "Rate, base, and period of availability" },
  { type: "text", key: "remarks",          label: "Remarks",                    placeholder: "Any other relevant budget information" },
]

// ── SF-424B ───────────────────────────────────────────────────────────────────

const SF424B: AnyField[] = [
  { type: "section", label: "Assurances — Non-Construction Programs" },
  { type: "text", key: "applicant_name",   label: "Applicant Name" },
  { type: "text", key: "cfda_number",      label: "CFDA Number(s)", placeholder: "If applicable" },
  { type: "text", key: "fed_award_title",  label: "Federal Award / Program Title" },
  { type: "text", key: "fed_award_number", label: "Federal Award Number" },
  { type: "radio", key: "acknowledgement", label: "By submitting this form, the applicant agrees to comply with all applicable assurances listed on the full SF-424B.", options: ["I acknowledge and agree"] },
  { type: "text", key: "auth_signature", label: "Authorized Representative Signature", placeholder: "Type full legal name as signature" },
  { type: "text", key: "auth_title",     label: "Title" },
  { type: "text", key: "auth_date",      label: "Date", placeholder: "MM/DD/YYYY" },
]

// ── SF-LLL ────────────────────────────────────────────────────────────────────

const SFLLL: AnyField[] = [
  { type: "section", label: "Disclosure of Lobbying Activities" },
  { type: "row", fields: [
    { type: "text", key: "fed_action_type", label: "1. Type of Federal Action", placeholder: "Contract, grant, cooperative agreement, loan…" },
    { type: "text", key: "award_status",    label: "2. Status of Federal Action", placeholder: "Bid/offer/application, initial award, post-award" },
    { type: "text", key: "report_type",     label: "3. Report Type", placeholder: "Initial filing, material change" },
  ]},
  { type: "section", label: "4 · Reporting Entity" },
  { type: "radio", key: "entity_type", label: "Type", options: ["Prime", "Subawardee"] },
  { type: "text", key: "entity_name",    label: "Organization Name" },
  { type: "text", key: "entity_address", label: "Address" },
  { type: "row", fields: [
    { type: "text", key: "entity_city",  label: "City" },
    { type: "text", key: "entity_state", label: "State" },
    { type: "text", key: "entity_zip",   label: "Zip" },
  ]},
  { type: "text", key: "congressional_district", label: "Congressional District" },
  { type: "section", label: "5 · Prime Awardee (if reporting entity is subawardee)" },
  { type: "text", key: "prime_name",    label: "Prime Name" },
  { type: "text", key: "prime_address", label: "Prime Address" },
  { type: "section", label: "6–8 · Federal Award Details" },
  { type: "text", key: "fed_dept", label: "6. Federal Department / Agency" },
  { type: "row", fields: [
    { type: "text", key: "fed_program_name", label: "7a. Federal Program Name / Description" },
    { type: "text", key: "cfda_number",      label: "7b. CFDA Number" },
  ]},
  { type: "row", fields: [
    { type: "text", key: "federal_action_number", label: "8a. Federal Action Number" },
    { type: "text", key: "award_amount",           label: "8b. Award Amount ($)" },
  ]},
  { type: "section", label: "9 · Lobbying Registrant" },
  { type: "text", key: "lobbyist_name",    label: "Name" },
  { type: "text", key: "lobbyist_address", label: "Address" },
  { type: "section", label: "10 · Individuals Performing Lobbying Activities" },
  { type: "text", key: "lobbyist_individuals", label: "Individual(s)", placeholder: "List all individuals, separated by commas" },
  { type: "text", key: "information_date",     label: "Information requested through (date)", placeholder: "MM/DD/YYYY" },
  { type: "text", key: "signature", label: "Signature" },
  { type: "row", fields: [
    { type: "text", key: "sig_name",  label: "Print Name" },
    { type: "text", key: "sig_title", label: "Title" },
    { type: "text", key: "sig_tel",   label: "Telephone" },
    { type: "text", key: "sig_date",  label: "Date" },
  ]},
]

export const FORM_SCHEMAS: Record<string, { title: string; fields: AnyField[] }> = {
  "sf-424":  { title: "SF-424 — Application for Federal Assistance",     fields: SF424  },
  "sf-424a": { title: "SF-424A — Budget Information (Non-Construction)",  fields: SF424A },
  "sf-424b": { title: "SF-424B — Assurances (Non-Construction Programs)", fields: SF424B },
  "sf-lll":  { title: "SF-LLL — Disclosure of Lobbying Activities",       fields: SFLLL  },
}

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
      {/* sticky toolbar */}
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

      {/* form body */}
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
