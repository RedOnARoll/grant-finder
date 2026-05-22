"use client"

import { useEffect, useMemo, useState } from "react"
import { CheckCircle, MapPin, RotateCcw } from "lucide-react"
import type { EligibilityCriteria } from "@/lib/types"

type BenefitDetailGuideProps = {
  slug: string
  name: string
  subcategory?: string | null
  description: string
  eligibilityCriteria: EligibilityCriteria | string[]
  documents: string[]
  processingTimeDays?: number | null
}

const CATEGORY_COPY: Record<string, { whatYouGet: string; tip: string; office: string }> = {
  food: {
    whatYouGet: "Help paying for groceries and nutrition support, usually through a card, meal program, or local provider.",
    tip: "If you need food this week, ask the local office whether expedited or emergency help is available.",
    office: "local benefits office",
  },
  housing: {
    whatYouGet: "Help with rent, housing costs, or finding stable housing through a local housing agency or approved provider.",
    tip: "Ask about priority lists if you are homeless, fleeing violence, disabled, elderly, or caring for children.",
    office: "public housing agency",
  },
  energy: {
    whatYouGet: "Help paying heating, cooling, or past-due utility bills, often paid directly to the utility company.",
    tip: "If you have a shutoff notice, mention it when you apply. Crisis applications are often handled faster.",
    office: "community action agency",
  },
  health: {
    whatYouGet: "Help paying for healthcare, prescriptions, coverage, or care services through a public program or approved provider.",
    tip: "Have insurance cards, medical bills, and income documents ready before you call.",
    office: "local health or benefits office",
  },
  childcare: {
    whatYouGet: "Help paying for child care, meals, or services so parents and caregivers can work, study, or stabilize care.",
    tip: "Ask whether your provider needs to be approved before benefits can be paid.",
    office: "child care assistance office",
  },
  disability: {
    whatYouGet: "Support for disability-related income, healthcare, services, equipment, or independent living needs.",
    tip: "Bring medical, school, or agency records that explain the disability and the support needed.",
    office: "local benefits office",
  },
  education: {
    whatYouGet: "Help paying for school, training, meals, or education-related services.",
    tip: "Ask the school or program office what documents they accept if you do not have one item on the list.",
    office: "school or program office",
  },
}

function criteriaToChecklist(criteria: EligibilityCriteria | string[]) {
  if (Array.isArray(criteria)) return criteria.filter(Boolean)

  const items: string[] = []
  if (criteria.requires_us_citizen) items.push("You are a U.S. citizen or eligible non-citizen.")
  if (criteria.requires_us_resident) items.push("You live in the United States.")
  if (criteria.requires_student) items.push("You or the person applying is enrolled as an eligible student.")
  if (criteria.max_household_income) items.push(`Your household income is at or below $${criteria.max_household_income.toLocaleString()}.`)
  if (criteria.max_household_income_percent_poverty) items.push(`Your household income is under ${criteria.max_household_income_percent_poverty}% of the federal poverty level.`)
  if (criteria.max_household_income_percent_ami) items.push(`Your household income is under ${criteria.max_household_income_percent_ami}% of area median income.`)
  if (criteria.education_level) items.push(`You meet the education requirement: ${criteria.education_level}.`)

  return items.length > 0 ? items : ["Your household matches the program rules listed by the agency."]
}

