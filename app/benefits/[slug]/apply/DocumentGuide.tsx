"use client"

import { useState } from "react"

// ─── Document categories ────────────────────────────────────────────────────

type DocCategory =
  | "application_form"
  | "photo_id"
  | "ssn"
  | "birth_certificate"
  | "income"
  | "tax"
  | "residency"
  | "energy_bill"
  | "bank"
  | "citizenship"
  | "disability"
  | "medical"
  | "school"
  | "marriage"
  | "lease"
  | "immunization"
  | "pregnancy"
  | "veteran"
  | "generic"

function categorize(doc: string): DocCategory {
  const d = doc.toLowerCase()
  if (d.includes("application") || d.includes("enrollment form")) return "application_form"
  if (d.includes("social security") && (d.includes("card") || d.includes("number"))) return "ssn"
  if (d.includes("birth certificate") || d.includes("identity and age") || d.includes("proof of age")) return "birth_certificate"
  if (d.includes("photo id") || d.includes("government-issued") || d.includes("driver") || d.includes("passport") || (d.includes("proof of identity") && !d.includes("age"))) return "photo_id"
  if (d.includes("income") || d.includes("pay stub") || d.includes("wages") || d.includes("earnings")) return "income"
  if (d.includes("tax return") || d.includes("w-2") || d.includes("w2") || d.includes("1040")) return "tax"
  if (d.includes("energy bill") || d.includes("utility bill") || d.includes("electric") || d.includes("gas bill") || d.includes("heating")) return "energy_bill"
  if (d.includes("residen") || d.includes("proof of address") || d.includes("proof of residence") || d.includes("current address")) return "residency"
  if (d.includes("bank statement") || d.includes("bank account")) return "bank"
  if (d.includes("citizenship") || d.includes("immigration") || d.includes("green card") || d.includes("naturalization") || d.includes("visa")) return "citizenship"
  if (d.includes("disability") || d.includes("award letter") || d.includes("ssi determination") || d.includes("ssa letter")) return "disability"
  if (d.includes("medical record") || d.includes("doctor") || d.includes("diagnosis")) return "medical"
  if (d.includes("school") || d.includes("enrollment") || d.includes("student") || d.includes("transcript")) return "school"
  if (d.includes("marriage certificate") || d.includes("marriage license")) return "marriage"
  if (d.includes("lease") || d.includes("rental agreement") || d.includes("mortgage")) return "lease"
  if (d.includes("immunization") || d.includes("vaccination") || d.includes("shot record")) return "immunization"
  if (d.includes("pregnancy") || d.includes("prenatal") || d.includes("due date")) return "pregnancy"
  if (d.includes("veteran") || d.includes("dd-214") || d.includes("military discharge")) return "veteran"
  return "generic"
}

// ─── Category info ──────────────────────────────────────────────────────────

interface DocInfo {
  what: string
  how: string // renamed from looksLike — "how to get it / what to look for"
}

