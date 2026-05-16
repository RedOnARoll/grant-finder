"use client"

import { useState } from "react"

interface DocInfo {
  what: string
  looksLike: string
}

const DOCUMENT_INFO: Record<string, DocInfo> = {
  "Social Security card": {
    what: "Official card issued by the Social Security Administration showing your 9-digit Social Security Number.",
    looksLike: "A small blue-and-white card with your full legal name and SSN printed on it. Do not laminate it — a laminated card is not accepted. If you don't have yours, request a free replacement at ssa.gov.",
  },
  "Government-issued photo ID": {
    what: "A current, valid photo ID issued by a federal or state government agency.",
    looksLike: "Driver's license, state ID card, or US passport. Must show your photo, full legal name, and must not be expired.",
  },
  "Driver's license": {
    what: "A valid state-issued driver's license.",
    looksLike: "Your state's license card showing your photo, name, address, and expiration date. Must not be expired.",
  },
  "Proof of income": {
    what: "Documentation showing your current earnings or all sources of household income.",
    looksLike: "Recent pay stubs (last 30 days), your most recent tax return (Form 1040), Social Security award letters, pension statements, or an employer letter on company letterhead stating your salary. Self-employed individuals can use bank statements or a profit/loss statement.",
  },
  "Tax returns": {
    what: "Federal tax returns showing your household's annual income.",
    looksLike: "IRS Form 1040 from the most recent tax year, including all schedules. You can download a transcript for free at irs.gov/individuals/get-transcript.",
  },
  "W-2 forms": {
    what: "Year-end wage and tax statements from each of your employers.",
    looksLike: "A multi-part form your employer mails to you by January 31 each year, showing total wages earned and taxes withheld. Bring all W-2s if you had multiple jobs.",
  },
  "Pay stubs": {
    what: "Recent pay statements showing your current income.",
    looksLike: "Printed or digital statements from your employer showing gross pay, deductions, and net pay. Typically need the last 2–4 pay stubs (covering the last 30 days).",
  },
  "Proof of residency": {
    what: "Documentation proving your current home address.",
    looksLike: "A recent utility bill (gas, electric, or water), current lease or rental agreement signed by your landlord, mortgage statement, or official government mail — all dated within the last 60 days. A cell phone bill or credit card statement may not be accepted.",
  },
  "Lease agreement": {
    what: "Your signed rental contract with your landlord.",
    looksLike: "A written document signed by both you and your landlord, showing your address, monthly rent amount, lease start/end dates, and both signatures.",
  },
  "Birth certificate": {
    what: "Official birth record issued by the government where you were born.",
    looksLike: "A state- or county-issued certified copy with an official raised seal or colored security paper. Hospital birth records and photocopies are generally NOT accepted — you need a government-certified copy. Order one from your state's vital records office.",
  },
  "Proof of citizenship": {
    what: "Documentation proving you are a US citizen.",
    looksLike: "US passport, US passport card, Certificate of Naturalization (Form N-550), Certificate of Citizenship (Form N-560), or a US birth certificate. A driver's license alone is not proof of citizenship.",
  },
  "Proof of immigration status": {
    what: "Documentation of your lawful immigration status in the United States.",
    looksLike: "Permanent Resident Card (Green Card / Form I-551), Employment Authorization Card (Form I-766), visa with I-94, or other USCIS-issued document. Must be current and not expired.",
  },
  "Bank statements": {
    what: "Recent statements from your checking or savings accounts.",
    looksLike: "Printed or digital statements from your bank showing your account number (last 4 digits), account holder name, and transaction history. Typically need the last 1–3 months.",
  },
  "Proof of disability": {
    what: "Documentation confirming a medical disability.",
    looksLike: "A Social Security Administration disability award letter (SSA-1099 or benefit verification letter), a letter from a licensed physician on official letterhead, or medical records documenting the condition. SSA letters can be downloaded at ssa.gov.",
  },
  "Medical records": {
    what: "Documentation of your medical history or current health conditions.",
    looksLike: "Records from your doctor, hospital, or clinic. Request them from your healthcare provider — you have a legal right to a copy. Include the most recent records relevant to your condition.",
  },
  "Proof of pregnancy": {
    what: "Documentation confirming your current pregnancy.",
    looksLike: "A letter from your doctor or midwife on official letterhead stating your name, the estimated due date, and their signature. A positive home pregnancy test is typically not accepted.",
  },
  "School enrollment verification": {
    what: "Official documentation that you or your child are currently enrolled in school.",
    looksLike: "An enrollment letter or transcript from the school's registrar, a current student ID, or a school-issued enrollment certificate. Must show the student's name, school name, and current enrollment status.",
  },
  "Immunization records": {
    what: "Documentation of vaccinations received.",
    looksLike: "An official immunization record from your doctor, state immunization registry printout, or yellow WHO vaccination booklet. Schools and programs typically require records showing dates and vaccine types.",
  },
  "Proof of insurance": {
    what: "Documentation showing you have (or lack) current health insurance coverage.",
    looksLike: "Insurance card from your provider, a letter from your employer confirming coverage, an Explanation of Benefits (EOB), or a letter from an insurer confirming you are uninsured.",
  },
  "Marriage certificate": {
    what: "Official record of your legal marriage.",
    looksLike: "A certified copy issued by the county clerk or registrar where you married, with an official seal. A wedding invitation or religious marriage certificate is not accepted.",
  },
  "Divorce decree": {
    what: "Court document finalizing your divorce.",
    looksLike: "A certified copy of the final divorce decree issued by the court, signed by a judge. Must include the date the divorce was finalized.",
  },
  "Utility bills": {
    what: "Recent bills for utilities at your home address.",
    looksLike: "Gas, electric, water, or landline phone bills dated within the last 60 days, showing your name and service address.",
  },
  "Mortgage statement": {
    what: "Monthly statement from your mortgage lender showing your loan details.",
    looksLike: "A statement from your bank or mortgage servicer showing your property address, loan balance, and monthly payment amount. Must be from the current or last month.",
  },
  "Landlord contact information": {
    what: "Name, address, and phone number of your current landlord.",
    looksLike: "A written statement or contact sheet with your landlord's full name, mailing address, phone number, and email. Some programs require a signed letter from the landlord confirming your tenancy.",
  },
  "Social Security award letter": {
    what: "Official letter from the SSA stating your benefit amount.",
    looksLike: "An official SSA letter (also called a benefit verification letter) showing your monthly benefit amount and the effective date. Download one free at ssa.gov or call 1-800-772-1213.",
  },
  "Veteran's discharge papers (DD-214)": {
    what: "Official military discharge document from the Department of Defense.",
    looksLike: "Form DD-214 (Certificate of Release or Discharge from Active Duty). Keep the Member Copy 4 — it contains the most information. Request a free copy at archives.gov/veterans.",
  },
}

