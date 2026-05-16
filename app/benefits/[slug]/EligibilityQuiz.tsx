"use client"

import { useState } from "react"
import Link from "next/link"
import type { EligibilityCriteria } from "@/lib/types"
import { getIncomeLimit, HOUSEHOLD_SIZES } from "@/lib/poverty-guidelines"
import { AMI_BY_STATE, US_STATES } from "@/lib/ami-data"

// ─── Question types ────────────────────────────────────────────────────────────

type YesNoQuestion = {
  kind: "yesno"
  id: string
  label: string
  helpText?: string
  qualifyingAnswer: "yes" | "no"
  failReason: string
}

type PovertyQuestion = {
  kind: "poverty"
  id: string
  percent: number
  failReason: string
}

type AMIQuestion = {
  kind: "ami"
  id: string
  percent: number
  failReason: string
}

type DollarQuestion = {
  kind: "dollar"
  id: string
  limit: number
  failReason: string
}

type Question = YesNoQuestion | PovertyQuestion | AMIQuestion | DollarQuestion

// ─── String requirement parser ────────────────────────────────────────────────

function parseStringRequirement(req: string, index: number): Question {
  const id = `req_${index}`
  const lower = req.toLowerCase()
  const failReason = req

  // "Specific categories include X, Y, Z" — check early before other keyword matches fire on the category names
  if (lower.startsWith("specific categor") || lower.includes("qualifying categor")) {
    const cats = req.replace(/^specific categories include\s*/i, "").replace(/\.$/, "")
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Do you fall into one of the qualifying categories?",
      helpText: `This program covers: ${cats}. If you belong to any of these groups, you likely qualify to apply.`,
    }
  }

  // AMI income limit — check before poverty since both use "income"
  const amiMatch = req.match(/(\d+)\s*%\s*of\s*(?:the\s*)?(?:area\s*median\s*income|ami)/i)
  if (amiMatch) {
    return { kind: "ami", id, percent: parseInt(amiMatch[1]), failReason }
  }

  // Federal poverty level income limit
  const povertyMatch = req.match(/(\d+)\s*%\s*(?:fpl|of\s*(?:the\s*)?(?:federal\s*poverty(?:\s*level)?|fpl))/i)
  if (povertyMatch) {
    return { kind: "poverty", id, percent: parseInt(povertyMatch[1]), failReason }
  }

  // Dollar income limit — e.g. "must not exceed $40,000" or "income limit of $30,000"
  const dollarMatch = req.match(/\$([0-9,]+)/)
  if (dollarMatch && (lower.includes("income") || lower.includes("earn") || lower.includes("wages"))) {
    return { kind: "dollar", id, limit: parseInt(dollarMatch[1].replace(/,/g, "")), failReason }
  }

  // "Low-income" without a specific % — treat as 80% FPL as a general check
  if ((lower.includes("low-income") || lower.includes("low income")) && lower.includes("income")) {
    return { kind: "poverty", id, percent: 80, failReason }
  }

  // Citizenship
  if (lower.includes("citizen") || lower.includes("qualifying non-citizen") || lower.includes("immigration status")) {
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Are you a US citizen or qualifying non-citizen?",
      helpText: "US citizens always qualify. Qualifying non-citizens include: lawful permanent residents (green card), refugees, asylees, Cuban/Haitian entrants, and certain parolees. Temporary visas (tourist, student, work) typically do not qualify.",
    }
  }

  // State residency
  if (lower.includes("resident of the state") || lower.includes("reside in the state") || lower.includes("live in the state")) {
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Do you currently live in the state where you're applying?",
      helpText: "You must physically live in — and intend to remain in — the state you're applying in. A state ID, utility bill, lease, or official mail showing your address is proof of residency.",
    }
  }

  // General US residency
  if (lower.includes("resident") || lower.includes("residency") || lower.includes("reside in")) {
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Are you a US resident?",
      helpText: "This includes US citizens, lawful permanent residents (green card), refugees, and asylees. Temporary visa holders typically do not qualify.",
    }
  }

  // Pregnancy / breastfeeding / postpartum
  if (lower.includes("pregnant") || lower.includes("breastfeed") || lower.includes("postpartum") || lower.includes("recently gave birth") || lower.includes("nursing")) {
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Are you currently pregnant, breastfeeding, or did you recently give birth?",
      helpText: "Many programs cover the full pregnancy plus up to 6–12 months after birth. Breastfeeding mothers are typically covered up to 12 months postpartum; non-breastfeeding mothers up to 6 months.",
    }
  }

  // Children / infants / toddlers — age-specific
  const childMaxAgeMatch = req.match(/(?:child(?:ren)?|infant|toddler|baby).*?(?:under|below|younger than)\s+age\s*(\d+)/i)
    || req.match(/(?:under|below|younger than)\s+age\s*(\d+).*?(?:child|infant|toddler)/i)
    || req.match(/age\s+(\d+)\s+(?:or\s+)?(?:younger|under|below)/i)
  if (childMaxAgeMatch) {
    const age = childMaxAgeMatch[1]
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: `Is the child you're applying for under age ${age}?`,
      helpText: `The child must be younger than ${age} years old at the time of application. Have the child's birth certificate or hospital record ready to confirm their age.`,
    }
  }

  // Children generally qualifying at different levels
  if (lower.includes("children") && lower.includes("qualify")) {
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Are you applying for a child (under 18)?",
      helpText: "Children typically qualify at higher income thresholds than adults for this program. Make sure to indicate the child's age and household income when you apply.",
    }
  }

  // Age minimum — "65 or older", "at least 18", "must be 21+"
  const ageMinMatch = req.match(/(?:be\s+|age\s+|least\s+)(\d+)\s*(?:or\s*)?(?:older|over|above|\+)/i)
  if (ageMinMatch) {
    const age = ageMinMatch[1]
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: `Are you ${age} years of age or older?`,
      helpText: `You must be at least ${age} years old to qualify. A government-issued ID showing your date of birth is required.`,
    }
  }

  // Age maximum — "under 18", "below age 65"
  const ageMaxMatch = req.match(/(?:under|below|younger than)\s+(?:age\s+)?(\d+)/i)
  if (ageMaxMatch && lower.includes("age")) {
    const age = ageMaxMatch[1]
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: `Are you under age ${age}?`,
      helpText: `You must be younger than ${age} to qualify for this program.`,
    }
  }

  // Disability
  if (lower.includes("disabilit") || lower.includes("disabled")) {
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Do you have a documented disability?",
      helpText: "A disability qualifies if it is recognized by the SSA (SSI/SSDI determination letter) or documented in writing by a licensed physician stating that your condition significantly limits one or more major life activities.",
    }
  }

  // Veteran / military
  if (lower.includes("veteran") || lower.includes("military service") || lower.includes("dd-214") || lower.includes("armed forces")) {
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Are you a US military veteran?",
      helpText: "You must have served in the US Armed Forces and received an honorable or general discharge. Have your DD-214 (Certificate of Release or Discharge from Active Duty) ready — it's required as proof.",
    }
  }

  // Student enrollment
  if (lower.includes("student") || (lower.includes("enrolled") && lower.includes("school"))) {
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Are you currently enrolled as a student?",
      helpText: "You must be actively enrolled at an accredited school, college, or university. Get an enrollment verification letter from your registrar — most schools provide this for free on the same day.",
    }
  }

  // Rural
  if (lower.includes("rural")) {
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Do you live in a rural area?",
      helpText: "USDA defines rural as communities with populations under 50,000 that are not closely connected to urban centers. Small towns, farm communities, and countryside areas typically qualify. Most suburbs do not.",
    }
  }

  // Currently receiving another benefit
  const receivingMatch = req.match(/(?:receiving|enrolled in|participating in)\s+(.+?)(?:\s+benefits?|\s+program|\s+assistance)?(?:\s+to\s+qualify|$)/i)
  if (receivingMatch && (lower.includes("receiving") || lower.includes("enrolled in") || lower.includes("participating"))) {
    const benefit = receivingMatch[1].trim()
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: `Are you currently receiving ${benefit}?`,
      helpText: `Eligibility is tied to your active enrollment in ${benefit}. Check your benefit card or contact your local benefits office to confirm your current enrollment status.`,
    }
  }

  // Fallback: convert the statement to a question grammatically
  return {
    kind: "yesno", id, qualifyingAnswer: "yes", failReason,
    label: statementToQuestion(req),
  }
}

