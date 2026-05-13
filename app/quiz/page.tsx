"use client"

import { useState } from "react"
import Link from "next/link"
import type { Grant } from "@/lib/types"

type ApplicantType = "individual" | "small_business" | null

interface Answers {
  type: ApplicantType
  // Individual
  isUsCitizen?: boolean
  isUsResident?: boolean
  isStudent?: boolean
  householdIncome?: number
  needsHousing?: boolean
  needsEnergy?: boolean
  // Business
  employeeCount?: number
  isMinorityOwned?: boolean
  isWomanOwned?: boolean
  isRural?: boolean
  industry?: string
  revenue?: number
}

function formatAmount(amount: number | null) {
  if (!amount) return "Varies"
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`
  return `$${amount}`
}

function matchGrants(answers: Answers, grants: Grant[]): Grant[] {
  return grants.filter((g) => {
    if (g.category !== answers.type) return false
    const c = g.eligibility_criteria

    if (answers.type === "individual") {
      if (c.requires_us_citizen && !answers.isUsCitizen) return false
      if (c.requires_us_resident && !answers.isUsResident) return false
      if (c.requires_student && !answers.isStudent) return false
      if (c.max_household_income && answers.householdIncome !== undefined) {
        if (answers.householdIncome > c.max_household_income) return false
      }
    }

    if (answers.type === "small_business") {
      if (c.min_employees !== undefined && answers.employeeCount !== undefined) {
        if (answers.employeeCount < c.min_employees) return false
      }
      if (c.max_employees !== undefined && answers.employeeCount !== undefined) {
        if (answers.employeeCount > c.max_employees) return false
      }
      if (c.max_revenue !== undefined && answers.revenue !== undefined) {
        if (answers.revenue > c.max_revenue) return false
      }
      if (c.requires_minority_owned && !answers.isMinorityOwned) return false
      if (c.requires_woman_owned && !answers.isWomanOwned) return false
      if (c.requires_rural && !answers.isRural) return false
      if (c.industries && answers.industry) {
        if (!c.industries.includes(answers.industry.toLowerCase())) return false
      }
    }

    return true
  })
}

interface StepProps {
  answers: Answers
  onChange: (updates: Partial<Answers>) => void
  onNext: () => void
  onBack: () => void
}

function StepType({ onChange, onNext }: Pick<StepProps, "onChange" | "onNext">) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-zinc-900 mb-2">
        Who is applying?
      </h2>
      <p className="text-zinc-500 mb-8">Select the option that best describes you.</p>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => { onChange({ type: "individual" }); onNext() }}
          className="rounded-xl border-2 border-zinc-200 p-6 text-left hover:border-zinc-900 transition-colors"
        >
          <div className="text-3xl mb-3">👤</div>
          <h3 className="font-semibold text-zinc-900 mb-1">Individual / Family</h3>
          <p className="text-sm text-zinc-500">
            Housing, energy assistance, education benefits
          </p>
        </button>
        <button
          onClick={() => { onChange({ type: "small_business" }); onNext() }}
          className="rounded-xl border-2 border-zinc-200 p-6 text-left hover:border-zinc-900 transition-colors"
        >
          <div className="text-3xl mb-3">🏢</div>
          <h3 className="font-semibold text-zinc-900 mb-1">Small Business</h3>
          <p className="text-sm text-zinc-500">
            Business grants, R&D funding, development programs
          </p>
        </button>
      </div>
    </div>
  )
}

function StepIndividual({ answers, onChange, onNext, onBack }: StepProps) {
  const [income, setIncome] = useState(answers.householdIncome?.toString() ?? "")
  return (
    <div>
      <h2 className="text-2xl font-semibold text-zinc-900 mb-2">
        About you
      </h2>
      <p className="text-zinc-500 mb-8">Answer a few questions to find matching grants.</p>
      <div className="space-y-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded"
            defaultChecked={answers.isUsCitizen}
            onChange={(e) => onChange({ isUsCitizen: e.target.checked })}
          />
          <span className="text-sm text-zinc-800">I am a US citizen</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded"
            defaultChecked={answers.isUsResident}
            onChange={(e) => onChange({ isUsResident: e.target.checked })}
          />
          <span className="text-sm text-zinc-800">I am a US resident</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded"
            defaultChecked={answers.isStudent}
            onChange={(e) => onChange({ isStudent: e.target.checked })}
          />
          <span className="text-sm text-zinc-800">
            I am an undergraduate student
          </span>
        </label>
        <div>
          <label className="block text-sm text-zinc-800 mb-2">
            Annual household income (optional)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">$</span>
            <input
              type="number"
              value={income}
              onChange={(e) => {
                setIncome(e.target.value)
                onChange({ householdIncome: e.target.value ? parseInt(e.target.value) : undefined })
              }}
              placeholder="e.g. 40000"
              className="w-full h-10 pl-7 pr-4 rounded-lg border border-zinc-300 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
        </div>
      </div>
      <div className="flex gap-3 mt-8">
        <button
          onClick={onBack}
          className="h-10 px-5 rounded-lg border border-zinc-300 text-sm font-medium text-zinc-700 hover:border-zinc-500 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="h-10 px-5 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 transition-colors"
        >
          See Results
        </button>
      </div>
    </div>
  )
}

function StepBusiness({ answers, onChange, onNext, onBack }: StepProps) {
  const [employees, setEmployees] = useState(answers.employeeCount?.toString() ?? "")
  const [revenue, setRevenue] = useState(answers.revenue?.toString() ?? "")
  return (
    <div>
      <h2 className="text-2xl font-semibold text-zinc-900 mb-2">
        About your business
      </h2>
      <p className="text-zinc-500 mb-8">We&apos;ll use this to find matching grants.</p>
      <div className="space-y-6">
        <div>
          <label className="block text-sm text-zinc-800 mb-2">
            Number of employees
          </label>
          <input
            type="number"
            value={employees}
            onChange={(e) => {
              setEmployees(e.target.value)
              onChange({ employeeCount: e.target.value ? parseInt(e.target.value) : undefined })
            }}
            placeholder="e.g. 10"
            className="w-full h-10 px-4 rounded-lg border border-zinc-300 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-800 mb-2">
            Annual revenue (optional)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">$</span>
            <input
              type="number"
              value={revenue}
              onChange={(e) => {
                setRevenue(e.target.value)
                onChange({ revenue: e.target.value ? parseInt(e.target.value) : undefined })
              }}
              placeholder="e.g. 500000"
              className="w-full h-10 pl-7 pr-4 rounded-lg border border-zinc-300 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-zinc-800 mb-2">
            Industry (optional)
          </label>
          <select
            defaultValue={answers.industry ?? ""}
            onChange={(e) => onChange({ industry: e.target.value || undefined })}
            className="w-full h-10 px-4 rounded-lg border border-zinc-300 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
          >
            <option value="">Select industry</option>
            <option value="technology">Technology</option>
            <option value="science">Science</option>
            <option value="engineering">Engineering</option>
            <option value="health">Health</option>
            <option value="agriculture">Agriculture</option>
            <option value="retail">Retail</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded"
              defaultChecked={answers.isMinorityOwned}
              onChange={(e) => onChange({ isMinorityOwned: e.target.checked })}
            />
            <span className="text-sm text-zinc-800">Minority-owned business</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded"
              defaultChecked={answers.isWomanOwned}
              onChange={(e) => onChange({ isWomanOwned: e.target.checked })}
            />
            <span className="text-sm text-zinc-800">Woman-owned business</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded"
              defaultChecked={answers.isRural}
              onChange={(e) => onChange({ isRural: e.target.checked })}
            />
            <span className="text-sm text-zinc-800">Located in a rural area</span>
          </label>
        </div>
      </div>
      <div className="flex gap-3 mt-8">
        <button
          onClick={onBack}
          className="h-10 px-5 rounded-lg border border-zinc-300 text-sm font-medium text-zinc-700 hover:border-zinc-500 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="h-10 px-5 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 transition-colors"
        >
          See Results
        </button>
      </div>
    </div>
  )
}

function Results({ matches, onReset }: { matches: Grant[]; onReset: () => void }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-zinc-900 mb-2">
        {matches.length > 0
          ? `You may qualify for ${matches.length} grant${matches.length === 1 ? "" : "s"}`
          : "No exact matches found"}
      </h2>
      <p className="text-zinc-500 mb-8">
        {matches.length > 0
          ? "Based on your answers. Verify eligibility directly with each program."
          : "Try browsing all grants or adjusting your answers."}
      </p>

      {matches.length === 0 ? (
        <Link
          href="/grants"
          className="inline-flex items-center h-10 px-5 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 transition-colors mb-6"
        >
          Browse All Grants
        </Link>
      ) : (
        <div className="space-y-4 mb-8">
          {matches.map((grant) => (
            <div
              key={grant.id}
              className="rounded-xl border border-zinc-200 p-5"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="font-semibold text-zinc-900">{grant.name}</h3>
                <span className="shrink-0 text-sm font-semibold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-full">
                  {formatAmount(grant.max_amount)}
                </span>
              </div>
              <p className="text-sm text-zinc-500 mb-1">{grant.agency}</p>
              <p className="text-sm text-zinc-600 mb-3 line-clamp-2">
                {grant.description}
              </p>
              {grant.required_documents.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-zinc-500 mb-1">
                    Required documents
                  </p>
                  <p className="text-xs text-zinc-600">
                    {grant.required_documents.slice(0, 3).join(" · ")}
                    {grant.required_documents.length > 3 && ` · +${grant.required_documents.length - 3} more`}
                  </p>
                </div>
              )}
              <a
                href={grant.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-zinc-900 hover:underline"
              >
                Apply at {grant.agency} →
              </a>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onReset}
        className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
      >
        ← Start over
      </button>
    </div>
  )
}

const ALL_GRANTS_KEY = "__grants__"

export default function QuizPage() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({ type: null })
  const [grants, setGrants] = useState<Grant[]>([])
  const [matches, setMatches] = useState<Grant[] | null>(null)
  const [loading, setLoading] = useState(false)

  function update(updates: Partial<Answers>) {
    setAnswers((prev) => ({ ...prev, ...updates }))
  }

  async function fetchAndMatch(finalAnswers: Answers) {
    setLoading(true)
    try {
      const cached = sessionStorage.getItem(ALL_GRANTS_KEY)
      let allGrants: Grant[]
      if (cached) {
        allGrants = JSON.parse(cached)
      } else {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/grants?select=*`,
          {
            headers: {
              apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
            },
          }
        )
        allGrants = await res.json()
        sessionStorage.setItem(ALL_GRANTS_KEY, JSON.stringify(allGrants))
      }
      setGrants(allGrants)
      setMatches(matchGrants(finalAnswers, allGrants))
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setStep(0)
    setAnswers({ type: null })
    setMatches(null)
  }

  if (matches !== null) {
    return (
      <div className="flex flex-col min-h-full">
        <Nav />
        <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">
          <Results matches={matches} onReset={reset} />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full">
      <Nav />
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">
        {/* Progress */}
        {step > 0 && (
          <div className="flex gap-1.5 mb-10">
            {[0, 1].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i < step ? "bg-zinc-900" : "bg-zinc-200"
                }`}
              />
            ))}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-zinc-500">
            <p>Finding your matches...</p>
          </div>
        ) : step === 0 ? (
          <StepType
            onChange={update}
            onNext={() => setStep(1)}
          />
        ) : answers.type === "individual" ? (
          <StepIndividual
            answers={answers}
            onChange={update}
            onNext={() => {
              fetchAndMatch(answers)
            }}
            onBack={() => setStep(0)}
          />
        ) : (
          <StepBusiness
            answers={answers}
            onChange={update}
            onNext={() => {
              fetchAndMatch(answers)
            }}
            onBack={() => setStep(0)}
          />
        )}
      </main>
      <Footer />
    </div>
  )
}

function Nav() {
  return (
    <nav className="border-b border-zinc-200 bg-white px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-zinc-900">
          GrantFinder
        </Link>
        <div className="flex gap-6 text-sm font-medium text-zinc-600">
          <Link href="/grants" className="hover:text-zinc-900 transition-colors">
            Browse Grants
          </Link>
          <Link href="/quiz" className="text-zinc-900 font-semibold">
            Eligibility Quiz
          </Link>
        </div>
      </div>
    </nav>
  )
}

function Footer() {
  return (
    <footer className="border-t border-zinc-200 py-8 px-6 text-center text-sm text-zinc-500">
      Grant information is for reference only. Verify eligibility with the issuing agency.
    </footer>
  )
}
