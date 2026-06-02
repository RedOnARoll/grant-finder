"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Plus, X } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import { getProfile, getSavedPrograms, migrateAccountMetadata, removeSavedProgram as removeSavedProgramRow, saveProgram, updateProgramStatus } from "@/lib/account-db"
import { APPLICATION_STATUSES } from "@/lib/dashboard"
import type { AccountDashboard as DashboardData, ApplicationStatus } from "@/lib/dashboard"
import { matchEligibleBenefits, type EligibleBenefitMatch } from "@/lib/eligible-benefits"
import { matchEligibleGrants, type EligibleGrantMatch } from "@/lib/eligible-grants"
import type { UserProfile } from "@/lib/profile"
import type { Grant } from "@/lib/types"
import { getBrowserSupabase } from "@/lib/supabase-browser"

function formatAmount(amount: number | null) {
  if (!amount) return "Varies"
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`
  return `$${amount}`
}

function formatDate(value: string | null) {
  if (!value) return "Open"
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function statusTone(status: ApplicationStatus): { row: string; pill: string } {
  switch (status) {
    case "interested": return { row: "border-amber-200 bg-amber-50",   pill: "bg-amber-100 text-amber-800"   }
    case "applying":   return { row: "border-blue-200 bg-blue-50",     pill: "bg-blue-100 text-blue-800"     }
    case "applied":    return { row: "border-violet-200 bg-violet-50", pill: "bg-violet-100 text-violet-800" }
    case "awarded":    return { row: "border-emerald-200 bg-emerald-50", pill: "bg-emerald-100 text-emerald-800" }
  }
}

export default function AccountDashboard() {
  const supabase = useMemo(() => getBrowserSupabase(), [])
  const [user, setUser] = useState<User | null>(null)
  const [programs, setPrograms] = useState<Grant[]>([])
  const [dashboard, setDashboard] = useState<DashboardData>({ saved_programs: [] })
  const [eligibleBenefits, setEligibleBenefits] = useState<EligibleBenefitMatch[]>([])
  const [eligibleGrants, setEligibleGrants] = useState<EligibleGrantMatch[]>([])
  const [selectedProgramKey, setSelectedProgramKey] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>("interested")
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [wsPct, setWsPct] = useState<Record<string, number>>({})

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
          if (mounted) setError(accountError instanceof Error ? accountError.message : "Could not load account data.")
        }

        if (mounted) setDashboard({ saved_programs: savedPrograms })

        if (userProfile && !programError) {
          const allPrograms = (programData ?? []) as Grant[]
          if (mounted) {
            setEligibleBenefits(matchEligibleBenefits(userProfile, allPrograms.filter(p => p.type === "benefit")).slice(0, 6))
            setEligibleGrants(matchEligibleGrants(userProfile, allPrograms.filter(p => p.type === "grant")).slice(0, 6))
          }
        }
      }

      if (programError) {
        if (mounted) setError(programError.message)
      } else {
        if (mounted) setPrograms((programData ?? []) as Grant[])
      }

      if (mounted) setLoading(false)
    }

    load()
    return () => { mounted = false }
  }, [supabase])

  async function refreshSavedPrograms(currentUser = user) {
    if (!currentUser) return
    const savedPrograms = await getSavedPrograms(supabase, currentUser.id)
    setDashboard({ saved_programs: savedPrograms })
  }

  useEffect(() => {
    if (!programs.length || !dashboard.saved_programs.length) return
    const REQ = ["org", "project", "funding", "outcomes"]
    try {
      const ans: Record<string, Record<string, string>> = JSON.parse(localStorage.getItem("gw_ws_answers") ?? "{}")
      const drMap: Record<string, number[]> = JSON.parse(localStorage.getItem("gw_ws_docready") ?? "{}")
      setWsPct(Object.fromEntries(dashboard.saved_programs.flatMap(s => {
        const p = programs.find(g => g.slug === s.slug); if (!p) return []
        const aDone = REQ.filter(k => ans[p.slug]?.[k]?.trim()).length
        const dc = p.required_documents.length
        const drArr = drMap[p.slug] ?? []
        const dDone = dc > 0 ? drArr.filter(i => i < dc).length : 0
        return [[p.slug, Math.round((aDone / 4 + (dc > 0 ? dDone / dc : 0)) / (dc > 0 ? 2 : 1) * 100)]]
      })))
    } catch {}
  }, [programs, dashboard.saved_programs])

  useEffect(() => {
    if (!user || !Object.keys(wsPct).length) return
    const toUpdate = dashboard.saved_programs.filter(s =>
      s.status === "interested" && (wsPct[s.slug] ?? 0) > 0
    )
    if (!toUpdate.length) return
    Promise.all(toUpdate.map(s =>
      updateProgramStatus(supabase, user.id, s.slug, s.type, "applying")
    )).then(async () => {
      const savedPrograms = await getSavedPrograms(supabase, user.id)
      setDashboard({ saved_programs: savedPrograms })
    }).catch(() => {})
  }, [wsPct, dashboard.saved_programs, user, supabase])

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
      setError(updateError instanceof Error ? updateError.message : "Could not save changes.")
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
    setShowAddForm(false)
  }

  async function updateStatus(slug: string, type: "grant" | "benefit", status: ApplicationStatus) {
    await runSaveMutation(() => updateProgramStatus(supabase, user!.id, slug, type, status), "Status updated.")
  }

  async function removeSavedProgram(slug: string, type: "grant" | "benefit") {
    await runSaveMutation(() => removeSavedProgramRow(supabase, user!.id, slug, type), "Removed.")
  }

  if (loading) {
    return <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-slate-500">Loading dashboard…</div>
  }

  if (!user) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center">
        <h2 className="mb-2 text-xl font-bold text-slate-900">Log in to view your dashboard</h2>
        <p className="mb-6 text-slate-600">Save programs and track applications from your GrantWay account.</p>
        <Link href="/auth?next=/account/dashboard" className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-6 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
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

  const activeApplications = savedPrograms.filter(({ saved }) => saved.status === "applying" || saved.status === "applied")
  const awarded = savedPrograms.filter(({ saved }) => saved.status === "awarded")
  const nextDeadline = savedPrograms
    .filter(({ program }) => program.deadline)
    .sort((a, b) => new Date(a.program.deadline!).getTime() - new Date(b.program.deadline!).getTime())[0]
  const selectablePrograms = programs.filter((program) =>
    !dashboard.saved_programs.some((saved) => saved.slug === program.slug && saved.type === program.type)
  )
  const programsByStatus = APPLICATION_STATUSES.map((status) => ({
    ...status,
    items: savedPrograms.filter(({ saved }) => saved.status === status.value),
  }))

  return (
    <div className="grid gap-4">

      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span className="font-semibold text-slate-900">{savedPrograms.length}</span> saved
          <span className="text-slate-300">·</span>
          <span className="font-semibold text-slate-900">{activeApplications.length}</span> active
          <span className="text-slate-300">·</span>
          <span className="font-semibold text-slate-900">{awarded.length}</span> awarded
          {nextDeadline && (
            <>
              <span className="text-slate-300">·</span>
              <span className="rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs text-amber-800 font-medium">
                Next deadline: {formatDate(nextDeadline.program.deadline)}
              </span>
            </>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href="/grants"
            className="inline-flex items-center h-8 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            Find programs
          </Link>
          <button
            type="button"
            onClick={() => setShowAddForm((v) => !v)}
            className="inline-flex items-center gap-1.5 h-8 rounded-lg bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add program
          </button>
        </div>
      </div>

      {/* Inline add form */}
      {showAddForm && (
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-slate-900">Add a program to track</p>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={addSavedProgram} className="flex flex-wrap gap-2 items-end">
            <select
              value={selectedProgramKey}
              onChange={(e) => setSelectedProgramKey(e.target.value)}
              required
              className="h-9 flex-1 min-w-52 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
            >
              <option value="">Choose a program…</option>
              <optgroup label="Grants">
                {selectablePrograms.filter((p) => p.type === "grant").map((p) => (
                  <option key={`${p.type}-${p.slug}`} value={`${p.type}:${p.slug}`}>{p.name}</option>
                ))}
              </optgroup>
              <optgroup label="Benefits">
                {selectablePrograms.filter((p) => p.type === "benefit").map((p) => (
                  <option key={`${p.type}-${p.slug}`} value={`${p.type}:${p.slug}`}>{p.name}</option>
                ))}
              </optgroup>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as ApplicationStatus)}
              className="h-9 w-36 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
            >
              {APPLICATION_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={saving}
              className="h-9 px-4 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </form>
          {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
          {message && <p className="mt-2 text-xs text-emerald-600">{message}</p>}
        </section>
      )}

      {/* Pipeline kanban — tracker + workspace combined */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {programsByStatus.map(({ value, label, items }) => {
          const tone = statusTone(value as ApplicationStatus)
          return (
            <div key={value} className={`rounded-xl border p-4 ${tone.row}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tone.pill}`}>{items.length}</span>
              </div>
              <div className="space-y-2 min-h-[3rem]">
                {items.slice(0, 4).map(({ saved, program }) => {
                  const base = `/${program.type === "grant" ? "grants" : "benefits"}/${program.slug}`
                  return (
                    <div key={`${saved.type}-${saved.slug}`} className="flex items-center justify-between gap-1.5">
                      <Link
                        href={base}
                        className="text-xs text-slate-800 truncate hover:underline leading-snug min-w-0"
                        title={program.name}
                      >
                        {program.name}
                      </Link>
                      <Link
                        href={`${base}/apply`}
                        className="shrink-0 text-xs font-medium text-blue-600 hover:underline"
                      >
                        Apply
                      </Link>
                    </div>
                  )
                })}
                {items.length > 4 && (
                  <p className="text-xs text-slate-500">+{items.length - 4} more</p>
                )}
                {items.length === 0 && (
                  <p className="text-xs text-slate-400 italic">None yet</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Saved programs — compact rows */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Saved programs</h2>
          <span className="text-xs text-slate-400">{savedPrograms.length} total</span>
        </div>

        {savedPrograms.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm font-semibold text-slate-900 mb-1">No saved programs yet</p>
            <p className="text-xs text-slate-500 mb-4">Browse grants and benefits, then star them to track here.</p>
            <div className="flex justify-center gap-4">
              <Link href="/grants" className="text-sm font-medium text-blue-600 hover:underline">Grants</Link>
              <Link href="/benefits" className="text-sm font-medium text-blue-600 hover:underline">Benefits</Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {/* Column headers */}
            <div className="hidden sm:grid grid-cols-[1fr_64px_80px_130px_28px] gap-3 px-5 py-2 text-xs font-medium text-slate-400">
              <span>Program</span>
              <span className="text-right">Amount</span>
              <span className="text-right">Deadline</span>
              <span>Status</span>
              <span />
            </div>
            {savedPrograms.map(({ saved, program }) => (
              <div key={`${saved.type}-${saved.slug}`} className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_64px_80px_130px_28px] gap-x-3 gap-y-1 items-center px-5 py-3">
                {/* Name + type */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`shrink-0 text-xs font-medium px-1.5 py-0.5 rounded ${
                      program.type === "grant" ? "bg-slate-100 text-slate-600" : "bg-blue-50 text-blue-700"
                    }`}>
                      {program.type === "grant" ? "Grant" : "Benefit"}
                    </span>
                    <Link
                      href={`/${program.type === "grant" ? "grants" : "benefits"}/${program.slug}`}
                      className="text-sm font-medium text-slate-900 hover:underline truncate"
                    >
                      {program.name}
                    </Link>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 pl-0.5">
                    <p className="text-xs text-slate-400 truncate">{program.agency}</p>
                    <Link
                      href="/workspace"
                      onClick={() => { try { localStorage.setItem("gw_ws_slug", JSON.stringify(program.slug)) } catch {} }}
                      className="shrink-0 text-xs font-medium text-blue-600 hover:underline"
                    >
                      {(wsPct[program.slug] ?? 0) > 0 ? "Finish application →" : "Start application →"}
                    </Link>
                  </div>
                  <div className="mt-1.5 pl-0.5 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${(wsPct[program.slug] ?? 0) === 100 ? "bg-emerald-500" : "bg-blue-500"}`}
                        style={{ width: `${wsPct[program.slug] ?? 0}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold tabular-nums shrink-0 text-slate-400">
                      {wsPct[program.slug] ?? 0}% complete
                    </span>
                  </div>
                </div>

                {/* Amount */}
                <span className="hidden sm:block text-xs text-slate-500 text-right">{formatAmount(program.max_amount)}</span>

                {/* Deadline */}
                <span className="hidden sm:block text-xs text-slate-500 text-right">{formatDate(program.deadline)}</span>

                {/* Status select */}
                <select
                  value={saved.status}
                  onChange={(e) => updateStatus(saved.slug, saved.type, e.target.value as ApplicationStatus)}
                  disabled={saving}
                  className="col-span-1 h-7 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900 outline-none focus:border-blue-500 disabled:opacity-60 transition"
                >
                  {APPLICATION_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeSavedProgram(saved.slug, saved.type)}
                  disabled={saving}
                  className="flex items-center justify-center w-7 h-7 rounded-md text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-40"
                  aria-label="Remove"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Likely matches */}
      {(eligibleGrants.length > 0 || eligibleBenefits.length > 0) && (
        <section className="space-y-5 pt-2">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Likely matches</h2>
              <p className="text-xs text-slate-500 mt-0.5">Based on your profile. Verify eligibility before applying.</p>
            </div>
            <Link href="/account/eligible" className="text-xs font-medium text-blue-600 hover:underline shrink-0">View all →</Link>
          </div>

          {eligibleGrants.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Grants</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {eligibleGrants.map(({ grant, confidence, matchedReasons }) => (
                  <Link
                    key={grant.id}
                    href={`/grants/${grant.slug}`}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:border-blue-300 hover:shadow-md transition group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${confidence === "likely" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                        {confidence === "likely" ? "Likely eligible" : "May qualify"}
                      </span>
                      <span className="text-xs text-slate-400 shrink-0">{formatAmount(grant.max_amount)}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 leading-snug">{grant.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{grant.agency}</p>
                    {matchedReasons[0] && <p className="text-xs text-slate-500 mt-1.5 line-clamp-1">✓ {matchedReasons[0]}</p>}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {eligibleBenefits.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Benefits</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {eligibleBenefits.map(({ benefit, confidence, matchedReasons }) => (
                  <Link
                    key={benefit.id}
                    href={`/benefits/${benefit.slug}`}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:border-blue-300 hover:shadow-md transition group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${confidence === "likely" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                        {confidence === "likely" ? "Likely eligible" : "May qualify"}
                      </span>
                      <span className="text-xs text-slate-400 shrink-0">{formatAmount(benefit.max_amount)}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 leading-snug">{benefit.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{benefit.agency}</p>
                    {matchedReasons[0] && <p className="text-xs text-slate-500 mt-1.5 line-clamp-1">✓ {matchedReasons[0]}</p>}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

    </div>
  )
}