function statementToQuestion(text: string): string {
  // Strip parenthetical notes for the question, keep them as context
  const cleaned = text.replace(/\s*\([^)]*\)/g, "").trim()

  // "X qualify/qualifies at/in/for..." → "Are you X?"
  const qualifiesMatch = cleaned.match(/^(.+?)\s+qualif(?:y|ies)\b/i)
  if (qualifiesMatch) {
    const subj = qualifiesMatch[1].trim().toLowerCase()
    return `Are you ${subj}?`
  }

  let q = cleaned
    .replace(/^Must be a\s+/i, "Are you a ")
    .replace(/^Must be an\s+/i, "Are you an ")
    .replace(/^Must be\s+/i, "Are you ")
    .replace(/^Must have\s+/i, "Do you have ")
    .replace(/^Must meet\s+/i, "Do you meet ")
    .replace(/^Must provide\s+/i, "Can you provide ")
    .replace(/^Must demonstrate\s+/i, "Can you demonstrate ")
    .replace(/^Must currently\s+/i, "Do you currently ")
    .replace(/^Must\s+/i, "Do you ")
    .replace(/^Required to\s+/i, "Do you ")
    .replace(/^Should be\s+/i, "Are you ")
    .replace(/^Applicant must\s+/i, "Do you ")

  if (!q.endsWith("?")) q += "?"
  return q
}

