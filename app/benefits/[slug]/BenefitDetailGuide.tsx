"use client"

import { type FormEvent, useEffect, useMemo, useState } from "react"
import { CheckCircle, ExternalLink, Info, MapPin, RotateCcw, XCircle } from "lucide-react"
import type { EligibilityCriteria } from "@/lib/types"
import { getIncomeLimit, HOUSEHOLD_SIZES } from "@/lib/poverty-guidelines"
import { STATE_APPLY_URLS, US_STATES } from "@/lib/state-programs"

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

// ─── Criteria type detection ──────────────────────────────────────────────────

type IncomeType =
  | { kind: "pct"; percent: number }
  | { kind: "dollar"; limit: number }
  | { kind: "generic" }

function detectIncomeItem(item: string): IncomeType | null {
  const lower = item.toLowerCase()
  const pct = item.match(/(\d+)\s*%\s*(?:fpl|of\s*(?:the\s*)?(?:federal\s*poverty(?:\s*level)?|fpl))/i)
  if (pct) return { kind: "pct", percent: parseInt(pct[1]) }
  const dollar = item.match(/\$([0-9,]+)/)
  if (dollar && lower.includes("income")) return { kind: "dollar", limit: parseInt(dollar[1].replace(/,/g, "")) }
  if (lower.includes("income") && (
    lower.includes("income requirement") ||
    lower.includes("income-eligible") ||
    lower.includes("income eligible") ||
    lower.includes("must meet income") ||
    (lower.includes("low-income") && lower.includes("must"))
  )) return { kind: "generic" }
  return null
}

function isStateParticipationItem(item: string): boolean {
  const lower = item.toLowerCase()
  return (
    lower.includes("participating state") ||
    lower.includes("tribal area") ||
    lower.includes("participating jurisdiction") ||
    (lower.includes("participating") && lower.includes("state"))
  )
}

function isLocalSiteItem(item: string): boolean {
  const lower = item.toLowerCase()
  return (
    lower.includes("distribution site") ||
    lower.includes("distribution center") ||
    lower.includes("distribution location") ||
    (lower.includes("served by a") && (lower.includes("site") || lower.includes("center") || lower.includes("provider") || lower.includes("program"))) ||
    lower.includes("area served by") ||
    (lower.includes("reside in an area") && lower.includes("served"))
  )
}

function getLocatorUrl(slug: string): string {
  if (slug.includes("csfp") || slug.includes("commodity-supplemental")) {
    return "https://www.fns.usda.gov/csfp"
  }
  return "https://www.fns.usda.gov/food-finder"
}

function isOwnRentItem(item: string): boolean {
  const lower = item.toLowerCase()
  return (
    lower.includes("own or rent") ||
    lower.includes("owner or renter") ||
    lower.includes("homeowner or renter") ||
    (lower.includes("own") && lower.includes("rent") && (lower.includes("home") || lower.includes("property") || lower.includes("weather")))
  )
}

function isPriorityNotice(item: string): boolean {
  return (
    /^priority (given|is given) to/i.test(item) ||
    /\bgiven priority\b/i.test(item) ||
    /^priority consideration/i.test(item)
  )
}

/** Convert statement-style criteria to a short, direct question. */
function toQuestion(text: string): string {
  const cleaned = text.replace(/\s*\([^)]*\)/g, "").trim()
  let q = cleaned
    .replace(/^Must be a\s+/i, "Are you a ")
    .replace(/^Must be an\s+/i, "Are you an ")
    .replace(/^Must be\s+/i, "Are you ")
    .replace(/^Must have\s+/i, "Do you have ")
    .replace(/^Must meet\s+/i, "Do you meet ")
    .replace(/^Must not have\s+/i, "Have you not ")
    .replace(/^Must not\s+/i, "Do you ")
    .replace(/^Must provide\s+/i, "Can you provide ")
    .replace(/^Must demonstrate\s+/i, "Can you demonstrate ")
    .replace(/^Must currently\s+/i, "Do you currently ")
    .replace(/^Must\s+/i, "Do you ")
    .replace(/^Required to\s+/i, "Are you ")
    .replace(/^Should be\s+/i, "Are you ")
    .replace(/^Applicant must\s+/i, "Do you ")
    .replace(/^You are\s+/i, "Are you ")
    .replace(/^You live\s+/i, "Do you live ")
    .replace(/^You or the person applying is\s+/i, "Are you or the person applying ")
    .replace(/^Your household income is at or below\s+/i, "Is your household income at or below ")
    .replace(/^Your household income is under\s+/i, "Is your household income under ")
    .replace(/^You meet\s+/i, "Do you meet ")
  if (!q.endsWith("?")) q += "?"
  return q
}

