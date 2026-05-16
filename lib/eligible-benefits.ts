import type { Grant } from "@/lib/types"
import type { UserProfile } from "@/lib/profile"

export type EligibleBenefitMatch = {
  benefit: Grant
  score: number
  reasons: string[]
}

const INTEREST_TO_SUBCATEGORY: Record<string, string> = {
  Housing: "housing",
  Food: "food",
  Healthcare: "health",
  Childcare: "childcare",
  Energy: "energy",
  Education: "education",
  Disability: "disability",
}

function toNumber(value?: string) {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function isLowIncome(profile: Partial<UserProfile>) {
  const income = toNumber(profile.annual_income)
  const householdSize = toNumber(profile.household_size)
  if (income === undefined) return false

  if (!householdSize || householdSize <= 1) return income < 30_000
  if (householdSize === 2) return income < 42_000
  if (householdSize === 3) return income < 52_000
  return income < 65_000
}

function addReason(reasons: string[], reason: string) {
  if (!reasons.includes(reason)) reasons.push(reason)
}

export function matchEligibleBenefits(profile: Partial<UserProfile>, benefits: Grant[]): EligibleBenefitMatch[] {
  const lowIncome = isLowIncome(profile)
  const hasChildren = profile.has_children === "yes"
  const hasDisability = profile.disability_status === "yes"
  const isVeteran = profile.veteran_status === "veteran" || profile.veteran_status === "active_duty" || profile.veteran_status === "military_family"
  const isStudent = profile.student_status && profile.student_status !== "not_student"
  const isRural = profile.rural_location === "yes"
  const interests = new Set(profile.funding_interests ?? [])
  const preferredSubcategories = new Set(
    Array.from(interests)
      .map((interest) => INTEREST_TO_SUBCATEGORY[interest])
      .filter(Boolean)
  )

  return benefits
    .map((benefit) => {
      let score = 0
      const reasons: string[] = []
      const subcategory = benefit.subcategory ?? ""
      const slug = benefit.slug.toLowerCase()
      const criteriaText = Array.isArray(benefit.eligibility_criteria)
        ? benefit.eligibility_criteria.join(" ").toLowerCase()
        : JSON.stringify(benefit.eligibility_criteria).toLowerCase()

      if (preferredSubcategories.has(subcategory)) {
        score += 2
        addReason(reasons, `Matches your ${subcategory} interest`)
      }

      if (lowIncome && (criteriaText.includes("low income") || criteriaText.includes("low-income") || criteriaText.includes("poverty") || ["housing", "food", "health", "childcare", "energy"].includes(subcategory))) {
        score += 3
        addReason(reasons, "Matches your household income range")
      }

      if (hasChildren && (subcategory === "childcare" || slug.includes("wic") || slug.includes("child") || slug.includes("school") || slug.includes("head-start") || slug.includes("chip"))) {
        score += 3
        addReason(reasons, "Matches a household with children")
      }

      if (hasDisability && (subcategory === "disability" || slug.includes("811") || criteriaText.includes("disabil"))) {
        score += 3
        addReason(reasons, "Matches disability-related eligibility")
      }

      if (isVeteran && (slug.includes("veteran") || slug.includes("vash") || slug.includes("tricare") || criteriaText.includes("veteran") || criteriaText.includes("military"))) {
        score += 3
        addReason(reasons, "Matches veteran or military status")
      }

      if (isStudent && (subcategory === "education" || slug.includes("pell") || slug.includes("campus") || criteriaText.includes("student"))) {
        score += 2
        addReason(reasons, "Matches student status")
      }

      if (isRural && (slug.includes("rural") || slug.includes("usda") || criteriaText.includes("rural"))) {
        score += 2
        addReason(reasons, "Matches rural location")
      }

      if (profile.state && criteriaText.includes("state")) {
        score += 1
        addReason(reasons, "Uses state-specific eligibility")
      }

      return { benefit, score, reasons }
    })
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score || a.benefit.name.localeCompare(b.benefit.name))
}