// ─── Build questions from DB criteria ─────────────────────────────────────────

function buildQuestions(criteria: EligibilityCriteria | string[]): Question[] {
  if (Array.isArray(criteria)) {
    return criteria.map((req, i) => parseStringRequirement(req, i))
  }

  const c = criteria
  const questions: Question[] = []

  if (c.requires_us_citizen) {
    questions.push({
      kind: "yesno", id: "citizen", qualifyingAnswer: "yes",
      failReason: "Must be a US citizen",
      label: "Are you a US citizen?",
      helpText: "You must be a US citizen — either born in the US or naturalized. Permanent residents (green card holders) and visa holders do not qualify for this requirement. Check your passport, naturalization certificate, or birth certificate.",
    })
  }
  if (c.requires_us_resident && !c.requires_us_citizen) {
    questions.push({
      kind: "yesno", id: "resident", qualifyingAnswer: "yes",
      failReason: "Must be a US resident or permanent resident",
      label: "Are you a US resident or permanent resident?",
      helpText: "This includes US citizens, lawful permanent residents (green card / Form I-551), refugees, asylees, and certain other immigration statuses. Temporary visas (tourist, student, work) typically do not qualify.",
    })
  }
  if (c.requires_student) {
    questions.push({
      kind: "yesno", id: "student", qualifyingAnswer: "yes",
      failReason: "Must be currently enrolled as a student",
      label: "Are you currently enrolled as a student?",
      helpText: "You must be enrolled at an accredited school, college, or university. Get an enrollment verification letter from your registrar — it's free and usually ready the same day.",
    })
  }
  if (c.requires_rural) {
    questions.push({
      kind: "yesno", id: "rural", qualifyingAnswer: "yes",
      failReason: "Must reside in a rural area",
      label: "Do you live in a rural area?",
      helpText: "USDA defines rural as areas with populations under 50,000 that are not closely connected to urban centers. Small towns, farm communities, and countryside typically qualify. Most suburbs do not.",
    })
  }
  if (c.max_household_income_percent_poverty) {
    questions.push({ kind: "poverty", id: "poverty", percent: c.max_household_income_percent_poverty, failReason: `Household income must be at or below ${c.max_household_income_percent_poverty}% of the federal poverty level` })
  }
  if (c.max_household_income_percent_ami) {
    questions.push({ kind: "ami", id: "ami", percent: c.max_household_income_percent_ami, failReason: `Household income must be at or below ${c.max_household_income_percent_ami}% of Area Median Income` })
  }
  if (c.max_household_income && !c.max_household_income_percent_poverty && !c.max_household_income_percent_ami) {
    questions.push({ kind: "dollar", id: "income", limit: c.max_household_income, failReason: `Annual household income must not exceed ${fmt(c.max_household_income)}` })
  }

  return questions
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n)
}

function isAnswered(q: Question, answers: Record<string, "yes" | "no">, sizes: Record<string, number>, states: Record<string, string>, areas: Record<string, number>): boolean {
  if (q.kind === "poverty") return !!sizes[q.id] && !!answers[q.id]
  if (q.kind === "ami") return !!states[q.id] && areas[q.id] !== undefined && !!answers[q.id]
  return !!answers[q.id]
}

