export type GrantCategory =
  | "small_business"
  | "individual"
  | "agricultural"
  | "research"
  | "education"
  | "veterans"
  | "arts"
  | "housing"
  | "energy"
  | "health"

export interface EligibilityCriteria {
  industries?: string[]
  max_employees?: number
  min_employees?: number
  max_revenue?: number
  requires_us_ownership?: boolean
  requires_us_business?: boolean
  requires_rural?: boolean
  requires_minority_owned?: boolean
  requires_woman_owned?: boolean
  requires_student?: boolean
  requires_us_citizen?: boolean
  requires_us_resident?: boolean
  education_level?: string
  max_household_income?: number
  max_household_income_percent_poverty?: number
  max_household_income_percent_ami?: number
}

export interface Grant {
  id: string
  name: string
  agency: string
  category: GrantCategory
  subcategory: string | null
  description: string
  max_amount: number | null
  is_recurring: boolean
  deadline: string | null
  eligibility_criteria: EligibilityCriteria
  required_documents: string[]
  application_url: string
  official_source_url: string
  form_numbers: string[]
  processing_time_days: number | null
  slug: string
  created_at: string
  updated_at: string
}
