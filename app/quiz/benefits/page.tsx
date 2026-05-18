"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import type { Grant } from "@/lib/types"
import SiteNav from "@/components/SiteNav"
import SaveInterestButton from "@/components/SaveInterestButton"

// ─── Types ───────────────────────────────────────────────────────────────────

type Path = "situation" | "category"
type Subcategory = "housing" | "food" | "disability" | "education" | "childcare" | "energy" | "health"

interface SituationProfile {
  ageGroup: string
  householdSize: number | undefined
  householdIncome: number | undefined
  numChildren: number | undefined
  hasDisability: boolean
  isVeteran: boolean
  isBipoc: boolean
  isNativeAmerican: boolean
  isPregnant: boolean
  isSingleParent: boolean
  isUninsured: boolean
  isStudent: boolean
  isHomeless: boolean
  isRural: boolean
  receivesSSI: boolean
  receivesSnap: boolean
}

interface CategoryProfile {
  subcategory: Subcategory | null
  // Housing
  housingIsVeteran?: boolean
  housingIsHivPositive?: boolean
  housingIsNativeAmerican?: boolean
  housingIsHomeless?: boolean
  housingIsRural?: boolean
  housingIsDisabled?: boolean
  housingIsGoodNeighbor?: boolean
  housingNeedsHivHousing?: boolean
  // Food
  foodHasSchoolChildren?: boolean
  foodIsPreschoolAge?: boolean
  foodIsNativeAmerican?: boolean
  foodIsSenior?: boolean
  foodIsWic?: boolean
  foodIsLowIncome?: boolean
  foodChildCareProgram?: boolean
  // Disability
  disabilityReceivesSsdi?: boolean
  disabilityReceivesSsi?: boolean
  disabilityIsVeteran?: boolean
  disabilityWantsWork?: boolean
  disabilityNeedsAT?: boolean
  disabilityTBI?: boolean
  // Education
  educationIsNativeAmerican?: boolean
  educationIsGraduate?: boolean
  educationIsLowIncome?: boolean
  educationIsInternational?: boolean
  educationWorksPublicService?: boolean
  educationIsHealth?: boolean
  educationNeedsAdult?: boolean
  // Childcare
  childcareIsLowIncome?: boolean
  childcareIsOnCampus?: boolean
  childcareIsMilitary?: boolean
  childcareIsTribal?: boolean
  childcareAfterSchool?: boolean
  // Energy
  energyLowIncome?: boolean
  energyIsRural?: boolean
  energyHomeImprovement?: boolean
  // Health
  healthIsUninsured?: boolean
  healthIsLowIncome?: boolean
  healthIsChild?: boolean
  healthIsHivPositive?: boolean
  healthIsNativeAmerican?: boolean
  healthIsMilitary?: boolean
  healthIsVeteran?: boolean
  healthIsMentalHealth?: boolean
  healthNeedsRxHelp?: boolean
  healthIsRural?: boolean
  healthIsPregnant?: boolean
}

type BenefitQuizMatch = {
  benefit: Grant
  score: number
  confidence: "likely" | "may_qualify"
  reasons: string[]
  possibleDisqualifiers: string[]
}

const defaultSituation: SituationProfile = {
  ageGroup: "",
  householdSize: undefined,
  householdIncome: undefined,
  numChildren: undefined,
  hasDisability: false,
  isVeteran: false,
  isBipoc: false,
  isNativeAmerican: false,
  isPregnant: false,
  isSingleParent: false,
  isUninsured: false,
  isStudent: false,
  isHomeless: false,
  isRural: false,
  receivesSSI: false,
  receivesSnap: false,
}

// ─── Subcategory metadata ─────────────────────────────────────────────────────

const SUBCATEGORIES: { key: Subcategory; label: string; icon: string; desc: string }[] = [
  { key: "housing",   label: "Housing",         icon: "🏠", desc: "Rental assistance, affordable housing, and homeownership programs" },
  { key: "food",      label: "Food Aid",        icon: "🥗", desc: "Nutrition programs, food assistance, and meal services" },
  { key: "disability",label: "Disability",      icon: "♿", desc: "Income support, rehabilitation, and independent living services" },
  { key: "education", label: "Education",       icon: "🎓", desc: "Grants, scholarships, and adult education programs" },
  { key: "childcare", label: "Childcare",       icon: "👶", desc: "Subsidized child care, Head Start, and early learning programs" },
  { key: "energy",    label: "Energy Assistance",icon: "⚡", desc: "Heating, cooling, and home weatherization assistance" },
  { key: "health",    label: "Healthcare",      icon: "❤️", desc: "Medicaid, Medicare, CHIP, and community health programs" },
]

// ─── Matching logic ───────────────────────────────────────────────────────────

