"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { getProfile, migrateAccountMetadata, upsertProfile } from "@/lib/account-db"
import {
  BUSINESS_OWNERSHIP_IDENTITIES,
  FUNDING_INTERESTS,
  PROFILE_DEFAULTS,
  US_STATES,
  profileCompletion,
} from "@/lib/profile"
import type { UserProfile } from "@/lib/profile"
import { getBrowserSupabase } from "@/lib/supabase-browser"

type ProfileStep = {
  id: string
  title: string
  description: string
  fields: (keyof UserProfile)[]
}

type FieldErrors = Partial<Record<keyof UserProfile, string>>

const STEPS: ProfileStep[] = [
  {
    id: "personal",
    title: "Personal Information",
    description: "Basic details used for location, age-gated programs, and account alerts.",
    fields: ["full_name", "email", "zip_code", "state", "date_of_birth", "phone_number"],
  },
  {
    id: "household",
    title: "Household & Financial",
    description: "Income and household details improve benefit and need-based grant matching.",
    fields: ["household_size", "has_children", "annual_income", "income_source", "home_ownership", "rural_location"],
  },
  {
    id: "identity",
    title: "Identity & Status",
    description: "Optional status fields help surface targeted programs without excluding other matches.",
    fields: ["veteran_status", "disability_status", "gender", "race_ethnicity", "citizenship_status", "tribal_affiliation"],
  },
  {
    id: "education",
    title: "Education",
    description: "Academic context helps match scholarships, fellowships, and research programs.",
    fields: ["education_level", "student_status", "field_of_study", "degree_type_pursuing"],
  },
  {
    id: "business",
    title: "Business Information",
    description: "Business fields unlock small-business, research, agriculture, and ownership-based grants.",
    fields: [
      "business_owner",
      "business_type",
      "business_industry",
      "employee_count",
      "annual_revenue",
      "years_in_operation",
      "business_location",
      "business_ownership_identities",
      "business_us_owned",
      "business_rural",
    ],
  },
  {
    id: "goals",
    title: "Interests & Goals",
    description: "Tell GrantFinder which program categories and application stage matter most.",
    fields: ["funding_interests", "application_stage"],
  },
  {
    id: "notifications",
    title: "Notification Preferences",
    description: "Choose which alerts should reach you as matching programs change.",
    fields: ["email_alerts", "deadline_reminders", "weekly_digest"],
  },
]

const YES_NO = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
]

const OPTIONAL_STEP_FIELDS = new Set<keyof UserProfile>([
  "phone_number",
  "annual_income",
  "disability_status",
  "gender",
  "race_ethnicity",
  "tribal_affiliation",
  "field_of_study",
  "degree_type_pursuing",
  "annual_revenue",
  "business_ownership_identities",
  "email_alerts",
  "deadline_reminders",
  "weekly_digest",
])

function readProfile(user: User | null): UserProfile {
  const saved = user?.user_metadata?.grantfinder_profile as Partial<UserProfile> | undefined
  return {
    ...PROFILE_DEFAULTS,
    ...saved,
    full_name: saved?.full_name || user?.user_metadata?.full_name || "",
    email: saved?.email || user?.email || "",
    funding_interests: saved?.funding_interests ?? [],
    business_ownership_identities: saved?.business_ownership_identities ?? [],
  }
}

function removeUndefinedValues(profile?: Partial<UserProfile> | null): Partial<UserProfile> {
  if (!profile) return {}
  return Object.fromEntries(
    Object.entries(profile).filter(([, value]) => value !== undefined),
  ) as Partial<UserProfile>
}

function mergeProfile(user: User | null, saved?: Partial<UserProfile> | null): UserProfile {
  const savedProfile = removeUndefinedValues(saved)
  return {
    ...readProfile(user),
    ...savedProfile,
    full_name: savedProfile.full_name || user?.user_metadata?.full_name || "",
    email: savedProfile.email || user?.email || "",
    funding_interests: savedProfile.funding_interests ?? [],
    business_ownership_identities: savedProfile.business_ownership_identities ?? [],
  }
}

function fieldComplete(profile: UserProfile, field: keyof UserProfile) {
  const value = profile[field]
  return Array.isArray(value) ? value.length > 0 : Boolean(value)
}

function stepCompletion(profile: UserProfile, step: ProfileStep) {
  const stepFields = step.id === "business" && profile.business_owner !== "yes"
    ? ["business_owner"] as (keyof UserProfile)[]
    : step.fields
  const fields = stepFields.filter((field) => !OPTIONAL_STEP_FIELDS.has(field))
  return Math.round((fields.filter((field) => fieldComplete(profile, field)).length / fields.length) * 100)
}

