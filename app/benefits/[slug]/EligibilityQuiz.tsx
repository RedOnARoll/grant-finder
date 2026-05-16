"use client"

import { useState } from "react"
import Link from "next/link"
import type { EligibilityCriteria } from "@/lib/types"
import { getIncomeLimit, HOUSEHOLD_SIZES } from "@/lib/poverty-guidelines"
import { AMI_BY_STATE, US_STATES } from "@/lib/ami-data"

// ─── Question types ───────────────────────────────────────────────────────────

type YesNoQuestion = {
  kind: "yesno"
  id: string
  label: string
  meaning: string       // plain-language explanation of what the requirement means
  proof?: string        // what document/info proves you meet it
  qualifyingAnswer: "yes" | "no"
  failReason: string
}

type PovertyQuestion  = { kind: "poverty"; id: string; percent: number; failReason: string }
type AMIQuestion      = { kind: "ami";     id: string; percent: number; failReason: string }
type DollarQuestion   = { kind: "dollar";  id: string; limit: number;   failReason: string }
type InfoCard         = { kind: "info";    id: string; text: string }

type Question = YesNoQuestion | PovertyQuestion | AMIQuestion | DollarQuestion | InfoCard

// ─── Informational string detection ──────────────────────────────────────────

function isInformational(text: string): boolean {
  const lower = text.toLowerCase()
  // Definite requirement indicators → never informational
  if (/^must\b/i.test(text) || /^required\b/i.test(text)) return false
  if (/\d+\s*%\s*(of|fpl|ami)/i.test(text)) return false
  if (lower.includes("must be") || lower.includes("must have") || lower.includes("must meet")) return false

  // Informational patterns
  if (lower.includes("do not enroll")) return true
  if (lower.includes("access is through")) return true
  if (lower.includes("set their own polic")) return true
  if (lower.includes("is administered by")) return true
  if (lower.includes("is handled by")) return true
  if (lower.includes("automatic enrollment")) return true
  if (lower.includes("redetermination required")) return true
  if (lower.includes("annually required")) return true
  if (lower.includes("benefit most from") && !/\byou\b/.test(lower)) return true
  if (lower.includes("program provides") && !/\bmust\b/.test(lower)) return true

  // Heuristic: starts with a subject that is the program/entity, not the applicant
  const personalSubject = /\b(you|your|applicant|household|family|individual applicant)\b/i.test(text)
  const programSubject = /^(individual patients|coverage entities|uninsured patients|this program|the program|benefit recipients|recipients automatically|annual|enrollment|access)/i.test(text)
  if (programSubject && !personalSubject && !/\bmust\b/.test(lower)) return true

  // Priority/availability notes
  if (/^priority (given|is given) to/i.test(text)) return true
  if (/\bgiven priority\b/i.test(text) && !/^must\b/i.test(text)) return true
  if (/^benefits? are distributed first.come/i.test(text)) return true
  if (/^(enrollment|participation) may be limited/i.test(text)) return true

  // Open/no-requirement notes
  if (/^open to all/i.test(text)) return true
  if (/^available to (renters?|prospective|current|all|individuals)/i.test(text)) return true
  if (/^no (income|prior|separate|documentation|additional application|individual income)/i.test(text)) return true
  if (lower.includes("no income requirement")) return true
  if (lower.includes("income limits vary")) return true
  if (lower.includes("may not participate in both")) return true

  // Informational program notes
  if (/^(eligibility criteria|documentation requirements|specific (eligibility|services|criteria)).*vary/i.test(text)) return true
  if (/^some states? or local/i.test(text)) return true
  if (/^participation is voluntary/i.test(text)) return true
  if (/^program (availability|funds|funding|provides|design)/i.test(text)) return true
  if (/^(schools?|sites?|facilities?) are selected/i.test(text)) return true
  if (/^(congregate meals?|home.delivered meals?|meals?) (are )?available/i.test(text)) return true
  if (/^(cil|program) (boards?|staff)\b/i.test(text)) return true
  if (lower.startsWith("services available to")) return true
  if (/^(elderly|seniors?|children|families|spouses?).*(given priority|may also qualify)/i.test(text)) return true
  if (/^automatic eligibility/i.test(text)) return true
  if (/^(children|adults?) in (foster care|head start|medicaid).*(categorically eligible|may be enrolled)/i.test(text)) return true
  if (/^households? may not participate in both/i.test(text)) return true
  if (/^(no|services? available|benefit recipients)/i.test(text) && !lower.includes("must")) return true
  if (/^income limits? vary\b/i.test(text)) return true
  if (/^starting january/i.test(text)) return true

  return false
}

