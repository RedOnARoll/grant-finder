import type { SupabaseClient, User } from "@supabase/supabase-js"
import { readDashboard } from "@/lib/dashboard"
import type { ApplicationStatus, SavedProgram } from "@/lib/dashboard"
import { PROFILE_DEFAULTS } from "@/lib/profile"
import type { UserProfile } from "@/lib/profile"

type SavedProgramRow = {
  id?: string
  user_id: string
  program_slug: string
  program_type: "grant" | "benefit"
  status: ApplicationStatus
  saved_at: string
  updated_at: string
  notes?: string | null
}

const PROFILE_COLUMNS = [
  "user_id",
  "full_name",
  "email",
  "zip_code",
  "state",
  "date_of_birth",
  "phone_number",
  "household_size",
  "annual_income",
  "income_source",
  "home_ownership",
  "veteran_status",
  "disability_status",
  "gender",
  "race_ethnicity",
  "citizenship_status",
  "tribal_affiliation",
  "student_status",
  "has_children",
  "education_level",
  "field_of_study",
  "degree_type_pursuing",
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
  "rural_location",
  "funding_interests",
  "application_stage",
  "email_alerts",
  "deadline_reminders",
  "weekly_digest",
  "profile_completed_at",
].join(",")

function rowToProfile(row: Record<string, unknown> | null): Partial<UserProfile> | null {
  if (!row) return null

  return {
    full_name: String(row.full_name ?? ""),
    email: String(row.email ?? ""),
    zip_code: String(row.zip_code ?? ""),
    state: String(row.state ?? ""),
    date_of_birth: String(row.date_of_birth ?? ""),
    phone_number: String(row.phone_number ?? ""),
    household_size: String(row.household_size ?? ""),
    annual_income: String(row.annual_income ?? ""),
    income_source: String(row.income_source ?? ""),
    home_ownership: String(row.home_ownership ?? ""),
    veteran_status: String(row.veteran_status ?? ""),
    disability_status: String(row.disability_status ?? ""),
    gender: String(row.gender ?? ""),
    race_ethnicity: String(row.race_ethnicity ?? ""),
    citizenship_status: String(row.citizenship_status ?? ""),
    tribal_affiliation: String(row.tribal_affiliation ?? ""),
    student_status: String(row.student_status ?? ""),
    has_children: String(row.has_children ?? ""),
    education_level: String(row.education_level ?? ""),
    field_of_study: String(row.field_of_study ?? ""),
    degree_type_pursuing: String(row.degree_type_pursuing ?? ""),
    business_owner: String(row.business_owner ?? ""),
    business_type: String(row.business_type ?? ""),
    business_industry: String(row.business_industry ?? ""),
    employee_count: String(row.employee_count ?? ""),
    annual_revenue: String(row.annual_revenue ?? ""),
    years_in_operation: String(row.years_in_operation ?? ""),
    business_location: String(row.business_location ?? ""),
    business_ownership_identities: Array.isArray(row.business_ownership_identities) ? row.business_ownership_identities as string[] : [],
    business_us_owned: String(row.business_us_owned ?? ""),
    business_rural: String(row.business_rural ?? ""),
    rural_location: String(row.rural_location ?? ""),
    funding_interests: Array.isArray(row.funding_interests) ? row.funding_interests as string[] : [],
    application_stage: String(row.application_stage ?? ""),
    email_alerts: String(row.email_alerts ?? ""),
    deadline_reminders: String(row.deadline_reminders ?? ""),
    weekly_digest: String(row.weekly_digest ?? ""),
    profile_completed_at: row.profile_completed_at ? String(row.profile_completed_at) : undefined,
  }
}

function savedRowToProgram(row: SavedProgramRow): SavedProgram {
  return {
    slug: row.program_slug,
    type: row.program_type,
    status: row.status,
    saved_at: row.saved_at,
    updated_at: row.updated_at,
    notes: row.notes ?? undefined,
  }
}

export async function getProfile(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("user_id", userId)
    .maybeSingle()

  if (error) throw error
  return rowToProfile(data as unknown as Record<string, unknown> | null)
}

