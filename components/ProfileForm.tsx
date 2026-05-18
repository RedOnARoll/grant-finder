"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { getProfile, migrateAccountMetadata, upsertProfile } from "@/lib/account-db"
import { FUNDING_INTERESTS, PROFILE_DEFAULTS, US_STATES, profileCompletion } from "@/lib/profile"
import type { UserProfile } from "@/lib/profile"
import { getBrowserSupabase } from "@/lib/supabase-browser"

function readProfile(user: User | null): UserProfile {
  const saved = user?.user_metadata?.grantfinder_profile as Partial<UserProfile> | undefined
  return {
    ...PROFILE_DEFAULTS,
    ...saved,
    full_name: saved?.full_name || user?.user_metadata?.full_name || "",
    funding_interests: saved?.funding_interests ?? [],
  }
}

function mergeProfile(user: User | null, saved?: Partial<UserProfile> | null): UserProfile {
  return {
    ...readProfile(user),
    ...saved,
    full_name: saved?.full_name || user?.user_metadata?.full_name || "",
    funding_interests: saved?.funding_interests ?? [],
  }
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-sm font-medium text-zinc-700">{children}</span>
}

function TextInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  required?: boolean
}) {
  return (
    <label className="grid gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="h-11 rounded-lg border border-zinc-300 px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
      />
    </label>
  )
}

function SelectInput({
  label,
  value,
  onChange,
  options,
  required = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  required?: boolean
}) {
  return (
    <label className="grid gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="h-11 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
      >
        <option value="">Select...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export default function ProfileForm() {
  const router = useRouter()
  const supabase = useMemo(() => getBrowserSupabase(), [])
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile>(PROFILE_DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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
    setMessage(null)
    setError(null)
  }

  function toggleInterest(interest: string) {
    const next = profile.funding_interests.includes(interest)
      ? profile.funding_interests.filter((item) => item !== interest)
      : [...profile.funding_interests, interest]
    update("funding_interests", next)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!user) {
      router.push("/auth?next=/account/profile")
      return
    }

    setSaving(true)
    setMessage(null)
    setError(null)

    const profileToSave: UserProfile = {
      ...profile,
      full_name: profile.full_name.trim(),
      annual_income: profile.annual_income.trim(),
      annual_revenue: profile.annual_revenue.trim(),
      employee_count: profile.employee_count.trim(),
      profile_completed_at: new Date().toISOString(),
    }

    try {
      const savedProfile = await upsertProfile(supabase, user.id, profileToSave)
      await supabase.auth.updateUser({
        data: { full_name: profileToSave.full_name },
      })
      setProfile(mergeProfile(user, savedProfile))
      setMessage("Profile saved. Your recommendations can now use this information.")
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Could not save profile.")
    } finally {
      setSaving(false)
    }

    const { data } = await supabase.auth.getUser()
    if (data.user) {
      setUser(data.user)
      return
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
    <form onSubmit={submit} className="grid gap-8">
      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Profile details</h2>
            <p className="text-sm text-zinc-500">Used to personalize grants, benefits, and quiz results.</p>
          </div>
          <div className="min-w-40">
            <div className="mb-1 flex items-center justify-between text-xs font-medium text-zinc-500">
              <span>Complete</span>
              <span>{completion}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
              <div className="h-full rounded-full bg-zinc-900 transition-all" style={{ width: `${completion}%` }} />
            </div>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <TextInput
            label="Full name"
            value={profile.full_name}
            onChange={(value) => update("full_name", value)}
            placeholder="Your name"
          />
          <SelectInput
            label="State"
            value={profile.state}
            onChange={(value) => update("state", value)}
            required
            options={US_STATES.map(([value, label]) => ({ value, label }))}
          />
          <SelectInput
            label="Household size"
            value={profile.household_size}
            onChange={(value) => update("household_size", value)}
            required
            options={Array.from({ length: 9 }, (_, index) => {
              const size = index + 1
              return { value: String(size), label: size === 9 ? "9 or more" : String(size) }
            })}
          />
          <TextInput
            label="Annual household income"
            value={profile.annual_income}
            onChange={(value) => update("annual_income", value)}
            type="number"
            placeholder="45000"
            required
          />
          <SelectInput
            label="Veteran status"
            value={profile.veteran_status}
            onChange={(value) => update("veteran_status", value)}
            required
            options={[
              { value: "veteran", label: "Veteran" },
              { value: "active_duty", label: "Active duty" },
              { value: "military_family", label: "Military family member" },
              { value: "none", label: "None" },
            ]}
          />
          <SelectInput
            label="Disability status"
            value={profile.disability_status}
            onChange={(value) => update("disability_status", value)}
            required
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
              { value: "prefer_not_to_say", label: "Prefer not to say" },
            ]}
          />
          <SelectInput
            label="Student status"
            value={profile.student_status}
            onChange={(value) => update("student_status", value)}
            required
            options={[
              { value: "high_school", label: "High school" },
              { value: "undergraduate", label: "Undergraduate" },
              { value: "graduate", label: "Graduate" },
              { value: "not_student", label: "Not a student" },
            ]}
          />
          <SelectInput
            label="Children in household"
            value={profile.has_children}
            onChange={(value) => update("has_children", value)}
            required
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
          />
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-zinc-900">Business and location</h2>
          <p className="text-sm text-zinc-500">These fields help surface business, agricultural, and rural programs.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <SelectInput
            label="Business owner"
            value={profile.business_owner}
            onChange={(value) => update("business_owner", value)}
            required
            options={[
              { value: "yes", label: "Yes" },
              { value: "planning", label: "Planning to start" },
              { value: "no", label: "No" },
            ]}
          />
          <SelectInput
            label="Business type"
            value={profile.business_type}
            onChange={(value) => update("business_type", value)}
            options={[
              { value: "for_profit", label: "For-profit business" },
              { value: "nonprofit", label: "Nonprofit" },
              { value: "farm_or_ranch", label: "Farm or ranch" },
              { value: "research_lab", label: "Research organization" },
              { value: "artist_or_creator", label: "Artist or creator" },
              { value: "not_applicable", label: "Not applicable" },
            ]}
          />
          <TextInput
            label="Employee count"
            value={profile.employee_count}
            onChange={(value) => update("employee_count", value)}
            type="number"
            placeholder="5"
          />
          <TextInput
            label="Annual business revenue"
            value={profile.annual_revenue}
            onChange={(value) => update("annual_revenue", value)}
            type="number"
            placeholder="120000"
          />
          <SelectInput
            label="Rural location"
            value={profile.rural_location}
            onChange={(value) => update("rural_location", value)}
            required
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
              { value: "not_sure", label: "Not sure" },
            ]}
          />
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-zinc-900">Funding interests</h2>
          <p className="text-sm text-zinc-500">Choose every area you want GrantFinder to prioritize.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {FUNDING_INTERESTS.map((interest) => {
            const selected = profile.funding_interests.includes(interest)
            return (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={`h-10 rounded-lg border px-4 text-sm font-medium transition-colors ${
                  selected
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-300 text-zinc-700 hover:border-zinc-500"
                }`}
              >
                {interest}
              </button>
            )
          })}
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {message}
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
