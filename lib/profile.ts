export type UserProfile = {
  full_name: string
  state: string
  household_size: string
  annual_income: string
  veteran_status: string
  disability_status: string
  student_status: string
  has_children: string
  business_owner: string
  business_type: string
  employee_count: string
  annual_revenue: string
  rural_location: string
  funding_interests: string[]
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
  state: "",
  household_size: "",
  annual_income: "",
  veteran_status: "",
  disability_status: "",
  student_status: "",
  has_children: "",
  business_owner: "",
  business_type: "",
  employee_count: "",
  annual_revenue: "",
  rural_location: "",
  funding_interests: [],
}

export const FUNDING_INTERESTS = [
  "Housing",
  "Food",
  "Healthcare",
  "Childcare",
  "Energy",
  "Education",
  "Disability",
  "Small business",
  "Agriculture",
  "Research",
  "Arts",
  "Veterans",
] as const

export function profileCompletion(profile?: Partial<UserProfile> | null) {
  if (!profile) return 0

  const required: (keyof UserProfile)[] = [
    "state",
    "household_size",
    "annual_income",
    "veteran_status",
    "disability_status",
    "student_status",
    "has_children",
    "business_owner",
    "rural_location",
  ]

  const completed = required.filter((key) => Boolean(profile[key])).length
  return Math.round((completed / required.length) * 100)
}