// ─── String → Question parser ─────────────────────────────────────────────────

function parseStringRequirement(req: string, index: number): Question {
  const id = `req_${index}`
  const lower = req.toLowerCase()
  const failReason = req

  // Informational notes first — render as info cards, not questions
  if (isInformational(req)) {
    return { kind: "info", id, text: req }
  }

  // "Specific categories include X, Y, Z" — check early before sub-keywords fire
  if (lower.startsWith("specific categor") || lower.includes("qualifying categor")) {
    const cats = req.replace(/^specific categories include\s*/i, "").replace(/\.$/, "")
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Do you fall into one of the qualifying categories?",
      meaning: `This program is open to people in the following groups: ${cats}.`,
      proof: "You may be asked to show documentation of your category — for example, a birth certificate for a child, SSA letter for disability, or discharge papers for veterans.",
    }
  }

  // AMI income limit
  const amiMatch = req.match(/(\d+)\s*%\s*of\s*(?:the\s*)?(?:area\s*median\s*income|ami)/i)
  if (amiMatch) return { kind: "ami", id, percent: parseInt(amiMatch[1]), failReason }

  // Federal poverty level income limit
  const povertyMatch = req.match(/(\d+)\s*%\s*(?:fpl|of\s*(?:the\s*)?(?:federal\s*poverty(?:\s*level)?|fpl))/i)
  if (povertyMatch) return { kind: "poverty", id, percent: parseInt(povertyMatch[1]), failReason }

  // Dollar income limit
  const dollarMatch = req.match(/\$([0-9,]+)/)
  if (dollarMatch && (lower.includes("income") || lower.includes("earn") || lower.includes("wages"))) {
    return { kind: "dollar", id, limit: parseInt(dollarMatch[1].replace(/,/g, "")), failReason }
  }

  // General "low-income" without specific %
  if ((lower.includes("low-income") || lower.includes("low income")) && lower.includes("income")) {
    return { kind: "poverty", id, percent: 80, failReason }
  }

  // Resource / asset limits
  if (lower.includes("resource limit") || lower.includes("asset limit")) {
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Do you meet the resource limits for this program?",
      meaning: "Resource limits cap the total value of savings, investments, and other assets you're allowed to have (not counting your home or one car). These are separate from income limits.",
      proof: "Recent bank statements, investment account statements, and retirement account statements showing your current balances. Your caseworker will add these up against the program's asset limit.",
    }
  }

  // Citizenship / qualifying non-citizen
  if (lower.includes("citizen") || lower.includes("qualifying non-citizen") || lower.includes("immigration status")) {
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Are you a US citizen or qualifying non-citizen?",
      meaning: "Most federal benefit programs require US citizenship or a qualifying immigration status. 'Qualifying non-citizens' include lawful permanent residents (green card holders), refugees, asylees, Cuban/Haitian entrants, and certain others. Temporary visa holders (tourist, student, work) typically do not qualify.",
      proof: "US citizens: passport, birth certificate, or Certificate of Naturalization. Permanent residents: Permanent Resident Card (green card / Form I-551). Refugees/asylees: official USCIS documentation.",
    }
  }

  // State residency
  if (lower.includes("resident of the state") || lower.includes("reside in the state") || lower.includes("live in the state")) {
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Do you currently live in the state where you're applying?",
      meaning: "You must physically reside in — and intend to remain in — the state you're applying through. You can't use a relative's address in a different state.",
      proof: "A utility bill, bank statement, or piece of official government mail showing your name and current address, dated within the last 60 days.",
    }
  }

  // School/facility enrollment (check before residency — "residential care institution" contains "resident")
  if ((lower.includes("enrolled") || lower.includes("enrollment")) &&
      (lower.includes("school") || lower.includes("care") || lower.includes("facility") || lower.includes("institution"))) {
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Are you (or your child) enrolled in a participating program or school?",
      meaning: req,
      proof: "Enrollment confirmation letter or school ID from the institution. The institution typically registers with the program on your behalf — contact the school or facility's administration to confirm they participate.",
    }
  }

  // General US residency — exclude "residential care" which matches "resident" spuriously
  if ((lower.includes("resident") || lower.includes("residency") || lower.includes("reside in")) &&
      !lower.includes("residential care") && !lower.includes("residential facility")) {
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Are you a US resident?",
      meaning: "You must live in the United States and have a qualifying immigration status. US citizens, permanent residents (green card), refugees, and asylees typically meet this requirement.",
      proof: "Government-issued photo ID with your US address, or a utility bill and immigration document showing your status.",
    }
  }

  // Medicare Part A/B enrollment
  if (lower.includes("medicare part")) {
    const parts = req.match(/part\s+([a-d](?:\s*(?:and|\/|or)\s*[a-d])*)/i)?.[1]?.toUpperCase() ?? "A and/or B"
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: `Are you currently enrolled in Medicare Part ${parts}?`,
      meaning: `Medicare Part A covers hospital stays; Part B covers doctor visits and outpatient care. You must be actively enrolled in Part ${parts} to qualify for this program.`,
      proof: "Your red, white, and blue Medicare card shows which parts you're enrolled in, and the date your coverage began. You can also check at Medicare.gov or call 1-800-MEDICARE.",
    }
  }

  // Receiving another benefit
  const receivingMatch = req.match(/receiving\s+(.+?)(?:\s+benefits?|\s+program|\s+assistance)?(?:\s+to\s+qualify|,|$)/i)
  if (receivingMatch || lower.includes("must be receiving") || lower.includes("must currently receive")) {
    const benefit = receivingMatch ? receivingMatch[1].trim() : "the qualifying program"
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: `Are you currently receiving ${benefit}?`,
      meaning: `Enrollment in ${benefit} may automatically qualify you for this program, or it may be a required prerequisite. Your active participation in ${benefit} needs to be verified.`,
      proof: `Your ${benefit} benefit card, approval letter, or most recent benefit statement. Contact your local benefits office if you're unsure of your current enrollment status.`,
    }
  }

  // Pregnancy / breastfeeding / postpartum
  if (lower.includes("pregnant") || lower.includes("breastfeed") || lower.includes("postpartum") || lower.includes("recently gave birth") || lower.includes("nursing")) {
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Are you currently pregnant, breastfeeding, or did you recently give birth?",
      meaning: "Many programs extend special eligibility to pregnant women and new mothers because of increased nutritional and health needs. Breastfeeding mothers are typically covered up to 12 months postpartum; non-breastfeeding mothers up to 6 months.",
      proof: "A letter from your doctor, OB-GYN, or midwife on official letterhead stating your name, pregnancy status, and estimated due date. If postpartum, the baby's birth certificate.",
    }
  }

  // Children — age-specific max
  const childMaxAgeMatch = req.match(/(?:child(?:ren)?|infant|toddler|baby).*?(?:under|below|younger than)\s+age\s*(\d+)/i)
    || req.match(/(?:under|below|younger than)\s+age\s*(\d+).*?(?:child|infant|toddler)/i)
    || req.match(/age\s+(\d+)\s+(?:or\s+)?(?:younger|under|below)/i)
  if (childMaxAgeMatch) {
    const age = childMaxAgeMatch[1]
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: `Is the child you're applying for under age ${age}?`,
      meaning: `The child must be younger than ${age} years old at the time of application. Some programs have separate rules for children between certain ages, so check with the program if your child is close to the age limit.`,
      proof: "The child's birth certificate or hospital birth record showing their date of birth.",
    }
  }

  // Children generally qualifying
  if (lower.includes("children") && lower.includes("qualify")) {
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Are you applying for a child (under 18)?",
      meaning: "Children typically qualify at higher income thresholds than adults for this program. Make sure to indicate the child's age and household income when you apply.",
      proof: "The child's birth certificate showing their date of birth.",
    }
  }

  // Age minimum
  const ageMinMatch = req.match(/(?:be\s+|age\s+|least\s+)(\d+)\s*(?:or\s*)?(?:older|over|above|\+)/i)
  if (ageMinMatch) {
    const age = ageMinMatch[1]
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: `Are you ${age} years of age or older?`,
      meaning: `You must be at least ${age} years old on the date you apply. Some programs have an upper age limit too — check the full eligibility rules if you are significantly older.`,
      proof: "Government-issued photo ID showing your date of birth (driver's license, state ID, or passport).",
    }
  }

  // Age maximum
  const ageMaxMatch = req.match(/(?:under|below|younger than)\s+(?:age\s+)?(\d+)/i)
  if (ageMaxMatch && lower.includes("age")) {
    const age = ageMaxMatch[1]
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: `Are you under age ${age}?`,
      meaning: `You must be younger than ${age} to qualify. If you are close to this age limit, apply as soon as possible.`,
      proof: "Government-issued ID or birth certificate showing your date of birth.",
    }
  }

  // Disability
  if (lower.includes("disabilit") || lower.includes("disabled")) {
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Do you have a documented disability?",
      meaning: "A disability qualifies if it is recognized by the Social Security Administration (SSI or SSDI approval) or documented in writing by a licensed physician confirming that your condition significantly limits one or more major life activities — such as walking, breathing, working, or caring for yourself.",
      proof: "SSA disability award letter or benefit verification letter (downloadable free at ssa.gov), OR a physician's letter on official letterhead stating your diagnosis, its severity, and how it limits daily activities.",
    }
  }

  // Veteran / military
  if (lower.includes("veteran") || lower.includes("military service") || lower.includes("dd-214") || lower.includes("armed forces")) {
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Are you a US military veteran?",
      meaning: "You must have served in the US Armed Forces (Army, Navy, Air Force, Marines, Coast Guard, or Space Force) and received an honorable or general (under honorable conditions) discharge. Active duty members may also qualify for some programs.",
      proof: "DD-214 (Certificate of Release or Discharge from Active Duty) — specifically Member Copy 4. Lost yours? Request a free replacement at archives.gov/veterans — takes 1–10 days online.",
    }
  }

  // Student enrollment
  if (lower.includes("student") || (lower.includes("enrolled") && lower.includes("school"))) {
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Are you currently enrolled as a student?",
      meaning: "You must be actively enrolled at an accredited school, college, or university. Some programs require full-time enrollment; others accept part-time. Check the specific requirement.",
      proof: "Enrollment verification letter from your school's registrar office — free and usually available the same day. Must show your name, school name, enrollment status, and current term.",
    }
  }

  // Rural
  if (lower.includes("rural")) {
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Do you live in a rural area?",
      meaning: "USDA defines 'rural' as communities with a population under 50,000 that are not part of or closely connected to a large urban area. Small towns, farm communities, and open countryside typically qualify. Most suburbs do not.",
      proof: "Your address is the proof — a utility bill or government mail with your address. The program will verify rural status based on your location.",
    }
  }

  // Professional employment requirement
  if (lower.includes("must be employed") || lower.includes("employed full-time as") || lower.includes("employed by an agency")) {
    const profMatch = req.match(/(?:employed(?:\s+full-time)?\s+as\s+(?:a|an)\s+)(.+?)(?:\s*,|\s+or\b|$)/i)
    const profession = profMatch ? profMatch[1].trim() : "an eligible profession for this program"
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: `Are you currently employed as ${profession}?`,
      meaning: `This program requires you to be employed full-time in a qualifying profession. ${req}`,
      proof: "An official letter on your employer's letterhead confirming your job title, full-time status, and the agency or organization you work for. HR departments can usually provide this same-day.",
    }
  }

  // Home non-ownership
  if (lower.includes("must not have owned") || lower.includes("not have owned a primary residence") || (lower.includes("owned") && lower.includes("prior"))) {
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Have you NOT owned a primary residence in the past 12 months?",
      meaning: "You must not have been a homeowner in the year before applying. This is a first-time or returning homebuyer requirement. Owning investment property or inheriting a share of a home may also count — ask the program for clarification.",
      proof: "You may be asked to sign a self-certification form. If you previously owned a home and sold it, you may need closing documents showing the sale date.",
    }
  }

  // Occupancy commitment
  if (lower.includes("must commit to occupying") || lower.includes("sole residence for at least") || lower.includes("commit to living")) {
    const monthsMatch = req.match(/(\d+)\s*months/i)
    const months = monthsMatch ? monthsMatch[1] : "36"
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: `Can you commit to living in the home as your sole residence for at least ${months} months?`,
      meaning: `You must use the property as your primary, full-time residence for at least ${months} months — you cannot rent it out, use it as a vacation home, or leave it vacant during this period. Violating this may require repaying the benefit.`,
      proof: "You'll sign a legal agreement at closing committing to this occupancy requirement. No advance document is needed to apply.",
    }
  }

  // Financing/purchase readiness
  if (lower.includes("obtain financing") || lower.includes("pay cash at the time") || lower.includes("proof of cash financing") || lower.includes("mortgage pre-approval")) {
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Do you have financing (mortgage) or cash ready to purchase the home?",
      meaning: "You must either have a mortgage pre-approval letter from a lender or documented funds sufficient to buy the property outright in cash. This confirms you are a serious buyer who can close.",
      proof: "Mortgage pre-approval letter from a HUD-approved lender (shows loan amount and terms), OR bank/investment account statements showing liquid funds equal to the purchase price.",
    }
  }

  // Wartime military service
  if (lower.includes("wartime period") || lower.includes("active duty with at least one day during")) {
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Did you serve on active duty during a qualifying wartime period?",
      meaning: "Qualifying wartime periods include: World War II (Dec 7, 1941–Dec 31, 1946), Korean War (Jun 27, 1950–Jan 31, 1955), Vietnam Era (Aug 5, 1964–May 7, 1975), Gulf War (Aug 2, 1990–present). You must have served at least one day during one of these periods, with a minimum of 90 days of active service total.",
      proof: "DD-214 (Certificate of Release or Discharge from Active Duty) — it shows your service dates and period. Look at Block 18 'Remarks' and Block 12 for service dates.",
    }
  }

  // Service-connected disability
  if ((lower.includes("connection between") && lower.includes("military service")) || lower.includes("service-connected") || lower.includes("in-service event")) {
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Do you have a health condition connected to your military service?",
      meaning: "A service-connected condition is a disability, illness, or injury that was caused or worsened by your active duty service. This includes physical injuries, mental health conditions (PTSD, depression), toxic exposure conditions (Agent Orange, burn pits), and many chronic diseases. The VA uses a 'benefit of the doubt' standard — you don't need to prove it beyond a reasonable doubt.",
      proof: "Medical records documenting your current condition, and any service records showing the in-service event or exposure. If records are unavailable, 'buddy statements' from fellow service members who witnessed the event are accepted. A VA-accredited attorney or Veterans Service Organization (VSO) can help for free.",
    }
  }

  // Net worth / asset limit
  if ((lower.includes("net worth") || lower.includes("net worth limit")) && (lower.includes("must meet") || lower.includes("must not exceed"))) {
    const limitMatch = req.match(/\$([0-9,]+)/)
    const limit = limitMatch ? `$${limitMatch[1]}` : "the program limit"
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: `Is your net worth under ${limit}?`,
      meaning: `Net worth means the total value of everything you own (savings, investments, property other than your primary home) minus what you owe. Your primary home and one vehicle are typically excluded. Net worth above the limit disqualifies you, but certain asset transfers to family or trusts may affect this calculation.`,
      proof: "Bank statements, investment account statements, property appraisals (for non-primary-home property), and vehicle values. Exclude your primary residence and one car from the total.",
    }
  }

  // Fallback: convert statement to question
  return {
    kind: "yesno", id, qualifyingAnswer: "yes", failReason,
    label: statementToQuestion(req),
    meaning: req,
  }
}

