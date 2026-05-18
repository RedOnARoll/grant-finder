import type { SupabaseClient, User } from "@supabase/supabase-js"
import { readDashboard } from "@/lib/dashboard"
import type { ApplicationStatus, SavedProgram } from "@/lib/dashboard"
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

function rowToProfile(row: Record<string, unknown> | null): Partial<UserProfile> | null {
  if (!row) return null

  return {
    full_name: String(row.full_name ?? ""),
    state: String(row.state ?? ""),
    household_size: String(row.household_size ?? ""),
    annual_income: String(row.annual_income ?? ""),
    veteran_status: String(row.veteran_status ?? ""),
    disability_status: String(row.disability_status ?? ""),
    student_status: String(row.student_status ?? ""),
    has_children: String(row.has_children ?? ""),
    business_owner: String(row.business_owner ?? ""),
    business_type: String(row.business_type ?? ""),
    employee_count: String(row.employee_count ?? ""),
    annual_revenue: String(row.annual_revenue ?? ""),
    rural_location: String(row.rural_location ?? ""),
    funding_interests: Array.isArray(row.funding_interests) ? row.funding_interests as string[] : [],
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
  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      user_id: userId,
      full_name: profile.full_name,
      state: profile.state,
      household_size: profile.household_size,
      annual_income: profile.annual_income,
      veteran_status: profile.veteran_status,
      disability_status: profile.disability_status,
      student_status: profile.student_status,
      has_children: profile.has_children,
      business_owner: profile.business_owner,
      business_type: profile.business_type,
      employee_count: profile.employee_count,
      annual_revenue: profile.annual_revenue,
      rural_location: profile.rural_location,
      funding_interests: profile.funding_interests,
      profile_completed_at: profile.profile_completed_at,
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