function passed(q: Question, answers: Record<string, "yes" | "no">): boolean {
  if (q.kind === "yesno") return answers[q.id] === q.qualifyingAnswer
  return answers[q.id] === "yes"
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function YesNoQ({ q, answer, onAnswer }: { q: YesNoQuestion; answer: "yes" | "no" | null; onAnswer: (v: "yes" | "no") => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-zinc-200 rounded-xl p-5">
      <p className="text-sm font-semibold text-zinc-900 mb-3">{q.label}</p>
      {q.helpText && (
        <div className="mb-3">
          <button type="button" onClick={() => setOpen(o => !o)} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
            How do I know?
            <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 12 12">
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {open && <p className="mt-2 text-sm text-zinc-600 leading-6 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">{q.helpText}</p>}
        </div>
      )}
      <div className="flex gap-3">
        {(["yes", "no"] as const).map(val => (
          <button key={val} type="button" onClick={() => onAnswer(val)}
            className={`h-9 px-6 rounded-full text-sm font-medium border transition-colors ${
              answer === val
                ? val === "yes" ? "bg-green-600 text-white border-green-600" : "bg-red-500 text-white border-red-500"
                : "border-zinc-300 text-zinc-700 hover:border-zinc-500"
            }`}>
            {val === "yes" ? "Yes" : "No"}
          </button>
        ))}
      </div>
    </div>
  )
}

function PovertyQ({ q, householdSize, answer, onSize, onAnswer }: { q: PovertyQuestion; householdSize: number | null; answer: "yes" | "no" | null; onSize: (n: number) => void; onAnswer: (v: "yes" | "no") => void }) {
  const limit = householdSize ? getIncomeLimit(householdSize, q.percent) : null
  return (
    <div className="border border-zinc-200 rounded-xl p-5">
      <p className="text-sm font-semibold text-zinc-900 mb-1">What is your household income?</p>
      <p className="text-xs text-zinc-500 mb-4">This program requires income at or below <span className="font-medium text-zinc-700">{q.percent}% of the Federal Poverty Level</span>. Select your household size to see your exact limit.</p>
      <div className="mb-4">
        <label className="text-xs font-medium text-zinc-600 block mb-2">How many people are in your household?</label>
        <div className="flex flex-wrap gap-2">
          {HOUSEHOLD_SIZES.map(n => (
            <button key={n} type="button" onClick={() => onSize(n)}
              className={`w-10 h-10 rounded-full text-sm font-medium border transition-colors ${householdSize === n ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-300 text-zinc-700 hover:border-zinc-500"}`}>
              {n}
            </button>
          ))}
          <button type="button" onClick={() => onSize(9)}
            className={`h-10 px-3 rounded-full text-sm font-medium border transition-colors ${householdSize === 9 ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-300 text-zinc-700 hover:border-zinc-500"}`}>
            9+
          </button>
        </div>
        <p className="text-xs text-zinc-400 mt-2">Count everyone who lives and eats together — yourself, spouse/partner, children, and any dependents.</p>
      </div>
      {limit && (
        <>
          <div className="rounded-lg bg-zinc-50 border border-zinc-200 px-4 py-3 mb-4">
            <p className="text-xs text-zinc-500 mb-1">For a household of {householdSize}, your income must be at or below:</p>
            <p className="text-2xl font-bold text-zinc-900">{fmt(limit)}<span className="text-base font-normal text-zinc-500">/year</span></p>
            <p className="text-sm text-zinc-500 mt-0.5">{fmt(Math.round(limit / 12))}/month &nbsp;·&nbsp; {fmt(Math.round(limit / 52))}/week</p>
            <p className="text-xs text-zinc-400 mt-2">Includes wages, self-employment, Social Security, child support, rental income, and most regular income. Some programs allow deductions for rent, childcare, and medical costs that reduce your countable income.</p>
          </div>
          <p className="text-sm font-semibold text-zinc-900 mb-2">Is your household income at or below {fmt(limit)}/year?</p>
          <div className="flex gap-3">
            {(["yes", "no"] as const).map(val => (
              <button key={val} type="button" onClick={() => onAnswer(val)}
                className={`h-9 px-6 rounded-full text-sm font-medium border transition-colors ${
                  answer === val ? val === "yes" ? "bg-green-600 text-white border-green-600" : "bg-red-500 text-white border-red-500" : "border-zinc-300 text-zinc-700 hover:border-zinc-500"
                }`}>
                {val === "yes" ? "Yes" : "No"}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function AMIQuestionCard({ q, selectedState, selectedArea, answer, onState, onArea, onAnswer }: { q: AMIQuestion; selectedState: string | null; selectedArea: number | null; answer: "yes" | "no" | null; onState: (s: string) => void; onArea: (i: number) => void; onAnswer: (v: "yes" | "no") => void }) {
  const areas = selectedState ? AMI_BY_STATE[selectedState] ?? [] : []
  const areaData = selectedArea !== null ? areas[selectedArea] : null
  const limit = areaData ? Math.round(areaData.ami * q.percent / 100) : null
  return (
    <div className="border border-zinc-200 rounded-xl p-5">
      <p className="text-sm font-semibold text-zinc-900 mb-1">What is your household income?</p>
      <p className="text-xs text-zinc-500 mb-4">This program requires income at or below <span className="font-medium text-zinc-700">{q.percent}% of Area Median Income (AMI)</span>. AMI varies by location — select yours to see your exact limit.</p>
      <div className="mb-4">
        <label className="text-xs font-medium text-zinc-600 block mb-1.5">What state do you live in?</label>
        <select value={selectedState ?? ""} onChange={e => onState(e.target.value)}
          className="h-10 px-3 rounded-lg border border-zinc-300 text-sm text-zinc-700 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 w-full max-w-xs">
          <option value="">Select a state…</option>
          {US_STATES.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
        </select>
      </div>
      {selectedState && areas.length > 0 && (
        <div className="mb-4">
          <label className="text-xs font-medium text-zinc-600 block mb-1.5">What's your nearest metro or area?</label>
          <div className="flex flex-wrap gap-2">
            {areas.map((area, idx) => (
              <button key={idx} type="button" onClick={() => onArea(idx)}
                className={`h-9 px-3 rounded-full text-xs font-medium border transition-colors ${selectedArea === idx ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-300 text-zinc-700 hover:border-zinc-500"}`}>
                {area.name}
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-400 mt-2">HUD sets AMI per county. Use "Statewide average" if you're unsure.</p>
        </div>
      )}
      {limit && areaData && (
        <>
          <div className="rounded-lg bg-zinc-50 border border-zinc-200 px-4 py-3 mb-4">
            <p className="text-xs text-zinc-500 mb-1">Area Median Income for {areaData.name}: <span className="font-medium text-zinc-700">{fmt(areaData.ami)}/year</span></p>
            <p className="text-xs text-zinc-500 mb-2">{q.percent}% of that = your income limit:</p>
            <p className="text-2xl font-bold text-zinc-900">{fmt(limit)}<span className="text-base font-normal text-zinc-500">/year</span></p>
            <p className="text-sm text-zinc-500 mt-0.5">{fmt(Math.round(limit / 12))}/month &nbsp;·&nbsp; {fmt(Math.round(limit / 52))}/week</p>
            <p className="text-xs text-zinc-400 mt-2">Based on 2024 HUD income limits. Actual limits may vary by county.</p>
          </div>
          <p className="text-sm font-semibold text-zinc-900 mb-2">Is your household income at or below {fmt(limit)}/year?</p>
          <div className="flex gap-3">
            {(["yes", "no"] as const).map(val => (
              <button key={val} type="button" onClick={() => onAnswer(val)}
                className={`h-9 px-6 rounded-full text-sm font-medium border transition-colors ${
                  answer === val ? val === "yes" ? "bg-green-600 text-white border-green-600" : "bg-red-500 text-white border-red-500" : "border-zinc-300 text-zinc-700 hover:border-zinc-500"
                }`}>
                {val === "yes" ? "Yes" : "No"}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function DollarQ({ q, answer, onAnswer }: { q: DollarQuestion; answer: "yes" | "no" | null; onAnswer: (v: "yes" | "no") => void }) {
  return (
    <div className="border border-zinc-200 rounded-xl p-5">
      <p className="text-sm font-semibold text-zinc-900 mb-1">What is your household income?</p>
      <p className="text-xs text-zinc-500 mb-3">This program has an income limit of <span className="font-medium text-zinc-700">{fmt(q.limit)}/year</span>.</p>
      <div className="rounded-lg bg-zinc-50 border border-zinc-200 px-4 py-3 mb-4">
        <p className="text-2xl font-bold text-zinc-900">{fmt(q.limit)}<span className="text-base font-normal text-zinc-500">/year</span></p>
        <p className="text-sm text-zinc-500 mt-0.5">{fmt(Math.round(q.limit / 12))}/month &nbsp;·&nbsp; {fmt(Math.round(q.limit / 52))}/week</p>
        <p className="text-xs text-zinc-400 mt-2">Count all sources: wages, self-employment, Social Security, pensions, alimony, rental income, and investment income.</p>
      </div>
      <p className="text-sm font-semibold text-zinc-900 mb-2">Is your annual household income below {fmt(q.limit)}?</p>
      <div className="flex gap-3">
        {(["yes", "no"] as const).map(val => (
          <button key={val} type="button" onClick={() => onAnswer(val)}
            className={`h-9 px-6 rounded-full text-sm font-medium border transition-colors ${
              answer === val ? val === "yes" ? "bg-green-600 text-white border-green-600" : "bg-red-500 text-white border-red-500" : "border-zinc-300 text-zinc-700 hover:border-zinc-500"
            }`}>
            {val === "yes" ? "Yes" : "No"}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function EligibilityQuiz({ criteria, slug }: { criteria: EligibilityCriteria | string[]; slug: string }) {
  const questions = buildQuestions(criteria)
  const [answers, setAnswers] = useState<Record<string, "yes" | "no">>({})
  const [householdSizes, setHouseholdSizes] = useState<Record<string, number>>({})
  const [selectedStates, setSelectedStates] = useState<Record<string, string>>({})
  const [selectedAreas, setSelectedAreas] = useState<Record<string, number>>({})

  if (questions.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 p-6">
        <h2 className="text-xl font-semibold text-zinc-900 mb-2">Eligibility</h2>
        <p className="text-sm text-zinc-500 mb-4">No specific criteria on file for this program. Review the full requirements before applying.</p>
        <Link href={`/benefits/${slug}/apply`} className="inline-flex items-center h-11 px-6 rounded-full bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 transition-colors">Start Application →</Link>
      </div>
    )
  }

  const allAnswered = questions.every(q => isAnswered(q, answers, householdSizes, selectedStates, selectedAreas))
  const failedQuestions = questions.filter(q => answers[q.id] && !passed(q, answers))
  const isEligible = allAnswered && failedQuestions.length === 0

  function setAnswer(id: string, val: "yes" | "no") {
    setAnswers(prev => ({ ...prev, [id]: val }))
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-zinc-900 mb-1">Am I Eligible?</h2>
      <p className="text-sm text-zinc-500 mb-5">Answer each question — we'll show you the exact numbers for your situation.</p>

      <div className="space-y-4">
        {questions.map(q => {
          if (q.kind === "yesno") return <YesNoQ key={q.id} q={q} answer={answers[q.id] ?? null} onAnswer={v => setAnswer(q.id, v)} />
          if (q.kind === "poverty") return <PovertyQ key={q.id} q={q} householdSize={householdSizes[q.id] ?? null} answer={answers[q.id] ?? null} onSize={n => setHouseholdSizes(p => ({ ...p, [q.id]: n }))} onAnswer={v => setAnswer(q.id, v)} />
          if (q.kind === "ami") return (
            <AMIQuestionCard key={q.id} q={q} selectedState={selectedStates[q.id] ?? null} selectedArea={selectedAreas[q.id] ?? null} answer={answers[q.id] ?? null}
              onState={s => { setSelectedStates(p => ({ ...p, [q.id]: s })); setSelectedAreas(p => { const n = { ...p }; delete n[q.id]; return n }); setAnswers(p => { const n = { ...p }; delete n[q.id]; return n }) }}
              onArea={i => setSelectedAreas(p => ({ ...p, [q.id]: i }))}
              onAnswer={v => setAnswer(q.id, v)} />
          )
          if (q.kind === "dollar") return <DollarQ key={q.id} q={q} answer={answers[q.id] ?? null} onAnswer={v => setAnswer(q.id, v)} />
          return null
        })}
      </div>

      {allAnswered && (
        <div className="mt-6">
          {isEligible ? (
            <div className="rounded-xl bg-green-50 border border-green-200 p-5 mb-4">
              <p className="font-semibold text-green-800 mb-1">✓ You appear to be eligible</p>
              <p className="text-sm text-green-700">Based on your answers, you meet the requirements. Click below to see what documents you'll need to apply.</p>
            </div>
          ) : (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-5 mb-4">
              <p className="font-semibold text-amber-800 mb-2">You may not qualify based on your answers</p>
              <ul className="text-sm text-amber-700 space-y-1 mb-3">
                {failedQuestions.map(q => <li key={q.id} className="flex items-start gap-2"><span className="mt-1 shrink-0">•</span><span>{q.failReason}</span></li>)}
              </ul>
              <p className="text-xs text-amber-600">Eligibility rules can have exceptions. You may still want to apply or speak with a local benefits counselor.</p>
            </div>
          )}
          <Link href={`/benefits/${slug}/apply`} className="inline-flex items-center h-11 px-6 rounded-full bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 transition-colors">Start Application →</Link>
        </div>
      )}
    </div>
  )
}
