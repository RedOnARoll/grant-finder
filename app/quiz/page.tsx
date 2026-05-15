"use client"

import { useState } from "react"
import Link from "next/link"
import type { Grant, EligibilityCriteria } from "@/lib/types"

type Mode = "grant" | "benefit" | "both" | null
type ApplicantType = "individual" | "small_business" | null

interface Answers {
  mode: Mode
  type: ApplicantType
  // Individual grants
  isUsCitizen?: boolean
  isUsResident?: boolean
  isStudent?: boolean
  householdIncome?: number
  // Business grants
  employeeCount?: number
  isMinorityOwned?: boolean
  isWomanOwned?: boolean
  isRural?: boolean
  industry?: string
  revenue?: number
  // Benefits needs (subcategories)
  benefitNeeds: string[]
}

const BENEFIT_NEEDS = [
  { key: "housing",    label: "Housing Assistance",  icon: "🏠" },
  { key: "food",       label: "Food Aid",            icon: "🥗" },
  { key: "disability", label: "Disability Support",  icon: "♿" },
  { key: "education",  label: "Education",           icon: "🎓" },
  { key: "childcare",  label: "Childcare",           icon: "👶" },
  { key: "energy",     label: "Energy Assistance",   icon: "⚡" },
  { key: "health",     label: "Healthcare",          icon: "❤️" },
]

