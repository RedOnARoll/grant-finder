"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { EligibilityCriteria } from "@/lib/types"
import { getIncomeLimit, HOUSEHOLD_SIZES } from "@/lib/poverty-guidelines"
import { AMI_BY_STATE, US_STATES } from "@/lib/ami-data"
import { getBrowserSupabase } from "@/lib/supabase-browser"

async function lookupZipAMI(zip: string): Promise<{ stateCode: string; areaIndex: number } | null> {
  if (!/^\d{5}$/.test(zip)) return null
  try {
    const res = await fetch(`https://api.zippopotam.us/us/${zip}`, {
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    const data = await res.json() as {
      places: Array<{ "place name": string; "state abbreviation": string }>
    }
    const place = data.places?.[0]
    if (!place) return null
    const stateCode = place["state abbreviation"]
    const city = place["place name"].toLowerCase()
    const areas = AMI_BY_STATE[stateCode]
    if (!areas?.length) return null
    let bestIndex = 0
    for (let i = 1; i < areas.length; i++) {
      const areaKey = areas[i].name.toLowerCase().replace(/\s+(metro|area|county)$/, "")
      if (city.includes(areaKey) || areaKey.includes(city)) { bestIndex = i; break }
    }
    return { stateCode, areaIndex: bestIndex }
  } catch {
    return null
  }
}

// ─── Question types ───────────────────────────────────────────────────────────

type YesNoQuestion = {
  kind: "yesno"
  id: string
  label: string
  meaning: string
  proof?: string
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
  if (/^must\b/i.test(text) || /^required\b/i.test(text)) return false
  if (/\d+\s*%\s*(of|fpl|ami)/i.test(text)) return false
  if (lower.includes("must be") || lower.includes("must have") || lower.includes("must meet")) return false

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

  const personalSubject = /\b(you|your|applicant|household|family|individual applicant)\b/i.test(text)
  const programSubject = /^(individual patients|coverage entities|uninsured patients|this program|the program|benefit recipients|recipients automatically|annual|enrollment|access)/i.test(text)
  if (programSubject && !personalSubject && !/\bmust\b/.test(lower)) return true

  if (/^priority (given|is given) to/i.test(text)) return true
  if (/\bgiven priority\b/i.test(text) && !/^must\b/i.test(text)) return true
  if (/^benefits? are distributed first.come/i.test(text)) return true
  if (/^(enrollment|participation) may be limited/i.test(text)) return true

  if (/^open to all/i.test(text)) return true
  if (/^available to (renters?|prospective|current|all|individuals)/i.test(text)) return true
  if (/^no (income|prior|separate|documentation|additional application|individual income)/i.test(text)) return true
  if (lower.includes("no income requirement")) return true
  if (lower.includes("income limits vary")) return true
  if (lower.includes("may not participate in both")) return true

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

  // Advisory consequence notes — describe program mechanics or side effects, not requirements
  if (/\bmay (affect|impact|reduce|lower|limit|count against|disqualify)\b/i.test(text) && !/\bmust\b/.test(lower)) return true
  if (/\bwill (affect|impact|reduce|lower|limit)\b/i.test(text) && !/\bmust\b/.test(lower)) return true
  if (/\bcan (affect|impact|reduce|lower|limit)\b/i.test(text) && !/\byou can\b/i.test(lower) && !/\bmust\b/.test(lower)) return true
  if (/^(note:|please note|keep in mind)/i.test(text)) return true

  // Heuristic: non-personal subject with no action verb the applicant controls
  if (!personalSubject && !/\bmust\b/.test(lower) && /\b(balances?|payments?|benefits?|amounts?|credits?)\b/i.test(text) && /\b(above|exceed|over)\b/i.test(text)) return true

  return false
}

// ─── String → Question parser ─────────────────────────────────────────────────

function isLocalSiteRequirement(lower: string): boolean {
  return (
    lower.includes("distribution site") ||
    lower.includes("distribution center") ||
    lower.includes("distribution location") ||
    lower.includes("service area") ||
    lower.includes("participating local") ||
    lower.includes("local participating") ||
    lower.includes("local program") ||
    lower.includes("local provider") ||
    (lower.includes("served by a") && (lower.includes("site") || lower.includes("center") || lower.includes("provider") || lower.includes("program"))) ||
    lower.includes("area served by") ||
    (lower.includes("reside in an area") && lower.includes("served"))
  )
}

function parseStringRequirement(req: string, index: number): Question {
  const id = `req_${index}`
  const lower = req.toLowerCase()
  const failReason = req

  if (isLocalSiteRequirement(lower)) {
    return {
      kind: "info",
      id,
      text: "This program is delivered through local distribution sites. Use your ZIP code at fns.usda.gov/food-finder to confirm availability near you.",
    }
  }

  if (isInformational(req)) {
    return { kind: "info", id, text: req }
  }

  if (lower.startsWith("specific categor") || lower.includes("qualifying categor")) {
    const cats = req.replace(/^specific categories include\s*/i, "").replace(/\.$/, "")
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Do you fall into one of the qualifying categories?",
      meaning: `This program is open to people in the following groups: ${cats}.`,
      proof: "You may be asked to show documentation of your category — for example, a birth certificate for a child, SSA letter for disability, or discharge papers for veterans.",
    }
  }

  const amiMatch = req.match(/(\d+)\s*%\s*of\s*(?:the\s*)?(?:area\s*median\s*income|ami)/i)
  if (amiMatch) return { kind: "ami", id, percent: parseInt(amiMatch[1]), failReason }

  const povertyMatch = req.match(/(\d+)\s*%\s*(?:fpl|of\s*(?:the\s*)?(?:federal\s*poverty(?:\s*level)?|fpl))/i)
  if (povertyMatch) return { kind: "poverty", id, percent: parseInt(povertyMatch[1]), failReason }

  const dollarMatch = req.match(/\$([0-9,]+)/)
  if (dollarMatch && (lower.includes("income") || lower.includes("earn") || lower.includes("wages"))) {
    return { kind: "dollar", id, limit: parseInt(dollarMatch[1].replace(/,/g, "")), failReason }
  }

  if ((lower.includes("low-income") || lower.includes("low income")) && lower.includes("income")) {
    return { kind: "poverty", id, percent: 80, failReason }
  }

  if (lower.includes("meet the income") || lower.includes("income requirement") || lower.includes("income guidelines") || lower.includes("income eligible")) {
    return { kind: "poverty", id, percent: 130, failReason }
  }

  if (lower.includes("resource limit") || lower.includes("asset limit")) {
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Do you meet the resource limits for this program?",
      meaning: "Resource limits cap the total value of savings, investments, and other assets you're allowed to have (not counting your home or one car). These are separate from income limits.",
      proof: "Recent bank statements, investment account statements, and retirement account statements showing your current balances. Your caseworker will add these up against the program's asset limit.",
    }
  }

  if (lower.includes("citizen") || lower.includes("qualifying non-citizen") || lower.includes("immigration status")) {
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Are you a US citizen or qualifying non-citizen?",
      meaning: "Most federal benefit programs require US citizenship or a qualifying immigration status. 'Qualifying non-citizens' include lawful permanent residents (green card holders), refugees, asylees, Cuban/Haitian entrants, and certain others. Temporary visa holders (tourist, student, work) typically do not qualify.",
      proof: "US citizens: passport, birth certificate, or Certificate of Naturalization. Permanent residents: Permanent Resident Card (green card / Form I-551). Refugees/asylees: official USCIS documentation.",
    }
  }

  if (lower.includes("resident of the state") || lower.includes("reside in the state") || lower.includes("live in the state")) {
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Do you currently live in the state where you're applying?",
      meaning: "You must physically reside in — and intend to remain in — the state you're applying through. You can't use a relative's address in a different state.",
      proof: "A utility bill, bank statement, or piece of official government mail showing your name and current address, dated within the last 60 days.",
    }
  }

  if ((lower.includes("enrolled") || lower.includes("enrollment")) &&
      (lower.includes("school") || lower.includes("care") || lower.includes("facility") || lower.includes("institution"))) {
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Are you (or your child) enrolled in a participating program or school?",
      meaning: req,
      proof: "Enrollment confirmation letter or school ID from the institution. The institution typically registers with the program on your behalf — contact the school or facility's administration to confirm they participate.",
    }
  }

  if ((lower.includes("resident") || lower.includes("residency") || lower.includes("reside in")) &&
      !lower.includes("residential care") && !lower.includes("residential facility")) {
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Are you a US resident?",
      meaning: "You must live in the United States and have a qualifying immigration status. US citizens, permanent residents (green card), refugees, and asylees typically meet this requirement.",
      proof: "Government-issued photo ID with your US address, or a utility bill and immigration document showing your status.",
    }
  }

  if (lower.includes("medicare part")) {
    const parts = req.match(/part\s+([a-d](?:\s*(?:and|\/|or)\s*[a-d])*)/i)?.[1]?.toUpperCase() ?? "A and/or B"
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: `Are you currently enrolled in Medicare Part ${parts}?`,
      meaning: `Medicare Part A covers hospital stays; Part B covers doctor visits and outpatient care. You must be actively enrolled in Part ${parts} to qualify for this program.`,
      proof: "Your red, white, and blue Medicare card shows which parts you're enrolled in, and the date your coverage began. You can also check at Medicare.gov or call 1-800-MEDICARE.",
    }
  }

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

  if (lower.includes("pregnant") || lower.includes("breastfeed") || lower.includes("postpartum") || lower.includes("recently gave birth") || lower.includes("nursing")) {
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Are you currently pregnant, breastfeeding, or did you recently give birth?",
      meaning: "Many programs extend special eligibility to pregnant women and new mothers because of increased nutritional and health needs. Breastfeeding mothers are typically covered up to 12 months postpartum; non-breastfeeding mothers up to 6 months.",
      proof: "A letter from your doctor, OB-GYN, or midwife on official letterhead stating your name, pregnancy status, and estimated due date. If postpartum, the baby's birth certificate.",
    }
  }

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

  if (lower.includes("children") && lower.includes("qualify")) {
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Are you applying for a child (under 18)?",
      meaning: "Children typically qualify at higher income thresholds than adults for this program. Make sure to indicate the child's age and household income when you apply.",
      proof: "The child's birth certificate showing their date of birth.",
    }
  }

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

  if (lower.includes("disabilit") || lower.includes("disabled")) {
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Do you have a documented disability?",
      meaning: "A disability qualifies if it is recognized by the Social Security Administration (SSI or SSDI approval) or documented in writing by a licensed physician confirming that your condition significantly limits one or more major life activities — such as walking, breathing, working, or caring for yourself.",
      proof: "SSA disability award letter or benefit verification letter (downloadable free at ssa.gov), OR a physician's letter on official letterhead stating your diagnosis, its severity, and how it limits daily activities.",
    }
  }

  if (lower.includes("veteran") || lower.includes("military service") || lower.includes("dd-214") || lower.includes("armed forces")) {
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Are you a US military veteran?",
      meaning: "You must have served in the US Armed Forces (Army, Navy, Air Force, Marines, Coast Guard, or Space Force) and received an honorable or general (under honorable conditions) discharge. Active duty members may also qualify for some programs.",
      proof: "DD-214 (Certificate of Release or Discharge from Active Duty) — specifically Member Copy 4. Lost yours? Request a free replacement at archives.gov/veterans — takes 1–10 days online.",
    }
  }

  if (lower.includes("student") || (lower.includes("enrolled") && lower.includes("school"))) {
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Are you currently enrolled as a student?",
      meaning: "You must be actively enrolled at an accredited school, college, or university. Some programs require full-time enrollment; others accept part-time. Check the specific requirement.",
      proof: "Enrollment verification letter from your school's registrar office — free and usually available the same day. Must show your name, school name, enrollment status, and current term.",
    }
  }

  if (lower.includes("rural")) {
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Do you live in a rural area?",
      meaning: "USDA defines 'rural' as communities with a population under 50,000 that are not part of or closely connected to a large urban area. Small towns, farm communities, and open countryside typically qualify. Most suburbs do not.",
      proof: "Your address is the proof — a utility bill or government mail with your address. The program will verify rural status based on your location.",
    }
  }

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

  // Primary residence
  if (lower.includes("primary residence") && !lower.includes("must not have owned") && !lower.includes("not have owned")) {
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Is this your primary residence?",
      meaning: "The home must be where you actually live full-time — not a vacation home, rental property, or someone else's address.",
      proof: "Utility bills, bank statements, or government mail at the property address in your name, dated within the last 60 days.",
    }
  }

  // Owner-occupied property
  if (lower.includes("owner-occupied") || lower.includes("owner occupied")) {
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Do you own and live in the home?",
      meaning: "An owner-occupied property is one where you both own and live in it as your primary residence. Rental properties you own but don't live in do not qualify.",
      proof: "Property deed or title in your name, plus a utility bill or government mail showing your address matches the property.",
    }
  }

  // Delinquent taxes / tax debt
  if ((lower.includes("delinquent") && lower.includes("tax")) || lower.includes("back taxes") || (lower.includes("tax") && (lower.includes("past due") || lower.includes("overdue") || lower.includes("unpaid taxes")))) {
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Are you current on your taxes (no delinquent or unpaid taxes)?",
      meaning: "Some programs require you to have no outstanding federal, state, or local tax debt — including income taxes, property taxes, or payroll taxes.",
      proof: "IRS tax transcripts, property tax receipts, or a letter from the tax authority confirming you are current.",
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

  if (lower.includes("obtain financing") || lower.includes("pay cash at the time") || lower.includes("proof of cash financing") || lower.includes("mortgage pre-approval")) {
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Do you have financing (mortgage) or cash ready to purchase the home?",
      meaning: "You must either have a mortgage pre-approval letter from a lender or documented funds sufficient to buy the property outright in cash. This confirms you are a serious buyer who can close.",
      proof: "Mortgage pre-approval letter from a HUD-approved lender (shows loan amount and terms), OR bank/investment account statements showing liquid funds equal to the purchase price.",
    }
  }

  if (lower.includes("wartime period") || lower.includes("active duty with at least one day during")) {
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Did you serve on active duty during a qualifying wartime period?",
      meaning: "Qualifying wartime periods include: World War II (Dec 7, 1941–Dec 31, 1946), Korean War (Jun 27, 1950–Jan 31, 1955), Vietnam Era (Aug 5, 1964–May 7, 1975), Gulf War (Aug 2, 1990–present). You must have served at least one day during one of these periods, with a minimum of 90 days of active service total.",
      proof: "DD-214 (Certificate of Release or Discharge from Active Duty) — it shows your service dates and period. Look at Block 18 'Remarks' and Block 12 for service dates.",
    }
  }

  if ((lower.includes("connection between") && lower.includes("military service")) || lower.includes("service-connected") || lower.includes("in-service event")) {
    return {
      kind: "yesno", id, qualifyingAnswer: "yes", failReason,
      label: "Do you have a health condition connected to your military service?",
      meaning: "A service-connected condition is a disability, illness, or injury that was caused or worsened by your active duty service. This includes physical injuries, mental health conditions (PTSD, depression), toxic exposure conditions (Agent Orange, burn pits), and many chronic diseases. The VA uses a 'benefit of the doubt' standard — you don't need to prove it beyond a reasonable doubt.",
      proof: "Medical records documenting your current condition, and any service records showing the in-service event or exposure. If records are unavailable, 'buddy statements' from fellow service members who witnessed the event are accepted. A VA-accredited attorney or Veterans Service Organization (VSO) can help for free.",
    }
  }

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

  // Non-personal subject: "Home must be...", "Property must have...", etc.
  const thingMustMatch = cleaned.match(/^(home|property|unit|vehicle|residence|building|address|account|land|lot|parcel)\s+must(?:\s+not)?\s+(be|have)\s+/i)
  if (thingMustMatch) {
    const subj = thingMustMatch[1].toLowerCase()
    const isNeg = /must\s+not/i.test(cleaned)
    const verb = thingMustMatch[2].toLowerCase()
    const rest = cleaned.slice(thingMustMatch[0].length).replace(/\.$/, "")
    const displaySubj = (subj === "home" || subj === "residence") ? "your home" : `the ${subj}`
    if (verb === "have") return `Does ${displaySubj} have ${rest}?`
    if (isNeg) return `Is ${displaySubj} not ${rest}?`
    return `Is ${displaySubj} ${rest}?`
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

// ─── Shared styles ────────────────────────────────────────────────────────────

function cardClass(answeredPassed: boolean | null) {
  if (answeredPassed === true)  return "border-emerald-200 bg-emerald-50"
  if (answeredPassed === false) return "border-rose-200 bg-rose-50"
  return "border-zinc-200 bg-white"
}

function yesBtn(active: boolean) {
  return active
    ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
    : "bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100"
}

function noBtn(active: boolean) {
  return active
    ? "bg-rose-600 border-rose-600 text-white shadow-sm"
    : "bg-rose-50 border-rose-200 text-rose-900 hover:bg-rose-100"
}

function StepBadge({ n }: { n: number }) {
  return (
    <span className="flex-none mt-0.5 h-5 w-5 rounded-full bg-zinc-100 text-zinc-500 text-[11px] font-bold flex items-center justify-center">
      {n}
    </span>
  )
}

function StatusIcon({ ok }: { ok: boolean }) {
  return ok ? (
    <svg className="flex-none mt-0.5 h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="7" fill="#d1fae5" stroke="#10b981" strokeWidth="1.5"/>
      <path d="M5 8.5l2 2 4-3.5" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ) : (
    <svg className="flex-none mt-0.5 h-4 w-4 text-rose-500" fill="none" viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="7" fill="#fee2e2" stroke="#f43f5e" strokeWidth="1.5"/>
      <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoCardQ({ q }: { q: InfoCard }) {
  return (
    <div className="flex gap-3 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3.5">
      <svg className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" fill="none" viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 7v4M8 5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      <p className="text-sm leading-6 text-sky-900">{q.text}</p>
    </div>
  )
}

function YesNoQ({ q, answer, onAnswer, stepNum }: { q: YesNoQuestion; answer: "yes" | "no" | null; onAnswer: (v: "yes" | "no") => void; stepNum: number }) {
  const [showDetail, setShowDetail] = useState(false)
  const isPassed = answer === q.qualifyingAnswer
  const isFailed = answer !== null && !isPassed
  const answeredState = answer === null ? null : isPassed

  return (
    <div className={`rounded-xl border transition-colors ${cardClass(answeredState)}`}>
      <div className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <StepBadge n={stepNum} />
          <p className="flex-1 text-sm font-semibold text-zinc-900 leading-6">{q.label}</p>
          {answer !== null && <StatusIcon ok={isPassed} />}
        </div>

        <div className="flex gap-2 mb-3">
          <button type="button" onClick={() => onAnswer("yes")}
            className={`flex-1 h-10 rounded-lg text-sm font-semibold border transition-all ${yesBtn(answer === "yes")}`}>
            Yes
          </button>
          <button type="button" onClick={() => onAnswer("no")}
            className={`flex-1 h-10 rounded-lg text-sm font-semibold border transition-all ${noBtn(answer === "no")}`}>
            No
          </button>
        </div>

        <button type="button" onClick={() => setShowDetail(d => !d)}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-600 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14">
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.25"/>
            <path d="M7 6v3M7 4.5v.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
          </svg>
          {showDetail ? "Hide details" : "What does this mean?"}
          <svg className={`w-3 h-3 transition-transform ${showDetail ? "rotate-180" : ""}`} fill="none" viewBox="0 0 10 10">
            <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {showDetail && (
          <div className="mt-3 rounded-lg border border-zinc-100 bg-zinc-50 p-3.5 space-y-2.5">
            <p className="text-xs leading-5 text-zinc-600">{q.meaning}</p>
            {q.proof && (
              <div className="pt-2.5 border-t border-zinc-200">
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">What you&apos;ll need</p>
                <p className="text-xs leading-5 text-zinc-600">{q.proof}</p>
              </div>
            )}
          </div>
        )}

        {isFailed && (
          <p className="mt-2.5 text-xs text-rose-700 font-medium">
            This requirement is not met based on your answer.
          </p>
        )}
      </div>
    </div>
  )
}

function PovertyQ({ q, householdSize, answer, onSize, onAnswer, stepNum }: { q: PovertyQuestion; householdSize: number | null; answer: "yes" | "no" | null; onSize: (n: number) => void; onAnswer: (v: "yes" | "no") => void; stepNum: number }) {
  const limit = householdSize ? getIncomeLimit(householdSize, q.percent) : null
  const answeredState = answer === null ? null : answer === "yes"

  return (
    <div className={`rounded-xl border transition-colors ${cardClass(answeredState)}`}>
      <div className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <StepBadge n={stepNum} />
          <div className="flex-1">
            <p className="text-sm font-semibold text-zinc-900 leading-6">Does your household income qualify?</p>
            <p className="text-xs text-zinc-500 mt-0.5">Limit: {q.percent}% of the Federal Poverty Level — based on your household size</p>
          </div>
          {answer !== null && <StatusIcon ok={answer === "yes"} />}
        </div>

        <div className="mb-4">
          <p className="text-xs font-medium text-zinc-500 mb-2">How many people are in your household?</p>
          <div className="flex flex-wrap gap-1.5">
            {HOUSEHOLD_SIZES.map(n => (
              <button key={n} type="button" onClick={() => onSize(n)}
                className={`w-9 h-9 rounded-lg text-sm font-semibold border transition-colors ${
                  householdSize === n
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "border-zinc-200 text-zinc-700 bg-white hover:border-zinc-400"
                }`}>
                {n}
              </button>
            ))}
            <button type="button" onClick={() => onSize(9)}
              className={`h-9 px-2.5 rounded-lg text-sm font-semibold border transition-colors ${
                householdSize === 9
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "border-zinc-200 text-zinc-700 bg-white hover:border-zinc-400"
              }`}>
              9+
            </button>
          </div>
          <p className="text-xs text-zinc-400 mt-1.5">Include yourself, spouse/partner, children, and dependents.</p>
        </div>

        {limit && (
          <>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 mb-4">
              <p className="text-xs text-zinc-500 mb-1">Your income limit — household of {householdSize}:</p>
              <p className="text-2xl font-bold text-zinc-900 tabular-nums">{fmt(limit)}<span className="text-sm font-normal text-zinc-500">/yr</span></p>
              <p className="text-xs text-zinc-500 mt-0.5 tabular-nums">{fmt(Math.round(limit / 12))}/mo &nbsp;·&nbsp; {fmt(Math.round(limit / 52))}/wk</p>
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={() => onAnswer("yes")}
                className={`flex-1 h-10 rounded-lg text-sm font-semibold border transition-all ${yesBtn(answer === "yes")}`}>
                Yes, within the limit
              </button>
              <button type="button" onClick={() => onAnswer("no")}
                className={`flex-1 h-10 rounded-lg text-sm font-semibold border transition-all ${noBtn(answer === "no")}`}>
                No, above the limit
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function AMIQuestionCard({ q, selectedState, selectedArea, answer, onState, onArea, onAnswer, zipDetected, stepNum }: { q: AMIQuestion; selectedState: string | null; selectedArea: number | null; answer: "yes" | "no" | null; onState: (s: string) => void; onArea: (i: number) => void; onAnswer: (v: "yes" | "no") => void; zipDetected?: boolean; stepNum: number }) {
  const [showPicker, setShowPicker] = useState(false)
  const areas = selectedState ? AMI_BY_STATE[selectedState] ?? [] : []
  const areaData = selectedArea !== null ? areas[selectedArea] : null
  const limit = areaData ? Math.round(areaData.ami * q.percent / 100) : null
  const autoFilled = zipDetected && selectedState && selectedArea !== null && !showPicker
  const answeredState = answer === null ? null : answer === "yes"

  return (
    <div className={`rounded-xl border transition-colors ${cardClass(answeredState)}`}>
      <div className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <StepBadge n={stepNum} />
          <div className="flex-1">
            <p className="text-sm font-semibold text-zinc-900 leading-6">Does your household income qualify?</p>
            <p className="text-xs text-zinc-500 mt-0.5">Limit: {q.percent}% of Area Median Income for your location</p>
          </div>
          {answer !== null && <StatusIcon ok={answer === "yes"} />}
        </div>

        {autoFilled ? (
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2.5 py-1 font-medium">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5"/><path d="M6 4v2.5L7.5 8" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/></svg>
              {areaData?.name}
            </span>
            <button type="button" onClick={() => setShowPicker(true)} className="text-xs text-zinc-400 hover:text-zinc-600 underline underline-offset-2">
              Change
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="text-xs font-medium text-zinc-500 block mb-1.5">What state do you live in?</label>
              <select value={selectedState ?? ""} onChange={e => onState(e.target.value)}
                className="h-10 px-3 rounded-lg border border-zinc-200 text-sm text-zinc-700 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 w-full max-w-xs">
                <option value="">Select a state…</option>
                {US_STATES.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
              </select>
            </div>
            {selectedState && areas.length > 0 && (
              <div className="mb-4">
                <label className="text-xs font-medium text-zinc-500 block mb-1.5">Nearest metro or county area:</label>
                <div className="flex flex-wrap gap-1.5">
                  {areas.map((area, idx) => (
                    <button key={idx} type="button" onClick={() => onArea(idx)}
                      className={`h-8 px-3 rounded-lg text-xs font-medium border transition-colors ${
                        selectedArea === idx
                          ? "bg-zinc-900 text-white border-zinc-900"
                          : "border-zinc-200 text-zinc-700 bg-white hover:border-zinc-400"
                      }`}>
                      {area.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {limit && areaData && (
          <>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 mb-4">
              <p className="text-xs text-zinc-500 mb-1">Your income limit — {areaData.name}:</p>
              <p className="text-2xl font-bold text-zinc-900 tabular-nums">{fmt(limit)}<span className="text-sm font-normal text-zinc-500">/yr</span></p>
              <p className="text-xs text-zinc-500 mt-0.5 tabular-nums">{fmt(Math.round(limit / 12))}/mo &nbsp;·&nbsp; {fmt(Math.round(limit / 52))}/wk</p>
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={() => onAnswer("yes")}
                className={`flex-1 h-10 rounded-lg text-sm font-semibold border transition-all ${yesBtn(answer === "yes")}`}>
                Yes, within the limit
              </button>
              <button type="button" onClick={() => onAnswer("no")}
                className={`flex-1 h-10 rounded-lg text-sm font-semibold border transition-all ${noBtn(answer === "no")}`}>
                No, above the limit
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function DollarQ({ q, answer, onAnswer, stepNum }: { q: DollarQuestion; answer: "yes" | "no" | null; onAnswer: (v: "yes" | "no") => void; stepNum: number }) {
  const answeredState = answer === null ? null : answer === "yes"

  return (
    <div className={`rounded-xl border transition-colors ${cardClass(answeredState)}`}>
      <div className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <StepBadge n={stepNum} />
          <p className="flex-1 text-sm font-semibold text-zinc-900 leading-6">Does your household income qualify?</p>
          {answer !== null && <StatusIcon ok={answer === "yes"} />}
        </div>

        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 mb-4">
          <p className="text-xs text-zinc-500 mb-1">Income must be at or below:</p>
          <p className="text-2xl font-bold text-zinc-900 tabular-nums">{fmt(q.limit)}<span className="text-sm font-normal text-zinc-500">/yr</span></p>
          <p className="text-xs text-zinc-500 mt-0.5 tabular-nums">{fmt(Math.round(q.limit / 12))}/mo &nbsp;·&nbsp; {fmt(Math.round(q.limit / 52))}/wk</p>
        </div>

        <div className="flex gap-2">
          <button type="button" onClick={() => onAnswer("yes")}
            className={`flex-1 h-10 rounded-lg text-sm font-semibold border transition-all ${yesBtn(answer === "yes")}`}>
            Yes, within the limit
          </button>
          <button type="button" onClick={() => onAnswer("no")}
            className={`flex-1 h-10 rounded-lg text-sm font-semibold border transition-all ${noBtn(answer === "no")}`}>
            No, above the limit
          </button>
        </div>
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
  const [zipDetectedIds, setZipDetectedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const amiQs = questions.filter(q => q.kind === "ami")
    if (amiQs.length === 0) return
    const supabase = getBrowserSupabase()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any).from("profiles").select("zip_code").eq("id", data.user.id).single() as { data: { zip_code?: string } | null }
      if (!profile?.zip_code) return
      const result = await lookupZipAMI(profile.zip_code)
      if (!result) return
      const newStates: Record<string, string> = {}
      const newAreas: Record<string, number> = {}
      const detected = new Set<string>()
      for (const q of amiQs) { newStates[q.id] = result.stateCode; newAreas[q.id] = result.areaIndex; detected.add(q.id) }
      setSelectedStates(prev => ({ ...prev, ...newStates }))
      setSelectedAreas(prev => ({ ...prev, ...newAreas }))
      setZipDetectedIds(detected)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (questions.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-zinc-900 mb-2">Am I Eligible?</h2>
        <p className="text-sm text-zinc-500 mb-4">No specific eligibility criteria on file. Review the program&apos;s official requirements before applying.</p>
        <Link href={`/workspace?slug=${slug}`} className="inline-flex items-center h-11 px-6 rounded-full bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 transition-colors">
          Start Application →
        </Link>
      </div>
    )
  }

  const answeredCount = answerableQs.filter(q => isAnswered(q, answers, householdSizes, selectedStates, selectedAreas)).length
  const totalQ = answerableQs.length
  const allAnswered = answeredCount === totalQ
  const failedQs = answerableQs.filter(q => answers[q.id] && !passed(q, answers))
  const isEligible = allAnswered && failedQs.length === 0

  function setAnswer(id: string, val: "yes" | "no") {
    setAnswers(prev => ({ ...prev, [id]: val }))
  }

  // Assign sequential step numbers (skipping info cards)
  const stepNums = new Map<string, number>()
  let sn = 0
  for (const q of questions) {
    if (q.kind !== "info") stepNums.set(q.id, ++sn)
  }

  return (
    <div>
      {/* Header + progress */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-zinc-900">Am I Eligible?</h2>
          {totalQ > 0 && (
            <span className={`text-xs font-medium tabular-nums ${allAnswered ? "text-emerald-600" : "text-zinc-400"}`}>
              {answeredCount} / {totalQ} answered
            </span>
          )}
        </div>
        {totalQ > 0 && (
          <div className="h-1 rounded-full bg-zinc-100 overflow-hidden">
            <div
              className={`h-1 rounded-full transition-all duration-500 ${isEligible && allAnswered ? "bg-emerald-500" : failedQs.length > 0 ? "bg-rose-400" : "bg-zinc-900"}`}
              style={{ width: `${totalQ > 0 ? Math.round(answeredCount / totalQ * 100) : 0}%` }}
            />
          </div>
        )}
      </div>

      <div className="space-y-3">
        {questions.map(q => {
          const num = stepNums.get(q.id) ?? 0
          if (q.kind === "info")    return <InfoCardQ key={q.id} q={q} />
          if (q.kind === "yesno")   return <YesNoQ   key={q.id} q={q} stepNum={num} answer={answers[q.id] ?? null} onAnswer={v => setAnswer(q.id, v)} />
          if (q.kind === "poverty") return <PovertyQ  key={q.id} q={q} stepNum={num} householdSize={householdSizes[q.id] ?? null} answer={answers[q.id] ?? null} onSize={n => setHouseholdSizes(p => ({ ...p, [q.id]: n }))} onAnswer={v => setAnswer(q.id, v)} />
          if (q.kind === "ami")     return (
            <AMIQuestionCard key={q.id} q={q} stepNum={num}
              selectedState={selectedStates[q.id] ?? null}
              selectedArea={selectedAreas[q.id] ?? null}
              answer={answers[q.id] ?? null}
              zipDetected={zipDetectedIds.has(q.id)}
              onState={s => { setSelectedStates(p => ({ ...p, [q.id]: s })); setSelectedAreas(p => { const n = {...p}; delete n[q.id]; return n }); setAnswers(p => { const n = {...p}; delete n[q.id]; return n }) }}
              onArea={i => setSelectedAreas(p => ({ ...p, [q.id]: i }))}
              onAnswer={v => setAnswer(q.id, v)} />
          )
          if (q.kind === "dollar")  return <DollarQ  key={q.id} q={q} stepNum={num} answer={answers[q.id] ?? null} onAnswer={v => setAnswer(q.id, v)} />
          return null
        })}
      </div>

      {/* Result */}
      {allAnswered && totalQ > 0 && (
        <div className="mt-5">
          {isEligible ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 mb-4">
              <div className="flex items-start gap-3">
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" fill="none" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="9" fill="#d1fae5" stroke="#10b981" strokeWidth="1.5"/>
                  <path d="M6.5 10.5l2.5 2.5 5-5" stroke="#10b981" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div>
                  <p className="font-semibold text-emerald-900">You appear to be eligible</p>
                  <p className="text-sm text-emerald-800 mt-0.5 leading-5">Your answers match all the criteria we checked. The agency may verify your answers with documentation when you apply.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 mb-4">
              <div className="flex items-start gap-3">
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" fill="none" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="9" fill="#fee2e2" stroke="#f43f5e" strokeWidth="1.5"/>
                  <path d="M7 7l6 6M13 7l-6 6" stroke="#f43f5e" strokeWidth="1.75" strokeLinecap="round"/>
                </svg>
                <div>
                  <p className="font-semibold text-rose-900 mb-1.5">You may not qualify based on your answers</p>
                  <ul className="space-y-1 mb-2">
                    {failedQs.map(q => (
                      <li key={q.id} className="text-sm text-rose-800 flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-rose-400 shrink-0" />
                        {q.failReason}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-rose-700">Eligibility rules can have exceptions. It&apos;s still worth applying or speaking with a local benefits counselor.</p>
                </div>
              </div>
            </div>
          )}
          <Link href={`/workspace?slug=${slug}`} className="inline-flex items-center h-11 px-6 rounded-full bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 transition-colors">
            Start Application →
          </Link>
        </div>
      )}
    </div>
  )
}
