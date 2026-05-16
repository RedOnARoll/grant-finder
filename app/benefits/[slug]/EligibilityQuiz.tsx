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

type StringQuestion = {
  kind: "string"
  id: string
  text: string
  failReason: string
}

type Question = YesNoQuestion | PovertyQuestion | AMIQuestion | DollarQuestion | StringQuestion

// ─── Build questions from DB criteria ─────────────────────────────────────────

function buildQuestions(criteria: EligibilityCriteria | string[]): Question[] {
  if (Array.isArray(criteria)) {
    return criteria.map((req, i) => ({
      kind: "string" as const,
      id: `req_${i}`,
      text: req,
      failReason: req,
    }))
  }

  const c = criteria
  const questions: Question[] = []

  if (c.requires_us_citizen) {
    questions.push({
      kind: "yesno",
      id: "citizen",
      label: "Are you a US citizen?",
      helpText: "You must be a US citizen (naturalized or born). Permanent residents (green card holders) and visa holders do not qualify for this requirement. Check your passport, naturalization certificate, or birth certificate.",
      qualifyingAnswer: "yes",
      failReason: "Must be a US citizen",
    })
  }

  if (c.requires_us_resident && !c.requires_us_citizen) {
    questions.push({
      kind: "yesno",
      id: "resident",
      label: "Are you a US resident or permanent resident?",
      helpText: "This includes US citizens, lawful permanent residents (green card / Form I-551), refugees, asylees, and certain other immigration statuses. Temporary visas (tourist, student, work) typically do not qualify.",
      qualifyingAnswer: "yes",
      failReason: "Must be a US resident or permanent resident",
    })
  }

  if (c.requires_student) {
    questions.push({
      kind: "yesno",
      id: "student",
      label: "Are you currently enrolled as a student?",
      helpText: "You must be enrolled at an accredited school, college, or university. Part-time enrollment may or may not qualify — check the program's specific rules. Bring an enrollment verification letter from your registrar.",
      qualifyingAnswer: "yes",
      failReason: "Must be currently enrolled as a student",
    })
  }

  if (c.requires_rural) {
    questions.push({
      kind: "yesno",
      id: "rural",
      label: "Do you live in a rural area?",
      helpText: "USDA defines 'rural' as areas with populations under 50,000 that are not closely connected to urban centers. You can check your address at eligibility.sc.egov.usda.gov. Most suburbs do NOT qualify — small towns, farm communities, and countryside typically do.",
      qualifyingAnswer: "yes",
      failReason: "Must reside in a rural area",
    })
  }

  if (c.max_household_income_percent_poverty) {
    questions.push({
      kind: "poverty",
      id: "poverty",
      percent: c.max_household_income_percent_poverty,
      failReason: `Household income must be at or below ${c.max_household_income_percent_poverty}% of the federal poverty level`,
    })
  }

  if (c.max_household_income_percent_ami) {
    questions.push({
      kind: "ami",
      id: "ami",
      percent: c.max_household_income_percent_ami,
      failReason: `Household income must be at or below ${c.max_household_income_percent_ami}% of Area Median Income`,
    })
  }

  if (c.max_household_income && !c.max_household_income_percent_poverty && !c.max_household_income_percent_ami) {
    questions.push({
      kind: "dollar",
      id: "income",
      limit: c.max_household_income,
      failReason: `Annual household income must not exceed ${fmt(c.max_household_income)}`,
    })
  }

  return questions
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n)
}

// ─── Individual question renderers ────────────────────────────────────────────