function statementToQuestion(text: string): string {
  const cleaned = text.replace(/\s*\([^)]*\)/g, "").trim()
  const qualifiesMatch = cleaned.match(/^(.+?)\s+qualif(?:y|ies)\b/i)
  if (qualifiesMatch) return `Are you ${qualifiesMatch[1].trim().toLowerCase()}?`

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

// ─── Build questions from EligibilityCriteria object ──────────────────────────

function buildFromObject(c: EligibilityCriteria): Question[] {
  const questions: Question[] = []
  if (c.requires_us_citizen) questions.push({
    kind: "yesno", id: "citizen", qualifyingAnswer: "yes",
    failReason: "Must be a US citizen",
    label: "Are you a US citizen?",
    meaning: "You must be a US citizen — either born in the US or naturalized. Lawful permanent residents (green card holders) and visa holders do not satisfy a citizenship requirement, though they may qualify under a residency requirement.",
    proof: "US passport, US birth certificate, or Certificate of Naturalization (Form N-550). If you were naturalized, your certificate has a 13-digit document number.",
  })
  if (c.requires_us_resident && !c.requires_us_citizen) questions.push({
    kind: "yesno", id: "resident", qualifyingAnswer: "yes",
    failReason: "Must be a US resident or permanent resident",
    label: "Are you a US resident or permanent resident?",
    meaning: "Qualifying statuses include US citizens, lawful permanent residents (green card / Form I-551), refugees, asylees, and certain other immigration categories. Temporary visa holders (B-1/B-2 tourist, F-1 student, H-1B work) typically do not qualify.",
    proof: "Permanent Resident Card (green card), refugee travel document, asylee approval letter, or valid US passport for citizens.",
  })
  if (c.requires_student) questions.push({
    kind: "yesno", id: "student", qualifyingAnswer: "yes",
    failReason: "Must be currently enrolled as a student",
    label: "Are you currently enrolled as a student?",
    meaning: "You must be actively enrolled at an accredited school, college, or university during the current term. Some programs require full-time enrollment (12+ credits); check the specific rules.",
    proof: "Enrollment verification letter from your registrar's office — free, usually ready same day. It must show your name, institution, enrollment status, and current semester.",
  })
  if (c.requires_rural) questions.push({
    kind: "yesno", id: "rural", qualifyingAnswer: "yes",
    failReason: "Must reside in a rural area",
    label: "Do you live in a rural area?",
    meaning: "USDA defines rural as areas with populations under 50,000 not closely connected to urban centers. Most suburbs do not qualify, but small towns, farm communities, and open countryside typically do.",
    proof: "Your address is verified against USDA's eligibility maps — bring a utility bill or official mail showing your address. You don't need to prove rural status yourself.",
  })
  if (c.max_household_income_percent_poverty) questions.push({ kind: "poverty", id: "poverty", percent: c.max_household_income_percent_poverty, failReason: `Household income must be at or below ${c.max_household_income_percent_poverty}% of the federal poverty level` })
  if (c.max_household_income_percent_ami) questions.push({ kind: "ami", id: "ami", percent: c.max_household_income_percent_ami, failReason: `Household income must be at or below ${c.max_household_income_percent_ami}% of Area Median Income` })
  if (c.max_household_income && !c.max_household_income_percent_poverty && !c.max_household_income_percent_ami) questions.push({ kind: "dollar", id: "income", limit: c.max_household_income, failReason: `Annual household income must not exceed ${fmt(c.max_household_income)}` })
  return questions
}