function prepareProfile(profile: UserProfile, completed = false): UserProfile {
  return {
    ...profile,
    full_name: (profile.full_name ?? "").trim(),
    email: (profile.email ?? "").trim(),
    zip_code: (profile.zip_code ?? "").trim(),
    phone_number: (profile.phone_number ?? "").trim(),
    annual_income: (profile.annual_income ?? "").trim(),
    annual_revenue: (profile.annual_revenue ?? "").trim(),
    employee_count: (profile.employee_count ?? "").trim(),
    years_in_operation: (profile.years_in_operation ?? "").trim(),
    field_of_study: (profile.field_of_study ?? "").trim(),
    business_industry: (profile.business_industry ?? "").trim(),
    funding_interests: profile.funding_interests ?? [],
    business_ownership_identities: profile.business_ownership_identities ?? [],
    profile_completed_at: completed ? new Date().toISOString() : profile.profile_completed_at,
  }
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message?: unknown }).message)
  }
  return "Could not save profile."
}

function FieldLabel({ children, note }: { children: React.ReactNode; note?: string }) {
  return (
    <span className="grid gap-1">
      <span className="text-sm font-medium text-zinc-700">{children}</span>
      {note && <span className="text-xs leading-5 text-zinc-500">{note}</span>}
    </span>
  )
}

function validateField<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
  const raw = Array.isArray(value) ? "" : String(value ?? "").trim()

  if (key === "zip_code" && raw && !/^\d{5}$/.test(raw)) {
    return "Enter a 5-digit ZIP code."
  }

  if (key === "date_of_birth" && raw) {
    const date = new Date(raw)
    const now = new Date()
    if (Number.isNaN(date.getTime()) || date > now) return "Enter a valid date of birth."
    const age = now.getFullYear() - date.getFullYear()
    if (age > 120) return "Enter a realistic date of birth."
  }

  if (["annual_income", "annual_revenue", "employee_count", "years_in_operation"].includes(key) && raw) {
    const parsed = Number(raw)
    if (!Number.isFinite(parsed) || parsed < 0) return "Enter zero or a positive number."
  }

  return null
}

function validateProfile(profile: UserProfile) {
  return Object.fromEntries(
    Object.entries(profile)
      .map(([key, value]) => [key, validateField(key as keyof UserProfile, value as UserProfile[keyof UserProfile])])
      .filter(([, value]) => value)
  ) as FieldErrors
}

function TextInput({
  label,
  value,
  onChange,
  onBlur,
  type = "text",
  placeholder,
  note,
  error,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  onBlur: (value: string) => void
  type?: string
  placeholder?: string
  note?: string
  error?: string
}) {
  return (
    <label className="grid gap-1.5">
      <FieldLabel note={note}>{label}</FieldLabel>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={(event) => onBlur(event.currentTarget.value)}
        placeholder={placeholder}
        className="h-11 rounded-lg border border-zinc-300 px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
      />
      {error && <span className="text-xs font-medium text-rose-600">{error}</span>}
    </label>
  )
}

function SelectInput({
  label,
  value,
  onChange,
  onBlur,
  options,
  note,
  error,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  onBlur: (value: string) => void
  options: { value: string; label: string }[]
  note?: string
  error?: string
}) {
  return (
    <label className="grid gap-1.5">
      <FieldLabel note={note}>{label}</FieldLabel>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={(event) => onBlur(event.currentTarget.value)}
        className="h-11 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
      >
        <option value="">Select...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs font-medium text-rose-600">{error}</span>}
    </label>
  )
}

