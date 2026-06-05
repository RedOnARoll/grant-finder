"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ChevronRight, FileText, Lock } from "lucide-react"
import type { Grant } from "@/lib/types"
import { getBrowserSupabase } from "@/lib/supabase-browser"
import { getSavedPrograms } from "@/lib/account-db"
import PaywallModal from "@/components/PaywallModal"
import { OverviewTab, NarrativeBuilderTab, FormsTab, NotesTab } from "@/components/WorkspaceEditors"

// ── Types & config ─────────────────────────────────────────────────────────

type Stage = "interested" | "applying" | "submitted" | "awarded" | "declined"
type WorkspaceTab = "overview" | "narrative" | "forms" | "notes"
type AccessState = "loading" | "locked" | "unlocked"
type FilterStage = "all" | Stage

const STAGE_CFG: { value: Stage; label: string; color: string }[] = [
  { value: "interested", label: "Interested", color: "bg-slate-100 text-slate-600" },
  { value: "applying",   label: "Applying",   color: "bg-blue-100 text-blue-700"  },
  { value: "submitted",  label: "Submitted",  color: "bg-amber-100 text-amber-700"},
  { value: "awarded",    label: "Awarded",    color: "bg-emerald-100 text-emerald-700" },
  { value: "declined",   label: "Declined",   color: "bg-rose-100 text-rose-700"  },
]

const FILTER_OPTS: { value: FilterStage; label: string }[] = [
  { value: "all",       label: "All"       },
  { value: "interested",label: "Interested"},
  { value: "applying",  label: "Applying"  },
  { value: "submitted", label: "Submitted" },
  { value: "awarded",   label: "Awarded"   },
]

const TABS: { value: WorkspaceTab; label: string }[] = [
  { value: "overview",  label: "Overview"           },
  { value: "narrative", label: "Narrative Builder"  },
  { value: "forms",     label: "Application Forms"  },
  { value: "notes",     label: "Notes"              },
]

// ── Helpers ────────────────────────────────────────────────────────────────

function deadlineColor(d: string | null) {
  if (!d) return "text-slate-400"
  const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
  if (diff < 7) return "text-rose-600"
  if (diff < 30) return "text-amber-600"
  return "text-emerald-700"
}

function fmtDL(d: string | null) {
  if (!d) return "Rolling"
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function fmtAmt(n: number | null) {
  if (!n) return "Varies"
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

// ── StageTracker ──────────────────────────────────────────────────────────

function StageTracker({ stage, onChange }: { stage: Stage; onChange: (s: Stage) => void }) {
  const linear: Stage[] = ["interested", "applying", "submitted"]
  const terminal: Stage[] = ["awarded", "declined"]
  const idx = linear.indexOf(stage)
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {linear.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <button onClick={() => onChange(s)}
            className={`h-7 px-3 rounded-full text-xs font-semibold transition-colors ${
              s === stage ? "bg-blue-600 text-white" :
              idx > i ? "bg-emerald-100 text-emerald-700" :
              "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}>
            {STAGE_CFG.find((c) => c.value === s)!.label}
          </button>
          {i < linear.length - 1 && <span className="text-slate-300 text-xs select-none">→</span>}
        </div>
      ))}
      <span className="text-slate-300 text-xs select-none">→</span>
      {terminal.map((s) => (
        <button key={s} onClick={() => onChange(s)}
          className={`h-7 px-3 rounded-full text-xs font-semibold transition-colors ${
            stage === s
              ? s === "awarded" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}>
          {STAGE_CFG.find((c) => c.value === s)!.label}
        </button>
      ))}
    </div>
  )
}

// ── GrantSidebarItem ──────────────────────────────────────────────────────