function buildQuestions(criteria: EligibilityCriteria | string[]): Question[] {
  const raw = Array.isArray(criteria) ? criteria.map((req, i) => parseStringRequirement(req, i)) : buildFromObject(criteria)

  // Deduplicate: keep only one income question per type (highest limit = most inclusive)
  const seen = new Set<string>()
  const deduped: Question[] = []
  let maxPovertyPct = 0, maxAmiPct = 0, maxDollar = 0
  let povertyIdx = -1, amiIdx = -1, dollarIdx = -1

  for (const q of raw) {
    if (q.kind === "poverty") {
      if (q.percent > maxPovertyPct) { maxPovertyPct = q.percent; if (povertyIdx >= 0) deduped[povertyIdx] = q; else { povertyIdx = deduped.length; deduped.push(q) } }
      continue
    }
    if (q.kind === "ami") {
      if (q.percent > maxAmiPct) { maxAmiPct = q.percent; if (amiIdx >= 0) deduped[amiIdx] = q; else { amiIdx = deduped.length; deduped.push(q) } }
      continue
    }
    if (q.kind === "dollar") {
      if (q.limit > maxDollar) { maxDollar = q.limit; if (dollarIdx >= 0) deduped[dollarIdx] = q; else { dollarIdx = deduped.length; deduped.push(q) } }
      continue
    }
    // Deduplicate yesno by label similarity
    const key = q.kind === "yesno" ? q.label.toLowerCase().slice(0, 40) : q.id
    if (!seen.has(key)) { seen.add(key); deduped.push(q) }
  }

  return deduped
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n)
}