function scoreSituation(profile: SituationProfile, benefit: Grant): number {
  let score = 0
  const sub = benefit.subcategory ?? ""
  const slug = benefit.slug
  const crit = Array.isArray(benefit.eligibility_criteria) ? benefit.eligibility_criteria : []
  const critText = crit.join(" ").toLowerCase()

  const isLowIncome = profile.householdIncome !== undefined && (
    (profile.householdSize === 1 && profile.householdIncome < 25000) ||
    (profile.householdSize === 2 && profile.householdIncome < 34000) ||
    (profile.householdSize === 3 && profile.householdIncome < 43000) ||
    (profile.householdSize !== undefined && profile.householdSize >= 4 && profile.householdIncome < 55000) ||
    profile.householdIncome < 25000
  )
  const isVeryLowIncome = profile.householdIncome !== undefined && profile.householdIncome < 15000

  // Housing
  if (sub === "housing") {
    if (profile.isVeteran && (slug.includes("vash") || slug.includes("veteran"))) score += 3
    if (profile.isNativeAmerican && slug.includes("native")) score += 3
    if (profile.isHomeless) score += 2
    if (isLowIncome) score += 2
    if (isVeryLowIncome) score += 1
    if (profile.hasDisability && slug.includes("811")) score += 3
    if (isLowIncome || profile.isHomeless || profile.isVeteran) score += 1
  }

  // Food
  if (sub === "food") {
    if (profile.numChildren !== undefined && profile.numChildren > 0) {
      if (slug.includes("school-lunch") || slug.includes("breakfast") || slug.includes("fresh-fruit")) score += 3
    }
    if (profile.isNativeAmerican && slug.includes("fdpir")) score += 3
    if (profile.ageGroup === "senior" && (slug.includes("senior") || slug.includes("meals-on-wheels") || slug.includes("commodity"))) score += 3
    if (isLowIncome) score += 2
    if (profile.receivesSnap && slug.includes("double-up")) score += 2
    if (profile.isPregnant || (profile.numChildren !== undefined && profile.numChildren > 0)) {
      if (slug.includes("wic")) score += 3
    }
  }

  // Disability
  if (sub === "disability") {
    if (!profile.hasDisability && !profile.isVeteran) return 0
    if (profile.hasDisability) score += 3
    if (profile.isVeteran && (slug.includes("veteran") || slug.includes("voc-rehab") || slug.includes("compensation"))) score += 2
    if (critText.includes("ssi") || critText.includes("ssdi")) score += 1
  }

  // Education
  if (sub === "education") {
    if (profile.isStudent) score += 2
    if (profile.isNativeAmerican && slug.includes("bureau-of-indian")) score += 3
    if (isLowIncome) score += 2
    if (!profile.isStudent && critText.includes("adult")) score += 1
    if (profile.receivesSSI && slug.includes("pell")) score += 1
  }

  // Childcare
  if (sub === "childcare") {
    if (profile.numChildren === undefined || profile.numChildren === 0) return 0
    score += 2
    if (isLowIncome) score += 2
    if (profile.isVeteran && slug.includes("dod")) score += 2
    if (profile.isNativeAmerican && slug.includes("tribal")) score += 2
    if (profile.isStudent && slug.includes("campus")) score += 2
  }

  // Energy
  if (sub === "energy") {
    if (isLowIncome) score += 3
    if (profile.isRural && slug.includes("usda")) score += 2
    score += 1
  }

  // Health
  if (sub === "health") {
    if (profile.isUninsured) score += 3
    if (profile.isVeteran && (slug.includes("veteran") || slug.includes("tricare"))) score += 3
    if (profile.isNativeAmerican && slug.includes("indian-health")) score += 3
    if (profile.numChildren !== undefined && profile.numChildren > 0 && slug.includes("chip")) score += 3
    if (isLowIncome && (slug.includes("medicaid") || slug.includes("fqhc") || slug.includes("rural-health"))) score += 3
    if (profile.isVeteran && slug.includes("tricare")) score += 3
    if (profile.ageGroup === "senior" && (slug.includes("medicare") || slug.includes("pace"))) score += 3
    if (profile.isPregnant && slug.includes("healthy-start")) score += 2
    if (isLowIncome) score += 1
  }

  return score
}

function benefitCaveats(benefit: Grant) {
  const caveats = ["Agency review may include extra rules or document checks."]
  if (["housing", "food", "health", "childcare", "energy"].includes(benefit.subcategory ?? "")) {
    caveats.push("Income limits may vary by household size, state, or local agency.")
  }
  caveats.push("Residency, citizenship, age, disability, or household-status rules may apply.")
  return caveats
}

function situationReasons(profile: SituationProfile, benefit: Grant, score: number) {
  const reasons: string[] = []
  const sub = benefit.subcategory
  if (profile.householdIncome !== undefined && ["housing", "food", "health", "childcare", "energy"].includes(sub ?? "")) reasons.push("Matches income-sensitive benefit categories")
  if (profile.numChildren && (sub === "childcare" || benefit.slug.includes("wic") || benefit.slug.includes("chip") || benefit.slug.includes("head-start"))) reasons.push("Matches a household with children")
  if (profile.hasDisability && (sub === "disability" || benefit.slug.includes("811"))) reasons.push("Matches disability-related answers")
  if (profile.isVeteran && (benefit.slug.includes("veteran") || benefit.slug.includes("vash") || benefit.slug.includes("tricare"))) reasons.push("Matches veteran or military answers")
  if (profile.isRural && (benefit.slug.includes("rural") || benefit.slug.includes("usda"))) reasons.push("Matches rural-location answers")
  if (profile.isStudent && sub === "education") reasons.push("Matches student or education answers")
  if (reasons.length === 0) reasons.push(score >= 4 ? "Several of your answers align with this program" : "This program may fit your selected situation")
  return reasons.slice(0, 3)
}