function formatAmount(amount: number | null) {
  if (!amount) return "Varies"
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`
  return `$${amount}`
}

function matchGrants(answers: Answers, all: Grant[]): Grant[] {
  const results: Grant[] = []

  const wantsGrants = answers.mode === "grant" || answers.mode === "both"
  const wantsBenefits = answers.mode === "benefit" || answers.mode === "both"

  if (wantsGrants && answers.type) {
    const grants = all.filter((g) => g.type === "grant" && g.category === answers.type)
    const matched = grants.filter((g) => {
      const c = g.eligibility_criteria
      if (Array.isArray(c)) return true
      const ec = c as EligibilityCriteria

      if (answers.type === "individual") {
        if (ec.requires_us_citizen && !answers.isUsCitizen) return false
        if (ec.requires_us_resident && !answers.isUsResident) return false
        if (ec.requires_student && !answers.isStudent) return false
        if (ec.max_household_income && answers.householdIncome !== undefined) {
          if (answers.householdIncome > ec.max_household_income) return false
        }
      }

      if (answers.type === "small_business") {
        if (ec.min_employees !== undefined && answers.employeeCount !== undefined) {
          if (answers.employeeCount < ec.min_employees) return false
        }
        if (ec.max_employees !== undefined && answers.employeeCount !== undefined) {
          if (answers.employeeCount > ec.max_employees) return false
        }
        if (ec.max_revenue !== undefined && answers.revenue !== undefined) {
          if (answers.revenue > ec.max_revenue) return false
        }
        if (ec.requires_minority_owned && !answers.isMinorityOwned) return false
        if (ec.requires_woman_owned && !answers.isWomanOwned) return false
        if (ec.requires_rural && !answers.isRural) return false
        if (ec.industries && answers.industry) {
          if (!ec.industries.includes(answers.industry.toLowerCase())) return false
        }
      }
      return true
    })
    results.push(...matched)
  }

  if (wantsBenefits) {
    const benefits = all.filter((g) => g.type === "benefit")
    const matched =
      answers.benefitNeeds.length > 0
        ? benefits.filter((b) => answers.benefitNeeds.includes(b.subcategory ?? ""))
        : benefits
    results.push(...matched)
  }

  return results
}

interface StepProps {
  answers: Answers
  onChange: (updates: Partial<Answers>) => void
  onNext: () => void
  onBack: () => void
}

function StepMode({ onChange, onNext }: Pick<StepProps, "onChange" | "onNext">) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-zinc-900 mb-2">What are you looking for?</h2>
      <p className="text-zinc-500 mb-8">Select the option that best describes your situation.</p>
      <div className="grid gap-4">
        <button
          onClick={() => { onChange({ mode: "grant" }); onNext() }}
          className="rounded-xl border-2 border-zinc-200 p-5 text-left hover:border-zinc-900 transition-colors"
        >
          <div className="flex items-start gap-4">
            <span className="text-2xl">💰</span>
            <div>
              <h3 className="font-semibold text-zinc-900 mb-0.5">Grants</h3>
              <p className="text-sm text-zinc-500">Competitive funding for businesses, researchers, artists, and individuals — you apply and get selected.</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => { onChange({ mode: "benefit" }); onNext() }}
          className="rounded-xl border-2 border-zinc-200 p-5 text-left hover:border-zinc-900 transition-colors"
        >
          <div className="flex items-start gap-4">
            <span className="text-2xl">🤝</span>
            <div>
              <h3 className="font-semibold text-zinc-900 mb-0.5">Benefits</h3>
              <p className="text-sm text-zinc-500">Ongoing government assistance programs — housing, food, healthcare, disability support, and more.</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => { onChange({ mode: "both" }); onNext() }}
          className="rounded-xl border-2 border-zinc-200 p-5 text-left hover:border-zinc-900 transition-colors"
        >
          <div className="flex items-start gap-4">
            <span className="text-2xl">🔍</span>
            <div>
              <h3 className="font-semibold text-zinc-900 mb-0.5">Both</h3>
              <p className="text-sm text-zinc-500">Show me everything — grants and benefit programs that match my situation.</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}

function StepBenefitNeeds({ answers, onChange, onNext, onBack }: StepProps) {
  const toggle = (key: string) => {
    const current = answers.benefitNeeds
    const updated = current.includes(key) ? current.filter((k) => k !== key) : [...current, key]
    onChange({ benefitNeeds: updated })
  }
  return (
    <div>
      <h2 className="text-2xl font-semibold text-zinc-900 mb-2">What type of assistance do you need?</h2>
      <p className="text-zinc-500 mb-8">Select all that apply. We&apos;ll show matching programs.</p>
      <div className="grid grid-cols-2 gap-3 mb-8">
        {BENEFIT_NEEDS.map(({ key, label, icon }) => {
          const selected = answers.benefitNeeds.includes(key)
          return (
            <button
              key={key}
              onClick={() => toggle(key)}
              className={`rounded-xl border-2 p-4 text-left transition-colors ${
                selected
                  ? "border-zinc-900 bg-zinc-50"
                  : "border-zinc-200 hover:border-zinc-400"
              }`}
            >
              <div className="text-xl mb-1">{icon}</div>
              <span className="text-sm font-medium text-zinc-900">{label}</span>
            </button>
          )
        })}
      </div>
      <div className="flex gap-3">
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
          {answers.benefitNeeds.length === 0 ? "Show All Benefits" : "See Results"}
        </button>
      </div>
    </div>
  )
}

function StepType({ answers, onChange, onNext, onBack }: StepProps) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-zinc-900 mb-2">Who is applying?</h2>
      <p className="text-zinc-500 mb-8">Select the option that best describes you.</p>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => { onChange({ type: "individual" }); onNext() }}
          className="rounded-xl border-2 border-zinc-200 p-6 text-left hover:border-zinc-900 transition-colors"
        >
          <div className="text-3xl mb-3">👤</div>
          <h3 className="font-semibold text-zinc-900 mb-1">Individual / Family</h3>
          <p className="text-sm text-zinc-500">Education, arts, personal research grants</p>
        </button>
        <button
          onClick={() => { onChange({ type: "small_business" }); onNext() }}
          className="rounded-xl border-2 border-zinc-200 p-6 text-left hover:border-zinc-900 transition-colors"
        >
          <div className="text-3xl mb-3">🏢</div>
          <h3 className="font-semibold text-zinc-900 mb-1">Small Business</h3>
          <p className="text-sm text-zinc-500">Business grants, R&D funding, development programs</p>
        </button>
      </div>
      <button
        onClick={onBack}
        className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
      >
        ← Back
      </button>
    </div>
  )
}

function StepIndividual({ answers, onChange, onNext, onBack }: StepProps) {
  const [income, setIncome] = useState(answers.householdIncome?.toString() ?? "")
  return (
    <div>
      <h2 className="text-2xl font-semibold text-zinc-900 mb-2">About you</h2>
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
          <span className="text-sm text-zinc-800">I am a US resident or permanent resident</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded"
            defaultChecked={answers.isStudent}
            onChange={(e) => onChange({ isStudent: e.target.checked })}
          />
          <span className="text-sm text-zinc-800">I am an undergraduate student</span>
        </label>
        <div>
          <label className="block text-sm text-zinc-800 mb-2">Annual household income (optional)</label>
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
      <h2 className="text-2xl font-semibold text-zinc-900 mb-2">About your business</h2>
      <p className="text-zinc-500 mb-8">We&apos;ll use this to find matching grants.</p>
      <div className="space-y-6">
        <div>
          <label className="block text-sm text-zinc-800 mb-2">Number of employees</label>
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
          <label className="block text-sm text-zinc-800 mb-2">Annual revenue (optional)</label>
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
          <label className="block text-sm text-zinc-800 mb-2">Industry (optional)</label>
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
            <input type="checkbox" className="w-4 h-4 rounded" defaultChecked={answers.isMinorityOwned} onChange={(e) => onChange({ isMinorityOwned: e.target.checked })} />
            <span className="text-sm text-zinc-800">Minority-owned business</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded" defaultChecked={answers.isWomanOwned} onChange={(e) => onChange({ isWomanOwned: e.target.checked })} />
            <span className="text-sm text-zinc-800">Woman-owned business</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded" defaultChecked={answers.isRural} onChange={(e) => onChange({ isRural: e.target.checked })} />
            <span className="text-sm text-zinc-800">Located in a rural area</span>
          </label>
        </div>
      </div>
      <div className="flex gap-3 mt-8">
        <button onClick={onBack} className="h-10 px-5 rounded-lg border border-zinc-300 text-sm font-medium text-zinc-700 hover:border-zinc-500 transition-colors">
          Back
        </button>
        <button onClick={onNext} className="h-10 px-5 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 transition-colors">
          See Results
        </button>
      </div>
    </div>
  )
}

function Results({ matches, mode, onReset }: { matches: Grant[]; mode: Mode; onReset: () => void }) {
  const grantMatches = matches.filter((m) => m.type === "grant")
  const benefitMatches = matches.filter((m) => m.type === "benefit")

  const totalLabel =
    mode === "grant" ? `${grantMatches.length} grant${grantMatches.length === 1 ? "" : "s"}` :
    mode === "benefit" ? `${benefitMatches.length} benefit program${benefitMatches.length === 1 ? "" : "s"}` :
    `${matches.length} program${matches.length === 1 ? "" : "s"}`

  return (
    <div>
      <h2 className="text-2xl font-semibold text-zinc-900 mb-2">
        {matches.length > 0
          ? `You may qualify for ${totalLabel}`
          : "No exact matches found"}
      </h2>
      <p className="text-zinc-500 mb-8">
        {matches.length > 0
          ? "Based on your answers. Verify eligibility directly with each program."
          : "Try browsing all programs or adjusting your answers."}
      </p>

      {matches.length === 0 ? (
        <div className="flex gap-3 mb-6">
          <Link href="/grants" className="inline-flex items-center h-10 px-5 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 transition-colors">
            Browse Grants
          </Link>
          <Link href="/benefits" className="inline-flex items-center h-10 px-5 rounded-lg border border-zinc-300 text-zinc-900 text-sm font-medium hover:bg-zinc-100 transition-colors">
            Browse Benefits
          </Link>
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {mode === "both" && grantMatches.length > 0 && (
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide pt-2">Grants</p>
          )}
          {(mode === "both" ? grantMatches : mode === "grant" ? grantMatches : []).map((item) => (
            <ResultCard key={item.id} item={item} href={`/grants/${item.slug}`} />
          ))}
          {mode === "both" && benefitMatches.length > 0 && (
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide pt-2">Benefits</p>
          )}
          {(mode === "both" ? benefitMatches : mode === "benefit" ? benefitMatches : []).map((item) => (
            <ResultCard key={item.id} item={item} href={`/benefits/${item.slug}`} />
          ))}
        </div>
      )}

      <button onClick={onReset} className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
        ← Start over
      </button>
    </div>
  )
}

function ResultCard({ item, href }: { item: Grant; href: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 p-5">
      <div className="flex items-start justify-between gap-4 mb-2">
        <h3 className="font-semibold text-zinc-900">{item.name}</h3>
        <span className="shrink-0 text-sm font-semibold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-full">
          {formatAmount(item.max_amount)}
        </span>
      </div>
      <p className="text-sm text-zinc-500 mb-1">{item.agency}</p>
      <p className="text-sm text-zinc-600 mb-3 line-clamp-2">{item.description}</p>
      {item.required_documents.length > 0 && (
        <p className="text-xs text-zinc-500 mb-3">
          <span className="font-medium">Docs needed: </span>
          {item.required_documents.slice(0, 3).join(" · ")}
          {item.required_documents.length > 3 && ` · +${item.required_documents.length - 3} more`}
        </p>
      )}
      <Link href={href} className="text-sm font-medium text-zinc-900 hover:underline">
        View details →
      </Link>
    </div>
  )
}

const CACHE_KEY = "__all_programs__"

export default function QuizPage() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({ mode: null, type: null, benefitNeeds: [] })
  const [matches, setMatches] = useState<Grant[] | null>(null)
  const [loading, setLoading] = useState(false)

  function update(updates: Partial<Answers>) {
    setAnswers((prev) => ({ ...prev, ...updates }))
  }

  async function fetchAndMatch(finalAnswers: Answers) {
    setLoading(true)
    try {
      const typeFilter =
        finalAnswers.mode === "grant" ? "&type=eq.grant" :
        finalAnswers.mode === "benefit" ? "&type=eq.benefit" : ""

      const cacheKey = CACHE_KEY + typeFilter
      const cached = sessionStorage.getItem(cacheKey)
      let all: Grant[]
      if (cached) {
        all = JSON.parse(cached)
      } else {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/grants?select=*${typeFilter}`,
          {
            headers: {
              apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
            },
          }
        )
        all = await res.json()
        sessionStorage.setItem(cacheKey, JSON.stringify(all))
      }
      setMatches(matchGrants(finalAnswers, all))
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setStep(0)
    setAnswers({ mode: null, type: null, benefitNeeds: [] })
    setMatches(null)
  }

  // Determine total steps for progress bar
  const totalSteps =
    answers.mode === "benefit" ? 2 :
    answers.mode === "grant" || answers.mode === "both" ? 3 : 1

  if (matches !== null) {
    return (
      <div className="flex flex-col min-h-full">
        <Nav />
        <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">
          <Results matches={matches} mode={answers.mode} onReset={reset} />
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
            {Array.from({ length: totalSteps }).map((_, i) => (
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
          <StepMode onChange={update} onNext={() => setStep(1)} />
        ) : step === 1 && answers.mode === "benefit" ? (
          <StepBenefitNeeds
            answers={answers}
            onChange={update}
            onNext={() => fetchAndMatch(answers)}
            onBack={() => setStep(0)}
          />
        ) : step === 1 ? (
          <StepType
            answers={answers}
            onChange={update}
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
          />
        ) : answers.type === "individual" ? (
          <StepIndividual
            answers={answers}
            onChange={update}
            onNext={() => fetchAndMatch(answers)}
            onBack={() => setStep(1)}
          />
        ) : (
          <StepBusiness
            answers={answers}
            onChange={update}
            onNext={() => fetchAndMatch(answers)}
            onBack={() => setStep(1)}
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
            Grants
          </Link>
          <Link href="/benefits" className="hover:text-zinc-900 transition-colors">
            Benefits
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
      Information is for reference only. Verify eligibility directly with each program.
    </footer>
  )
}