function isAnswered(q: Question, answers: Record<string, "yes" | "no">, sizes: Record<string, number>, states: Record<string, string>, areas: Record<string, number>): boolean {
  if (q.kind === "info") return true
  if (q.kind === "poverty") return !!sizes[q.id] && !!answers[q.id]
  if (q.kind === "ami") return !!states[q.id] && areas[q.id] !== undefined && !!answers[q.id]
  return !!answers[q.id]
}

function passed(q: Question, answers: Record<string, "yes" | "no">): boolean {
  if (q.kind === "info") return true
  if (q.kind === "yesno") return answers[q.id] === q.qualifyingAnswer
  return answers[q.id] === "yes"
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoCardQ({ q }: { q: InfoCard }) {
  return (
    <div className="rounded-xl bg-blue-50 border border-blue-100 px-5 py-4 flex gap-3">
      <svg className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 7v4M8 5.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <p className="text-sm text-blue-800 leading-6">{q.text}</p>
    </div>
  )
}

function YesNoQ({ q, answer, onAnswer }: { q: YesNoQuestion; answer: "yes" | "no" | null; onAnswer: (v: "yes" | "no") => void }) {
  const [open, setOpen] = useState(false)
  const hasFailed = answer === (q.qualifyingAnswer === "yes" ? "no" : "yes")

  return (
    <div className={`border rounded-xl p-5 transition-colors ${hasFailed ? "border-red-200 bg-red-50" : "border-zinc-200 bg-white"}`}>
      <p className="text-sm font-semibold text-zinc-900 mb-3">{q.label}</p>

      <button type="button" onClick={() => setOpen(o => !o)}
        className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-3">
        {open ? "Hide details" : "What does this mean?"}
        <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 12 12">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-3 mb-4 space-y-3">
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">What this means</p>
            <p className="text-sm text-zinc-700 leading-6">{q.meaning}</p>
          </div>
          {q.proof && (
            <div className="border-t border-zinc-200 pt-3">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">What you'll need to prove it</p>
              <p className="text-sm text-zinc-700 leading-6">{q.proof}</p>
            </div>
          )}
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
      <p className="text-sm text-zinc-600 leading-6 mb-4">This program requires income at or below <span className="font-semibold text-zinc-800">{q.percent}% of the Federal Poverty Level</span> — that's the government's measure of what it costs to meet basic needs. Select your household size to see your exact dollar limit.</p>
      <div className="mb-4">
        <label className="text-xs font-medium text-zinc-500 block mb-2">How many people are in your household?</label>
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
        <p className="text-xs text-zinc-400 mt-2">Count everyone who lives and eats with you — yourself, spouse/partner, children, and any dependents. Count a pregnant woman as 2.</p>
      </div>
      {limit && (
        <>
          <div className="rounded-lg bg-zinc-50 border border-zinc-200 px-4 py-3 mb-4">
            <p className="text-xs text-zinc-500 mb-1">For a household of {householdSize}, your income limit is:</p>
            <p className="text-2xl font-bold text-zinc-900">{fmt(limit)}<span className="text-base font-normal text-zinc-500">/year</span></p>
            <p className="text-sm text-zinc-500 mt-0.5">{fmt(Math.round(limit / 12))}/month &nbsp;·&nbsp; {fmt(Math.round(limit / 52))}/week</p>
            <p className="text-xs text-zinc-400 mt-2">Counts wages, self-employment, Social Security, child support, alimony, and rental income. Many programs allow deductions for rent, childcare, and medical costs — your actual limit may be higher.</p>
          </div>
          <p className="text-sm font-semibold text-zinc-900 mb-2">Is your household income at or below {fmt(limit)}/year?</p>
          <div className="flex gap-3">
            {(["yes", "no"] as const).map(val => (
              <button key={val} type="button" onClick={() => onAnswer(val)}
                className={`h-9 px-6 rounded-full text-sm font-medium border transition-colors ${answer === val ? val === "yes" ? "bg-green-600 text-white border-green-600" : "bg-red-500 text-white border-red-500" : "border-zinc-300 text-zinc-700 hover:border-zinc-500"}`}>
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
      <p className="text-sm text-zinc-600 leading-6 mb-4">This program uses <span className="font-semibold text-zinc-800">Area Median Income (AMI)</span> — the middle income for your local area — as its benchmark. Your limit is {q.percent}% of your area's AMI, which varies by location. Select your state and area to see your exact limit.</p>
      <div className="mb-4">
        <label className="text-xs font-medium text-zinc-500 block mb-1.5">What state do you live in?</label>
        <select value={selectedState ?? ""} onChange={e => onState(e.target.value)}
          className="h-10 px-3 rounded-lg border border-zinc-300 text-sm text-zinc-700 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 w-full max-w-xs">
          <option value="">Select a state…</option>
          {US_STATES.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
        </select>
      </div>
      {selectedState && areas.length > 0 && (
        <div className="mb-4">
          <label className="text-xs font-medium text-zinc-500 block mb-1.5">What's your nearest metro or area?</label>
          <div className="flex flex-wrap gap-2">
            {areas.map((area, idx) => (
              <button key={idx} type="button" onClick={() => onArea(idx)}
                className={`h-9 px-3 rounded-full text-xs font-medium border transition-colors ${selectedArea === idx ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-300 text-zinc-700 hover:border-zinc-500"}`}>
                {area.name}
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-400 mt-2">AMI is set by HUD per county. Choose "Statewide average" if you're unsure — actual limits may vary slightly.</p>
        </div>
      )}
      {limit && areaData && (
        <>
          <div className="rounded-lg bg-zinc-50 border border-zinc-200 px-4 py-3 mb-4">
            <p className="text-xs text-zinc-500 mb-1">Area Median Income for {areaData.name}: <span className="font-medium text-zinc-700">{fmt(areaData.ami)}/year</span></p>
            <p className="text-xs text-zinc-500 mb-2">{q.percent}% of that is your income limit:</p>
            <p className="text-2xl font-bold text-zinc-900">{fmt(limit)}<span className="text-base font-normal text-zinc-500">/year</span></p>
            <p className="text-sm text-zinc-500 mt-0.5">{fmt(Math.round(limit / 12))}/month &nbsp;·&nbsp; {fmt(Math.round(limit / 52))}/week</p>
            <p className="text-xs text-zinc-400 mt-2">Based on 2024 HUD income limits. Limits may vary by county.</p>
          </div>
          <p className="text-sm font-semibold text-zinc-900 mb-2">Is your household income at or below {fmt(limit)}/year?</p>
          <div className="flex gap-3">
            {(["yes", "no"] as const).map(val => (
              <button key={val} type="button" onClick={() => onAnswer(val)}
                className={`h-9 px-6 rounded-full text-sm font-medium border transition-colors ${answer === val ? val === "yes" ? "bg-green-600 text-white border-green-600" : "bg-red-500 text-white border-red-500" : "border-zinc-300 text-zinc-700 hover:border-zinc-500"}`}>
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
      <p className="text-sm text-zinc-600 leading-6 mb-3">This program has a fixed annual income limit. Count income from all sources — wages, self-employment, Social Security, pensions, and any other regular payments.</p>
      <div className="rounded-lg bg-zinc-50 border border-zinc-200 px-4 py-3 mb-4">
        <p className="text-xs text-zinc-500 mb-1">Your household income must be at or below:</p>
        <p className="text-2xl font-bold text-zinc-900">{fmt(q.limit)}<span className="text-base font-normal text-zinc-500">/year</span></p>
        <p className="text-sm text-zinc-500 mt-0.5">{fmt(Math.round(q.limit / 12))}/month &nbsp;·&nbsp; {fmt(Math.round(q.limit / 52))}/week</p>
      </div>
      <p className="text-sm font-semibold text-zinc-900 mb-2">Is your annual household income below {fmt(q.limit)}?</p>
      <div className="flex gap-3">
        {(["yes", "no"] as const).map(val => (
          <button key={val} type="button" onClick={() => onAnswer(val)}
            className={`h-9 px-6 rounded-full text-sm font-medium border transition-colors ${answer === val ? val === "yes" ? "bg-green-600 text-white border-green-600" : "bg-red-500 text-white border-red-500" : "border-zinc-300 text-zinc-700 hover:border-zinc-500"}`}>
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
  const answerableQs = questions.filter(q => q.kind !== "info")
  const [answers, setAnswers] = useState<Record<string, "yes" | "no">>({})
  const [householdSizes, setHouseholdSizes] = useState<Record<string, number>>({})
  const [selectedStates, setSelectedStates] = useState<Record<string, string>>({})
  const [selectedAreas, setSelectedAreas] = useState<Record<string, number>>({})

  if (questions.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 p-6">
        <h2 className="text-xl font-semibold text-zinc-900 mb-2">Eligibility</h2>
        <p className="text-sm text-zinc-500 mb-4">No specific eligibility criteria on file. Review the program's official requirements before applying.</p>
        <Link href={`/benefits/${slug}/apply`} className="inline-flex items-center h-11 px-6 rounded-full bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 transition-colors">Start Application →</Link>
      </div>
    )
  }

  const allAnswered = answerableQs.every(q => isAnswered(q, answers, householdSizes, selectedStates, selectedAreas))
  const failedQs = answerableQs.filter(q => answers[q.id] && !passed(q, answers))
  const isEligible = allAnswered && failedQs.length === 0

  function setAnswer(id: string, val: "yes" | "no") {
    setAnswers(prev => ({ ...prev, [id]: val }))
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-zinc-900 mb-1">Am I Eligible?</h2>
      <p className="text-sm text-zinc-500 mb-5">Answer each question — we'll show you exactly what applies to your situation.</p>

      <div className="space-y-4">
        {questions.map(q => {
          if (q.kind === "info")    return <InfoCardQ key={q.id} q={q} />
          if (q.kind === "yesno")   return <YesNoQ key={q.id} q={q} answer={answers[q.id] ?? null} onAnswer={v => setAnswer(q.id, v)} />
          if (q.kind === "poverty") return <PovertyQ key={q.id} q={q} householdSize={householdSizes[q.id] ?? null} answer={answers[q.id] ?? null} onSize={n => setHouseholdSizes(p => ({ ...p, [q.id]: n }))} onAnswer={v => setAnswer(q.id, v)} />
          if (q.kind === "ami")     return (
            <AMIQuestionCard key={q.id} q={q} selectedState={selectedStates[q.id] ?? null} selectedArea={selectedAreas[q.id] ?? null} answer={answers[q.id] ?? null}
              onState={s => { setSelectedStates(p => ({ ...p, [q.id]: s })); setSelectedAreas(p => { const n = {...p}; delete n[q.id]; return n }); setAnswers(p => { const n = {...p}; delete n[q.id]; return n }) }}
              onArea={i => setSelectedAreas(p => ({ ...p, [q.id]: i }))}
              onAnswer={v => setAnswer(q.id, v)} />
          )
          if (q.kind === "dollar")  return <DollarQ key={q.id} q={q} answer={answers[q.id] ?? null} onAnswer={v => setAnswer(q.id, v)} />
          return null
        })}
      </div>

      {allAnswered && answerableQs.length > 0 && (
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
                {failedQs.map(q => <li key={q.id} className="flex items-start gap-2"><span className="mt-1 shrink-0">•</span><span>{q.failReason}</span></li>)}
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