const CATEGORY_INFO: Record<DocCategory, DocInfo> = {
  application_form: {
    what: "This is the application itself — you'll fill it out when you apply.",
    how: "You don't need to gather this in advance. When you click Apply Now below, you'll be taken directly to the form. Have your other documents ready so you can fill it out in one sitting.",
  },
  photo_id: {
    what: "A current, valid photo ID proving who you are.",
    how: "Use your state driver's license, state ID card, or US passport. It must show your photo and full legal name and must not be expired. If yours is expired, visit your local DMV to renew — most states offer same-day renewals.",
  },
  ssn: {
    what: "Your 9-digit Social Security Number, or the SSN card itself.",
    how: "Your SSN appears on your Social Security card, W-2 tax forms, and tax returns. If you need the physical card, you can request a free replacement online at ssa.gov or at any Social Security office — bring your photo ID.",
  },
  birth_certificate: {
    what: "An official government record proving your date and place of birth.",
    how: "You need a certified copy with a raised seal or color security paper — not a hospital record or photocopy. If you don't have one, order it from your state's vital records office (usually $10–$25). Processing takes 2–8 weeks, or faster in person.",
  },
  income: {
    what: "Documents proving how much money your household earns from all sources.",
    how: "Gather the most recent: pay stubs (last 30 days), employer letter on letterhead, or most recent tax return. For Social Security income, use your SSA award letter. For self-employment, use bank statements or a profit/loss summary. All income sources count — wages, tips, freelance, child support, retirement.",
  },
  tax: {
    what: "Your filed federal income tax return showing last year's income.",
    how: "You need IRS Form 1040 from the most recent tax year, including all schedules (A, B, C, etc.). If you don't have a copy, download a free transcript instantly at irs.gov/individuals/get-transcript — no printer needed, the PDF works.",
  },
  residency: {
    what: "A document proving you currently live at your address.",
    how: "Use a recent utility bill, bank statement, or official government mail — all must show your name and address and be dated within the last 60 days. A current lease or mortgage statement also works. Cell phone bills or credit card statements are usually not accepted.",
  },
  energy_bill: {
    what: "Your most recent bill from an energy provider (electric, gas, heating fuel, or propane).",
    how: "Find your latest bill from your electric company, gas company, or heating fuel supplier. It must show your name, service address, account number, and the amount due. If you pay through a landlord, ask them for a copy of the utility bill or a signed statement of your monthly energy costs.",
  },
  bank: {
    what: "Recent statements showing all money coming in and going out of your accounts.",
    how: "Print or download statements from your bank's website for the last 1–3 months. They must show your name, account number (last 4 digits is fine), and all transactions. Most banks let you download a PDF for free under 'Statements' or 'Documents' in online banking.",
  },
  citizenship: {
    what: "Proof that you are a US citizen or have a qualifying immigration status.",
    how: "US citizens: US passport, US birth certificate, or Certificate of Naturalization (Form N-550). Permanent residents: Permanent Resident Card (green card / Form I-551). Other statuses: Employment Authorization Card (Form I-766), refugee travel document, or visa with I-94 entry record. Must be current.",
  },
  disability: {
    what: "Official documentation confirming a physical or mental disability.",
    how: "The strongest proof is an SSA disability award letter or Supplemental Security Income (SSI) approval — download a free verification letter at ssa.gov. A doctor's letter on official letterhead works too: it must state your name, diagnosis, and how the condition limits daily activities.",
  },
  medical: {
    what: "Health records from a doctor, hospital, or clinic showing your medical history.",
    how: "Request records directly from your healthcare provider — by law, they must give you a copy within 30 days, often sooner. You have the right to them at no charge under HIPAA. Ask specifically for records related to the condition you're documenting.",
  },
  school: {
    what: "Proof that you or your child is currently enrolled in school.",
    how: "Get an enrollment verification letter from the school's registrar or main office — it's usually free and ready the same day. It must show the student's full name, school name, grade level, and current enrollment status. A current student ID card may also be accepted.",
  },
  marriage: {
    what: "Official documentation of your legal marriage.",
    how: "You need a certified copy from the county clerk or registrar where you married — religious or ceremonial certificates are not accepted. Certified copies cost $10–$30 and can usually be ordered online or in person. The document must have an official seal or stamp.",
  },
  lease: {
    what: "Your signed rental or ownership agreement for your current home.",
    how: "Use your current lease agreement signed by both you and your landlord, or your most recent mortgage statement from your lender. It must show your full name, the property address, and the current dates. If your lease is expired but you're still living there, ask your landlord for a new letter confirming your tenancy.",
  },
  immunization: {
    what: "A record of all vaccinations your child (or you) has received.",
    how: "Ask your pediatrician or family doctor for an official immunization record — they can print it on the spot. You can also request one from your state's immunization registry (most states have a free online portal). The record must show dates and vaccine names.",
  },
  pregnancy: {
    what: "A doctor's confirmation of your current pregnancy and expected due date.",
    how: "Ask your OB-GYN, midwife, or any licensed healthcare provider to write a letter on their official letterhead stating your name, your pregnancy status, and your estimated due date. A home pregnancy test is not accepted. If you don't have a doctor yet, a community health clinic can provide this.",
  },
  veteran: {
    what: "Your military discharge document proving your service record.",
    how: "You need Form DD-214 (Certificate of Release or Discharge from Active Duty) — specifically Member Copy 4, which contains the most complete information. If you've lost yours, request a free replacement at archives.gov/veterans/military-service-records — it takes 1–10 days online.",
  },
  generic: {
    what: "Supporting documentation for your application.",
    how: "Bring the original document and one photocopy. Make sure it clearly shows your name, the relevant dates, and any identifying numbers. If you're unsure exactly which format is required, you can call the program's helpline — a benefits counselor will tell you specifically what to bring.",
  },
}