export default function BenefitDetailGuide({
  slug,
  name,
  subcategory,
  description,
  eligibilityCriteria,
  documents,
  processingTimeDays,
}: BenefitDetailGuideProps) {
  const storageKey = `gw_elig_${slug}`
  const [checked, setChecked] = useState<Set<number>>(new Set())
  const [zip, setZip] = useState("")
  const checklist = useMemo(() => criteriaToChecklist(eligibilityCriteria), [eligibilityCriteria])
  const category = subcategory ? CATEGORY_COPY[subcategory] : undefined
  const documentList = documents.length > 0 ? documents : ["Photo ID", "Proof of address", "Proof of income"]

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const saved = JSON.parse(window.localStorage.getItem(storageKey) ?? "[]")
        if (Array.isArray(saved)) setChecked(new Set(saved.filter((item) => typeof item === "number")))
        setZip(window.localStorage.getItem("gw_zip") ?? "")
      } catch {
        setChecked(new Set())
      }
    })

    return () => cancelAnimationFrame(frame)
  }, [storageKey])

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify([...checked]))
    } catch {
      // Ignore private browsing/storage failures.
    }
  }, [checked, storageKey])

  function toggle(index: number) {
    setChecked((current) => {
      const next = new Set(current)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  function saveZip(value: string) {
    const clean = value.replace(/\D/g, "").slice(0, 5)
    setZip(clean)
    try {
      if (clean) window.localStorage.setItem("gw_zip", clean)
      else window.localStorage.removeItem("gw_zip")
    } catch {
      // Ignore storage failures.
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">What you get</p>
        <p className="mt-3 text-lg leading-8 text-slate-800">{category?.whatYouGet ?? description}</p>
        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          {category?.tip ?? "Apply even if you are unsure. The agency or caseworker makes the final eligibility decision."}
        </div>
      </section>

      <section className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Do you qualify?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Check what applies to you. Your answers are saved on this device so you can come back later.
            </p>
          </div>
          <span className="text-sm text-slate-500">
            {checked.size}/{checklist.length} checked
          </span>
        </div>

        {checked.size > 0 && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
            <span>Your answers are saved on this device.</span>
            <button
              type="button"
              onClick={() => setChecked(new Set())}
              className="inline-flex items-center gap-1 font-medium text-slate-600 hover:text-slate-900"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
        )}

        <ul className="mt-5 space-y-3">
          {checklist.map((item, index) => {
            const isChecked = checked.has(index)
            return (
              <li key={`${item}-${index}`}>
                <label
                  className={`flex cursor-pointer gap-3 rounded-lg border p-4 transition-colors ${
                    isChecked ? "border-emerald-100 bg-emerald-50" : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggle(index)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-700"
                  />
                  <span className="text-sm leading-6 text-slate-700">{item}</span>
                </label>
              </li>
            )
          })}
        </ul>

        {checked.size >= Math.ceil(checklist.length * 0.75) && (
          <div className="mt-5 flex gap-3 rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
            <p>
              This looks like a strong match based on what you checked. Final eligibility is still decided by the agency,
              not GrantWay.
            </p>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">What to bring</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          If you do not have one of these, apply anyway and ask what substitutes are accepted.
        </p>
        <ul className="mt-5 space-y-3">
          {documentList.map((document, index) => (
            <li key={`${document}-${index}`} className="flex gap-3 text-sm leading-6 text-slate-700">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-xs font-semibold text-slate-700">
                {index + 1}
              </span>
              <span>{document}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">How to apply</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {processingTimeDays
            ? `Most applications take about ${processingTimeDays} days to process after submission.`
            : "Processing time varies by location and program funding."}
        </p>
        <ol className="mt-6 space-y-5">
          {[
            ["Find the right local office", `Use your ZIP code to confirm the ${category?.office ?? "local office"} that handles ${name}.`],
            ["Apply online, by phone, or in person", "Use the official application path and keep a copy of anything you submit."],
            ["Complete the interview or verification", "Many benefits require a short call, appointment, or document check."],
            ["Watch for a decision", "Keep mail, email, and phone open so you do not miss follow-up requests."],
          ].map(([title, body], index) => (
            <li key={title} className="flex gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                {index + 1}
              </span>
              <span className="pt-1">
                <span className="block text-base font-semibold text-slate-900">{title}</span>
                <span className="mt-1 block text-sm leading-6 text-slate-600">{body}</span>
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <MapPin className="h-4 w-4 text-amber-700" />
            Find local help
          </div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              value={zip}
              onChange={(event) => saveZip(event.target.value)}
              inputMode="numeric"
              maxLength={5}
              placeholder="Enter ZIP code"
              className="h-10 flex-1 rounded-lg border border-amber-200 bg-white px-3 text-sm outline-none focus:border-blue-600"
            />
            <button type="button" className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700">
              Save ZIP
            </button>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-600">
            {zip.length === 5
              ? `We saved ${zip} on this device for local program guidance.`
              : "Your ZIP helps you confirm the right local office and state-specific rules."}
          </p>
        </div>
      </section>
    </div>
  )
}
