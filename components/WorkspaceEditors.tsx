"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { BookOpen, Check, ChevronLeft, ChevronRight, Download, ExternalLink, RefreshCw, Send, Sparkles } from "lucide-react"
import type { Grant } from "@/lib/types"
import { getBrowserSupabase } from "@/lib/supabase-browser"
import { GovFormFiller } from "@/components/GovFormFiller"

// ── OverviewTab ────────────────────────────────────────────────────────────

function fmtAmt(n: number | null) {
  if (!n) return "Varies"
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

function fmtVerified(s: string | null) {
  if (!s) return null
  const diff = Math.round((Date.now() - new Date(s).getTime()) / 86400000)
  if (diff === 0) return "Verified today"
  if (diff === 1) return "Last verified yesterday"
  return `Last verified ${diff} days ago`
}

export function OverviewTab({ grant, onStartApplication }: { grant: Grant; onStartApplication: () => void }) {
  const verifiedText = fmtVerified(grant.last_verified_at)
  const eligList: string[] = Array.isArray(grant.eligibility_criteria)
    ? (grant.eligibility_criteria as string[])
    : Object.entries(grant.eligibility_criteria as Record<string, unknown>)
        .filter(([, v]) => v !== null && v !== undefined && v !== false)
        .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`)

  return (
    <div className="p-5 grid gap-5">
      <div className="flex flex-wrap gap-3">
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex-1 min-w-28">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Funder</p>
          <p className="text-sm font-semibold text-slate-800 mt-0.5">{grant.agency}</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex-1 min-w-28">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Max Award</p>
          <p className="text-sm font-semibold text-blue-700 mt-0.5">{fmtAmt(grant.max_amount)}</p>
        </div>
        {grant.funding_source && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex-1 min-w-28">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Source</p>
            <p className="text-sm font-semibold text-slate-800 mt-0.5 capitalize">{grant.funding_source}</p>
          </div>
        )}
      </div>

      {grant.description && (
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-1">About this grant</p>
          <p className="text-sm text-slate-600 leading-relaxed">{grant.description}</p>
        </div>
      )}

      {eligList.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-2">Eligibility</p>
          <ul className="grid gap-1.5">
            {eligList.slice(0, 12).map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <Check className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" strokeWidth={2.5} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-100">
        {verifiedText && (
          <span className="text-xs text-slate-400 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md">{verifiedText}</span>
        )}
        {grant.official_source_url && (
          <a href={grant.official_source_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:underline">
            Official source <ExternalLink className="w-3 h-3" />
          </a>
        )}
        <button onClick={onStartApplication}
          className="ml-auto inline-flex items-center gap-1.5 h-8 px-4 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors">
          Start Application →
        </button>
      </div>
    </div>
  )
}

// ── GrantGuidelines ────────────────────────────────────────────────────────

type GuidelineSection = { heading: string; items: string[] }

function GrantGuidelines({ grant }: { grant: Grant }) {
  const supabase = getBrowserSupabase()
  const [sections, setSections] = useState<GuidelineSection[]>([])
  const [loading, setLoading] = useState(Boolean(grant.official_source_url))

  useEffect(() => {
    if (!grant.official_source_url) { setLoading(false); return }
    let cancelled = false
    ;(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const res = await fetch("/api/workspace/grant-guidelines", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token ?? ""}` },
          body: JSON.stringify({ grantId: grant.id, officialSourceUrl: grant.official_source_url, grantName: grant.name }),
        })
        if (!cancelled && res.ok) {
          const json = await res.json() as { sections: GuidelineSection[] }
          if (!cancelled) setSections(json.sections ?? [])
        }
      } catch { /* leave empty */ }
      if (!cancelled) setLoading(false)
    })()
    return () => { cancelled = true }
  }, [grant.official_source_url, grant.name, supabase])

  const eligList: string[] = Array.isArray(grant.eligibility_criteria)
    ? (grant.eligibility_criteria as string[])
    : Object.entries(grant.eligibility_criteria as Record<string, unknown>)
        .filter(([, v]) => v !== null && v !== undefined && v !== false)
        .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`)

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
      {/* Funder / basic info */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Funder</p>
        <p className="text-xs font-semibold text-slate-800">{grant.agency}</p>
        {grant.description && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{grant.description}</p>}
      </div>

      {/* Eligibility */}
      {eligList.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Eligibility</p>
          <ul className="space-y-1.5">
            {eligList.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                <Check className="w-3 h-3 text-blue-500 mt-0.5 shrink-0" strokeWidth={2.5} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Fetched NOFO requirements */}
      {loading && (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-3 h-3 border border-slate-300 border-t-blue-400 rounded-full animate-spin shrink-0" />
          Checking official requirements…
        </div>
      )}

      {!loading && sections.length === 0 && grant.official_source_url && (
        <div className="text-xs text-slate-400 italic">
          No specific formatting requirements found from the official source.
        </div>
      )}

      {sections.map((section) => (
        <div key={section.heading}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">{section.heading}</p>
          <ul className="space-y-1.5">
            {section.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                <span className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}

      {grant.official_source_url && (
        <div className="pt-2 border-t border-slate-100">
          <a href={grant.official_source_url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:underline">
            View official NOFO <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  )
}

// ── NarrativeQuestionnaire ─────────────────────────────────────────────────

type QuestionnaireAnswers = {
  orgName: string
  orgMission: string
  projectDescription: string
  targetPopulation: string
  expectedOutcomes: string
  pastExperience: string
}

type QField = { key: keyof QuestionnaireAnswers; label: string; placeholder: string; rows: number }

const CATEGORY_FIELDS: Record<string, QField[]> = {
  research: [
    { key: "orgName",            label: "Lead investigator or institution",         placeholder: "e.g. Dr. Jane Smith, MIT",                                      rows: 1 },
    { key: "orgMission",         label: "What is the research problem or question?", placeholder: "The scientific question, gap, or hypothesis you're addressing…", rows: 3 },
    { key: "projectDescription", label: "What is your proposed approach or method?", placeholder: "Research design, methods, and key activities…",                 rows: 3 },
    { key: "targetPopulation",   label: "Why is this research significant or novel?", placeholder: "What prior work does it build on? What gap does it fill?",     rows: 2 },
    { key: "expectedOutcomes",   label: "What deliverables or results do you expect?", placeholder: "e.g. publications, datasets, prototypes, clinical outcomes…", rows: 2 },
    { key: "pastExperience",     label: "Relevant prior work, publications, or funding?", placeholder: "Grants received, key publications, team credentials…",     rows: 2 },
  ],
  small_business: [
    { key: "orgName",            label: "Business name",                              placeholder: "e.g. Bright Innovations LLC",                                   rows: 1 },
    { key: "orgMission",         label: "What does your business do?",               placeholder: "Your product or service and the problem you solve…",            rows: 3 },
    { key: "projectDescription", label: "What will you do with this grant?",         placeholder: "Specific activity — R&D, market launch, hiring, equipment…",   rows: 3 },
    { key: "targetPopulation",   label: "Who are your customers or end beneficiaries?", placeholder: "e.g. small farms in the Midwest, underserved urban communities…", rows: 2 },
    { key: "expectedOutcomes",   label: "What business outcomes do you expect?",     placeholder: "e.g. launch MVP, create 5 jobs, reach $500K revenue…",         rows: 2 },
    { key: "pastExperience",     label: "Business track record or relevant experience?", placeholder: "Founding year, prior contracts, awards, key team background…", rows: 2 },
  ],
  arts: [
    { key: "orgName",            label: "Artist or organization name",               placeholder: "e.g. Open Canvas Collective",                                   rows: 1 },
    { key: "orgMission",         label: "Describe the artistic project and medium",  placeholder: "What kind of work? What is your artistic vision?",              rows: 3 },
    { key: "projectDescription", label: "What will this grant fund?",               placeholder: "Creation, exhibition, residency, community events…",            rows: 3 },
    { key: "targetPopulation",   label: "Who is the intended audience or community?", placeholder: "Geographic area, demographic, how many people engaged…",      rows: 2 },
    { key: "expectedOutcomes",   label: "What artistic and community outcomes do you expect?", placeholder: "e.g. exhibit 12 works, engage 500 community members…", rows: 2 },
    { key: "pastExperience",     label: "Relevant past work, exhibitions, or residencies?", placeholder: "Prior grants, shows, commissions, partnerships…",        rows: 2 },
  ],
  education: [
    { key: "orgName",            label: "Institution or program name",               placeholder: "e.g. Lincoln Elementary, Reading First Program",                rows: 1 },
    { key: "orgMission",         label: "What is the educational program?",          placeholder: "Program, grade levels, subject area, and students served…",    rows: 3 },
    { key: "projectDescription", label: "What will this grant fund?",               placeholder: "Curriculum, training, technology, staffing, equipment…",       rows: 3 },
    { key: "targetPopulation",   label: "Who are the learners?",                     placeholder: "Grade levels, demographics, number of students, location…",    rows: 2 },
    { key: "expectedOutcomes",   label: "What learning outcomes do you expect?",     placeholder: "e.g. improve reading scores 20%, train 50 teachers…",          rows: 2 },
    { key: "pastExperience",     label: "Prior programs, grants, or student results?", placeholder: "Relevant history, accreditations, previous grant outcomes…", rows: 2 },
  ],
  health: [
    { key: "orgName",            label: "Organization or clinic name",               placeholder: "e.g. Community Health Alliance",                                rows: 1 },
    { key: "orgMission",         label: "What health need or disparity does this address?", placeholder: "Health problem, target population, and geographic area…", rows: 3 },
    { key: "projectDescription", label: "What intervention or services will this fund?", placeholder: "Screenings, outreach, training, equipment, staffing…",     rows: 3 },
    { key: "targetPopulation",   label: "Who will receive services?",                placeholder: "Demographics, location, estimated number of patients…",        rows: 2 },
    { key: "expectedOutcomes",   label: "What health outcomes do you expect?",       placeholder: "e.g. reduce ER visits 15%, screen 1,000 patients…",            rows: 2 },
    { key: "pastExperience",     label: "Relevant clinical experience or past programs?", placeholder: "Certifications, prior grants, partner orgs, patient data…", rows: 2 },
  ],
  agricultural: [
    { key: "orgName",            label: "Farm or organization name",                 placeholder: "e.g. Sunrise Family Farm",                                      rows: 1 },
    { key: "orgMission",         label: "Describe your agricultural operation",      placeholder: "Type of farming, acreage, crops/livestock, years in operation…", rows: 3 },
    { key: "projectDescription", label: "What will this grant fund?",               placeholder: "Equipment, conservation practices, infrastructure, land…",      rows: 3 },
    { key: "targetPopulation",   label: "Who else benefits beyond your farm?",       placeholder: "Local food system, community, environment, downstream buyers…", rows: 2 },
    { key: "expectedOutcomes",   label: "What improvements do you expect?",          placeholder: "e.g. reduce erosion 30%, improve water quality, expand 200 ac…", rows: 2 },
    { key: "pastExperience",     label: "Farming history and prior USDA programs?",  placeholder: "Years farming, prior grant participation, certifications…",     rows: 2 },
  ],
  veterans: [
    { key: "orgName",            label: "Organization or program name",              placeholder: "e.g. Valor Transition Services",                                rows: 1 },
    { key: "orgMission",         label: "How does your organization serve veterans?", placeholder: "Mission, services offered, and veteran population served…",    rows: 3 },
    { key: "projectDescription", label: "What will this grant fund?",               placeholder: "Job training, housing, mental health, benefits outreach…",      rows: 3 },
    { key: "targetPopulation",   label: "Which veterans will benefit?",              placeholder: "Era (Vietnam, post-9/11), demographics, location, number…",    rows: 2 },
    { key: "expectedOutcomes",   label: "What outcomes do you expect for veterans?", placeholder: "e.g. place 50 in jobs, house 20 vets, serve 200 in counseling…", rows: 2 },
    { key: "pastExperience",     label: "Experience serving veterans?",              placeholder: "Prior programs, VA partnerships, certifications, veteran staff…", rows: 2 },
  ],
  housing: [
    { key: "orgName",            label: "Organization or developer name",            placeholder: "e.g. Affordable Homes Initiative",                              rows: 1 },
    { key: "orgMission",         label: "What housing need does this address?",      placeholder: "Housing gap, affordability crisis, or population in need…",     rows: 3 },
    { key: "projectDescription", label: "What will this grant fund?",               placeholder: "Construction, rehab, rental assistance, homeownership…",       rows: 3 },
    { key: "targetPopulation",   label: "Who will be housed or served?",             placeholder: "Income level, household type, demographics, number of units…", rows: 2 },
    { key: "expectedOutcomes",   label: "What housing outcomes do you expect?",      placeholder: "e.g. create 40 affordable units, prevent 50 evictions…",       rows: 2 },
    { key: "pastExperience",     label: "Experience in affordable housing?",         placeholder: "Prior projects, HUD experience, LIHTC, community partners…",   rows: 2 },
  ],
  energy: [
    { key: "orgName",            label: "Organization or project name",              placeholder: "e.g. SolarEdge Cooperative",                                    rows: 1 },
    { key: "orgMission",         label: "What energy problem or opportunity is this?", placeholder: "Technology, energy source, or efficiency challenge…",         rows: 3 },
    { key: "projectDescription", label: "What will this grant fund?",               placeholder: "R&D, installation, pilot program, grid work, workforce…",      rows: 3 },
    { key: "targetPopulation",   label: "Who benefits from this project?",           placeholder: "Households, businesses, communities, grid users, job seekers…", rows: 2 },
    { key: "expectedOutcomes",   label: "What energy or environmental results do you expect?", placeholder: "e.g. 2 MW installed, 500 homes powered, reduce 1,000 tons CO2…", rows: 2 },
    { key: "pastExperience",     label: "Technical background or past deployments?", placeholder: "Prior installs, patents, team qualifications, DOE experience…", rows: 2 },
  ],
  individual: [
    { key: "orgName",            label: "Your name",                                 placeholder: "e.g. Maria Gonzalez",                                           rows: 1 },
    { key: "orgMission",         label: "Describe yourself and your background",     placeholder: "Your field, career stage, and what drives your work…",          rows: 3 },
    { key: "projectDescription", label: "What will you use this grant for?",         placeholder: "Specific project, study, creative work, or professional goal…", rows: 3 },
    { key: "targetPopulation",   label: "Who else benefits from your work?",         placeholder: "Community, field, audience, or population impacted…",           rows: 2 },
    { key: "expectedOutcomes",   label: "What do you expect to accomplish?",         placeholder: "Concrete deliverables, milestones, or outcomes…",               rows: 2 },
    { key: "pastExperience",     label: "Relevant past work or qualifications?",     placeholder: "Degrees, awards, prior projects, publications…",                rows: 2 },
  ],
}

const DEFAULT_FIELDS: QField[] = [
  { key: "orgName",            label: "Your name or organization",          placeholder: "e.g. Sunrise Community Center",              rows: 1 },
  { key: "orgMission",         label: "What does your organization do?",    placeholder: "Briefly describe your mission or work…",     rows: 3 },
  { key: "projectDescription", label: "What will you use this grant for?",  placeholder: "The specific project or activity…",          rows: 3 },
  { key: "targetPopulation",   label: "Who will benefit?",                  placeholder: "e.g. low-income youth in rural areas…",      rows: 2 },
  { key: "expectedOutcomes",   label: "What results do you expect?",        placeholder: "e.g. serve 200 families, create 10 jobs…",   rows: 2 },
  { key: "pastExperience",     label: "Relevant past work or experience?",  placeholder: "Awards, prior programs, partnerships…",      rows: 2 },
]

function NarrativeQuestionnaire({ grant, userId, initial, onSubmit, onCancel }: {
  grant: Grant
  userId: string
  initial: Partial<QuestionnaireAnswers>
  onSubmit: (a: QuestionnaireAnswers) => void
  onCancel: () => void
}) {
  const supabase = getBrowserSupabase()
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({
    orgName: initial.orgName ?? "",
    orgMission: initial.orgMission ?? "",
    projectDescription: initial.projectDescription ?? "",
    targetPopulation: initial.targetPopulation ?? "",
    expectedOutcomes: initial.expectedOutcomes ?? "",
    pastExperience: initial.pastExperience ?? "",
  })
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [scraping, setScraping] = useState(false)
  const [scrapeMsg, setScrapeMsg] = useState("")

  const fields = CATEGORY_FIELDS[grant.category] ?? DEFAULT_FIELDS

  useEffect(() => {
    if (initial.orgName) return
    supabase.from("profiles").select("full_name").eq("user_id", userId).maybeSingle()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(({ data }: { data: any }) => {
        if (data?.full_name) setAnswers(a => ({ ...a, orgName: a.orgName || data.full_name }))
      })
  }, [userId, supabase, initial.orgName])

  async function fetchWebsite() {
    const url = websiteUrl.trim()
    if (!url) return
    setScraping(true)
    setScrapeMsg("")
    try {
      const res = await fetch("/api/scrape-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json() as { interpretation?: string }
      if (data.interpretation) {
        setAnswers(a => ({ ...a, orgMission: a.orgMission || data.interpretation! }))
        setScrapeMsg("Filled in from your website")
      } else {
        setScrapeMsg("No description found — fill in manually")
      }
    } catch {
      setScrapeMsg("Could not read that website — fill in manually")
    }
    setScraping(false)
  }

  function set(k: keyof QuestionnaireAnswers, v: string) {
    setAnswers(a => ({ ...a, [k]: v }))
  }

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-4">
      <div>
        <p className="text-sm font-semibold text-slate-800">Tell us about your application</p>
        <p className="text-xs text-slate-500 mt-0.5">Your answers help the AI write a narrative specific to this grant.</p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Your website <span className="font-normal text-slate-400">(optional — we&apos;ll read it to fill in your description)</span>
        </label>
        <div className="flex gap-2">
          <input type="url" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") fetchWebsite() }}
            placeholder="https://yourorg.com"
            className="flex-1 h-8 rounded-lg border border-slate-200 px-3 text-xs text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors" />
          <button onClick={fetchWebsite} disabled={!websiteUrl.trim() || scraping}
            className="h-8 px-3 rounded-lg bg-slate-100 text-xs font-semibold text-slate-600 hover:bg-slate-200 disabled:opacity-50 transition-colors shrink-0 flex items-center gap-1">
            {scraping ? <span className="w-3 h-3 border border-slate-500 border-t-transparent rounded-full animate-spin block" /> : "Fetch"}
          </button>
        </div>
        {scrapeMsg && (
          <p className={`text-[11px] mt-1 ${scrapeMsg.startsWith("Filled") ? "text-emerald-600" : "text-rose-500"}`}>{scrapeMsg}</p>
        )}
      </div>

      {fields.map(({ key, label, placeholder, rows }) => (
        <div key={key}>
          <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
          {rows === 1
            ? <input type="text" value={answers[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder}
                className="w-full h-8 rounded-lg border border-slate-200 px-3 text-xs text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors" />
            : <textarea value={answers[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder} rows={rows}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors resize-none leading-relaxed" />
          }
        </div>
      ))}

      <div className="flex gap-2 pt-1 pb-2">
        <button onClick={onCancel}
          className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
          Cancel
        </button>
        <button onClick={() => onSubmit(answers)}
          className="flex-1 inline-flex items-center justify-center gap-2 h-9 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors">
          <Sparkles className="w-3.5 h-3.5" /> Generate Narrative
        </button>
      </div>
    </div>
  )
}

// ── NarrativeBuilderTab ────────────────────────────────────────────────────

type ChatMsg = { role: "user" | "ai"; content: string; isError?: boolean }

export function NarrativeBuilderTab({ grant, userId }: { grant: Grant; userId: string }) {
  const supabase = getBrowserSupabase()
  const [draft, setDraft] = useState("")
  const [lastSavedDraft, setLastSavedDraft] = useState("")
  const [savedBadge, setSavedBadge] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([])
  const [chatInput, setChatInput] = useState("")
  const [genError, setGenError] = useState("")
  const [rightTab, setRightTab] = useState<"guidelines" | "ai-edit">("guidelines")
  const [manualMode, setManualMode] = useState(false)
  const [showQuestionnaire, setShowQuestionnaire] = useState(false)
  const [questAnswers, setQuestAnswers] = useState<Partial<QuestionnaireAnswers>>({})
  const chatEndRef = useRef<HTMLDivElement>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(supabase as any).from("workspace_drafts").select("narrative_text")
      .eq("user_id", userId).eq("grant_id", grant.id).maybeSingle()
      .then(({ data }: { data: { narrative_text?: string } | null }) => {
        if (data?.narrative_text) { setDraft(data.narrative_text); setLastSavedDraft(data.narrative_text) }
      })
  }, [grant.id, userId, supabase])

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [chatMsgs])

  const persistDraft = useCallback(async (text: string) => {
    if (!text.trim()) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("workspace_drafts").upsert(
      { user_id: userId, grant_id: grant.id, narrative_text: text, generated_at: new Date().toISOString() },
      { onConflict: "user_id,grant_id" }
    )
    setLastSavedDraft(text)
    setSavedBadge(true)
    setTimeout(() => setSavedBadge(false), 2000)
  }, [supabase, userId, grant.id])

  function handleBlur() {
    if (draft === lastSavedDraft) return
    clearTimeout(saveTimerRef.current ?? undefined)
    saveTimerRef.current = setTimeout(() => persistDraft(draft), 500)
  }

  function openQuestionnaire() {
    if (draft.trim() && draft !== lastSavedDraft) {
      if (!confirm("Regenerate will overwrite your current draft. Continue?")) return
    }
    setShowQuestionnaire(true)
  }

  async function handleGenerateWithAnswers(answers: QuestionnaireAnswers) {
    setQuestAnswers(answers)
    setShowQuestionnaire(false)
    setIsGenerating(true)
    setGenError("")
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch("/api/workspace/generate-narrative", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token ?? ""}` },
        body: JSON.stringify({
          grantId: grant.id, grantName: grant.name, agencyName: grant.agency,
          fundingSource: grant.funding_source, grantDescription: grant.description,
          eligibilityRequirements: Array.isArray(grant.eligibility_criteria) ? grant.eligibility_criteria : [],
          grantAmount: grant.max_amount, deadline: grant.deadline,
          orgName: answers.orgName, orgMission: answers.orgMission,
          projectDescription: answers.projectDescription, targetPopulation: answers.targetPopulation,
          expectedOutcomes: answers.expectedOutcomes, pastExperience: answers.pastExperience,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      const json = await res.json() as { narrative: string }
      setDraft(json.narrative)
      setLastSavedDraft(json.narrative)
      setManualMode(false)
      setChatMsgs([])
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "Generation failed. Please try again.")
    }
    setIsGenerating(false)
  }

  async function handleSend() {
    const msg = chatInput.trim()
    if (!msg || isEditing || !draft.trim()) return
    setChatMsgs((m) => [...m, { role: "user", content: msg }])
    setChatInput("")
    setIsEditing(true)
    const snapshotDraft = draft
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch("/api/workspace/edit-narrative", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token ?? ""}` },
        body: JSON.stringify({ grantId: grant.id, grantName: grant.name, currentDraft: snapshotDraft, userMessage: msg }),
      })
      if (!res.ok) throw new Error(await res.text())
      const reader = res.body?.getReader()
      if (!reader) throw new Error("No stream")
      const dec = new TextDecoder()
      let accumulated = ""
      setDraft("")
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += dec.decode(value, { stream: true })
        setDraft(accumulated)
      }
      setLastSavedDraft(accumulated)
      setChatMsgs((m) => [...m, { role: "ai", content: "✓ Applied" }])
    } catch {
      setDraft(snapshotDraft)
      setChatMsgs((m) => [...m, { role: "ai", content: "Edit failed. Please try again.", isError: true }])
    }
    setIsEditing(false)
  }

  function exportPDF() {
    const win = window.open("", "_blank")
    if (!win) return
    const escaped = draft.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    win.document.write(`<html><head><title>${grant.name} — Narrative</title><style>body{font-family:Georgia,serif;max-width:680px;margin:40px auto;line-height:1.75;font-size:13pt;color:#1e293b}h1{font-size:17pt;margin-bottom:4px}p.sub{color:#64748b;font-size:11pt;margin-top:0}hr{border:none;border-top:1px solid #e2e8f0;margin:24px 0}pre{white-space:pre-wrap;font-family:Georgia,serif;font-size:13pt;margin:0}</style></head><body><h1>${grant.name}</h1><p class="sub">${grant.agency}</p><hr/><pre>${escaped}</pre></body></html>`)
    win.document.close()
    win.print()
  }

  if (showQuestionnaire) {
    return (
      <div className="flex" style={{ minHeight: "500px" }}>
        <div className="flex flex-col border-r border-slate-200 overflow-hidden" style={{ flex: "0 0 65%" }}>
          <NarrativeQuestionnaire
            grant={grant}
            userId={userId}
            initial={questAnswers}
            onSubmit={handleGenerateWithAnswers}
            onCancel={() => setShowQuestionnaire(false)}
          />
        </div>
        <div className="flex flex-col" style={{ flex: "0 0 35%" }}>
          <div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50 shrink-0 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <p className="text-xs font-semibold text-slate-500">Grant Guidelines</p>
          </div>
          <GrantGuidelines grant={grant} />
        </div>
      </div>
    )
  }

  if (!draft && !isGenerating && !manualMode) {
    return (
      <div className="flex" style={{ minHeight: "500px" }}>
        <div className="flex flex-col items-center justify-center border-r border-slate-200 p-8 text-center gap-4" style={{ flex: "0 0 65%" }}>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 grid place-items-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Write your narrative</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Type directly below, or let AI draft a narrative based on this grant&apos;s requirements.</p>
          </div>
          {genError && <p className="text-xs text-rose-600 max-w-xs">{genError}</p>}
          <div className="flex flex-col gap-2 w-full max-w-xs">
            <button onClick={() => setManualMode(true)}
              className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors">
              Start writing
            </button>
            <button onClick={openQuestionnaire}
              className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
              <Sparkles className="w-4 h-4" /> Generate with AI
            </button>
          </div>
        </div>
        <div className="flex flex-col" style={{ flex: "0 0 35%" }}>
          <div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50 shrink-0 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <p className="text-xs font-semibold text-slate-500">Grant Guidelines</p>
          </div>
          <GrantGuidelines grant={grant} />
        </div>
      </div>
    )
  }

  if (isGenerating) {
    return (
      <div className="flex" style={{ minHeight: "500px" }}>
        <div className="flex flex-col items-center justify-center border-r border-slate-200 p-8 gap-3 text-center" style={{ flex: "0 0 65%" }}>
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-600">Researching grant requirements and drafting narrative…</p>
          <p className="text-xs text-slate-400">This may take up to 30 seconds</p>
        </div>
        <div className="flex flex-col" style={{ flex: "0 0 35%" }}>
          <div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50 shrink-0 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <p className="text-xs font-semibold text-slate-500">Grant Guidelines</p>
          </div>
          <GrantGuidelines grant={grant} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex" style={{ minHeight: "500px" }}>
      {/* Left zone — editable narrative 65% */}
      <div className="flex flex-col border-r border-slate-200" style={{ flex: "0 0 65%" }}>
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50 shrink-0">
          <span className="text-xs font-semibold text-slate-500 truncate mr-2">{grant.name} · draft</span>
          <div className="flex items-center gap-1.5 shrink-0">
            {savedBadge && <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Saved</span>}
            <button onClick={exportPDF}
              className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md border border-slate-200 bg-white text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              <Download className="w-3 h-3" /> Save as PDF
            </button>
            <button onClick={openQuestionnaire}
              className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md border border-slate-200 bg-white text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              <RefreshCw className="w-3 h-3" /> Regen
            </button>
          </div>
        </div>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleBlur}
          disabled={isEditing}
          className="flex-1 resize-none p-4 text-sm leading-relaxed text-slate-800 bg-white outline-none font-[inherit] disabled:opacity-60"
          style={{ minHeight: "460px" }}
        />
      </div>

      {/* Right zone — Guidelines / AI edit 35% */}
      <div className="flex flex-col" style={{ flex: "0 0 35%" }}>
        <div className="flex border-b border-slate-100 bg-slate-50 shrink-0">
          <button onClick={() => setRightTab("guidelines")}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-semibold border-b-2 transition-colors ${
              rightTab === "guidelines" ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}>
            <BookOpen className="w-3 h-3" /> Guidelines
          </button>
          <button onClick={() => setRightTab("ai-edit")}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-semibold border-b-2 transition-colors ${
              rightTab === "ai-edit" ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}>
            <Sparkles className="w-3 h-3" /> Edit with AI
          </button>
        </div>

        {rightTab === "guidelines" && <GrantGuidelines grant={grant} />}

        {rightTab === "ai-edit" && (
          <>
            <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ minHeight: "380px" }}>
              {chatMsgs.length === 0 && (
                <p className="text-xs text-slate-400 text-center pt-8 leading-relaxed px-2">
                  Ask AI to edit your narrative…<br />
                  e.g. &ldquo;Make the opening more concise&rdquo;
                </p>
              )}
              {chatMsgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[90%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                    m.role === "user" ? "bg-blue-600 text-white" :
                    m.isError ? "bg-rose-50 text-rose-700 border border-rose-200" :
                    "bg-slate-100 text-slate-700"
                  }`}>{m.content}</div>
                </div>
              ))}
              {isEditing && (
                <div className="flex gap-1 px-2 pt-1">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="flex gap-2 p-3 border-t border-slate-100 shrink-0">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                disabled={isEditing}
                placeholder="Ask AI to edit…"
                rows={2}
                className="flex-1 resize-none rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors disabled:opacity-60"
              />
              <button onClick={handleSend} disabled={!chatInput.trim() || isEditing || !draft.trim()}
                className="self-end h-9 w-9 rounded-lg bg-blue-600 text-white grid place-items-center hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── FormsTab ───────────────────────────────────────────────────────────────

const FORM_REGISTRY: Array<{ match: RegExp; key: string }> = [
  // SF-424 family — more specific variants before the base to avoid false matches
  { match: /sf[-\s]?424[\s-]?a\b/i,                key: "sf-424a"   },
  { match: /sf[-\s]?424[\s-]?b\b/i,                key: "sf-424b"   },
  { match: /sf[-\s]?424[\s-]?c\b/i,                key: "sf-424c"   },
  { match: /sf[-\s]?424[\s-]?d\b/i,                key: "sf-424d"   },
  { match: /sf[-\s]?424\b/i,                        key: "sf-424"    },
  // Other Standard Forms
  { match: /sf[-\s]?lll\b/i,                        key: "sf-lll"    },
  { match: /sf[-\s]?3881\b/i,                       key: "sf-3881"   },
  { match: /sf[-\s]?270\b/i,                        key: "sf-270"    },
  { match: /sf[-\s]?425\b/i,                        key: "sf-425"    },
  // SBA forms
  { match: /sba[\s-]?(form[\s-]?)?912\b/i,          key: "sba-912"   },
  { match: /sba[\s-]?(form[\s-]?)?413\b/i,          key: "sba-413"   },
  { match: /sba[\s-]?(form[\s-]?)?1919\b/i,         key: "sba-1919"  },
  { match: /sba[\s-]?(form[\s-]?)?1010[\s-]?c\b/i,  key: "sba-1010c" },
]

function matchFormKey(doc: string): string | null {
  for (const { match, key } of FORM_REGISTRY) {
    if (match.test(doc)) return key
  }
  return null
}

type ProfileSeed = { full_name?: string; email?: string; phone_number?: string; state?: string; zip_code?: string } | null

function buildSeed(profile: ProfileSeed, grant: Grant): Record<string, string> {
  const seed: Record<string, string> = {}
  if (!profile) return seed
  const fullName = (profile.full_name ?? "").trim()
  if (fullName) {
    const parts = fullName.split(/\s+/)
    seed.legal_name     = fullName
    seed.applicant_name = fullName
    seed.entity_name    = fullName
    seed.contact_first  = parts[0] ?? ""
    seed.contact_last   = parts.length > 1 ? parts[parts.length - 1] : ""
    seed.auth_first     = parts[0] ?? ""
    seed.auth_last      = parts.length > 1 ? parts[parts.length - 1] : ""
    seed.auth_signature = fullName
    seed.signature      = fullName
    seed.sig_name       = fullName
  }
  if (profile.email)        { seed.contact_email = profile.email; seed.auth_email = profile.email }
  if (profile.phone_number) { seed.contact_tel   = profile.phone_number; seed.auth_tel = profile.phone_number; seed.sig_tel = profile.phone_number }
  if (profile.state)        { seed.addr_state    = profile.state;  seed.entity_state = profile.state }
  if (profile.zip_code)     { seed.addr_zip      = profile.zip_code; seed.entity_zip = profile.zip_code }
  if (grant.agency)         { seed.federal_agency = grant.agency;  seed.fed_dept = grant.agency }
  if (grant.name)           { seed.cfda_title    = grant.name;     seed.foa_title = grant.name; seed.project_title = grant.name }
  return seed
}

export function FormsTab({ grant, userId }: { grant: Grant; userId: string }) {
  const supabase = getBrowserSupabase()
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set())
  const [downloading, setDownloading] = useState(false)
  const [dlError, setDlError] = useState("")
  const [step, setStep] = useState(0)
  const [seed, setSeed] = useState<Record<string, string>>({})
  const [formValues, setFormValues] = useState<Record<number, Record<string, string>>>({})

  const docs = grant.required_documents
  const total = docs.length

  // Load saved form values from localStorage
  useEffect(() => {
    const saved: Record<number, Record<string, string>> = {}
    for (let i = 0; i < docs.length; i++) {
      const raw = localStorage.getItem(`workspace:${grant.slug}:form:${i}`)
      if (raw) { try { saved[i] = JSON.parse(raw) } catch { /* ignore */ } }
    }
    if (Object.keys(saved).length) setFormValues(saved)
  }, [grant.slug, docs.length])

  function getFormValues(i: number): Record<string, string> {
    return { ...seed, ...formValues[i] }
  }

  function handleFormChange(i: number, k: string, v: string) {
    setFormValues(prev => {
      const next = { ...prev, [i]: { ...(prev[i] ?? {}), [k]: v } }
      localStorage.setItem(`workspace:${grant.slug}:form:${i}`, JSON.stringify(next[i]))
      return next
    })
  }

  // Checklist from Supabase
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(supabase as any).from("workspace_checklist").select("checked_items")
      .eq("user_id", userId).eq("grant_id", grant.id).maybeSingle()
      .then(({ data }: { data: { checked_items?: number[] } | null }) => {
        if (Array.isArray(data?.checked_items)) setCheckedItems(new Set(data.checked_items as number[]))
      })
  }, [grant.id, userId, supabase])

  // Profile autofill seed
  useEffect(() => {
    supabase.from("profiles")
      .select("full_name, email, phone_number, state, zip_code")
      .eq("user_id", userId).maybeSingle()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(({ data }: { data: any }) => setSeed(buildSeed(data as ProfileSeed, grant)))
  }, [userId, grant, supabase])

  async function toggleItem(i: number) {
    setCheckedItems((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      const arr = [...next]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(supabase as any).from("workspace_checklist").upsert(
        { user_id: userId, grant_id: grant.id, checked_items: arr, updated_at: new Date().toISOString() },
        { onConflict: "user_id,grant_id" }
      )
      return next
    })
  }

  async function handlePrefill() {
    setDownloading(true)
    setDlError("")
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch("/api/grants/prefill", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token ?? ""}` },
        body: JSON.stringify({ grantSlug: grant.slug }),
      })
      if (!res.ok) throw new Error(await res.text())
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = Object.assign(document.createElement("a"), { href: url, download: `${grant.slug}-prefilled.pdf` })
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setDlError(err instanceof Error ? err.message : "Download failed. Please try again.")
    }
    setDownloading(false)
  }

  // No required documents — just show the SF-424 download
  if (total === 0) {
    return (
      <div className="p-5">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm font-semibold text-slate-800">Download Pre-filled SF-424</p>
            <p className="text-xs text-slate-500 mt-0.5">Auto-populated from your profile</p>
            {dlError && <p className="text-xs text-rose-600 mt-2">{dlError}</p>}
          </div>
          <button onClick={handlePrefill} disabled={downloading}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors shrink-0">
            {downloading ? <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating…</> : <><Download className="w-3.5 h-3.5" /> Download</>}
          </button>
        </div>
      </div>
    )
  }

  const currentDoc = docs[step]
  const currentFormKey = matchFormKey(currentDoc)
  const allDone = checkedItems.size === total

  return (
    <div className="flex flex-col">
      {/* Step indicator */}
      <div className="px-5 pt-4 pb-3 border-b border-slate-100 bg-slate-50 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-slate-500">
            Step {step + 1} of {total}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 tabular-nums">{checkedItems.size}/{total} complete</span>
            <button onClick={handlePrefill} disabled={downloading}
              className="inline-flex items-center gap-1 h-6 px-2.5 rounded-md border border-slate-200 bg-white text-[11px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60 transition-colors">
              {downloading ? <span className="w-2.5 h-2.5 border border-slate-400 border-t-transparent rounded-full animate-spin" /> : <Download className="w-2.5 h-2.5" />}
              SF-424
            </button>
            {dlError && <span className="text-[10px] text-rose-500">{dlError}</span>}
          </div>
        </div>
        {/* Step dots */}
        <div className="flex items-center">
          {docs.map((_, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <button onClick={() => setStep(i)}
                className={`w-7 h-7 rounded-full text-[11px] font-bold transition-all flex-none grid place-items-center ${
                  i === step
                    ? "bg-blue-600 text-white ring-4 ring-blue-100"
                    : checkedItems.has(i)
                    ? "bg-emerald-500 text-white hover:bg-emerald-600"
                    : "bg-slate-200 text-slate-500 hover:bg-slate-300"
                }`}>
                {checkedItems.has(i) && i !== step ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : i + 1}
              </button>
              {i < docs.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 rounded-full ${checkedItems.has(i) ? "bg-emerald-400" : "bg-slate-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current step content */}
      <div className="flex-1">
        {currentFormKey ? (
          <GovFormFiller
            formKey={currentFormKey}
            values={getFormValues(step)}
            onChange={(k, v) => handleFormChange(step, k, v)}
            onReady={() => toggleItem(step)}
            isReady={checkedItems.has(step)}
          />
        ) : (
          <div className="p-6 flex flex-col gap-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Required Document</p>
              <p className="text-lg font-semibold text-slate-900 leading-snug">{currentDoc}</p>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Prepare this document, then mark it ready when it&apos;s complete.
            </p>
            <button onClick={() => toggleItem(step)}
              className={`self-start inline-flex items-center gap-2.5 h-10 px-5 rounded-xl text-sm font-semibold border-2 transition-colors ${
                checkedItems.has(step)
                  ? "bg-emerald-50 border-emerald-400 text-emerald-700"
                  : "bg-white border-slate-300 text-slate-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
              }`}>
              <span className={`w-5 h-5 rounded-md grid place-items-center border-2 flex-none transition-colors ${
                checkedItems.has(step) ? "bg-emerald-500 border-emerald-500 text-white" : "border-current"
              }`}>
                {checkedItems.has(step) && <Check className="w-3 h-3" strokeWidth={3} />}
              </span>
              {checkedItems.has(step) ? "Marked as ready" : "Mark as ready"}
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50 shrink-0">
        <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}
          className="inline-flex items-center gap-1 h-9 px-3.5 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        {step < total - 1 ? (
          <button onClick={() => setStep((s) => s + 1)}
            className="inline-flex items-center gap-1 h-9 px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <span className={`text-sm font-semibold ${allDone ? "text-emerald-600" : "text-slate-400"}`}>
            {allDone ? "All documents ready ✓" : `${total - checkedItems.size} remaining`}
          </span>
        )}
      </div>
    </div>
  )
}

// ── NotesTab ───────────────────────────────────────────────────────────────

export function NotesTab({ grant, userId }: { grant: Grant; userId: string }) {
  const supabase = getBrowserSupabase()
  const [notes, setNotes] = useState("")
  const [savedNotes, setSavedNotes] = useState("")
  const [savedBadge, setSavedBadge] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(supabase as any).from("workspace_notes").select("content")
      .eq("user_id", userId).eq("grant_id", grant.id).maybeSingle()
      .then(({ data }: { data: { content?: string } | null }) => {
        if (data?.content) { setNotes(data.content); setSavedNotes(data.content) }
      })
  }, [grant.id, userId, supabase])

  function handleBlur() {
    if (notes === savedNotes) return
    clearTimeout(saveTimerRef.current ?? undefined)
    saveTimerRef.current = setTimeout(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("workspace_notes").upsert(
        { user_id: userId, grant_id: grant.id, content: notes, updated_at: new Date().toISOString() },
        { onConflict: "user_id,grant_id" }
      )
      setSavedNotes(notes)
      setSavedBadge(true)
      setTimeout(() => setSavedBadge(false), 2000)
    }, 500)
  }

  return (
    <div className="p-4">
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50">
          <span className="text-xs font-semibold text-slate-500 truncate">Notes — {grant.name}</span>
          {savedBadge && <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0 ml-2">Saved</span>}
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={handleBlur}
          placeholder="Jot down notes, deadlines, contact info, or anything else relevant to this application…"
          className="w-full p-4 text-sm leading-relaxed text-slate-800 bg-transparent outline-none resize-none font-[inherit]"
          style={{ minHeight: "340px" }}
        />
      </div>
    </div>
  )
}