// ─── Visual document mockups ────────────────────────────────────────────────

function DocVisual({ category }: { category: DocCategory }) {
  switch (category) {
    case "application_form":
      return (
        <div className="rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 p-4 font-mono text-xs text-zinc-500 space-y-1.5">
          <div className="text-zinc-700 font-semibold text-xs uppercase tracking-wide mb-2">Application Form</div>
          <div className="flex items-center gap-2"><span className="w-20 shrink-0">Name:</span><span className="flex-1 border-b border-zinc-300" /></div>
          <div className="flex items-center gap-2"><span className="w-20 shrink-0">Address:</span><span className="flex-1 border-b border-zinc-300" /></div>
          <div className="flex items-center gap-2"><span className="w-20 shrink-0">Income:</span><span className="flex-1 border-b border-zinc-300" /></div>
          <div className="flex items-center gap-2"><span className="w-20 shrink-0">Signature:</span><span className="flex-1 border-b border-zinc-300" /></div>
          <div className="text-blue-500 text-xs mt-1">→ You'll fill this out when you apply</div>
        </div>
      )

    case "photo_id":
      return (
        <div className="rounded-lg bg-gradient-to-br from-blue-800 to-blue-900 p-4 text-white font-mono text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-yellow-300 text-xs tracking-wider">DRIVER LICENSE</span>
            <span className="text-blue-300 text-[10px]">STATE OF —</span>
          </div>
          <div className="flex gap-3 mt-2">
            <div className="w-10 h-12 bg-blue-700 rounded border border-blue-500 flex items-center justify-center text-blue-400 text-[10px]">Photo</div>
            <div className="space-y-0.5">
              <div className="font-semibold">YOUR FULL NAME</div>
              <div className="text-blue-300">123 Main St, City ST</div>
              <div className="text-blue-300">DOB: 01/01/1990</div>
              <div className="text-yellow-300 text-[10px]">EXP: 01/01/2027</div>
            </div>
          </div>
        </div>
      )

    case "ssn":
      return (
        <div className="rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 p-4 text-white font-mono text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 text-[10px] uppercase tracking-widest">Social Security</span>
            <span className="text-slate-400 text-[10px]">Administration</span>
          </div>
          <div className="text-2xl font-bold tracking-widest text-center py-2">XXX-XX-XXXX</div>
          <div className="border-t border-slate-600 pt-2 font-semibold tracking-wide text-center text-sm">YOUR FULL LEGAL NAME</div>
        </div>
      )

    case "birth_certificate":
      return (
        <div className="rounded-lg border-4 border-double border-amber-700 bg-amber-50 p-4 text-xs text-amber-900 space-y-1 font-serif">
          <div className="text-center font-bold text-sm uppercase tracking-wide border-b border-amber-300 pb-2 mb-2">Certificate of Birth</div>
          <div className="flex justify-center mb-2">
            <div className="w-8 h-8 rounded-full border-2 border-amber-600 flex items-center justify-center text-amber-600 text-[10px] font-bold">SEAL</div>
          </div>
          <div><span className="font-semibold">Name:</span> Child&apos;s Full Name</div>
          <div><span className="font-semibold">Date of Birth:</span> Month DD, YYYY</div>
          <div><span className="font-semibold">Place of Birth:</span> City, State</div>
          <div className="text-amber-700 text-[10px] mt-1 italic">Certified Copy — Official State Seal Required</div>
        </div>
      )

    case "income":
      return (
        <div className="rounded-lg border border-zinc-300 bg-white p-4 font-mono text-xs space-y-1 text-zinc-700">
          <div className="font-bold text-zinc-900 border-b border-zinc-200 pb-1 mb-2">PAY STATEMENT</div>
          <div className="flex justify-between"><span>Employer:</span><span>ACME Corp</span></div>
          <div className="flex justify-between"><span>Period:</span><span>03/01–03/15/26</span></div>
          <div className="border-t border-zinc-200 my-1" />
          <div className="flex justify-between"><span>Gross Pay:</span><span>$2,500.00</span></div>
          <div className="flex justify-between text-red-500"><span>Federal Tax:</span><span>-$312.50</span></div>
          <div className="flex justify-between text-red-500"><span>FICA/Medicare:</span><span>-$191.25</span></div>
          <div className="flex justify-between font-bold text-green-700 border-t border-zinc-200 pt-1 mt-1"><span>Net Pay:</span><span>$1,996.25</span></div>
        </div>
      )

    case "tax":
      return (
        <div className="rounded-lg border border-zinc-300 bg-white p-4 font-mono text-xs text-zinc-700 space-y-1">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-1 mb-2">
            <span className="font-bold text-zinc-900">Form 1040</span>
            <span className="text-zinc-400 text-[10px]">Dept. of the Treasury — IRS</span>
          </div>
          <div className="text-zinc-500 text-[10px] mb-1">U.S. Individual Income Tax Return</div>
          <div className="flex justify-between"><span>Filing Status:</span><span>Single</span></div>
          <div className="flex justify-between"><span>Total Income:</span><span>$42,500</span></div>
          <div className="flex justify-between"><span>Adjusted Gross Income:</span><span>$40,200</span></div>
          <div className="flex justify-between font-bold border-t border-zinc-200 pt-1 mt-1"><span>Tax Due:</span><span>$4,522</span></div>
        </div>
      )

    case "residency":
    case "energy_bill":
      return (
        <div className="rounded-lg border border-zinc-300 bg-white p-4 font-mono text-xs text-zinc-700 space-y-1">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-1 mb-2">
            <span className="font-bold text-blue-700">{category === "energy_bill" ? "ELECTRIC BILL" : "UTILITY BILL"}</span>
            <span className="text-zinc-400 text-[10px]">Statement</span>
          </div>
          <div className="flex justify-between"><span>Account:</span><span>●●●●XXXXXX</span></div>
          <div className="flex justify-between"><span>Service Address:</span><span>123 Main St</span></div>
          <div className="flex justify-between"><span>City, State:</span><span>Anytown, ST</span></div>
          <div className="border-t border-zinc-200 my-1" />
          <div className="flex justify-between"><span>Statement Date:</span><span>04/01/2026</span></div>
          <div className="flex justify-between font-bold text-zinc-900"><span>Amount Due:</span><span>$124.38</span></div>
          <div className="flex justify-between text-zinc-400"><span>Due Date:</span><span>04/20/2026</span></div>
        </div>
      )

    case "bank":
      return (
        <div className="rounded-lg border border-zinc-300 bg-white p-4 font-mono text-xs text-zinc-700 space-y-1">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-1 mb-2">
            <span className="font-bold text-zinc-900">BANK STATEMENT</span>
            <span className="text-zinc-400 text-[10px]">Mar 1 – Mar 31</span>
          </div>
          <div className="flex justify-between"><span>Account:</span><span>●●●●●●1234</span></div>
          <div className="border-t border-zinc-200 my-1" />
          <div className="flex justify-between"><span>Opening Balance:</span><span>$1,250.00</span></div>
          <div className="flex justify-between text-green-700"><span>+ Deposits:</span><span>$3,200.00</span></div>
          <div className="flex justify-between text-red-500"><span>– Withdrawals:</span><span>-$2,847.22</span></div>
          <div className="flex justify-between font-bold border-t border-zinc-200 pt-1 mt-1"><span>Closing Balance:</span><span>$1,602.78</span></div>
        </div>
      )

    case "citizenship":
      return (
        <div className="rounded-lg bg-gradient-to-br from-red-700 to-blue-900 p-4 text-white font-mono text-xs space-y-2">
          <div className="flex items-center gap-2 border-b border-white/20 pb-2">
            <div className="text-[18px]">🇺🇸</div>
            <div>
              <div className="font-bold text-yellow-300 text-[11px]">UNITED STATES OF AMERICA</div>
              <div className="text-white/60 text-[10px]">Passport / Certificate of Naturalization</div>
            </div>
          </div>
          <div><span className="text-white/60">Surname: </span>DOE</div>
          <div><span className="text-white/60">Given Names: </span>JOHN</div>
          <div><span className="text-white/60">Nationality: </span>UNITED STATES</div>
          <div className="text-yellow-300 text-[10px] mt-1">Must not be expired</div>
        </div>
      )

    case "disability":
      return (
        <div className="rounded-lg border border-zinc-300 bg-white p-4 text-xs text-zinc-700 space-y-2">
          <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">SSA</div>
            <span className="font-bold text-zinc-900">Benefit Verification Letter</span>
          </div>
          <p className="text-[11px] text-zinc-600 leading-4">
            This letter is to certify that <span className="font-semibold">JOHN DOE</span> receives
            Supplemental Security Income (SSI) benefits in the amount of <span className="font-semibold">$943/month</span>.
          </p>
          <div className="text-zinc-400 text-[10px]">Social Security Administration • ssa.gov</div>
        </div>
      )

    case "school":
      return (
        <div className="rounded-lg border border-zinc-300 bg-white p-4 text-xs text-zinc-700 space-y-2">
          <div className="font-bold text-zinc-900 border-b border-zinc-200 pb-1">ENROLLMENT VERIFICATION</div>
          <p className="text-[11px] leading-4">
            This is to certify that <span className="font-semibold">STUDENT NAME</span> is currently enrolled
            as a <span className="font-semibold">full-time student</span> at <span className="font-semibold">University Name</span> for the
            Fall 2025 semester.
          </p>
          <div className="text-zinc-400 text-[10px]">Issued by: Office of the Registrar</div>
          <div className="border-t border-zinc-200 pt-1 text-zinc-500">_______________________<br />Registrar Signature</div>
        </div>
      )

    case "immunization":
      return (
        <div className="rounded-lg border border-zinc-300 bg-white p-4 font-mono text-xs text-zinc-700 space-y-1">
          <div className="font-bold text-zinc-900 border-b border-zinc-200 pb-1 mb-1">IMMUNIZATION RECORD</div>
          <div className="font-semibold text-[11px] mb-1">CHILD&apos;S NAME | DOB: 01/01/2022</div>
          {[["DTaP", "02/15/22"], ["Hib", "04/10/22"], ["IPV", "06/05/22"], ["MMR", "01/20/23"]].map(([v, d]) => (
            <div key={v} className="flex justify-between text-[11px]">
              <span className="text-zinc-600">{v}</span><span className="text-green-700">✓ {d}</span>
            </div>
          ))}
        </div>
      )

    case "pregnancy":
      return (
        <div className="rounded-lg border border-zinc-300 bg-white p-4 text-xs text-zinc-700 space-y-2">
          <div className="font-bold text-zinc-900 border-b border-zinc-200 pb-1">PHYSICIAN LETTER</div>
          <p className="text-[11px] leading-4">
            To Whom It May Concern,<br /><br />
            This letter certifies that <span className="font-semibold">PATIENT NAME</span> is currently
            pregnant with an estimated due date of <span className="font-semibold">Month DD, YYYY</span>.
          </p>
          <div className="border-t border-zinc-200 pt-2 text-[10px] text-zinc-500">
            Dr. Jane Smith, MD<br />
            License #: XXXXXXXXX<br />
            Date: MM/DD/YYYY
          </div>
        </div>
      )

    case "veteran":
      return (
        <div className="rounded-lg bg-gradient-to-br from-olive-700 to-zinc-800 bg-zinc-800 p-4 text-white font-mono text-xs space-y-1">
          <div className="flex items-center gap-2 border-b border-white/20 pb-2 mb-1">
            <div className="text-[16px]">⭐</div>
            <span className="font-bold text-yellow-300 tracking-wide">DD FORM 214</span>
          </div>
          <div className="text-white/70 text-[10px] mb-2">Certificate of Release from Active Duty</div>
          <div><span className="text-white/50">Name: </span>DOE, JOHN A.</div>
          <div><span className="text-white/50">Branch: </span>U.S. ARMY</div>
          <div><span className="text-white/50">Service Dates: </span>01/2018 – 01/2022</div>
          <div><span className="text-white/50">Character: </span>HONORABLE</div>
        </div>
      )

    case "marriage":
    case "lease":
    case "medical":
    case "generic":
    default:
      return (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 flex items-center justify-center">
          <svg className="w-12 h-12 text-zinc-300" fill="none" viewBox="0 0 48 48">
            <rect x="8" y="4" width="32" height="40" rx="3" stroke="currentColor" strokeWidth="2" />
            <line x1="16" y1="16" x2="32" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="22" x2="32" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="28" x2="26" y2="28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      )
  }
}

// ─── Main component ─────────────────────────────────────────────────────────

export default function DocumentGuide({ documents }: { documents: string[] }) {
  const [checked, setChecked] = useState<boolean[]>(documents.map(() => false))
  const [expanded, setExpanded] = useState<boolean[]>(documents.map(() => false))

  const categories = documents.map(categorize)
  const nonFormDocs = documents.filter((_, i) => categories[i] !== "application_form")
  const checkableCount = nonFormDocs.length
  const checkedCount = checked.filter((v, i) => v && categories[i] !== "application_form").length

  if (documents.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 p-6 text-center text-zinc-500 text-sm">
        No specific documents listed for this program.
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold text-zinc-900">Required Documents</h2>
        {checkableCount > 0 && (
          <span className="text-sm text-zinc-500">{checkedCount} of {checkableCount} ready</span>
        )}
      </div>

      {checkableCount > 0 && (
        <div className="mb-6 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-zinc-900 transition-all duration-300"
            style={{ width: `${(checkedCount / checkableCount) * 100}%` }}
          />
        </div>
      )}

      <div className="space-y-3">
        {documents.map((doc, i) => {
          const cat = categories[i]
          const isForm = cat === "application_form"
          const info = CATEGORY_INFO[cat]

          return (
            <div
              key={i}
              className={`rounded-xl border transition-colors ${
                isForm
                  ? "border-blue-200 bg-blue-50"
                  : checked[i]
                  ? "border-green-200 bg-green-50"
                  : "border-zinc-200 bg-white"
              }`}
            >
              {/* Header row */}
              <div className="flex items-center gap-4 p-4">
                {isForm ? (
                  <div className="shrink-0 w-6 h-6 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-500 text-xs font-bold">→</div>
                ) : (
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
                )}

                <span className={`flex-1 text-sm font-medium ${
                  isForm ? "text-blue-900" : checked[i] ? "line-through text-zinc-400" : "text-zinc-900"
                }`}>
                  {doc}
                </span>

                <button
                  type="button"
                  onClick={() => setExpanded((prev) => prev.map((v, j) => (j === i ? !v : v)))}
                  className="shrink-0 text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors"
                >
                  {expanded[i] ? "Hide" : "What's this?"}
                  <svg className={`w-3.5 h-3.5 transition-transform ${expanded[i] ? "rotate-180" : ""}`} fill="none" viewBox="0 0 14 14">
                    <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              {/* Expanded details */}
              {expanded[i] && (
                <div className="px-4 pb-4 border-t border-zinc-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    {/* Visual */}
                    <DocVisual category={cat} />

                    {/* Text */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">What it is</p>
                        <p className="text-sm text-zinc-700 leading-6">{info.what}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">
                          {isForm ? "What to expect" : "How to get it"}
                        </p>
                        <p className="text-sm text-zinc-700 leading-6">{info.how}</p>
                      </div>
                    </div>
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