export async function upsertProfile(supabase: SupabaseClient, userId: string, profile: UserProfile) {
  const normalizedProfile = {
    ...PROFILE_DEFAULTS,
    ...profile,
  }

  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      user_id: userId,
      full_name: normalizedProfile.full_name,
      email: normalizedProfile.email,
      zip_code: normalizedProfile.zip_code,
      state: normalizedProfile.state,
      date_of_birth: normalizedProfile.date_of_birth,
      phone_number: normalizedProfile.phone_number,
      household_size: normalizedProfile.household_size,
      annual_income: normalizedProfile.annual_income,
      income_source: normalizedProfile.income_source,
      home_ownership: normalizedProfile.home_ownership,
      veteran_status: normalizedProfile.veteran_status,
      disability_status: normalizedProfile.disability_status,
      gender: normalizedProfile.gender,
      race_ethnicity: normalizedProfile.race_ethnicity,
      citizenship_status: normalizedProfile.citizenship_status,
      tribal_affiliation: normalizedProfile.tribal_affiliation,
      student_status: normalizedProfile.student_status,
      has_children: normalizedProfile.has_children,
      education_level: normalizedProfile.education_level,
      field_of_study: normalizedProfile.field_of_study,
      degree_type_pursuing: normalizedProfile.degree_type_pursuing,
      business_owner: normalizedProfile.business_owner,
      business_type: normalizedProfile.business_type,
      business_industry: normalizedProfile.business_industry,
      employee_count: normalizedProfile.employee_count,
      annual_revenue: normalizedProfile.annual_revenue,
      years_in_operation: normalizedProfile.years_in_operation,
      business_location: normalizedProfile.business_location,
      business_ownership_identities: normalizedProfile.business_ownership_identities,
      business_us_owned: normalizedProfile.business_us_owned,
      business_rural: normalizedProfile.business_rural,
      rural_location: normalizedProfile.rural_location,
      funding_interests: normalizedProfile.funding_interests,
      application_stage: normalizedProfile.application_stage,
      email_alerts: normalizedProfile.email_alerts,
      deadline_reminders: normalizedProfile.deadline_reminders,
      weekly_digest: normalizedProfile.weekly_digest,
      profile_completed_at: normalizedProfile.profile_completed_at,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" })
    .select(PROFILE_COLUMNS)
    .single()

  if (error) throw error
  return rowToProfile(data as unknown as Record<string, unknown> | null)
}

export async function getSavedPrograms(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("saved_programs")
    .select("program_slug, program_type, status, saved_at, updated_at, notes")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })

  if (error) throw error
  return ((data ?? []) as SavedProgramRow[]).map(savedRowToProgram)
}

export async function saveProgram(
  supabase: SupabaseClient,
  userId: string,
  slug: string,
  type: "grant" | "benefit",
  status: ApplicationStatus = "interested"
) {
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from("saved_programs")
    .upsert({
      user_id: userId,
      program_slug: slug,
      program_type: type,
      status,
      updated_at: now,
    }, { onConflict: "user_id,program_slug,program_type" })
    .select("id, program_slug, program_type, status, saved_at, updated_at, notes")
    .single()

  if (error) throw error

  await supabase.from("application_statuses").insert({
    user_id: userId,
    saved_program_id: data.id,
    status,
  })

  return savedRowToProgram(data as SavedProgramRow)
}

export async function updateProgramStatus(
  supabase: SupabaseClient,
  userId: string,
  slug: string,
  type: "grant" | "benefit",
  status: ApplicationStatus
) {
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from("saved_programs")
    .update({ status, updated_at: now })
    .eq("user_id", userId)
    .eq("program_slug", slug)
    .eq("program_type", type)
    .select("id, program_slug, program_type, status, saved_at, updated_at, notes")
    .single()

  if (error) throw error

  await supabase.from("application_statuses").insert({
    user_id: userId,
    saved_program_id: data.id,
    status,
  })

  return savedRowToProgram(data as SavedProgramRow)
}

export async function removeSavedProgram(
  supabase: SupabaseClient,
  userId: string,
  slug: string,
  type: "grant" | "benefit"
) {
  const { error } = await supabase
    .from("saved_programs")
    .delete()
    .eq("user_id", userId)
    .eq("program_slug", slug)
    .eq("program_type", type)

  if (error) throw error
}

export async function migrateAccountMetadata(supabase: SupabaseClient, user: User) {
  const metadataProfile = user.user_metadata?.grantfinder_profile as UserProfile | undefined
  const metadataDashboard = readDashboard(user.user_metadata?.grantfinder_dashboard)

  if (metadataProfile) {
    const existingProfile = await getProfile(supabase, user.id)
    if (!existingProfile?.profile_completed_at) {
      await upsertProfile(supabase, user.id, metadataProfile)
    }
  }

  if (metadataDashboard.saved_programs.length > 0) {
    const existingSaved = await getSavedPrograms(supabase, user.id)
    const existingKeys = new Set(existingSaved.map((item) => `${item.type}:${item.slug}`))

    for (const saved of metadataDashboard.saved_programs) {
      if (!existingKeys.has(`${saved.type}:${saved.slug}`)) {
        await saveProgram(supabase, user.id, saved.slug, saved.type, saved.status)
      }
    }
  }
}