function GrantSidebarItem({ grant, stage, active, onClick }: {
  grant: Grant; stage: Stage; active: boolean; onClick: () => void
}) {
  const cfg = STAGE_CFG.find((c) => c.value === stage) ?? STAGE_CFG[0]
  const isClosed = !!grant.deadline && new Date(grant.deadline).getTime() < Date.now()
  return (
    <button onClick={onClick}
      className={`w-full text-left px-3 py-3 rounded-xl border transition-all ${
        active ? "border-blue-300 bg-blue-50 shadow-sm" : "border-transparent hover:border-slate-200 hover:bg-slate-50"
      }`}>
      <div className="flex items-start justify-between gap-2">
        <p className={`text-sm font-semibold leading-tight line-clamp-2 ${active ? "text-blue-900" : isClosed ? "text-slate-400" : "text-slate-800"}`}>{grant.name}</p>
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md flex-none ${cfg.color}`}>{cfg.label}</span>
      </div>
      <p className="text-xs text-slate-500 mt-0.5 truncate">{grant.agency}</p>
      <div className="flex items-center gap-2 mt-1.5">
        {isClosed
          ? <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">Closed</span>
          : <span className={`text-[11px] font-semibold ${deadlineColor(grant.deadline)}`}>{fmtDL(grant.deadline)}</span>
        }
        <span className="text-slate-200 text-[10px]">·</span>
        <span className="text-[11px] text-slate-400">{fmtAmt(grant.max_amount)}</span>
      </div>
    </button>
  )
}

// ── PremiumGate ───────────────────────────────────────────────────────────

function PremiumGate() {
  const [paywallOpen, setPaywallOpen] = useState(false)
  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 grid place-items-center mx-auto mb-4">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Workspace is a Premium feature</h2>
        <p className="text-slate-500 text-sm leading-relaxed mb-6">
          Upgrade to Premium to access the full Workspace — save grants, track your stage, generate AI-powered narratives, and manage all your documents in one place.
        </p>
        <button onClick={() => setPaywallOpen(true)}
          className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
          Unlock Workspace — $15/mo <ChevronRight className="w-4 h-4" />
        </button>
        <p className="text-xs text-slate-400 mt-4">Cancel anytime · Secure payment via Stripe</p>
      </div>
      <PaywallModal isOpen={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────

export default function WorkspaceClient({ initialSlug }: { initialSlug?: string }) {
  const supabase = useMemo(() => getBrowserSupabase(), [])
  const [access, setAccess] = useState<AccessState>("loading")
  const [userId, setUserId] = useState<string | null>(null)
  const [grants, setGrants] = useState<Grant[]>([])
  const [stageMap, setStageMap] = useState<Record<string, Stage>>({})
  const [loading, setLoading] = useState(true)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(initialSlug ?? null)
  const [filter, setFilter] = useState<FilterStage>("all")
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("overview")

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setAccess("locked"); setLoading(false); return }
      setUserId(user.id)

      const { data: prof } = await supabase.from("profiles")
        .select("is_premium, is_admin, subscription_tier").eq("user_id", user.id).maybeSingle()
      const p = prof as { is_premium?: boolean; is_admin?: boolean; subscription_tier?: string } | null
      if (!Boolean(p?.is_admin) && !(Boolean(p?.is_premium) && p?.subscription_tier === "premium")) {
        setAccess("locked"); setLoading(false); return
      }
      setAccess("unlocked")

      const saved = await getSavedPrograms(supabase, user.id)
      const savedSlugs = new Set(saved.map((s) => s.slug))

      const { data: grantData } = await supabase.from("grants").select("*").order("name")
      const all = (grantData ?? []) as Grant[]
      const working = all.filter((g) => savedSlugs.has(g.slug))
      if (initialSlug && !savedSlugs.has(initialSlug)) {
        const extra = all.find((g) => g.slug === initialSlug)
        if (extra) working.unshift(extra)
      }
      setGrants(working)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: stageRows } = await (supabase as any).from("saved_programs")
        .select("program_slug, stage").eq("user_id", user.id)
      const stages: Record<string, Stage> = {}
      for (const row of (stageRows ?? []) as { program_slug: string; stage?: string }[]) {
        stages[row.program_slug] = (row.stage ?? "interested") as Stage
      }
      setStageMap(stages)

      if (!selectedSlug && working.length > 0) setSelectedSlug(working[0].slug)
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase])

  const grant = grants.find((g) => g.slug === selectedSlug) ?? null

  const visible = useMemo(() =>
    filter === "all" ? grants : grants.filter((g) => (stageMap[g.slug] ?? "interested") === filter),
    [grants, stageMap, filter]
  )

  async function handleStageChange(newStage: Stage) {
    if (!grant || !userId) return
    const slug = grant.slug
    setStageMap((m) => ({ ...m, [slug]: newStage }))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("saved_programs") as any)
      .update({ stage: newStage, updated_at: new Date().toISOString() })
      .eq("user_id", userId).eq("program_slug", slug)
  }

  if (access === "loading" || loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (access === "locked") return <PremiumGate />

  if (grants.length === 0) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 max-w-md w-full text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 grid place-items-center mx-auto mb-4">
            <FileText className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No saved grants yet</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">Save grants you&apos;re interested in, then manage your applications here.</p>
          <Link href="/grants" className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
            Browse grants <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex">
      {/* Left panel — sidebar */}
      <aside className="w-72 shrink-0 border-r border-slate-200 bg-white flex flex-col sticky top-16 h-[calc(100vh-64px)]">
        <div className="px-3 py-3 border-b border-slate-100 shrink-0">
          <div className="flex flex-wrap gap-1">
            {FILTER_OPTS.map((opt) => (
              <button key={opt.value} onClick={() => setFilter(opt.value)}
                className={`h-6 px-2.5 rounded-md text-[11px] font-semibold transition-colors ${
                  filter === opt.value ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {visible.length === 0
            ? <p className="text-xs text-slate-400 text-center pt-8">No grants match this filter.</p>
            : visible.map((g) => (
                <GrantSidebarItem key={g.slug} grant={g} stage={stageMap[g.slug] ?? "interested"}
                  active={g.slug === selectedSlug}
                  onClick={() => { setSelectedSlug(g.slug); setActiveTab("overview") }} />
              ))
          }
        </div>
      </aside>

      {/* Right panel */}
      <main className="flex-1 flex flex-col min-w-0 min-h-[calc(100vh-64px)]">
        {grant ? (
          <>
            {/* Stage tracker */}
            <div className="px-6 py-4 border-b border-slate-200 bg-white shrink-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Application Stage</p>
              <StageTracker stage={stageMap[grant.slug] ?? "interested"} onChange={handleStageChange} />
            </div>

            {/* Closed grant banner */}
            {!!grant.deadline && new Date(grant.deadline).getTime() < Date.now() && (
              <div className="px-6 py-3 border-b border-rose-200 bg-rose-50 shrink-0 flex items-start gap-2.5">
                <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 8v4m0 4h.01" />
                </svg>
                <p className="text-sm text-rose-800">
                  <span className="font-semibold">Applications are currently closed.</span>{" "}
                  {grant.is_recurring
                    ? <>This is a recurring grant — the next cycle is estimated to open around <strong>{(() => { const d = new Date(grant.deadline!); d.setFullYear(d.getFullYear() + 1); return d.toLocaleDateString("en-US", { month: "long", year: "numeric" }) })()}</strong>. You can still prepare your materials here.</>
                    : <>This grant cycle has ended. Check the <a href={grant.official_source_url ?? "#"} target="_blank" rel="noopener noreferrer" className="underline">official source</a> for future opportunities. You can still use this workspace to prepare.</>
                  }
                </p>
              </div>
            )}

            {/* Tab bar */}
            <div className="flex border-b border-slate-200 bg-white px-6 shrink-0">
              {TABS.map((tab) => (
                <button key={tab.value} onClick={() => setActiveTab(tab.value)}
                  className={`py-3 px-1 mr-6 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.value ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto py-5 px-5">
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  {activeTab === "overview" && (
                    <OverviewTab grant={grant} onStartApplication={() => setActiveTab("forms")} />
                  )}
                  {activeTab === "narrative" && userId && (
                    <NarrativeBuilderTab grant={grant} userId={userId} />
                  )}
                  {activeTab === "forms" && userId && (
                    <FormsTab grant={grant} userId={userId} />
                  )}
                  {activeTab === "notes" && userId && (
                    <NotesTab grant={grant} userId={userId} />
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-slate-400">
            Select a grant to get started
          </div>
        )}
      </main>
    </div>
  )
}
