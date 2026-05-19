import type { Grant, EligibilityCriteria } from "@/lib/types"
import type { UserProfile } from "@/lib/profile"

export type EligibleGrantMatch = {
  grant: Grant
  score: number
  confidence: "likely" | "may_qualify"
  matchedReasons: string[]
  possibleDisqualifiers: string[]
}

function toNumber(value?: string | null) {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function addReason(reasons: string[], reason: string) {
  if (!reasons.includes(reason)) reasons.push(reason)
}

function possibleDisqualifiersFor(grant: Grant): string[] {
  const d = ["Final eligibility is determined by the issuing agency — verify before applying."]
  const text = Array.isArray(grant.eligibility_criteria)
    ? grant.eligibility_criteria.join(" ").toLowerCase()
    : JSON.stringify(grant.eligibility_criteria).toLowerCase()

  if (text.includes("citizen") || text.includes("resident"))
    d.push("US citizenship or residency may be required.")
  if (text.includes("employee") || text.includes("revenue") || text.includes("size"))
    d.push("Business size or revenue limits may apply.")
  if (text.includes("sam.gov") || text.includes("uei") || text.includes("registration"))
    d.push("Active SAM.gov registration and a UEI number may be required.")
  if (text.includes("state") || text.includes("location"))
    d.push("Geographic restrictions or state-specific rules may apply.")

  return d.slice(0, 3)
}

function scoreStructuredCriteria(
  criteria: EligibilityCriteria,
  profile: Partial<UserProfile>,
  reasons: string[]
): number {
  let score = 0
  const employeeCount = toNumber(profile.employee_count)
  const annualRevenue = toNumber(profile.annual_revenue)
  const citizenship = profile.citizenship_status ?? ""
  const identities = profile.business_ownership_identities ?? []

  if (criteria.requires_us_citizen && citizenship !== "us_citizen") return -999
  if (criteria.requires_us_resident && !["us_citizen", "permanent_resident"].includes(citizenship)) return -999

  if (criteria.requires_rural && profile.rural_location !== "yes") return -999
  if (criteria.requires_student && profile.student_status !== "yes") return -999

  if (criteria.max_employees !== undefined && employeeCount !== undefined) {
    if (employeeCount > criteria.max_employees) return -999
    score += 2
    addReason(reasons, `Business size (${employeeCount} employees) fits within the limit`)
  }
  if (criteria.max_revenue !== undefined && annualRevenue !== undefined) {
    if (annualRevenue > criteria.max_revenue) return -999
    score += 2
    addReason(reasons, "Annual revenue is within program limits")
  }

  if (criteria.requires_us_business && profile.business_us_owned === "yes") {
    score += 1
    addReason(reasons, "US-based business")
  }
  if (criteria.requires_minority_owned && identities.includes("Minority-owned")) {
    score += 3
    addReason(reasons, "Minority-owned business")
  }
  if (criteria.requires_woman_owned && identities.includes("Woman-owned")) {
    score += 3
    addReason(reasons, "Woman-owned business")
  }
  if (criteria.requires_rural && profile.rural_location === "yes") {
    score += 2
    addReason(reasons, "Rural location")
  }
  if (criteria.requires_student && profile.student_status === "yes") {
    score += 2
    addReason(reasons, "Student status")
  }

  return score
}

function scoreStringCriteria(
  criteriaList: string[],
  profile: Partial<UserProfile>,
  reasons: string[]
): number {
  let score = 0
  const text = criteriaList.join(" ").toLowerCase()
  const identities = profile.business_ownership_identities ?? []
  const isBusinessOwner = profile.business_owner === "yes"
  const isVeteran = ["yes", "active_duty", "surviving_spouse"].includes(profile.veteran_status ?? "")
  const isStudent = profile.student_status === "yes"
  const isRural = profile.rural_location === "yes"
  const citizenship = profile.citizenship_status ?? ""
  const employeeCount = toNumber(profile.employee_count)
  const annualRevenue = toNumber(profile.annual_revenue)

  if (text.includes("us citizen") || text.includes("u.s. citizen")) {
    if (citizenship !== "us_citizen") return -999
    score += 1
    addReason(reasons, "US citizenship requirement matched")
  }
  if (text.includes("small business") || text.includes("micro-business") || text.includes("micro business")) {
    if (!isBusinessOwner) return -999
    score += 3
    addReason(reasons, "Small business owner")
  }
  if (text.includes("veteran") || text.includes("military")) {
    if (!isVeteran) return -999
    score += 3
    addReason(reasons, "Veteran or military status")
  }
  if (text.includes("woman-owned") || text.includes("women-owned")) {
    if (!identities.includes("Woman-owned")) return -999
    score += 3
    addReason(reasons, "Woman-owned business")
  }
  if (text.includes("minority") && text.includes("owned")) {
    if (!identities.includes("Minority-owned")) return -999
    score += 3
    addReason(reasons, "Minority-owned business")
  }
  if (text.includes("student") || text.includes("undergraduate") || text.includes("graduate student")) {
    if (!isStudent) return -999
    score += 2
    addReason(reasons, "Student status")
  }
  if (text.includes("rural")) {
    if (!isRural) return -999
    score += 2
    addReason(reasons, "Rural location")
  }
  if (text.includes("employee") && employeeCount !== undefined) {
    const match = text.match(/fewer than (\d+) employees|under (\d+) employees|(\d+) or fewer employees/)
    if (match) {
      const limit = Number(match[1] ?? match[2] ?? match[3])
      if (employeeCount > limit) return -999
      score += 2
      addReason(reasons, `Business size (${employeeCount} employees) fits within the limit`)
    }
  }
  if (text.includes("revenue") && annualRevenue !== undefined) {
    const match = text.match(/\$?([\d,]+)\s*(million|m)?\s*(or less|or under|annual revenue)/i)
    if (match) {
      const raw = match[1].replace(/,/g, "")
      const multiplier = match[2]?.toLowerCase() === "million" ? 1_000_000 : 1
      const limit = Number(raw) * multiplier
      if (annualRevenue > limit) return -999
      score += 2
      addReason(reasons, "Annual revenue is within program limits")
    }
  }

  return score
}

export function matchEligibleGrants(
  profile: Partial<UserProfile>,
  grants: Grant[]
): EligibleGrantMatch[] {
  const isBusinessOwner = profile.business_owner === "yes"
  const isVeteran = ["yes", "active_duty", "surviving_spouse"].includes(profile.veteran_status ?? "")
  const isStudent = profile.student_status === "yes"
  const isRural = profile.rural_location === "yes"
  const identities = profile.business_ownership_identities ?? []
  const interests = new Set(profile.funding_interests ?? [])

  const INTEREST_TO_CATEGORY: Record<string, string> = {
    "Business funding": "small_business",
    "Research funding": "research",
    "Arts funding": "arts",
    "Agricultural funding": "agricultural",
    "Education funding": "individual",
  }

  const preferredCategories = new Set(
    Array.from(interests)
      .map((i) => INTEREST_TO_CATEGORY[i])
      .filter(Boolean)
  )

  return grants
    .map((grant) => {
      let score = 0
      const reasons: string[] = []
      const criteria = grant.eligibility_criteria

      // Category-level interest match
      if (preferredCategories.has(grant.category)) {
        score += 1
        addReason(reasons, `Matches your ${grant.category.replace("_", " ")} interest`)
      }

      // Score from eligibility criteria
      let criteriaScore = 0
      if (Array.isArray(criteria)) {
        criteriaScore = scoreStringCriteria(criteria, profile, reasons)
      } else if (criteria && typeof criteria === "object") {
        criteriaScore = scoreStructuredCriteria(criteria as EligibilityCriteria, profile, reasons)
      }

      if (criteriaScore === -999) return null

      score += criteriaScore

      // Category-level heuristics when criteria are thin
      if (grant.category === "small_business" && isBusinessOwner) {
        score += 2
        addReason(reasons, "Business owner — eligible category")
      }
      if (grant.category === "veterans" && isVeteran) {
        score += 3
        addReason(reasons, "Veteran or military status")
      }
      if (grant.category === "research" && isStudent) {
        score += 1
        addReason(reasons, "Student or academic background")
      }
      if ((grant.category === "agricultural" || grant.category === "small_business") && isRural) {
        score += 1
        addReason(reasons, "Rural location")
      }
      if (identities.includes("Woman-owned") && grant.category === "small_business") {
        score += 1
        addReason(reasons, "Woman-owned business")
      }
      if (identities.includes("Minority-owned") && grant.category === "small_business") {
        score += 1
        addReason(reasons, "Minority-owned business")
      }

      if (score <= 0) return null

      return {
        grant,
        score,
        confidence: score >= 4 ? "likely" : "may_qualify",
        matchedReasons: reasons,
        possibleDisqualifiers: possibleDisqualifiersFor(grant),
      } satisfies EligibleGrantMatch
    })
    .filter((m): m is EligibleGrantMatch => m !== null)
    .sort((a, b) => b.score - a.score || a.grant.name.localeCompare(b.grant.name))
}