function MultiSelect({
  label,
  values,
  options,
  onToggle,
  note,
}: {
  label: string
  values: string[]
  options: readonly string[]
  onToggle: (value: string) => void
  note?: string
}) {
  return (
    <div className="grid gap-2">
      <FieldLabel note={note}>{label}</FieldLabel>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = values.includes(option)
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={`h-10 rounded-lg border px-4 text-sm font-medium transition-colors ${
                selected
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-300 text-zinc-700 hover:border-zinc-500"
              }`}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function ProfileForm() {
  const router = useRouter()
  const supabase = useMemo(() => getBrowserSupabase(), [])
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile>(PROFILE_DEFAULTS)
  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user)
      if (data.user) {
        try {
          await migrateAccountMetadata(supabase, data.user)
          const dbProfile = await getProfile(supabase, data.user.id)
          setProfile(mergeProfile(data.user, dbProfile))
        } catch {
          setProfile(readProfile(data.user))
        }
      } else {
        setProfile(readProfile(null))
      }
      setLoading(false)
    })
  }, [supabase])

  function update<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setProfile((current) => ({ ...current, [key]: value }))
    setFieldErrors((current) => ({ ...current, [key]: undefined }))
    setMessage(null)
    setError(null)
  }

  async function save(nextProfile = profile, completed = false, successMessage = "Profile auto-saved.") {
    if (!user) return
    setSaving(true)
    setError(null)

    try {
      const profileToSave = prepareProfile(nextProfile, completed)
      await upsertProfile(supabase, user.id, profileToSave)
      await supabase.auth.updateUser({
        data: {
          full_name: profileToSave.full_name,
          grantfinder_profile: profileToSave,
        },
      })
      setMessage(successMessage)
    } catch (updateError) {
      setError(errorMessage(updateError))
    } finally {
      setSaving(false)
    }
  }

  function saveField<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    const validationError = validateField(key, value)
    if (validationError) {
      setFieldErrors((current) => ({ ...current, [key]: validationError }))
      setError("Fix the highlighted field before saving.")
      return
    }

    setProfile((current) => {
      const nextProfile = { ...current, [key]: value }
      void save(nextProfile)
      return nextProfile
    })
  }

  function toggleArrayField(key: "funding_interests" | "business_ownership_identities", value: string) {
    setMessage(null)
    setError(null)
    setProfile((currentProfile) => {
      const current = currentProfile[key]
      const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
      const nextProfile = { ...currentProfile, [key]: next }
      void save(nextProfile)
      return nextProfile
    })
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!user) {
      router.push("/auth?next=/account/profile")
      return
    }

    const nextErrors = validateProfile(profile)

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      setError("Fix the highlighted fields before saving.")
      return
    }

    await save(profile, true, "Profile saved. Your recommendations can now use this information.")
  }

  function renderField(field: keyof UserProfile) {
    const textField = (
      key: keyof UserProfile,
      label: string,
      options: { type?: string; placeholder?: string; note?: string } = {},
    ) => (
      <TextInput
        label={label}
        value={String(profile[key] ?? "")}
        onChange={(value) => update(key, value)}
        onBlur={(value) => saveField(key, value)}
        type={options.type}
        placeholder={options.placeholder}
        note={options.note}
        error={fieldErrors[key]}
      />
    )

    const selectField = (
      key: keyof UserProfile,
      label: string,
      options: { value: string; label: string }[],
      note?: string,
    ) => (
      <SelectInput
        label={label}
        value={String(profile[key] ?? "")}
        onChange={(value) => update(key, value)}
        onBlur={(value) => saveField(key, value)}
        options={options}
        note={note}
        error={fieldErrors[key]}
      />
    )

    switch (field) {
      case "full_name":
        return textField(field, "Full name", { placeholder: "Your name" })
      case "email":
        return textField(field, "Email address", { type: "email", placeholder: "you@example.com" })
      case "zip_code":
        return textField(field, "ZIP code", { placeholder: "90210" })
      case "state":
        return selectField(field, "State", US_STATES.map(([value, label]) => ({ value, label })))
      case "date_of_birth":
        return textField(field, "Date of birth", { type: "date", note: "Used for age-gated grants and benefits." })
      case "phone_number":
        return textField(field, "Phone number", { type: "tel", placeholder: "(555) 555-5555", note: "Optional. Used only for alerts if you enable them later." })
      case "household_size":
        return selectField(field, "Household size", Array.from({ length: 9 }, (_, index) => {
          const size = index + 1
          return { value: String(size), label: size === 9 ? "9 or more" : String(size) }
        }))
      case "has_children":
        return selectField(field, "Children in household", YES_NO, "Used for childcare, WIC, school meal, and family benefit matching.")
      case "annual_income":
        return textField(field, "Annual household income", { type: "number", placeholder: "45000", note: "Optional sensitive field. Income improves need-based benefit and grant matching." })
      case "income_source":
        return selectField(field, "Income source", [
          { value: "employed", label: "Employed" },
          { value: "self_employed", label: "Self-employed" },
          { value: "unemployed", label: "Unemployed" },
          { value: "retired", label: "Retired" },
          { value: "student", label: "Student" },
        ])
      case "home_ownership":
        return selectField(field, "Home ownership status", [
          { value: "own", label: "Own" },
          { value: "rent", label: "Rent" },
          { value: "neither", label: "Neither" },
        ])
      case "rural_location":
        return selectField(field, "Rural location", [
          ...YES_NO,
          { value: "not_sure", label: "Not sure" },
        ])
      case "veteran_status":
        return selectField(field, "Veteran status", [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
          { value: "active_duty", label: "Active duty" },
          { value: "surviving_spouse", label: "Surviving spouse" },
        ])
      case "disability_status":
        return selectField(field, "Disability status", [
          ...YES_NO,
          { value: "prefer_not_to_say", label: "Prefer not to say" },
        ], "Optional sensitive field. Disability status improves matching for programs specifically designed around disability access or support.")
      case "gender":
        return selectField(field, "Gender", [
          { value: "woman", label: "Woman" },
          { value: "man", label: "Man" },
          { value: "nonbinary", label: "Nonbinary" },
          { value: "prefer_not_to_say", label: "Prefer not to say" },
        ], "Optional sensitive field. This helps match women-specific programs and women-owned business grants.")
      case "race_ethnicity":
        return selectField(field, "Race/ethnicity", [
          { value: "american_indian_alaska_native", label: "American Indian or Alaska Native" },
          { value: "asian", label: "Asian" },
          { value: "black", label: "Black or African American" },
          { value: "hispanic_latino", label: "Hispanic or Latino" },
          { value: "middle_eastern_north_african", label: "Middle Eastern or North African" },
          { value: "native_hawaiian_pacific_islander", label: "Native Hawaiian or Pacific Islander" },
          { value: "white", label: "White" },
          { value: "multiracial", label: "Multiracial" },
          { value: "prefer_not_to_say", label: "Prefer not to say" },
        ], "Optional. Some grants are designed for specific communities; this improves matching when you choose to share it.")
      case "citizenship_status":
        return selectField(field, "Citizenship status", [
          { value: "us_citizen", label: "US citizen" },
          { value: "permanent_resident", label: "Permanent resident" },
          { value: "daca", label: "DACA" },
          { value: "other", label: "Other" },
        ])
      case "tribal_affiliation":
        return selectField(field, "Tribal affiliation", YES_NO)
      case "education_level":
        return selectField(field, "Highest education level completed", [
          { value: "less_than_high_school", label: "Less than high school" },
          { value: "high_school", label: "High school or GED" },
          { value: "some_college", label: "Some college" },
          { value: "associate", label: "Associate degree" },
          { value: "bachelor", label: "Bachelor's degree" },
          { value: "graduate", label: "Graduate degree" },
          { value: "doctorate", label: "Doctorate" },
        ])
      case "student_status":
        return selectField(field, "Currently enrolled in school", YES_NO)
      case "field_of_study":
        return textField(field, "Field of study", { placeholder: "Biology, computer science, public policy..." })
      case "degree_type_pursuing":
        return selectField(field, "Degree type pursuing", [
          { value: "undergraduate", label: "Undergraduate" },
          { value: "graduate", label: "Graduate" },
          { value: "phd", label: "PhD" },
          { value: "postdoc", label: "Postdoc" },
          { value: "not_applicable", label: "Not applicable" },
        ])
      case "business_owner":
        return selectField(field, "Do you own a business?", YES_NO)
      case "business_type":
        return selectField(field, "Business type", [
          { value: "sole_proprietor", label: "Sole proprietor" },
          { value: "llc", label: "LLC" },
          { value: "corporation", label: "Corporation" },
          { value: "nonprofit", label: "Nonprofit" },
          { value: "cooperative", label: "Cooperative" },
        ])
      case "business_industry":
        return textField(field, "Industry", { placeholder: "Food service, software, farming, arts..." })
      case "employee_count":
        return textField(field, "Number of employees", { type: "number", placeholder: "5" })
      case "annual_revenue":
        return textField(field, "Annual revenue", { type: "number", placeholder: "120000", note: "Optional sensitive field. Revenue helps match size-limited small business grants." })
      case "years_in_operation":
        return textField(field, "Years in operation", { type: "number", placeholder: "2" })
      case "business_location":
        return selectField(field, "Business location", [
          { value: "same_as_home", label: "Same as home" },
          ...US_STATES.map(([value, label]) => ({ value, label })),
        ])
      case "business_ownership_identities":
        return (
          <MultiSelect
            label="Ownership identity"
            values={profile.business_ownership_identities}
            options={BUSINESS_OWNERSHIP_IDENTITIES}
            onToggle={(value) => toggleArrayField("business_ownership_identities", value)}
          />
        )
      case "business_us_owned":
        return selectField(field, "Is the business US-owned and operated?", YES_NO)
      case "business_rural":
        return selectField(field, "Is the business in a rural area?", YES_NO)
      case "funding_interests":
        return (
          <MultiSelect
            label="What are you looking for?"
            values={profile.funding_interests}
            options={FUNDING_INTERESTS}
            onToggle={(value) => toggleArrayField("funding_interests", value)}
          />
        )
      case "application_stage":
        return selectField(field, "What stage are you at?", [
          { value: "just_exploring", label: "Just exploring" },
          { value: "ready_to_apply", label: "Ready to apply" },
          { value: "already_applying", label: "Already applying" },
        ])
      case "email_alerts":
        return selectField(field, "Email alerts for new matching grants", YES_NO)
      case "deadline_reminders":
        return selectField(field, "Deadline reminders for saved grants", YES_NO)
      case "weekly_digest":
        return selectField(field, "Weekly digest of new grants in my categories", YES_NO)
      default:
        return null
    }
  }

  if (loading) {
    return <div className="rounded-xl border border-zinc-200 bg-white p-6 text-zinc-500 shadow-sm">Loading profile...</div>
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <h1 className="mb-3 text-2xl font-bold text-zinc-900">Log in to complete your profile</h1>
        <p className="mb-6 text-zinc-500">Your profile is attached to your GrantFinder account.</p>
        <Link
          href="/auth?next=/account/profile"
          className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
        >
          Log in or sign up
        </Link>
      </div>
    )
  }

  const completion = profileCompletion(profile)

  return (
    <form onSubmit={submit} className="grid gap-6">
      <section className="sticky top-0 z-10 rounded-xl border border-zinc-200 bg-white/95 p-5 shadow-sm backdrop-blur">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Your profile is {completion}% complete</h2>
            <p className="text-sm text-zinc-500">Complete it to see more accurate grants, benefits, and deadline alerts.</p>
          </div>
          <span className="text-sm text-zinc-500">{saving ? "Saving..." : message ?? "Auto-saves on blur"}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
          <div className="h-full rounded-full bg-zinc-900 transition-all" style={{ width: `${completion}%` }} />
        </div>
      </section>

      <div className="grid gap-3">
        {STEPS.map((step, index) => {
          const isActive = index === activeStep
          const stepPercent = stepCompletion(profile, step)

          return (
            <section key={step.id} className="rounded-xl border border-zinc-200 bg-white shadow-sm">
              <button
                type="button"
                onClick={() => setActiveStep(index)}
                className="flex w-full flex-wrap items-center justify-between gap-4 p-5 text-left"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Step {index + 1}</p>
                  <h3 className="mt-1 text-lg font-semibold text-zinc-900">{step.title}</h3>
                  <p className="mt-1 max-w-2xl text-sm text-zinc-500">{step.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    stepPercent === 100 ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-600"
                  }`}>
                    {stepPercent}% complete
                  </span>
                  <span className="text-sm font-medium text-zinc-500">{isActive ? "Collapse" : "Edit"}</span>
                </div>
              </button>

              {isActive && (
                <div className="border-t border-zinc-200 p-5">
                  {step.id === "business" && profile.business_owner !== "yes" ? (
                    <div className="grid gap-5 sm:grid-cols-2">
                      {renderField("business_owner")}
                    </div>
                  ) : (
                    <div className="grid gap-5 sm:grid-cols-2">
                      {step.fields.map((field) => (
                        <div key={field} className={field === "funding_interests" || field === "business_ownership_identities" ? "sm:col-span-2" : ""}>
                          {renderField(field)}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveStep(Math.max(0, index - 1))}
                      disabled={index === 0}
                      className="h-10 rounded-full border border-zinc-300 px-5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const nextErrors = validateProfile(profile)
                        if (Object.keys(nextErrors).length > 0) {
                          setFieldErrors(nextErrors)
                          setError("Fix the highlighted fields before saving.")
                          return
                        }
                        void save()
                        setActiveStep(Math.min(STEPS.length - 1, index + 1))
                      }}
                      className="h-10 rounded-full bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
                    >
                      {index === STEPS.length - 1 ? "Review" : "Next section"}
                    </button>
                  </div>
                </div>
              )}
            </section>
          )
        })}
      </div>

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/account" className="text-sm font-medium text-zinc-500 hover:text-zinc-900">
          Back to account
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="h-11 rounded-full bg-zinc-900 px-8 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save profile"}
        </button>
      </div>
    </form>
  )
}