function YesNoQ({
  q,
  answer,
  onAnswer,
}: {
  q: YesNoQuestion
  answer: "yes" | "no" | null
  onAnswer: (v: "yes" | "no") => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-zinc-200 rounded-xl p-5">
      <p className="text-sm font-semibold text-zinc-900 mb-3">{q.label}</p>
      {q.helpText && (
        <div className="mb-3">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            {open ? "Hide" : "How do I know?"}{" "}
            <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 12 12">
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {open && (
            <p className="mt-2 text-sm text-zinc-600 leading-6 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
              {q.helpText}
            </p>
          )}
        </div>
      )}
      <div className="flex gap-3">
        {(["yes", "no"] as const).map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => onAnswer(val)}
            className={`h-9 px-6 rounded-full text-sm font-medium border transition-colors ${
              answer === val
                ? val === "yes"
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-red-500 text-white border-red-500"
                : "border-zinc-300 text-zinc-700 hover:border-zinc-500"
            }`}
          >
            {val === "yes" ? "Yes" : "No"}
          </button>
        ))}
      </div>
    </div>
  )
}

function PovertyQ({
  q,
  householdSize,
  answer,
  onSize,
  onAnswer,
}: {
  q: PovertyQuestion
  householdSize: number | null
  answer: "yes" | "no" | null
  onSize: (n: number) => void
  onAnswer: (v: "yes" | "no") => void
}) {
  const limit = householdSize ? getIncomeLimit(householdSize, q.percent) : null

  return (
    <div className="border border-zinc-200 rounded-xl p-5">
      <p className="text-sm font-semibold text-zinc-900 mb-1">
        Income limit: {q.percent}% of the Federal Poverty Level
      </p>
      <p className="text-xs text-zinc-500 mb-4">
        Select your household size to see the exact income limit for you.
      </p>

      {/* Household size picker */}
      <div className="mb-4">
        <label className="text-xs font-medium text-zinc-600 block mb-2">How many people are in your household?</label>
        <div className="flex flex-wrap gap-2">
          {HOUSEHOLD_SIZES.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onSize(n)}
              className={`w-10 h-10 rounded-full text-sm font-medium border transition-colors ${
                householdSize === n
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "border-zinc-300 text-zinc-700 hover:border-zinc-500"
              }`}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onSize(9)}
            className={`h-10 px-3 rounded-full text-sm font-medium border transition-colors ${
              householdSize === 9
                ? "bg-zinc-900 text-white border-zinc-900"
                : "border-zinc-300 text-zinc-700 hover:border-zinc-500"
            }`}
          >
            9+
          </button>
        </div>
        <p className="text-xs text-zinc-400 mt-2">
          Count everyone who lives and eats together — yourself, spouse/partner, children, and any other dependents.
        </p>
      </div>

      {/* Computed threshold */}
      {limit && (
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 px-4 py-3 mb-4">
          <p className="text-xs text-zinc-500 mb-1">For a household of {householdSize}, your income must be at or below:</p>
          <p className="text-2xl font-bold text-zinc-900">{fmt(limit)}<span className="text-base font-normal text-zinc-500">/year</span></p>
          <p className="text-sm text-zinc-500 mt-0.5">{fmt(Math.round(limit / 12))}/month &nbsp;·&nbsp; {fmt(Math.round(limit / 52))}/week</p>
          <p className="text-xs text-zinc-400 mt-2">
            Income includes wages, self-employment, Social Security, rental income, child support, and most other regular income. Some deductions (rent, childcare, medical) may reduce your countable income.
          </p>
        </div>
      )}

      {/* Yes / No */}
      {limit && (
        <div>
          <p className="text-sm font-medium text-zinc-800 mb-2">Is your household income at or below {fmt(limit)}/year?</p>
          <div className="flex gap-3">
            {(["yes", "no"] as const).map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => onAnswer(val)}
                className={`h-9 px-6 rounded-full text-sm font-medium border transition-colors ${
                  answer === val
                    ? val === "yes"
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-red-500 text-white border-red-500"
                    : "border-zinc-300 text-zinc-700 hover:border-zinc-500"
                }`}
              >
                {val === "yes" ? "Yes" : "No"}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function AMIQuestion({
  q,
  selectedState,
  selectedArea,
  answer,
  onState,
  onArea,
  onAnswer,
}: {
  q: AMIQuestion
  selectedState: string | null
  selectedArea: number | null
  answer: "yes" | "no" | null
  onState: (s: string) => void
  onArea: (idx: number) => void
  onAnswer: (v: "yes" | "no") => void
}) {
  const areas = selectedState ? AMI_BY_STATE[selectedState] ?? [] : []
  const areaData = selectedArea !== null ? areas[selectedArea] : null
  const limit = areaData ? Math.round(areaData.ami * q.percent / 100) : null

  return (
    <div className="border border-zinc-200 rounded-xl p-5">
      <p className="text-sm font-semibold text-zinc-900 mb-1">
        Income limit: {q.percent}% of Area Median Income (AMI)
      </p>
      <p className="text-xs text-zinc-500 mb-4">
        AMI varies by location. Select your state and nearest area to see the exact income limit for you.
      </p>

      {/* State picker */}
      <div className="mb-4">
        <label className="text-xs font-medium text-zinc-600 block mb-1.5">What state do you live in?</label>
        <select
          value={selectedState ?? ""}
          onChange={(e) => onState(e.target.value)}
          className="h-10 px-3 rounded-lg border border-zinc-300 text-sm text-zinc-700 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 w-full max-w-xs"
        >
          <option value="">Select a state…</option>
          {US_STATES.map((s) => (
            <option key={s.code} value={s.code}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Area picker */}
      {selectedState && areas.length > 0 && (
        <div className="mb-4">
          <label className="text-xs font-medium text-zinc-600 block mb-1.5">What's your nearest metro / area?</label>
          <div className="flex flex-wrap gap-2">
            {areas.map((area, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onArea(idx)}
                className={`h-9 px-3 rounded-full text-xs font-medium border transition-colors ${
                  selectedArea === idx
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "border-zinc-300 text-zinc-700 hover:border-zinc-500"
                }`}
              >
                {area.name}
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-400 mt-2">
            AMI is set by HUD per county. Use "Statewide average" if you&apos;re unsure — actual limits may vary slightly.
          </p>
        </div>
      )}

      {/* Computed threshold */}
      {limit && areaData && (
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 px-4 py-3 mb-4">
          <p className="text-xs text-zinc-500 mb-1">
            Area Median Income for {areaData.name}: <span className="font-medium text-zinc-700">{fmt(areaData.ami)}/year</span>
          </p>
          <p className="text-xs text-zinc-500 mb-2">
            {q.percent}% of {fmt(areaData.ami)} = your income limit:
          </p>
          <p className="text-2xl font-bold text-zinc-900">{fmt(limit)}<span className="text-base font-normal text-zinc-500">/year</span></p>
          <p className="text-sm text-zinc-500 mt-0.5">{fmt(Math.round(limit / 12))}/month &nbsp;·&nbsp; {fmt(Math.round(limit / 52))}/week</p>
          <p className="text-xs text-zinc-400 mt-2">
            Based on HUD 2024 income limits. Actual limits may vary by county — verify at hud.gov/program_offices/comm_planning/affordablehousing/programs.
          </p>
        </div>
      )}

      {/* Yes / No */}
      {limit && (
        <div>
          <p className="text-sm font-medium text-zinc-800 mb-2">Is your household income at or below {fmt(limit)}/year?</p>
          <div className="flex gap-3">
            {(["yes", "no"] as const).map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => onAnswer(val)}
                className={`h-9 px-6 rounded-full text-sm font-medium border transition-colors ${
                  answer === val
                    ? val === "yes"
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-red-500 text-white border-red-500"
                    : "border-zinc-300 text-zinc-700 hover:border-zinc-500"
                }`}
              >
                {val === "yes" ? "Yes" : "No"}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function DollarQ({
  q,
  answer,
  onAnswer,
}: {
  q: DollarQuestion
  answer: "yes" | "no" | null
  onAnswer: (v: "yes" | "no") => void
}) {
  return (
    <div className="border border-zinc-200 rounded-xl p-5">
      <p className="text-sm font-semibold text-zinc-900 mb-1">
        Income limit: {fmt(q.limit)}/year
      </p>
      <div className="rounded-lg bg-zinc-50 border border-zinc-200 px-4 py-3 mb-4">
        <p className="text-2xl font-bold text-zinc-900">{fmt(q.limit)}<span className="text-base font-normal text-zinc-500">/year</span></p>
        <p className="text-sm text-zinc-500 mt-0.5">{fmt(Math.round(q.limit / 12))}/month &nbsp;·&nbsp; {fmt(Math.round(q.limit / 52))}/week</p>
        <p className="text-xs text-zinc-400 mt-2">
          Count all sources: wages, self-employment, Social Security, pensions, alimony, rental income, and investment income.
        </p>
      </div>
      <p className="text-sm font-medium text-zinc-800 mb-2">Is your annual household income below {fmt(q.limit)}?</p>
      <div className="flex gap-3">
        {(["yes", "no"] as const).map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => onAnswer(val)}
            className={`h-9 px-6 rounded-full text-sm font-medium border transition-colors ${
              answer === val
                ? val === "yes"
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-red-500 text-white border-red-500"
                : "border-zinc-300 text-zinc-700 hover:border-zinc-500"
            }`}
          >
            {val === "yes" ? "Yes" : "No"}
          </button>
        ))}
      </div>
    </div>
  )
}

function StringQ({
  q,
  answer,
  onAnswer,
}: {
  q: StringQuestion
  answer: "yes" | "no" | null
  onAnswer: (v: "yes" | "no") => void
}) {
  return (
    <div className="border border-zinc-200 rounded-xl p-5">
      <p className="text-sm font-semibold text-zinc-900 mb-3">{q.text}</p>
      <div className="flex gap-3">
        {(["yes", "no"] as const).map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => onAnswer(val)}
            className={`h-9 px-6 rounded-full text-sm font-medium border transition-colors ${
              answer === val
                ? val === "yes"
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-red-500 text-white border-red-500"
                : "border-zinc-300 text-zinc-700 hover:border-zinc-500"
            }`}
          >
            {val === "yes" ? "Yes" : "No"}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── State helpers ────────────────────────────────────────────────────────────

function isQuestionAnswered(
  q: Question,
  answers: Record<string, "yes" | "no">,
  householdSizes: Record<string, number>,
  states: Record<string, string>,
  areas: Record<string, number>,
): boolean {
  if (q.kind === "poverty") return !!householdSizes[q.id] && !!answers[q.id]
  if (q.kind === "ami") return !!states[q.id] && areas[q.id] !== undefined && !!answers[q.id]
  return !!answers[q.id]
}

function questionPassed(q: Question, answers: Record<string, "yes" | "no">): boolean {
  if (q.kind === "yesno") return answers[q.id] === q.qualifyingAnswer
  if (q.kind === "string") return answers[q.id] === "yes"
  return answers[q.id] === "yes"
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function EligibilityQuiz({
  criteria,
  slug,
}: {
  criteria: EligibilityCriteria | string[]
  slug: string
}) {
  const questions = buildQuestions(criteria)
  const [answers, setAnswers] = useState<Record<string, "yes" | "no">>({})
  const [householdSizes, setHouseholdSizes] = useState<Record<string, number>>({})
  const [selectedStates, setSelectedStates] = useState<Record<string, string>>({})
  const [selectedAreas, setSelectedAreas] = useState<Record<string, number>>({})

  if (questions.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 p-6">
        <h2 className="text-xl font-semibold text-zinc-900 mb-2">Eligibility</h2>
        <p className="text-sm text-zinc-500 mb-4">
          No specific criteria on file. Review the full requirements on the official program page before applying.
        </p>
        <Link
          href={`/benefits/${slug}/apply`}
          className="inline-flex items-center h-11 px-6 rounded-full bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 transition-colors"
        >
          Start Application →
        </Link>
      </div>
    )
  }

  const allAnswered = questions.every((q) =>
    isQuestionAnswered(q, answers, householdSizes, selectedStates, selectedAreas)
  )
  const failedQuestions = questions.filter((q) => !questionPassed(q, answers) && answers[q.id])
  const isEligible = allAnswered && failedQuestions.length === 0

  function setAnswer(id: string, val: "yes" | "no") {
    setAnswers((prev) => ({ ...prev, [id]: val }))
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-zinc-900 mb-1">Am I Eligible?</h2>
      <p className="text-sm text-zinc-500 mb-5">
        Answer each question to find out. We&apos;ll show you the exact numbers for your situation.
      </p>

      <div className="space-y-4">
        {questions.map((q) => {
          if (q.kind === "yesno") {
            return (
              <YesNoQ
                key={q.id}
                q={q}
                answer={answers[q.id] ?? null}
                onAnswer={(v) => setAnswer(q.id, v)}
              />
            )
          }
          if (q.kind === "poverty") {
            return (
              <PovertyQ
                key={q.id}
                q={q}
                householdSize={householdSizes[q.id] ?? null}
                answer={answers[q.id] ?? null}
                onSize={(n) => setHouseholdSizes((prev) => ({ ...prev, [q.id]: n }))}
                onAnswer={(v) => setAnswer(q.id, v)}
              />
            )
          }
          if (q.kind === "ami") {
            return (
              <AMIQuestion
                key={q.id}
                q={q}
                selectedState={selectedStates[q.id] ?? null}
                selectedArea={selectedAreas[q.id] ?? null}
                answer={answers[q.id] ?? null}
                onState={(s) => {
                  setSelectedStates((prev) => ({ ...prev, [q.id]: s }))
                  setSelectedAreas((prev) => {
                    const next = { ...prev }
                    delete next[q.id]
                    return next
                  })
                  setAnswers((prev) => {
                    const next = { ...prev }
                    delete next[q.id]
                    return next
                  })
                }}
                onArea={(idx) => setSelectedAreas((prev) => ({ ...prev, [q.id]: idx }))}
                onAnswer={(v) => setAnswer(q.id, v)}
              />
            )
          }
          if (q.kind === "dollar") {
            return (
              <DollarQ
                key={q.id}
                q={q}
                answer={answers[q.id] ?? null}
                onAnswer={(v) => setAnswer(q.id, v)}
              />
            )
          }
          return (
            <StringQ
              key={q.id}
              q={q}
              answer={answers[q.id] ?? null}
              onAnswer={(v) => setAnswer(q.id, v)}
            />
          )
        })}
      </div>

      {/* Result */}
      {allAnswered && (
        <div className="mt-6">
          {isEligible ? (
            <div className="rounded-xl bg-green-50 border border-green-200 p-5 mb-4">
              <p className="font-semibold text-green-800 mb-1">✓ You appear to be eligible</p>
              <p className="text-sm text-green-700">
                Based on your answers, you meet the requirements. Click below to see what documents you&apos;ll need to apply.
              </p>
            </div>
          ) : (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-5 mb-4">
              <p className="font-semibold text-amber-800 mb-2">You may not qualify based on your answers</p>
              <ul className="text-sm text-amber-700 space-y-1 mb-3">
                {failedQuestions.map((q) => (
                  <li key={q.id} className="flex items-start gap-2">
                    <span className="mt-1 shrink-0">•</span>
                    <span>{q.failReason}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-amber-600">
                Eligibility rules can have exceptions. You may still want to apply or speak with a local benefits counselor.
              </p>
            </div>
          )}
          <Link
            href={`/benefits/${slug}/apply`}
            className="inline-flex items-center h-11 px-6 rounded-full bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 transition-colors"
          >
            Start Application →
          </Link>
        </div>
      )}
    </div>
  )
}
