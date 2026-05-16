export interface BenefitStats {
  recipientsLabel: string   // e.g. "42 million Americans"
  recipientsNote?: string   // e.g. "enrolled monthly"
  annualBudget: string      // e.g. "$113 billion"
  avgBenefit?: string       // e.g. "$212/month per person"
  yearEstablished?: number
  availability: string      // e.g. "All 50 states + DC"
  administeredBy: string
  keyFact?: string          // one compelling stat
}

const BENEFIT_STATS: Record<string, BenefitStats> = {
  "snap-benefits": {
    recipientsLabel: "42 million Americans",
    recipientsNote: "enrolled monthly",
    annualBudget: "$113 billion",
    avgBenefit: "~$212/month per person (~$6/day)",
    yearEstablished: 1964,
    availability: "All 50 states, DC, Guam, US Virgin Islands",
    administeredBy: "USDA Food and Nutrition Service (state-run)",
    keyFact: "1 in 8 Americans rely on SNAP — it's the largest food assistance program in the US.",
  },
  "wic-nutrition-program": {
    recipientsLabel: "6.7 million women and children",
    recipientsNote: "served monthly",
    annualBudget: "$7.3 billion",
    avgBenefit: "~$50–$150/month in food benefits",
    yearEstablished: 1974,
    availability: "All 50 states, DC, 5 US territories, 34 tribal organizations",
    administeredBy: "USDA Food and Nutrition Service (state-run)",
    keyFact: "WIC reaches about half of all infants born in the United States.",
  },
  "liheap-energy-assistance": {
    recipientsLabel: "5.5 million households",
    recipientsNote: "helped annually",
    annualBudget: "$4.1 billion",
    avgBenefit: "~$500–$1,000 per household per year",
    yearEstablished: 1981,
    availability: "All 50 states, DC, 5 US territories",
    administeredBy: "HHS Office of Community Services (state-run)",
    keyFact: "LIHEAP covers heating AND cooling costs — it can prevent utility shut-offs in both winter and summer.",
  },
  "head-start-program": {
    recipientsLabel: "800,000 children",
    recipientsNote: "enrolled annually",
    annualBudget: "$12 billion",
    avgBenefit: "Free full-day programs (valued at $8,000–$14,000/year per child)",
    yearEstablished: 1965,
    availability: "All 50 states, DC, and US territories",
    administeredBy: "HHS Administration for Children and Families",
    keyFact: "Head Start has served over 38 million children since it launched in 1965.",
  },
  "child-care-development-fund": {
    recipientsLabel: "1.4 million families",
    recipientsNote: "receiving subsidized childcare",
    annualBudget: "$11.7 billion",
    avgBenefit: "Childcare subsidy covering most or all of childcare costs",
    yearEstablished: 1990,
    availability: "All 50 states, DC, and US territories",
    administeredBy: "HHS Administration for Children and Families (state-run)",
    keyFact: "Without CCDF, a single parent would spend over 30% of income on childcare in most states.",
  },
  "tanf-cash-assistance": {
    recipientsLabel: "1 million families",
    recipientsNote: "receiving monthly cash assistance",
    annualBudget: "$16.5 billion (federal block grant)",
    avgBenefit: "Varies by state — average $442/month for a family of 3",
    yearEstablished: 1996,
    availability: "All 50 states (program design varies significantly by state)",
    administeredBy: "HHS Administration for Children and Families (state-run)",
    keyFact: "TANF replaced the older AFDC program in 1996. Lifetime limit is 60 months of federal benefits.",
  },
  "housing-choice-voucher": {
    recipientsLabel: "5 million households",
    recipientsNote: "with active vouchers",
    annualBudget: "$30 billion",
    avgBenefit: "Covers portion of rent — tenant pays 30% of adjusted income",
    yearEstablished: 1974,
    availability: "All 50 states (administered by ~2,200 local Public Housing Agencies)",
    administeredBy: "HUD, via local Public Housing Authorities",
    keyFact: "Wait lists for Section 8 vouchers average 2–8 years. Apply as early as possible — many PHAs have closed waitlists.",
  },
  "hud-section-8-housing-choice-voucher": {
    recipientsLabel: "5 million households",
    recipientsNote: "with active vouchers",
    annualBudget: "$30 billion",
    avgBenefit: "Covers portion of rent — tenant pays 30% of adjusted income",
    yearEstablished: 1974,
    availability: "All 50 states (administered by ~2,200 local Public Housing Agencies)",
    administeredBy: "HUD, via local Public Housing Authorities",
    keyFact: "Wait lists for Section 8 vouchers average 2–8 years. Apply as early as possible — many PHAs have closed waitlists.",
  },
  "medicaid": {
    recipientsLabel: "90 million Americans",
    recipientsNote: "enrolled",
    annualBudget: "$871 billion (combined federal + state)",
    avgBenefit: "Full health coverage with $0 or low-cost premiums",
    yearEstablished: 1965,
    availability: "All 50 states and DC (coverage rules vary by state)",
    administeredBy: "CMS (Centers for Medicare & Medicaid Services), state-run",
    keyFact: "Medicaid covers 1 in 4 Americans, including 40% of all births in the US.",
  },
  "chip-childrens-health-insurance": {
    recipientsLabel: "7.2 million children",
    recipientsNote: "enrolled",
    annualBudget: "$27 billion",
    avgBenefit: "Low-cost or free comprehensive health coverage for children",
    yearEstablished: 1997,
    availability: "All 50 states, DC, and US territories",
    administeredBy: "CMS, administered by states",
    keyFact: "CHIP covers children whose families earn too much for Medicaid but can't afford private insurance.",
  },
  "supplemental-security-income": {
    recipientsLabel: "7.4 million Americans",
    recipientsNote: "receiving monthly benefits",
    annualBudget: "$59 billion",
    avgBenefit: "Up to $943/month for an individual (2024)",
    yearEstablished: 1972,
    availability: "All 50 states (some states add a supplement)",
    administeredBy: "Social Security Administration",
    keyFact: "SSI is needs-based — you must have very limited income AND assets to qualify.",
  },
  "national-school-lunch-program": {
    recipientsLabel: "29.6 million children",
    recipientsNote: "daily",
    annualBudget: "$16.7 billion",
    avgBenefit: "Free or reduced-price meals ($0–$0.40/meal)",
    yearEstablished: 1946,
    availability: "All 50 states and US territories",
    administeredBy: "USDA Food and Nutrition Service (school-run)",
    keyFact: "Free lunch is available to children in families at or below 130% of the poverty line.",
  },
  "low-income-home-energy-assistance": {
    recipientsLabel: "5.5 million households",
    recipientsNote: "helped annually",
    annualBudget: "$4.1 billion",
    avgBenefit: "~$500–$1,000 per household",
    yearEstablished: 1981,
    availability: "All 50 states, DC, 5 US territories",
    administeredBy: "HHS Office of Community Services (state-run)",
    keyFact: "LIHEAP can also cover weatherization costs — insulation, window sealing — to reduce your bills long-term.",
  },
}

export function getBenefitStats(slug: string): BenefitStats | null {
  return BENEFIT_STATS[slug] ?? null
}
