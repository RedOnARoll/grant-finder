export type ApplicationStatus = "interested" | "applying" | "applied" | "awarded"

export type SavedProgram = {
  slug: string
  type: "grant" | "benefit"
  status: ApplicationStatus
  saved_at: string
  updated_at: string
  notes?: string
}

export type AccountDashboard = {
  saved_programs: SavedProgram[]
}

export const DASHBOARD_DEFAULTS: AccountDashboard = {
  saved_programs: [],
}

export const APPLICATION_STATUSES: { value: ApplicationStatus; label: string }[] = [
  { value: "interested", label: "Interested" },
  { value: "applying", label: "Applying" },
  { value: "applied", label: "Applied" },
  { value: "awarded", label: "Awarded" },
]

export function readDashboard(raw: unknown): AccountDashboard {
  if (!raw || typeof raw !== "object") return DASHBOARD_DEFAULTS

  const saved = "saved_programs" in raw ? raw.saved_programs : []
  if (!Array.isArray(saved)) return DASHBOARD_DEFAULTS

  return {
    saved_programs: saved.filter(isSavedProgram),
  }
}

function isSavedProgram(item: unknown): item is SavedProgram {
  if (!item || typeof item !== "object") return false
  const candidate = item as Partial<SavedProgram>

  return (
    typeof candidate.slug === "string" &&
    (candidate.type === "grant" || candidate.type === "benefit") &&
    APPLICATION_STATUSES.some((status) => status.value === candidate.status) &&
    typeof candidate.saved_at === "string" &&
    typeof candidate.updated_at === "string"
  )
}