function matchBySituation(profile: SituationProfile, all: Grant[]): BenefitQuizMatch[] {
  const scored = all
    .map((b) => {
      const score = scoreSituation(profile as any, b)
      return {
        benefit: b,
        score,
        confidence: score >= 4 ? "likely" : "may_qualify",
        reasons: situationReasons(profile, b, score),
        possibleDisqualifiers: benefitCaveats(b),
      } satisfies BenefitQuizMatch
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.benefit.name.localeCompare(b.benefit.name))
  return scored
}

function matchByCategory(profile: CategoryProfile, all: Grant[]): BenefitQuizMatch[] {
  const sub = profile.subcategory
  if (!sub) return []
  const inSub = all.filter((b) => b.subcategory === sub)

  return inSub.filter((b) => {
    const slug = b.slug

    if (sub === "housing") {
      if (profile.housingIsVeteran && slug.includes("vash")) return true
      if (profile.housingIsNativeAmerican && slug.includes("native")) return true
      if (profile.housingNeedsHivHousing && slug.includes("hopwa")) return true
      if (profile.housingIsDisabled && slug.includes("811")) return true
      if (profile.housingIsGoodNeighbor && slug.includes("good-neighbor")) return true
      if (profile.housingIsRural && slug.includes("usda")) return true
      if (profile.housingIsHomeless) return true
      return !profile.housingIsVeteran && !profile.housingIsNativeAmerican && !profile.housingNeedsHivHousing && !profile.housingIsDisabled && !profile.housingIsGoodNeighbor && !profile.housingIsRural
    }

    if (sub === "food") {
      if (profile.foodIsNativeAmerican && slug.includes("fdpir")) return true
      if (profile.foodIsSenior && (slug.includes("senior") || slug.includes("meals-on-wheels") || slug.includes("commodity") || slug.includes("nutrition-services"))) return true
      if (profile.foodHasSchoolChildren && (slug.includes("school-lunch") || slug.includes("breakfast") || slug.includes("fresh-fruit") || slug.includes("special-milk") || slug.includes("summer-food"))) return true
      if (profile.foodIsPreschoolAge && (slug.includes("cacfp") || slug.includes("child-adult") || slug.includes("summer"))) return true
      if (profile.foodChildCareProgram && slug.includes("cacfp")) return true
      if (profile.foodIsWic) return slug.includes("wic")
      if (profile.foodIsLowIncome) return true
      return true
    }

    if (sub === "disability") {
      if (profile.disabilityIsVeteran && (slug.includes("veteran") || slug.includes("compensation") || slug.includes("pension"))) return true
      if (profile.disabilityWantsWork && (slug.includes("ticket-to-work") || slug.includes("pass") || slug.includes("vr") || slug.includes("vocational") || slug.includes("supported-employment") || slug.includes("wipa"))) return true
      if (profile.disabilityNeedsAT && (slug.includes("assistive") || slug.includes("at-act"))) return true
      if (profile.disabilityTBI && slug.includes("tbi")) return true
      if (profile.disabilityReceivesSsdi || profile.disabilityReceivesSsi) {
        if (slug.includes("ticket") || slug.includes("able") || slug.includes("wipa") || slug.includes("pass")) return true
      }
      return !profile.disabilityIsVeteran && !profile.disabilityWantsWork && !profile.disabilityNeedsAT && !profile.disabilityTBI
    }

    if (sub === "education") {
      if (profile.educationIsNativeAmerican && slug.includes("bureau-of-indian")) return true
      if (profile.educationIsGraduate && (slug.includes("gaann") || slug.includes("nih-kirschstein") || slug.includes("fulbright"))) return true
      if (profile.educationIsInternational && slug.includes("fulbright")) return true
      if (profile.educationWorksPublicService && slug.includes("public-service-loan")) return true
      if (profile.educationIsHealth && (slug.includes("scholarships-for-disadvantaged") || slug.includes("nhsc"))) return true
      if (profile.educationNeedsAdult && (slug.includes("adult-education") || slug.includes("even-start") || slug.includes("family-literacy"))) return true
      if (profile.educationIsLowIncome) return true
      return true
    }

    if (sub === "childcare") {
      if (profile.childcareIsMilitary && slug.includes("dod")) return true
      if (profile.childcareIsTribal && slug.includes("tribal")) return true
      if (profile.childcareIsOnCampus && slug.includes("campus")) return true
      if (profile.childcareAfterSchool && slug.includes("21st-century")) return true
      if (profile.childcareIsLowIncome) return true
      return true
    }

    if (sub === "energy") {
      if (profile.energyIsRural && (slug.includes("usda") || slug.includes("electric-loan"))) return true
      if (profile.energyHomeImprovement && (slug.includes("weatherization") || slug.includes("retrofit") || slug.includes("audit"))) return true
      if (profile.energyLowIncome) return true
      return true
    }

    if (sub === "health") {
      if (profile.healthIsVeteran && (slug.includes("veteran") || slug.includes("tricare"))) return true
      if (profile.healthIsMilitary && slug.includes("tricare")) return true
      if (profile.healthIsNativeAmerican && slug.includes("indian-health")) return true
      if (profile.healthIsHivPositive && slug.includes("ryan-white")) return true
      if (profile.healthIsChild && (slug.includes("chip") || slug.includes("healthy-start"))) return true
      if (profile.healthNeedsRxHelp && (slug.includes("extra-help") || slug.includes("340b") || slug.includes("medicare-savings"))) return true
      if (profile.healthIsMentalHealth && (slug.includes("mental-health") || slug.includes("community-mental"))) return true
      if (profile.healthIsRural && (slug.includes("rural-health") || slug.includes("fqhc"))) return true
      if (profile.healthIsPregnant && (slug.includes("healthy-start") || slug.includes("title-x"))) return true
      if (profile.healthIsLowIncome) return true
      return !profile.healthIsVeteran && !profile.healthIsMilitary && !profile.healthIsNativeAmerican && !profile.healthIsHivPositive && !profile.healthIsChild && !profile.healthNeedsRxHelp && !profile.healthIsMentalHealth && !profile.healthIsRural && !profile.healthIsPregnant
    }

    return true
  }).map((benefit) => ({
    benefit,
    score: 1,
    confidence: "may_qualify",
    reasons: [`Matches your ${SUBCATEGORY_LABELS[sub] ?? sub} quiz path`],
    possibleDisqualifiers: benefitCaveats(benefit),
  }))
}

// ─── Shared UI helpers ────────────────────────────────────────────────────────

function Checkbox({ label, checked, onChange }: { label: string; checked?: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input type="checkbox" className="w-4 h-4 rounded" defaultChecked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="text-sm text-zinc-800">{label}</span>
    </label>
  )
}

function Select({ label, value, options, onChange }: { label: string; value?: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm text-zinc-800 mb-2">{label}</label>
      <select
        defaultValue={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-4 rounded-lg border border-zinc-300 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="">Select…</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

function NumberInput({ label, value, placeholder, prefix, onChange }: { label: string; value?: number; placeholder?: string; prefix?: string; onChange: (v: number | undefined) => void }) {
  return (
    <div>
      <label className="block text-sm text-zinc-800 mb-2">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">{prefix}</span>}
        <input
          type="number"
          defaultValue={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : undefined)}
          className={`w-full h-10 ${prefix ? "pl-7" : "px-4"} pr-4 rounded-lg border border-zinc-300 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
      </div>
    </div>
  )
}

function NavButtons({ onBack, onNext, nextLabel = "See Results" }: { onBack: () => void; onNext: () => void; nextLabel?: string }) {
  return (
    <div className="flex gap-3 mt-8">
      <button onClick={onBack} className="h-10 px-5 rounded-lg border border-zinc-300 text-sm font-medium text-zinc-700 hover:border-zinc-500 transition-colors">Back</button>
      <button onClick={onNext} className="h-10 px-5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">{nextLabel}</button>
    </div>
  )
}

// ─── Path selection ───────────────────────────────────────────────────────────

function StepChoosePath({ onSelect }: { onSelect: (p: Path) => void }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-zinc-900 mb-2">How would you like to search?</h2>
      <p className="text-zinc-500 mb-8">Choose the option that works best for you.</p>
      <div className="grid gap-4">
        <button
          onClick={() => onSelect("situation")}
          className="rounded-xl border-2 border-zinc-200 p-6 text-left hover:border-blue-500 transition-colors"
        >
          <div className="text-3xl mb-2">👤</div>
          <h3 className="font-semibold text-zinc-900 mb-1">By My Situation</h3>
          <p className="text-sm text-zinc-500">Tell us about your household and circumstances — we'll show everything you may qualify for across all categories.</p>
        </button>
        <button
          onClick={() => onSelect("category")}
          className="rounded-xl border-2 border-zinc-200 p-6 text-left hover:border-blue-500 transition-colors"
        >
          <div className="text-3xl mb-2">🗂️</div>
          <h3 className="font-semibold text-zinc-900 mb-1">By Category</h3>
          <p className="text-sm text-zinc-500">Browse a specific type of assistance — housing, food, healthcare, disability, and more.</p>
        </button>
      </div>
    </div>
  )
}

// ─── Path A: By Situation ─────────────────────────────────────────────────────

function StepSituation({ profile, onChange, onNext, onBack }: { profile: SituationProfile; onChange: (u: Partial<SituationProfile>) => void; onNext: () => void; onBack: () => void }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-zinc-900 mb-2">Tell us about your situation</h2>
      <p className="text-zinc-500 mb-8">Answer as many as apply. All information is used only to find matching programs.</p>
      <div className="space-y-6">
        <Select
          label="Age group"
          value={profile.ageGroup}
          options={[
            { value: "under18", label: "Under 18" },
            { value: "18-24", label: "18–24" },
            { value: "25-59", label: "25–59" },
            { value: "senior", label: "60 or older" },
          ]}
          onChange={(v) => onChange({ ageGroup: v })}
        />
        <div className="grid grid-cols-2 gap-4">
          <NumberInput label="Household size" placeholder="e.g. 4" value={profile.householdSize} onChange={(v) => onChange({ householdSize: v })} />
          <NumberInput label="Annual household income" prefix="$" placeholder="e.g. 32000" value={profile.householdIncome} onChange={(v) => onChange({ householdIncome: v })} />
        </div>
        <NumberInput label="Number of children (under 18)" placeholder="0" value={profile.numChildren} onChange={(v) => onChange({ numChildren: v })} />
        <div className="grid grid-cols-1 gap-3 pt-2">
          <Checkbox label="I have a disability" checked={profile.hasDisability} onChange={(v) => onChange({ hasDisability: v })} />
          <Checkbox label="I am a veteran or active-duty military" checked={profile.isVeteran} onChange={(v) => onChange({ isVeteran: v })} />
          <Checkbox label="I identify as BIPOC" checked={profile.isBipoc} onChange={(v) => onChange({ isBipoc: v })} />
          <Checkbox label="I am Native American or Alaska Native" checked={profile.isNativeAmerican} onChange={(v) => onChange({ isNativeAmerican: v })} />
          <Checkbox label="I am pregnant" checked={profile.isPregnant} onChange={(v) => onChange({ isPregnant: v })} />
          <Checkbox label="I am a single parent" checked={profile.isSingleParent} onChange={(v) => onChange({ isSingleParent: v })} />
          <Checkbox label="I do not have health insurance" checked={profile.isUninsured} onChange={(v) => onChange({ isUninsured: v })} />
          <Checkbox label="I am currently enrolled in school or college" checked={profile.isStudent} onChange={(v) => onChange({ isStudent: v })} />
          <Checkbox label="I am experiencing homelessness or housing instability" checked={profile.isHomeless} onChange={(v) => onChange({ isHomeless: v })} />
          <Checkbox label="I live in a rural area" checked={profile.isRural} onChange={(v) => onChange({ isRural: v })} />
          <Checkbox label="I currently receive SSI or SSDI" checked={profile.receivesSSI} onChange={(v) => onChange({ receivesSSI: v })} />
          <Checkbox label="I currently receive SNAP (food stamps)" checked={profile.receivesSnap} onChange={(v) => onChange({ receivesSnap: v })} />
        </div>
      </div>
      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  )
}

// ─── Path B: By Category ──────────────────────────────────────────────────────

function StepChooseCategory({ onSelect }: { onSelect: (s: Subcategory) => void }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-zinc-900 mb-2">What type of assistance are you looking for?</h2>
      <p className="text-zinc-500 mb-8">Select the category that fits your needs.</p>
      <div className="grid grid-cols-2 gap-4">
        {SUBCATEGORIES.map(({ key, label, icon, desc }) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className="rounded-xl border-2 border-zinc-200 p-5 text-left hover:border-blue-500 transition-colors"
          >
            <div className="text-3xl mb-2">{icon}</div>
            <h3 className="font-semibold text-zinc-900 mb-1">{label}</h3>
            <p className="text-xs text-zinc-500">{desc}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

function StepHousing({ profile, onChange, onNext, onBack }: { profile: CategoryProfile; onChange: (u: Partial<CategoryProfile>) => void; onNext: () => void; onBack: () => void }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-zinc-900 mb-2">Housing assistance</h2>
      <p className="text-zinc-500 mb-8">Tell us about your housing situation and needs.</p>
      <div className="space-y-3">
        <Checkbox label="I am a veteran" checked={profile.housingIsVeteran} onChange={(v) => onChange({ housingIsVeteran: v })} />
        <Checkbox label="I am Native American or Alaska Native" checked={profile.housingIsNativeAmerican} onChange={(v) => onChange({ housingIsNativeAmerican: v })} />
        <Checkbox label="I am living with HIV/AIDS" checked={profile.housingNeedsHivHousing} onChange={(v) => onChange({ housingNeedsHivHousing: v })} />
        <Checkbox label="I have a disability" checked={profile.housingIsDisabled} onChange={(v) => onChange({ housingIsDisabled: v })} />
        <Checkbox label="I am a teacher, law enforcement officer, or first responder" checked={profile.housingIsGoodNeighbor} onChange={(v) => onChange({ housingIsGoodNeighbor: v })} />
        <Checkbox label="I live in a rural area" checked={profile.housingIsRural} onChange={(v) => onChange({ housingIsRural: v })} />
        <Checkbox label="I am experiencing homelessness" checked={profile.housingIsHomeless} onChange={(v) => onChange({ housingIsHomeless: v })} />
      </div>
      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  )
}

function StepFood({ profile, onChange, onNext, onBack }: { profile: CategoryProfile; onChange: (u: Partial<CategoryProfile>) => void; onNext: () => void; onBack: () => void }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-zinc-900 mb-2">Food assistance</h2>
      <p className="text-zinc-500 mb-8">Tell us about your household to match you with food programs.</p>
      <div className="space-y-3">
        <Checkbox label="I have school-age children (K–12)" checked={profile.foodHasSchoolChildren} onChange={(v) => onChange({ foodHasSchoolChildren: v })} />
        <Checkbox label="I have children under 5 or in a child care program" checked={profile.foodIsPreschoolAge} onChange={(v) => onChange({ foodIsPreschoolAge: v })} />
        <Checkbox label="I am pregnant or have an infant under 5" checked={profile.foodIsWic} onChange={(v) => onChange({ foodIsWic: v })} />
        <Checkbox label="I am 60 or older" checked={profile.foodIsSenior} onChange={(v) => onChange({ foodIsSenior: v })} />
        <Checkbox label="I am Native American or Alaska Native" checked={profile.foodIsNativeAmerican} onChange={(v) => onChange({ foodIsNativeAmerican: v })} />
        <Checkbox label="I operate a child care or adult day care program" checked={profile.foodChildCareProgram} onChange={(v) => onChange({ foodChildCareProgram: v })} />
        <Checkbox label="My household has a low income" checked={profile.foodIsLowIncome} onChange={(v) => onChange({ foodIsLowIncome: v })} />
      </div>
      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  )
}

function StepDisability({ profile, onChange, onNext, onBack }: { profile: CategoryProfile; onChange: (u: Partial<CategoryProfile>) => void; onNext: () => void; onBack: () => void }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-zinc-900 mb-2">Disability support</h2>
      <p className="text-zinc-500 mb-8">Tell us about your situation to find relevant programs.</p>
      <div className="space-y-3">
        <Checkbox label="I currently receive SSDI" checked={profile.disabilityReceivesSsdi} onChange={(v) => onChange({ disabilityReceivesSsdi: v })} />
        <Checkbox label="I currently receive SSI" checked={profile.disabilityReceivesSsi} onChange={(v) => onChange({ disabilityReceivesSsi: v })} />
        <Checkbox label="I am a veteran with a service-connected disability" checked={profile.disabilityIsVeteran} onChange={(v) => onChange({ disabilityIsVeteran: v })} />
        <Checkbox label="I want to return to work or increase my earnings" checked={profile.disabilityWantsWork} onChange={(v) => onChange({ disabilityWantsWork: v })} />
        <Checkbox label="I need assistive technology (mobility aids, communication devices, etc.)" checked={profile.disabilityNeedsAT} onChange={(v) => onChange({ disabilityNeedsAT: v })} />
        <Checkbox label="I have a traumatic brain injury (TBI)" checked={profile.disabilityTBI} onChange={(v) => onChange({ disabilityTBI: v })} />
      </div>
      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  )
}

function StepEducation({ profile, onChange, onNext, onBack }: { profile: CategoryProfile; onChange: (u: Partial<CategoryProfile>) => void; onNext: () => void; onBack: () => void }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-zinc-900 mb-2">Education programs</h2>
      <p className="text-zinc-500 mb-8">Tell us about your educational goals and background.</p>
      <div className="space-y-3">
        <Checkbox label="I am Native American or Alaska Native" checked={profile.educationIsNativeAmerican} onChange={(v) => onChange({ educationIsNativeAmerican: v })} />
        <Checkbox label="I am pursuing or have a graduate degree" checked={profile.educationIsGraduate} onChange={(v) => onChange({ educationIsGraduate: v })} />
        <Checkbox label="I am an international student or researcher" checked={profile.educationIsInternational} onChange={(v) => onChange({ educationIsInternational: v })} />
        <Checkbox label="I work or plan to work in public service or government" checked={profile.educationWorksPublicService} onChange={(v) => onChange({ educationWorksPublicService: v })} />
        <Checkbox label="I am studying a health-related field" checked={profile.educationIsHealth} onChange={(v) => onChange({ educationIsHealth: v })} />
        <Checkbox label="I need adult basic education or literacy support" checked={profile.educationNeedsAdult} onChange={(v) => onChange({ educationNeedsAdult: v })} />
        <Checkbox label="My household has a low income" checked={profile.educationIsLowIncome} onChange={(v) => onChange({ educationIsLowIncome: v })} />
      </div>
      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  )
}

function StepChildcare({ profile, onChange, onNext, onBack }: { profile: CategoryProfile; onChange: (u: Partial<CategoryProfile>) => void; onNext: () => void; onBack: () => void }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-zinc-900 mb-2">Childcare programs</h2>
      <p className="text-zinc-500 mb-8">Tell us about your childcare needs and situation.</p>
      <div className="space-y-3">
        <Checkbox label="I am active-duty military or a DoD civilian" checked={profile.childcareIsMilitary} onChange={(v) => onChange({ childcareIsMilitary: v })} />
        <Checkbox label="I am Native American or Alaska Native" checked={profile.childcareIsTribal} onChange={(v) => onChange({ childcareIsTribal: v })} />
        <Checkbox label="I am a college student needing campus child care" checked={profile.childcareIsOnCampus} onChange={(v) => onChange({ childcareIsOnCampus: v })} />
        <Checkbox label="I need after-school or summer programs for my children" checked={profile.childcareAfterSchool} onChange={(v) => onChange({ childcareAfterSchool: v })} />
        <Checkbox label="My household has a low income" checked={profile.childcareIsLowIncome} onChange={(v) => onChange({ childcareIsLowIncome: v })} />
      </div>
      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  )
}

function StepEnergy({ profile, onChange, onNext, onBack }: { profile: CategoryProfile; onChange: (u: Partial<CategoryProfile>) => void; onNext: () => void; onBack: () => void }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-zinc-900 mb-2">Energy assistance</h2>
      <p className="text-zinc-500 mb-8">Tell us about your energy and home improvement needs.</p>
      <div className="space-y-3">
        <Checkbox label="My household has a low income" checked={profile.energyLowIncome} onChange={(v) => onChange({ energyLowIncome: v })} />
        <Checkbox label="I live in a rural area" checked={profile.energyIsRural} onChange={(v) => onChange({ energyIsRural: v })} />
        <Checkbox label="I am looking for home weatherization or energy efficiency improvements" checked={profile.energyHomeImprovement} onChange={(v) => onChange({ energyHomeImprovement: v })} />
      </div>
      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  )
}

function StepHealth({ profile, onChange, onNext, onBack }: { profile: CategoryProfile; onChange: (u: Partial<CategoryProfile>) => void; onNext: () => void; onBack: () => void }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-zinc-900 mb-2">Healthcare programs</h2>
      <p className="text-zinc-500 mb-8">Tell us about your healthcare situation to find the right programs.</p>
      <div className="space-y-3">
        <Checkbox label="I do not have health insurance" checked={profile.healthIsUninsured} onChange={(v) => onChange({ healthIsUninsured: v })} />
        <Checkbox label="I have a low income" checked={profile.healthIsLowIncome} onChange={(v) => onChange({ healthIsLowIncome: v })} />
        <Checkbox label="I have children who need coverage" checked={profile.healthIsChild} onChange={(v) => onChange({ healthIsChild: v })} />
        <Checkbox label="I am living with HIV/AIDS" checked={profile.healthIsHivPositive} onChange={(v) => onChange({ healthIsHivPositive: v })} />
        <Checkbox label="I am Native American or Alaska Native" checked={profile.healthIsNativeAmerican} onChange={(v) => onChange({ healthIsNativeAmerican: v })} />
        <Checkbox label="I am active-duty military or a dependent" checked={profile.healthIsMilitary} onChange={(v) => onChange({ healthIsMilitary: v })} />
        <Checkbox label="I am a veteran" checked={profile.healthIsVeteran} onChange={(v) => onChange({ healthIsVeteran: v })} />
        <Checkbox label="I need mental health or substance use treatment" checked={profile.healthIsMentalHealth} onChange={(v) => onChange({ healthIsMentalHealth: v })} />
        <Checkbox label="I need help paying for prescription drugs" checked={profile.healthNeedsRxHelp} onChange={(v) => onChange({ healthNeedsRxHelp: v })} />
        <Checkbox label="I live in a rural area or underserved community" checked={profile.healthIsRural} onChange={(v) => onChange({ healthIsRural: v })} />
        <Checkbox label="I am pregnant or planning to become pregnant" checked={profile.healthIsPregnant} onChange={(v) => onChange({ healthIsPregnant: v })} />
      </div>
      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  )
}

// ─── Results ──────────────────────────────────────────────────────────────────

const SUBCATEGORY_LABELS: Record<string, string> = {
  housing: "Housing Assistance",
  food: "Food Aid",
  disability: "Disability Support",
  education: "Education",
  childcare: "Childcare",
  energy: "Energy Assistance",
  health: "Healthcare",
}

const SUBCATEGORY_ICONS: Record<string, string> = {
  housing: "🏠", food: "🥗", disability: "♿",
  education: "🎓", childcare: "👶", energy: "⚡", health: "❤️",
}

type BenefitSortKey = "default" | "name_asc" | "subcategory_asc" | "amount_desc"

function applyBenefitSort(matches: BenefitQuizMatch[], sort: BenefitSortKey): BenefitQuizMatch[] {
  const arr = [...matches]
  switch (sort) {
    case "name_asc":        return arr.sort((a, b) => a.benefit.name.localeCompare(b.benefit.name))
    case "subcategory_asc": return arr.sort((a, b) => (a.benefit.subcategory ?? "").localeCompare(b.benefit.subcategory ?? ""))
    case "amount_desc":     return arr.sort((a, b) => (b.benefit.max_amount ?? -1) - (a.benefit.max_amount ?? -1))
    default:                return arr
  }
}

function Results({ benefits, onReset }: { benefits: BenefitQuizMatch[]; onReset: () => void }) {
  const [activeTab, setActiveTab] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<BenefitSortKey>("default")

  if (benefits.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900 mb-2">No matches found</h2>
        <p className="text-zinc-500 mb-6">We couldn't find programs matching your answers. Try adjusting your responses or browse all benefits.</p>
        <div className="flex gap-3">
          <button onClick={onReset} className="h-10 px-5 rounded-lg border border-zinc-300 text-sm font-medium text-zinc-700 hover:border-zinc-500 transition-colors">Start over</button>
          <Link href="/benefits" className="h-10 px-5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors inline-flex items-center">Browse all benefits</Link>
        </div>
      </div>
    )
  }

  const tabs = Array.from(new Set(benefits.map((match) => match.benefit.subcategory ?? "other")))
  const filtered = applyBenefitSort(
    benefits.filter(({ benefit, reasons, possibleDisqualifiers }) => {
      const matchTab = activeTab === "all" || benefit.subcategory === activeTab
      const q = search.toLowerCase()
      const matchSearch = !q ||
        benefit.name.toLowerCase().includes(q) ||
        benefit.description.toLowerCase().includes(q) ||
        benefit.agency.toLowerCase().includes(q) ||
        reasons.join(" ").toLowerCase().includes(q) ||
        possibleDisqualifiers.join(" ").toLowerCase().includes(q)
      return matchTab && matchSearch
    }),
    sort
  )

  return (
    <div>
      <h2 className="text-2xl font-semibold text-zinc-900 mb-1">
        You may be eligible for {benefits.length} program{benefits.length === 1 ? "" : "s"}
      </h2>
      <p className="text-zinc-500 mb-6">Verify eligibility directly with each program before applying.</p>

      {/* Search + Sort */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Search programs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[180px] h-10 px-4 rounded-lg border border-zinc-300 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as BenefitSortKey)}
          className="h-10 px-3 rounded-lg border border-zinc-300 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="default">Sort by…</option>
          <option value="name_asc">Name: A–Z</option>
          <option value="subcategory_asc">Category</option>
          <option value="amount_desc">Amount: High → Low</option>
        </select>
      </div>

      {/* Category tabs */}
      {tabs.length > 1 && (
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setActiveTab("all")}
            className={`h-8 px-3 rounded-full text-xs font-medium transition-colors ${activeTab === "all" ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}
          >
            All ({benefits.length})
          </button>
          {tabs.map((sub) => {
            const count = benefits.filter((match) => (match.benefit.subcategory ?? "other") === sub).length
            return (
              <button
                key={sub}
                onClick={() => setActiveTab(sub)}
                className={`h-8 px-3 rounded-full text-xs font-medium transition-colors ${activeTab === sub ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}
              >
                {SUBCATEGORY_ICONS[sub] ?? ""} {SUBCATEGORY_LABELS[sub] ?? sub} ({count})
              </button>
            )
          })}
        </div>
      )}

      {/* Results list */}
      {filtered.length === 0 ? (
        <p className="text-sm text-zinc-500 py-6 text-center">No programs match your search.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(({ benefit: b, confidence, reasons, possibleDisqualifiers, score }) => (
            <div
              key={b.id}
              className="rounded-xl border border-zinc-200 p-5 transition-colors hover:border-blue-400"
            >
              <div className="flex items-start justify-between gap-4 mb-1">
                <Link href={`/benefits/${b.slug}`} className="font-semibold text-zinc-900 text-sm leading-snug hover:underline">
                  {b.name}
                </Link>
                <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                  confidence === "likely" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                }`}>
                  {confidence === "likely" ? "Likely eligible" : "May qualify"}
                </span>
                {b.subcategory && activeTab === "all" && (
                  <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium whitespace-nowrap">
                    {SUBCATEGORY_ICONS[b.subcategory]} {SUBCATEGORY_LABELS[b.subcategory] ?? b.subcategory}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 mb-1">{b.agency}</p>
              <p className="text-xs text-zinc-600 line-clamp-2 mb-3">{b.description}</p>
              <div className="mb-3 grid gap-2 rounded-lg bg-zinc-50 p-3 text-xs text-zinc-600">
                <p><span className="font-semibold text-zinc-900">Why this may match:</span> {reasons.join(" · ")}</p>
                <p><span className="font-semibold text-zinc-900">What may disqualify you:</span> {possibleDisqualifiers.slice(0, 2).join(" · ")}</p>
                <p className="text-zinc-400">Score {score} is used only to sort quiz matches.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <SaveInterestButton slug={b.slug} type="benefit" />
                <Link href={`/benefits/${b.slug}`} className="text-sm font-medium text-zinc-900 hover:underline">
                  View details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3 mt-8">
        <button onClick={onReset} className="h-10 px-5 rounded-lg border border-zinc-300 text-sm font-medium text-zinc-700 hover:border-zinc-500 transition-colors">Start over</button>
        <Link href="/benefits" className="h-10 px-5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors inline-flex items-center">Browse all benefits →</Link>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

type Step =
  | "choosePath"
  | "situation"
  | "chooseCategory"
  | "housing" | "food" | "disability" | "education" | "childcare" | "energy" | "health"
  | "results"

export default function BenefitsQuizPage() {
  const [step, setStep] = useState<Step>("choosePath")
  const [path, setPath] = useState<Path | null>(null)
  const [situation, setSituation] = useState<SituationProfile>(defaultSituation)
  const [catProfile, setCatProfile] = useState<CategoryProfile>({ subcategory: null })
  const [allBenefits, setAllBenefits] = useState<Grant[]>([])
  const [results, setResults] = useState<BenefitQuizMatch[]>([])
  const [loading, setLoading] = useState(false)

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  useEffect(() => {
    const cached = sessionStorage.getItem("benefits_cache")
    if (cached) {
      setAllBenefits(JSON.parse(cached))
      return
    }
    setLoading(true)
    fetch(`${SUPABASE_URL}/rest/v1/grants?select=*&type=eq.benefit`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setAllBenefits(data)
        sessionStorage.setItem("benefits_cache", JSON.stringify(data))
      })
      .finally(() => setLoading(false))
  }, [SUPABASE_URL, SUPABASE_ANON_KEY])

  function choosePath(p: Path) {
    setPath(p)
    setStep(p === "situation" ? "situation" : "chooseCategory")
  }

  function handleSituationNext() {
    setResults(matchBySituation(situation, allBenefits))
    setStep("results")
  }

  function handleCategoryNext(sub: Subcategory) {
    setCatProfile((prev) => ({ ...prev, subcategory: sub }))
    setStep(sub)
  }

  function handleCategoryQuestionsNext() {
    setResults(matchByCategory(catProfile, allBenefits))
    setStep("results")
  }

  function reset() {
    setStep("choosePath")
    setPath(null)
    setSituation(defaultSituation)
    setCatProfile({ subcategory: null })
    setResults([])
  }

  const catQuestionBack = () => setStep("chooseCategory")

  return (
    <div className="flex flex-col min-h-full">
      <SiteNav active="quiz" />

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">
        <nav className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
          <Link href="/quiz" className="hover:text-zinc-900 transition-colors">Eligibility Quiz</Link>
          <span>/</span>
          <span className="text-zinc-900">Benefits Quiz</span>
        </nav>

        {loading ? (
          <div className="text-center py-20 text-zinc-500">Loading programs…</div>
        ) : (
          <>
            {step === "choosePath" && <StepChoosePath onSelect={choosePath} />}

            {step === "situation" && (
              <StepSituation
                profile={situation}
                onChange={(u) => setSituation((p) => ({ ...p, ...u }))}
                onBack={() => setStep("choosePath")}
                onNext={handleSituationNext}
              />
            )}

            {step === "chooseCategory" && (
              <StepChooseCategory onSelect={handleCategoryNext} />
            )}

            {step === "housing" && (
              <StepHousing profile={catProfile} onChange={(u) => setCatProfile((p) => ({ ...p, ...u }))} onBack={catQuestionBack} onNext={handleCategoryQuestionsNext} />
            )}
            {step === "food" && (
              <StepFood profile={catProfile} onChange={(u) => setCatProfile((p) => ({ ...p, ...u }))} onBack={catQuestionBack} onNext={handleCategoryQuestionsNext} />
            )}
            {step === "disability" && (
              <StepDisability profile={catProfile} onChange={(u) => setCatProfile((p) => ({ ...p, ...u }))} onBack={catQuestionBack} onNext={handleCategoryQuestionsNext} />
            )}
            {step === "education" && (
              <StepEducation profile={catProfile} onChange={(u) => setCatProfile((p) => ({ ...p, ...u }))} onBack={catQuestionBack} onNext={handleCategoryQuestionsNext} />
            )}
            {step === "childcare" && (
              <StepChildcare profile={catProfile} onChange={(u) => setCatProfile((p) => ({ ...p, ...u }))} onBack={catQuestionBack} onNext={handleCategoryQuestionsNext} />
            )}
            {step === "energy" && (
              <StepEnergy profile={catProfile} onChange={(u) => setCatProfile((p) => ({ ...p, ...u }))} onBack={catQuestionBack} onNext={handleCategoryQuestionsNext} />
            )}
            {step === "health" && (
              <StepHealth profile={catProfile} onChange={(u) => setCatProfile((p) => ({ ...p, ...u }))} onBack={catQuestionBack} onNext={handleCategoryQuestionsNext} />
            )}

            {step === "results" && <Results benefits={results} onReset={reset} />}
          </>
        )}
      </main>

      <footer className="border-t border-zinc-200 py-8 px-6 text-center text-sm text-zinc-500">
        Information is for reference only. Verify eligibility directly with each program.
      </footer>
    </div>
  )
}
