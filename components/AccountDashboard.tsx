"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import type { User } from "@supabase/supabase-js"
import { APPLICATION_STATUSES, readDashboard } from "@/lib/dashboard"
import type { AccountDashboard as DashboardData, ApplicationStatus } from "@/lib/dashboard"
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

export default function AccountDashboard() {
  const supabase = useMemo(() => getBrowserSupabase(), [])
  const [user, setUser] = useState<User | null>(null)
  const [programs, setPrograms] = useState<Grant[]>([])
  const [dashboard, setDashboard] = useState<DashboardData>({ saved_programs: [] })
  const [selectedSlug, setSelectedSlug] = useState("")
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

      setUser(userData.user)
      setDashboard(readDashboard(userData.user?.user_metadata?.grantfinder_dashboard))

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

  async function saveDashboard(nextDashboard: DashboardData, successMessage: string) {
    if (!user) return

    setSaving(true)
    setError(null)
    setMessage(null)

    const { data, error: updateError } = await supabase.auth.updateUser({
      data: { grantfinder_dashboard: nextDashboard },
    })

    setSaving(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setUser(data.user)
    setDashboard(readDashboard(data.user.user_metadata?.grantfinder_dashboard))
    setMessage(successMessage)
  }

  async function addSavedProgram(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const program = programs.find((item) => item.slug === selectedSlug)
    if (!program) return

    const now = new Date().toISOString()
    const existing = dashboard.saved_programs.find((item) => item.slug === program.slug)
    const nextSaved = existing
      ? dashboard.saved_programs.map((item) =>
          item.slug === program.slug
            ? { ...item, status: selectedStatus, updated_at: now }
            : item
        )
      : [
          ...dashboard.saved_programs,
          {
            slug: program.slug,
            type: program.type,
            status: selectedStatus,
            saved_at: now,
            updated_at: now,
          },
        ]

    await saveDashboard({ saved_programs: nextSaved }, existing ? "Status updated." : "Program saved.")
    setSelectedSlug("")
    setSelectedStatus("interested")
  }

  async function updateStatus(slug: string, status: ApplicationStatus) {
    const now = new Date().toISOString()
    const nextSaved = dashboard.saved_programs.map((item) =>
      item.slug === slug ? { ...item, status, updated_at: now } : item
    )

    await saveDashboard({ saved_programs: nextSaved }, "Application status updated.")
  }

  async function removeSavedProgram(slug: string) {
    const nextSaved = dashboard.saved_programs.filter((item) => item.slug !== slug)
    await saveDashboard({ saved_programs: nextSaved }, "Saved program removed.")
  }

  if (loading) {
    return <div className="rounded-xl border border-zinc-200 bg-white p-6 text-zinc-500 shadow-sm">Loading dashboard...</div>
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <h1 className="mb-3 text-2xl font-bold text-zinc-900">Log in to view your dashboard</h1>
        <p className="mb-6 text-zinc-500">Save programs and track applications from your GrantFinder account.</p>
        <Link
          href="/auth?next=/account/dashboard"
          className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
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
  const countsByStatus = APPLICATION_STATUSES.map((status) => ({
    ...status,
    count: savedPrograms.filter(({ saved }) => saved.status === status.value).length,
  }))

  return (
    <div className="grid gap-8">
      <section className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">Saved programs</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900">{savedPrograms.length}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">Grants</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900">{grants.length}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">Benefits</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900">{benefits.length}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">Applied or awarded</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900">
            {savedPrograms.filter(({ saved }) => saved.status === "applied" || saved.status === "awarded").length}
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Application tracker</h2>
            <p className="text-sm text-zinc-500">Move saved programs through each stage as you work.</p>
          </div>
          <Link href="/grants" className="text-sm font-medium text-zinc-900 hover:underline">
            Find more programs
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          {countsByStatus.map((status, index) => (
            <div key={status.value} className="rounded-lg bg-zinc-50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
                  {index + 1}
                </span>
                <p className="text-sm font-semibold text-zinc-900">{status.label}</p>
              </div>
              <p className="text-2xl font-bold text-zinc-900">{status.count}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-zinc-900">Save a grant or benefit</h2>
        <form onSubmit={addSavedProgram} className="grid gap-3 lg:grid-cols-[1fr_180px_auto]">
          <select
            value={selectedSlug}
            onChange={(event) => setSelectedSlug(event.target.value)}
            required
            className="h-11 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
          >
            <option value="">Choose a program...</option>
            <optgroup label="Grants">
              {programs.filter((program) => program.type === "grant").map((program) => (
                <option key={program.slug} value={program.slug}>
                  {program.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Benefits">
              {programs.filter((program) => program.type === "benefit").map((program) => (
                <option key={program.slug} value={program.slug}>
                  {program.name}
                </option>
              ))}
            </optgroup>
          </select>
          <select
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value as ApplicationStatus)}
            className="h-11 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
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
            className="h-11 rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Save
          </button>
        </form>

        {error && <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</p>}
        {message && <p className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{message}</p>}
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 p-6">
          <h2 className="text-lg font-semibold text-zinc-900">Saved grants and benefits</h2>
          <p className="mt-1 text-sm text-zinc-500">Track deadlines, award amounts, and application progress.</p>
        </div>

        {savedPrograms.length === 0 ? (
          <div className="p-8 text-center">
            <h3 className="mb-2 text-lg font-semibold text-zinc-900">No saved programs yet</h3>
            <p className="mx-auto mb-6 max-w-md text-sm text-zinc-500">
              Add programs from the selector above, then update their status as you apply.
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/grants" className="text-sm font-medium text-zinc-900 hover:underline">
                Browse grants
              </Link>
              <Link href="/benefits" className="text-sm font-medium text-zinc-900 hover:underline">
                Browse benefits
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200">
            {savedPrograms.map(({ saved, program }) => (
              <article key={`${saved.type}-${saved.slug}`} className="grid gap-4 p-6 lg:grid-cols-[1fr_180px_150px_auto] lg:items-center">
                <div>
                  <div className="mb-2 flex flex-wrap gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      program.type === "grant" ? "bg-zinc-100 text-zinc-700" : "bg-blue-50 text-blue-700"
                    }`}>
                      {program.type === "grant" ? "Grant" : "Benefit"}
                    </span>
                    <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                      {statusLabel(saved.status)}
                    </span>
                  </div>
                  <Link href={`/${program.type === "grant" ? "grants" : "benefits"}/${program.slug}`} className="font-semibold text-zinc-900 hover:underline">
                    {program.name}
                  </Link>
                  <p className="mt-1 text-sm text-zinc-500">{program.agency}</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-zinc-900">{formatAmount(program.max_amount)}</p>
                  <p className="text-zinc-500">Max amount</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-zinc-900">{formatDate(program.deadline)}</p>
                  <p className="text-zinc-500">Deadline</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  <select
                    value={saved.status}
                    onChange={(event) => updateStatus(saved.slug, event.target.value as ApplicationStatus)}
                    disabled={saving}
                    className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                  >
                    {APPLICATION_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeSavedProgram(saved.slug)}
                    disabled={saving}
                    className="h-10 rounded-lg border border-zinc-300 px-3 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
