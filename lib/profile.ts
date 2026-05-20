export type UserProfile = {
  full_name: string
  email: string
  zip_code: string
  state: string
  date_of_birth: string
  phone_number: string
  household_size: string
  annual_income: string
  income_source: string
  home_ownership: string
  veteran_status: string
  disability_status: string
  gender: string
  race_ethnicity: string
  citizenship_status: string
  tribal_affiliation: string
  student_status: string
  has_children: string
  education_level: string
  field_of_study: string
  degree_type_pursuing: string
  business_owner: string
  business_type: string
  business_industry: string
  employee_count: string
  annual_revenue: string
  years_in_operation: string
  business_location: string
  business_ownership_identities: string[]
  business_us_owned: string
  business_rural: string
  rural_location: string
  funding_interests: string[]
  application_stage: string
  email_alerts: string
  deadline_reminders: string
  weekly_digest: string
  profile_completed_at?: string
}

export const US_STATES = [
  ["AL", "Alabama"],
  ["AK", "Alaska"],
  ["AZ", "Arizona"],
  ["AR", "Arkansas"],
  ["CA", "California"],
  ["CO", "Colorado"],
  ["CT", "Connecticut"],
  ["DE", "Delaware"],
  ["FL", "Florida"],
  ["GA", "Georgia"],
  ["HI", "Hawaii"],
  ["ID", "Idaho"],
  ["IL", "Illinois"],
  ["IN", "Indiana"],
  ["IA", "Iowa"],
  ["KS", "Kansas"],
  ["KY", "Kentucky"],
  ["LA", "Louisiana"],
  ["ME", "Maine"],
  ["MD", "Maryland"],
  ["MA", "Massachusetts"],
  ["MI", "Michigan"],
  ["MN", "Minnesota"],
  ["MS", "Mississippi"],
  ["MO", "Missouri"],
  ["MT", "Montana"],
  ["NE", "Nebraska"],
  ["NV", "Nevada"],
  ["NH", "New Hampshire"],
  ["NJ", "New Jersey"],
  ["NM", "New Mexico"],
  ["NY", "New York"],
  ["NC", "North Carolina"],
  ["ND", "North Dakota"],
  ["OH", "Ohio"],
  ["OK", "Oklahoma"],
  ["OR", "Oregon"],
  ["PA", "Pennsylvania"],
  ["RI", "Rhode Island"],
  ["SC", "South Carolina"],
  ["SD", "South Dakota"],
  ["TN", "Tennessee"],
  ["TX", "Texas"],
  ["UT", "Utah"],
  ["VT", "Vermont"],
  ["VA", "Virginia"],
  ["WA", "Washington"],
  ["WV", "West Virginia"],
  ["WI", "Wisconsin"],
  ["WY", "Wyoming"],
] as const

export const PROFILE_DEFAULTS: UserProfile = {
  full_name: "",
  email: "",
  zip_code: "",
  state: "",
  date_of_birth: "",
  phone_number: "",
  household_size: "",
  annual_income: "",
  income_source: "",
  home_ownership: "",
  veteran_status: "",
  disability_status: "",
  gender: "",
  race_ethnicity: "",
  citizenship_status: "",
  tribal_affiliation: "",
  student_status: "",
  has_children: "",
  education_level: "",
  field_of_study: "",
  degree_type_pursuing: "",
  business_owner: "",
  business_type: "",
  business_industry: "",
  employee_count: "",
  annual_revenue: "",
  years_in_operation: "",
  business_location: "",
  business_ownership_identities: [],
  business_us_owned: "",
  business_rural: "",
  rural_location: "",
  funding_interests: [],
  application_stage: "",
  email_alerts: "",
  deadline_reminders: "",
  weekly_digest: "",
}

export const FUNDING_INTERESTS = [
  "Personal financial assistance",
  "Education funding",
  "Business funding",
  "Research funding",
  "Arts funding",
  "Housing assistance",
  "Healthcare assistance",
  "Agricultural funding",
] as const

export const BUSINESS_INDUSTRIES = [
  "Agriculture & Farming",
  "Arts & Entertainment",
  "Construction",
  "Education",
  "Energy",
  "Finance & Insurance",
  "Food & Beverage",
  "Government & Public Sector",
  "Healthcare & Medical",
  "Hospitality & Tourism",
  "Information Technology",
  "Legal Services",
  "Manufacturing",
  "Media & Communications",
  "Nonprofit & Social Services",
  "Real Estate",
  "Research & Science",
  "Retail",
  "Transportation & Logistics",
  "Other",
] as const

export const BUSINESS_OWNERSHIP_IDENTITIES = [
  "Woman-owned",
  "Minority-owned",
  "Veteran-owned",
  "LGBTQ+-owned",
] as const

export function profileCompletion(profile?: Partial<UserProfile> | null) {
  if (!profile) return 0

  const required: (keyof UserProfile)[] = [
    "full_name",
    "email",
    "zip_code",
    "state",
    "date_of_birth",
    "household_size",
    "income_source",
    "home_ownership",
    "veteran_status",
    "citizenship_status",
    "education_level",
    "student_status",
    "business_owner",
    "rural_location",
    "funding_interests",
    "application_stage",
  ]

  const businessRequired: (keyof UserProfile)[] = profile.business_owner === "yes"
    ? [
        "business_type",
        "business_industry",
        "employee_count",
        "years_in_operation",
        "business_location",
        "business_us_owned",
        "business_rural",
      ]
    : []

  const allRequired = [...required, ...businessRequired]
  const completed = allRequired.filter((key) => {
    const value = profile[key]
    return Array.isArray(value) ? value.length > 0 : Boolean(value)
  }).length
  return Math.round((completed / allRequired.length) * 100)
}