// ─── Own / rent card ──────────────────────────────────────────────────────────

function OwnRentCard({
  answer,
  onAnswer,
}: {
  answer: "own" | "rent" | "neither" | null
  onAnswer: (v: "own" | "rent" | "neither") => void
}) {
  return (
    <li className={`rounded-lg border p-4 transition-colors ${
      answer === "own" ? "border-emerald-100 bg-emerald-50" :
      answer === "rent" ? "border-blue-100 bg-blue-50" :
      answer === "neither" ? "border-rose-100 bg-rose-50" :
      "border-slate-200 bg-white"
    }`}>
      <p className="text-sm font-semibold text-slate-900 mb-3">Do you own or rent the home to be weatherized?</p>
      <div className="flex gap-2 flex-wrap">
        {(["own", "rent", "neither"] as const).map(val => (
          <button key={val} type="button" onClick={() => onAnswer(val)}
            className={`h-8 px-5 rounded-full text-sm font-medium border transition-colors ${answer === val
              ? val === "own" ? "bg-emerald-600 text-white border-emerald-600"
                : val === "rent" ? "bg-blue-600 text-white border-blue-600"
                : "bg-rose-500 text-white border-rose-500"
              : "border-slate-300 text-slate-700 hover:border-slate-500"
            }`}>
            {val === "own" ? "I own it" : val === "rent" ? "I rent it" : "Neither"}
          </button>
        ))}
      </div>
      {answer === "rent" && (
        <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-xs leading-5 text-blue-900">
          <strong className="block mb-1">Renters can qualify — but you need landlord consent.</strong>
          Most weatherization measures require written permission from your landlord before work begins. Ask your landlord to sign a consent form — the local weatherization agency can provide one. Many landlords agree because the work is free and increases the property's value.
        </div>
      )}
      {answer === "neither" && (
        <p className="mt-2 text-xs text-rose-700">
          This program covers homeowners and renters. If you live in a shelter, group home, or similar arrangement, contact the local weatherization agency to ask about eligibility for your situation.
        </p>
      )}
    </li>
  )
}

// ─── Local distribution site lookup card ─────────────────────────────────────