function getDocInfo(doc: string): DocInfo {
  // Try exact match first
  if (DOCUMENT_INFO[doc]) return DOCUMENT_INFO[doc]
  // Try case-insensitive partial match
  const lower = doc.toLowerCase()
  for (const [key, info] of Object.entries(DOCUMENT_INFO)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return info
    }
  }
  // Generic fallback
  return {
    what: `Official documentation for ${doc}.`,
    looksLike: "Bring the original document and a photocopy. Check the program's official website for the exact format required.",
  }
}

export default function DocumentGuide({ documents }: { documents: string[] }) {
  const [checked, setChecked] = useState<boolean[]>(documents.map(() => false))
  const [expanded, setExpanded] = useState<boolean[]>(documents.map(() => false))

  const count = checked.filter(Boolean).length

  if (documents.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 p-6 text-center text-zinc-500 text-sm">
        No specific documents listed. Check the official program page for current requirements.
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold text-zinc-900">Required Documents</h2>
        <span className="text-sm text-zinc-500">{count} of {documents.length} ready</span>
      </div>

      {/* Progress bar */}
      <div className="mb-6 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-zinc-900 transition-all duration-300"
          style={{ width: `${(count / documents.length) * 100}%` }}
        />
      </div>

      <div className="space-y-3">
        {documents.map((doc, i) => {
          const info = getDocInfo(doc)
          return (
            <div
              key={i}
              className={`rounded-xl border transition-colors ${checked[i] ? "border-green-200 bg-green-50" : "border-zinc-200 bg-white"}`}
            >
              {/* Header row */}
              <div className="flex items-center gap-4 p-4">
                {/* Checkbox */}
                <button
                  type="button"
                  onClick={() => setChecked((prev) => prev.map((v, j) => (j === i ? !v : v)))}
                  className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    checked[i] ? "bg-green-600 border-green-600" : "border-zinc-300 hover:border-zinc-500"
                  }`}
                >
                  {checked[i] && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>

                {/* Name */}
                <span className={`flex-1 text-sm font-medium ${checked[i] ? "line-through text-zinc-400" : "text-zinc-900"}`}>
                  {doc}
                </span>

                {/* Expand toggle */}
                <button
                  type="button"
                  onClick={() => setExpanded((prev) => prev.map((v, j) => (j === i ? !v : v)))}
                  className="shrink-0 text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors"
                >
                  {expanded[i] ? "Hide" : "What's this?"}
                  <svg
                    className={`w-3.5 h-3.5 transition-transform ${expanded[i] ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 14 14"
                  >
                    <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              {/* Expanded details */}
              {expanded[i] && (
                <div className="px-4 pb-4 border-t border-zinc-100 pt-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">What it is</p>
                    <p className="text-sm text-zinc-700 leading-6">{info.what}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">What it looks like</p>
                    <p className="text-sm text-zinc-700 leading-6">{info.looksLike}</p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
