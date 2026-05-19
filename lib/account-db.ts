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

const EXPANDED_PROFILE_COLUMNS = [
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

const LEGACY_PROFILE_COLUMNS = [
  "user_id",
  "full_name",
  "state",
  "household_size",
  "annual_income",
  "veteran_status",
  "disability_status",
  "student_status",
  "has_children",
  "business_owner",
  "business_type",
  "employee_count",
  "annual_revenue",
  "rural_location",
  "funding_interests",
  "profile_completed_at",
].join(",")

function isMissingProfileColumnError(error: unknown) {
  if (!error || typeof error !== "object") return false

  const { code, message } = error as { code?: string; message?: string }
  return (
    code === "42703"
    || code === "PGRST204"
    || Boolean(message?.toLowerCase().includes("schema cache"))
    || Boolean(message?.toLowerCase().includes("column") && message?.toLowerCase().includes("does not exist"))
  )
}

function readString(row: Record<string, unknown>, key: string) {
  return key in row ? String(row[key] ?? "") : undefined
}

function removeUndefinedValues(profile: Partial<UserProfile>) {
  return Object.fromEntries(
    Object.entries(profile).filter(([, value]) => value !== undefined),
  ) as Partial<UserProfile>
}

function rowToProfile(row: Record<string, unknown> | null): Partial<UserProfile> | null {
  if (!row) return null

  return {
    full_name: readString(row, "full_name"),
    email: readString(row, "email"),
    zip_code: readString(row, "zip_code"),
    state: readString(row, "state"),
    date_of_birth: readString(row, "date_of_birth"),
    phone_number: readString(row, "phone_number"),
    household_size: readString(row, "household_size"),
    annual_income: readString(row, "annual_income"),
    income_source: readString(row, "income_source"),
    home_ownership: readString(row, "home_ownership"),
    veteran_status: readString(row, "veteran_status"),
    disability_status: readString(row, "disability_status"),
    gender: readString(row, "gender"),
    race_ethnicity: readString(row, "race_ethnicity"),
    citizenship_status: readString(row, "citizenship_status"),
    tribal_affiliation: readString(row, "tribal_affiliation"),
    student_status: readString(row, "student_status"),
    has_children: readString(row, "has_children"),
    education_level: readString(row, "education_level"),
    field_of_study: readString(row, "field_of_study"),
    degree_type_pursuing: readString(row, "degree_type_pursuing"),
    business_owner: readString(row, "business_owner"),
    business_type: readString(row, "business_type"),
    business_industry: readString(row, "business_industry"),
    employee_count: readString(row, "employee_count"),
    annual_revenue: readString(row, "annual_revenue"),
    years_in_operation: readString(row, "years_in_operation"),
    business_location: readString(row, "business_location"),
    business_ownership_identities: Array.isArray(row.business_ownership_identities) ? row.business_ownership_identities as string[] : undefined,
    business_us_owned: readString(row, "business_us_owned"),
    business_rural: readString(row, "business_rural"),
    rural_location: readString(row, "rural_location"),
    funding_interests: Array.isArray(row.funding_interests) ? row.funding_interests as string[] : undefined,
    application_stage: readString(row, "application_stage"),
    email_alerts: readString(row, "email_alerts"),
    deadline_reminders: readString(row, "deadline_reminders"),
    weekly_digest: readString(row, "weekly_digest"),
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
    .select(EXPANDED_PROFILE_COLUMNS)
    .eq("user_id", userId)
    .maybeSingle()

  if (isMissingProfileColumnError(error)) {
    const legacy = await supabase
      .from("profiles")
      .select(LEGACY_PROFILE_COLUMNS)
      .eq("user_id", userId)
      .maybeSingle()

    if (legacy.error) throw legacy.error
    return rowToProfile(legacy.data as unknown as Record<string, unknown> | null)
  }

  if (error) throw error
  return rowToProfile(data as unknown as Record<string, unknown> | null)
}

export async function upsertProfile(supabase: SupabaseClient, userId: string, profile: UserProfile) {
  const normalizedProfile = {
    ...PROFILE_DEFAULTS,
    ...removeUndefinedValues(profile),
  }

  const expandedPayload = {
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
  }

  const { data, error } = await supabase
    .from("profiles")
    .upsert(expandedPayload, { onConflict: "user_id" })
    .select(EXPANDED_PROFILE_COLUMNS)
    .single()

  if (isMissingProfileColumnError(error)) {
    const legacy = await supabase
      .from("profiles")
      .upsert({
        user_id: userId,
        full_name: normalizedProfile.full_name,
        state: normalizedProfile.state,
        household_size: normalizedProfile.household_size,
        annual_income: normalizedProfile.annual_income,
        veteran_status: normalizedProfile.veteran_status,
        disability_status: normalizedProfile.disability_status,
        student_status: normalizedProfile.student_status,
        has_children: normalizedProfile.has_children,
        business_owner: normalizedProfile.business_owner,
        business_type: normalizedProfile.business_type,
        employee_count: normalizedProfile.employee_count,
        annual_revenue: normalizedProfile.annual_revenue,
        rural_location: normalizedProfile.rural_location,
        funding_interests: normalizedProfile.funding_interests,
        profile_completed_at: normalizedProfile.profile_completed_at,
      }, { onConflict: "user_id" })
      .select(LEGACY_PROFILE_COLUMNS)
      .single()

    if (legacy.error) throw legacy.error
    return rowToProfile(legacy.data as unknown as Record<string, unknown> | null)
  }

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