function LocalSiteCard({ slug }: { slug: string }) {
  const [zip, setZip] = useState("")
  const [zipInput, setZipInput] = useState("")

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const stored = localStorage.getItem("gw_zip") ?? localStorage.getItem("gw_profile_zip")
      if (stored) { setZip(stored); setZipInput(stored) }
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    function onUpdate() {
      const stored = localStorage.getItem("gw_zip")
      if (stored) { setZip(stored); setZipInput(stored) }
    }
    window.addEventListener("gw:zip-updated", onUpdate)
    return () => window.removeEventListener("gw:zip-updated", onUpdate)
  }, [])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const clean = zipInput.replace(/\D/g, "").slice(0, 5)
    if (clean.length !== 5) return
    setZip(clean)
    try {
      localStorage.setItem("gw_zip", clean)
      window.dispatchEvent(new Event("gw:zip-updated"))
    } catch { /* ignore */ }
  }

  const locatorUrl = getLocatorUrl(slug)

  return (
    <li className={`rounded-lg border p-4 ${zip ? "border-blue-100 bg-blue-50" : "border-slate-200 bg-white"}`}>
      <div className="flex items-start gap-3">
        <MapPin className={`mt-0.5 h-5 w-5 shrink-0 ${zip ? "text-blue-600" : "text-slate-500"}`} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">Is this available near you?</p>
          {zip ? (
            <div className="mt-1 space-y-2">
              <p className="text-xs leading-5 text-blue-900">
                Using your ZIP code <strong>{zip}</strong> — find local distribution sites near you.
              </p>
              <a
                href={locatorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Find sites near {zip}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          ) : (
            <div className="mt-2 space-y-2">
              <p className="text-xs leading-5 text-slate-500">
                This program is delivered through local distribution sites. Enter your ZIP code to find one near you.
              </p>
              <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  value={zipInput}
                  onChange={e => setZipInput(e.target.value.replace(/\D/g, "").slice(0, 5))}
                  placeholder="ZIP code"
                  className="h-8 w-24 rounded-lg border border-slate-200 px-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button type="submit" disabled={zipInput.length !== 5}
                  className="h-8 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed">
                  Find sites near me
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </li>
  )
}

// ─── Inline income quiz card ──────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n)
}

function IncomeCriteriaCard({
  item,
  type,
  answer,
  householdSize,
  stateCode,
  onAnswer,
  onSize,
}: {
  item: string
  type: IncomeType
  answer: "yes" | "no" | null
  householdSize: number | null
  stateCode: string | null
  onAnswer: (v: "yes" | "no") => void
  onSize: (n: number) => void
}) {
  const limit = householdSize && type.kind === "pct"
    ? getIncomeLimit(householdSize, type.percent, stateCode ?? undefined)
    : type.kind === "dollar" ? type.limit : null

  return (
    <li className={`rounded-lg border p-4 transition-colors ${answer === "yes" ? "border-emerald-100 bg-emerald-50" : answer === "no" ? "border-rose-100 bg-rose-50" : "border-slate-200 bg-white"}`}>
      <p className="text-sm font-semibold text-slate-900 mb-1">
        {type.kind === "generic" ? "Household income requirement" : item}
      </p>

      {type.kind === "generic" && (
        <p className="text-xs text-slate-500 mb-3">
          This program has income limits. Answer a couple of questions so we can check if you qualify.
        </p>
      )}

      {type.kind === "pct" && !householdSize && (
        <p className="text-xs text-slate-500 mb-3">
          This program requires income at or below <strong>{type.percent}% of the Federal Poverty Level</strong>. Select your household size to see your exact dollar limit.
        </p>
      )}

      {/* Household size selector for FPL-based limits */}
      {(type.kind === "pct" || type.kind === "generic") && (
        <div className="mb-3">
          <p className="text-xs font-medium text-slate-500 mb-2">How many people are in your household?</p>
          <div className="flex flex-wrap gap-1.5">
            {HOUSEHOLD_SIZES.map(n => (
              <button key={n} type="button" onClick={() => onSize(n)}
                className={`w-9 h-9 rounded-full text-sm font-medium border transition-colors ${householdSize === n ? "bg-slate-900 text-white border-slate-900" : "border-slate-300 text-slate-700 hover:border-slate-500"}`}>
                {n}
              </button>
            ))}
            <button type="button" onClick={() => onSize(9)}
              className={`h-9 px-2.5 rounded-full text-sm font-medium border transition-colors ${householdSize === 9 ? "bg-slate-900 text-white border-slate-900" : "border-slate-300 text-slate-700 hover:border-slate-500"}`}>
              9+
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1.5">Count everyone who lives and eats with you — yourself, partner, children, and dependents.</p>
        </div>
      )}

      {/* Show limit once household size known */}
      {limit !== null && (
        <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5 mb-3">
          <p className="text-xs text-slate-500 mb-0.5">
            {type.kind === "pct" && householdSize
              ? `For a household of ${householdSize}, income must be at or below:`
              : "Your household income must be at or below:"}
          </p>
          <p className="text-xl font-bold text-slate-900">{fmt(limit)}<span className="text-sm font-normal text-slate-500">/year</span></p>
          <p className="text-sm text-slate-500">{fmt(Math.round(limit / 12))}/month</p>
        </div>
      )}

      {/* Show yes/no once limit is known (or always for dollar type) */}
      {(limit !== null || (type.kind === "generic" && householdSize)) && (
        <div>
          <p className="text-xs font-medium text-slate-700 mb-2">
            {limit ? `Is your household income at or below ${fmt(limit)}/year?` : "Does your household meet the income requirement?"}
          </p>
          <div className="flex gap-2">
            {(["yes", "no"] as const).map(val => (
              <button key={val} type="button" onClick={() => onAnswer(val)}
                className={`h-8 px-5 rounded-full text-sm font-medium border transition-colors ${answer === val
                  ? val === "yes" ? "bg-emerald-600 text-white border-emerald-600" : "bg-rose-500 text-white border-rose-500"
                  : "border-slate-300 text-slate-700 hover:border-slate-500"}`}>
                {val === "yes" ? "Yes" : "No"}
              </button>
            ))}
          </div>
        </div>
      )}
    </li>
  )
}

// ─── Inline state participation status ───────────────────────────────────────

function StateParticipationStatusCard({
  slug,
}: {
  slug: string
}) {
  const [stateCode, setStateCode] = useState<string | null>(null)
  const [zipInput, setZipInput] = useState("")

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const savedState = localStorage.getItem("gw_state")
      if (savedState) { setStateCode(savedState); return }
      const zip = localStorage.getItem("gw_zip") ?? localStorage.getItem("gw_profile_zip")
      if (zip) setZipInput(zip)
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  // React to state being set elsewhere on the page
  useEffect(() => {
    function onStateSet() {
      const s = localStorage.getItem("gw_state")
      setStateCode(s || null)
    }
    window.addEventListener("gw:zip-updated", onStateSet)
    window.addEventListener("gw:state-updated", onStateSet)
    return () => {
      window.removeEventListener("gw:zip-updated", onStateSet)
      window.removeEventListener("gw:state-updated", onStateSet)
    }
  }, [])

  function handleZipSubmit(e: FormEvent) {
    e.preventDefault()
    const clean = zipInput.replace(/\D/g, "").slice(0, 5)
    if (clean.length !== 5) return
    localStorage.setItem("gw_zip", clean)
    window.dispatchEvent(new Event("gw:zip-updated"))
  }

  const stateName = stateCode ? (US_STATES.find(s => s.code === stateCode)?.name ?? stateCode) : null
  const statePrograms = STATE_APPLY_URLS[slug]
  const applyUrl = stateCode ? statePrograms?.[stateCode] : null
  const hasParticipationData = Boolean(statePrograms)
  const participates = Boolean(applyUrl)

  return (
    <div className={`rounded-lg border p-4 ${
      stateName && participates
        ? "border-emerald-100 bg-emerald-50"
        : stateName && hasParticipationData
          ? "border-rose-100 bg-rose-50"
          : "border-slate-200 bg-white"
    }`}>
      <div className="flex items-start gap-3">
        {stateName && participates ? (
          <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
        ) : stateName && hasParticipationData ? (
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
        ) : (
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">State participation</p>

          {stateName && participates && (
            <div className="mt-1 space-y-2">
              <p className="text-sm font-semibold text-emerald-900">
                Yes. {stateName} participates in this program.
              </p>
              <p className="text-xs leading-5 text-emerald-800">
                Use the {stateName} official apply link to confirm local office rules and start the application.
              </p>
              <a
                href={applyUrl ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Open {stateName} apply page
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}

          {stateName && !participates && hasParticipationData && (
            <div className="mt-1 space-y-1">
              <p className="text-sm font-semibold text-rose-900">
                No. GrantWay does not show {stateName} as participating in this program.
              </p>
              <p className="text-xs leading-5 text-rose-800">
                This program is administered state-by-state, and we do not have an active {stateName} apply page on file.
                Check the official source before ruling it out completely.
              </p>
            </div>
          )}

          {stateName && !hasParticipationData && (
            <div className="mt-1 space-y-1">
              <p className="text-sm font-semibold text-slate-900">
                We do not have state participation data for this program yet.
              </p>
              <p className="text-xs leading-5 text-slate-500">
                Use the official apply link on this page to confirm whether {stateName} participates.
              </p>
            </div>
          )}

          {!stateName && (
            <div className="mt-2">
              <p className="text-xs text-slate-500 mb-2">
                Enter your ZIP code to see whether your state participates in this program.
              </p>
              <form onSubmit={handleZipSubmit} className="flex flex-wrap gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  value={zipInput}
                  onChange={e => setZipInput(e.target.value.replace(/\D/g, "").slice(0, 5))}
                  placeholder="ZIP code"
                  className="h-8 w-24 rounded-lg border border-slate-200 px-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button type="submit" disabled={zipInput.length !== 5}
                  className="h-8 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed">
                  Check my state
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
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
  // Special interactive items: income and own/rent
  const [specialAnswers, setSpecialAnswers] = useState<Record<number, "yes" | "no" | "unsure">>({})
  const [householdSizes, setHouseholdSizes] = useState<Record<number, number>>({})
  const [detectedState, setDetectedState] = useState<string | null>(null)
  const [ownRentAnswers, setOwnRentAnswers] = useState<Record<number, "own" | "rent" | "neither">>({})
  const allChecklistItems = useMemo(() => criteriaToChecklist(eligibilityCriteria), [eligibilityCriteria])
  const hasStateParticipationRequirement = useMemo(
    () => allChecklistItems.some(isStateParticipationItem),
    [allChecklistItems]
  )
  const checklist = useMemo(
    () => allChecklistItems.filter((item) => !isStateParticipationItem(item)),
    [allChecklistItems]
  )
  const category = subcategory ? CATEGORY_COPY[subcategory] : undefined
  const documentList = documents.length > 0 ? documents : ["Photo ID", "Proof of address", "Proof of income"]
  const confirmedCount = checked.size
    + Object.values(specialAnswers).filter(a => a === "yes").length
    + Object.values(ownRentAnswers).filter(a => a === "own" || a === "rent").length

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const saved = JSON.parse(window.localStorage.getItem(storageKey) ?? "[]")
        if (Array.isArray(saved)) setChecked(new Set(saved.filter((item) => typeof item === "number")))
        setZip(window.localStorage.getItem("gw_zip") ?? "")
        const s = window.localStorage.getItem("gw_state")
        if (s) setDetectedState(s)
      } catch {
        setChecked(new Set())
      }
    })

    return () => cancelAnimationFrame(frame)
  }, [storageKey])

  // Keep detectedState in sync when ZIP/state is set by other components on the page
  useEffect(() => {
    function onZipUpdated() {
      const s = localStorage.getItem("gw_state")
      setDetectedState(s || null)
    }
    window.addEventListener("gw:zip-updated", onZipUpdated)
    window.addEventListener("gw:state-updated", onZipUpdated)
    return () => {
      window.removeEventListener("gw:zip-updated", onZipUpdated)
      window.removeEventListener("gw:state-updated", onZipUpdated)
    }
  }, [])

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
      if (clean) {
        window.localStorage.setItem("gw_zip", clean)
        // Notify StateSelector on the same page so it can auto-detect the state
        window.dispatchEvent(new Event("gw:zip-updated"))
      } else {
        window.localStorage.removeItem("gw_zip")
      }
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
          {checklist.length > 0 && (
            <span className="text-sm text-slate-500">
              {confirmedCount}/{checklist.length} confirmed
            </span>
          )}
        </div>

        {(checked.size > 0 || Object.keys(specialAnswers).length > 0) && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
            <span>Your answers are saved on this device.</span>
            <button
              type="button"
              onClick={() => { setChecked(new Set()); setSpecialAnswers({}); setHouseholdSizes({}); setOwnRentAnswers({}) }}
              className="inline-flex items-center gap-1 font-medium text-slate-600 hover:text-slate-900"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
        )}

        {hasStateParticipationRequirement && (
          <div className="mt-5 space-y-3">
            <StateParticipationStatusCard slug={slug} />
          </div>
        )}

        <ul className={hasStateParticipationRequirement ? "mt-3 space-y-3" : "mt-5 space-y-3"}>
          {checklist.map((item, index) => {
            // Priority notices — render as info banner, not a requirement
            if (isPriorityNotice(item)) {
              return (
                <li key={`${item}-${index}`} className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{item} — but you can still apply even if you don&apos;t fall into those groups.</span>
                </li>
              )
            }

            // Local distribution site card
            if (isLocalSiteItem(item)) {
              return <LocalSiteCard key={`${item}-${index}`} slug={slug} />
            }

            // Own / rent card
            if (isOwnRentItem(item)) {
              return (
                <OwnRentCard
                  key={`${item}-${index}`}
                  answer={ownRentAnswers[index] ?? null}
                  onAnswer={v => setOwnRentAnswers(prev => ({ ...prev, [index]: v }))}
                />
              )
            }

            // Income cards
            const incomeType = detectIncomeItem(item)
            if (incomeType) {
              return (
                <IncomeCriteriaCard
                  key={`${item}-${index}`}
                  item={item}
                  type={incomeType}
                  answer={(specialAnswers[index] as "yes" | "no") ?? null}
                  householdSize={householdSizes[index] ?? null}
                  stateCode={detectedState}
                  onAnswer={v => setSpecialAnswers(prev => ({ ...prev, [index]: v }))}
                  onSize={n => setHouseholdSizes(prev => ({ ...prev, [index]: n }))}
                />
              )
            }

            // Plain checkbox — label as a direct question
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
                  <span className="text-sm leading-6 text-slate-700">{toQuestion(item)}</span>
                </label>
              </li>
            )
          })}
        </ul>

        {checklist.length > 0 && confirmedCount >= Math.ceil(checklist.length * 0.75) && (
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
