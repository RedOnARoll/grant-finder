"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import type { User } from "@supabase/supabase-js"
import { getProfile, getSavedPrograms, migrateAccountMetadata, removeSavedProgram as removeSavedProgramRow, saveProgram, updateProgramStatus } from "@/lib/account-db"
import { APPLICATION_STATUSES } from "@/lib/dashboard"
import type { AccountDashboard as DashboardData, ApplicationStatus } from "@/lib/dashboard"
import { profileCompletion, type UserProfile } from "@/lib/profile"
import type { Grant } from "@/lib/types"
import { getBrowserSupabase } from "@/lib/supabase-browser"

function formatAmount(amount: number | null) {
  if (!amount) return "Varies"
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`
  return `$${amount}`
}

function formatDate(value: string | null) {
  if (!value) return "Open enrollment"
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function statusLabel(status: ApplicationStatus) {
  return APPLICATION_STATUSES.find((item) => item.value === status)?.label ?? "Interested"
}

function statusTone(status: ApplicationStatus) {
  switch (status) {
    case "interested": return "bg-amber-50 text-amber-800 border-amber-200"
    case "applying": return "bg-blue-50 text-blue-800 border-blue-200"
    case "applied": return "bg-violet-50 text-violet-800 border-violet-200"
    case "awarded": return "bg-emerald-50 text-emerald-800 border-emerald-200"
  }
}

export default function AccountDashboard() {
  const supabase = useMemo(() => getBrowserSupabase(), [])
  const [user, setUser] = useState<User | null>(null)
  const [programs, setPrograms] = useState<Grant[]>([])
  const [dashboard, setDashboard] = useState<DashboardData>({ saved_programs: [] })
  const [completion, setCompletion] = useState(0)
  const [selectedProgramKey, setSelectedProgramKey] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>("interested")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      const [{ data: userData }, { data: programData, error: programError }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("grants").select("*").in("type", ["grant", "benefit"]).order("name"),
      ])

      if (!mounted) return

      const currentUser = userData.user
      setUser(currentUser)

      if (currentUser) {
        let userProfile: Partial<UserProfile> | null = null
        let savedPrograms: DashboardData["saved_programs"] = []

        try {
          await migrateAccountMetadata(supabase, currentUser)
          ;[userProfile, savedPrograms] = await Promise.all([
            getProfile(supabase, currentUser.id),
            getSavedPrograms(supabase, currentUser.id),
          ])
        } catch (accountError) {
          setError(accountError instanceof Error ? accountError.message : "Could not load account data.")
        }

        setCompletion(profileCompletion(userProfile))
        setDashboard({ saved_programs: savedPrograms })
      }

      if (programError) {
        setError(programError.message)
      } else {
        setPrograms((programData ?? []) as Grant[])
      }

      setLoading(false)
    }

    load()

    return () => {
      mounted = false
    }
  }, [supabase])

  async function refreshSavedPrograms(currentUser = user) {
    if (!currentUser) return
    const savedPrograms = await getSavedPrograms(supabase, currentUser.id)
    setDashboard({ saved_programs: savedPrograms })
  }

  async function runSaveMutation(mutation: () => Promise<unknown>, successMessage: string) {
    if (!user) return

    setSaving(true)
    setError(null)
    setMessage(null)

    try {
      await mutation()
      await refreshSavedPrograms()
      setMessage(successMessage)
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Could not save dashboard changes.")
    } finally {
      setSaving(false)
    }
  }

  async function addSavedProgram(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const [selectedType, selectedSlug] = selectedProgramKey.split(":")
    const program = programs.find((item) => item.slug === selectedSlug && item.type === selectedType)
    if (!program) return

    const existing = dashboard.saved_programs.find((item) => item.slug === program.slug && item.type === program.type)

    await runSaveMutation(
      () => existing
        ? updateProgramStatus(supabase, user!.id, program.slug, program.type, selectedStatus)
        : saveProgram(supabase, user!.id, program.slug, program.type, selectedStatus),
      existing ? "Status updated." : "Program saved."
    )
    setSelectedProgramKey("")
    setSelectedStatus("interested")
  }

  async function updateStatus(slug: string, type: "grant" | "benefit", status: ApplicationStatus) {
    await runSaveMutation(
      () => updateProgramStatus(supabase, user!.id, slug, type, status),
      "Application status updated."
    )
  }

  async function removeSavedProgram(slug: string, type: "grant" | "benefit") {
    await runSaveMutation(
      () => removeSavedProgramRow(supabase, user!.id, slug, type),
      "Saved program removed."
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-slate-500">
        Loading dashboard...
      </div>
    )
  }

  if (!user) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
        <h1 className="mb-3 text-2xl font-bold text-slate-900">Log in to view your dashboard</h1>
        <p className="mb-6 text-slate-600">Save programs and track applications from your GrantWay account.</p>
        <Link
          href="/auth?next=/account"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-blue-600 px-6 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Log in or sign up
        </Link>
      </div>
    )
  }

  const savedPrograms = dashboard.saved_programs
    .map((saved) => {
      const program = programs.find((item) => item.slug === saved.slug && item.type === saved.type)
      return program ? { saved, program } : null
    })
    .filter(Boolean) as { saved: DashboardData["saved_programs"][number]; program: Grant }[]

  const grants = savedPrograms.filter(({ program }) => program.type === "grant")
  const benefits = savedPrograms.filter(({ program }) => program.type === "benefit")
  const activeApplications = savedPrograms.filter(({ saved }) => saved.status === "applying" || saved.status === "applied")
  const awarded = savedPrograms.filter(({ saved }) => saved.status === "awarded")
  const nextDeadline = savedPrograms
    .filter(({ program }) => program.deadline)
    .sort((a, b) => new Date(a.program.deadline!).getTime() - new Date(b.program.deadline!).getTime())[0]
  const countsByStatus = APPLICATION_STATUSES.map((status) => ({
    ...status,
    count: savedPrograms.filter(({ saved }) => saved.status === status.value).length,
  }))
  const selectablePrograms = programs.filter((program) =>
    !dashboard.saved_programs.some((saved) => saved.slug === program.slug && saved.type === program.type)
  )

  return (
    <div className="grid gap-6">
      {/* Profile completion banner */}
      {completion < 100 && (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-amber-900">
                Your profile is {completion}% complete
              </p>
              <p className="mt-1 text-sm text-amber-800">
                Complete it to see more matches, better eligibility estimates, and more useful reminders.
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-lg bg-white/70">
                <div className="h-full rounded-lg bg-amber-600 transition-all" style={{ width: `${completion}%` }} />
              </div>
            </div>
            <Link
              href="/account/profile"
              className="inline-flex h-10 items-center rounded-lg bg-amber-900 px-5 text-sm font-medium text-white hover:bg-amber-800 transition-colors"
            >
              Complete profile
            </Link>
          </div>
        </section>
      )}

      {/* Workspace header card */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-900 p-6 text-white rounded-t-xl">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="mb-2 text-sm font-medium text-slate-300">Application workspace</p>
              <h2 className="text-2xl font-bold">Track every program from saved to awarded.</h2>
            </div>
            <Link
              href="/grants"
              className="inline-flex h-10 items-center rounded-lg bg-white px-5 text-sm font-medium text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Find programs
            </Link>
          </div>
        </div>
        <div className="grid gap-px bg-slate-200 sm:grid-cols-4">
          {[
            ["Saved", savedPrograms.length],
            ["Grants", grants.length],
            ["Benefits", benefits.length],
            ["Active", activeApplications.length],
          ].map(([label, value]) => (
            <div key={label} className="bg-white p-5">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Application tracker */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Application tracker</h2>
            <p className="text-sm text-slate-600">Move saved programs through each stage as you work.</p>
          </div>
          {nextDeadline && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-900">
              Next deadline: <span className="font-semibold">{formatDate(nextDeadline.program.deadline)}</span>
            </div>
          )}
        </div>

        <div className="grid gap-3 lg:grid-cols-4">
          {countsByStatus.map((status, index) => (
            <div key={status.value} className={`rounded-lg border p-4 ${statusTone(status.value)}`}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/80 text-xs font-semibold text-slate-900">
                  {index + 1}
                </span>
                <span className="text-2xl font-bold">{status.count}</span>
              </div>
              <p className="text-sm font-semibold">{status.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Saved programs list + sidebar */}
      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
        {/* Saved programs list */}
        <section className="min-w-0 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-lg font-semibold text-slate-900">Saved grants and benefits</h2>
            <p className="mt-1 text-sm text-slate-600">Track deadlines, award amounts, and application progress.</p>
          </div>

          {savedPrograms.length === 0 ? (
            <div className="p-8 text-center">
              <h3 className="mb-2 text-lg font-semibold text-slate-900">No saved programs yet</h3>
              <p className="mx-auto mb-6 max-w-md text-sm text-slate-600">
                Use the yellow star on grants and benefits, or add one from the panel.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/grants" className="text-sm font-medium text-blue-600 hover:underline">
                  Browse grants
                </Link>
                <Link href="/benefits" className="text-sm font-medium text-blue-600 hover:underline">
                  Browse benefits
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {savedPrograms.map(({ saved, program }) => (
                <article key={`${saved.type}-${saved.slug}`} className="p-5">
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap gap-2">
                        <span className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                          program.type === "grant" ? "bg-slate-100 text-slate-700" : "bg-blue-50 text-blue-700"
                        }`}>
                          {program.type === "grant" ? "Grant" : "Benefit"}
                        </span>
                        <span className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${statusTone(saved.status)}`}>
                          {statusLabel(saved.status)}
                        </span>
                      </div>
                      <Link
                        href={`/${program.type === "grant" ? "grants" : "benefits"}/${program.slug}`}
                        className="break-words font-semibold text-slate-900 hover:underline"
                      >
                        {program.name}
                      </Link>
                      <p className="mt-1 text-sm text-slate-500">{program.agency}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSavedProgram(saved.slug, saved.type)}
                      disabled={saving}
                      className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[1fr_1fr_180px] sm:items-end">
                    <div className="rounded-lg bg-slate-50 p-3 text-sm">
                      <p className="font-semibold text-slate-900">{formatAmount(program.max_amount)}</p>
                      <p className="text-slate-500">Max amount</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3 text-sm">
                      <p className="font-semibold text-slate-900">{formatDate(program.deadline)}</p>
                      <p className="text-slate-500">Deadline</p>
                    </div>
                    <select
                      value={saved.status}
                      onChange={(event) => updateStatus(saved.slug, saved.type, event.target.value as ApplicationStatus)}
                      disabled={saving}
                      className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {APPLICATION_STATUSES.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Sidebar */}
        <aside className="grid min-w-0 content-start gap-6">
          {/* Add a program */}
          <section className="min-w-0 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="mb-1 text-lg font-semibold text-slate-900">Add a program</h2>
            <p className="mb-5 text-sm text-slate-600">Saved items appear here and in your tracker.</p>
            <form onSubmit={addSavedProgram} className="grid gap-3">
              <select
                value={selectedProgramKey}
                onChange={(event) => setSelectedProgramKey(event.target.value)}
                required
                className="h-11 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
              >
                <option value="">Choose a program...</option>
                <optgroup label="Grants">
                  {selectablePrograms.filter((program) => program.type === "grant").map((program) => (
                    <option key={`${program.type}-${program.slug}`} value={`${program.type}:${program.slug}`}>
                      {program.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Benefits">
                  {selectablePrograms.filter((program) => program.type === "benefit").map((program) => (
                    <option key={`${program.type}-${program.slug}`} value={`${program.type}:${program.slug}`}>
                      {program.name}
                    </option>
                  ))}
                </optgroup>
              </select>
              <select
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value as ApplicationStatus)}
                className="h-11 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
              >
                {APPLICATION_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={saving}
                className="h-11 rounded-lg bg-blue-600 px-6 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              >
                Save
              </button>
            </form>

            {error && (
              <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </p>
            )}
            {message && (
              <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {message}
              </p>
            )}
          </section>

          {/* Quick read */}
          <section className="min-w-0 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-lg font-semibold text-slate-900">Quick read</h2>
            <div className="mt-4 grid gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Awarded</span>
                <span className="font-semibold text-slate-900">{awarded.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">In progress</span>
                <span className="font-semibold text-slate-900">{activeApplications.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Remaining catalog</span>
                <span className="font-semibold text-slate-900">{selectablePrograms.length}</span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
