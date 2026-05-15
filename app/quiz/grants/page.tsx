"use client"

import { useState } from "react"
import Link from "next/link"
import type { Grant, EligibilityCriteria } from "@/lib/types"

// ─── Types ───────────────────────────────────────────────────────────────────

type Category = "small_business" | "agricultural" | "research" | "arts" | "veterans" | "individual"

interface Profile {
  category: Category | null
  // Small Business
  employeeCount?: number
  revenue?: number
  industry?: string
  isMinorityOwned?: boolean
  isWomanOwned?: boolean
  isRural?: boolean
  // Agricultural
  isBeginningFarmer?: boolean
  isSociallyDisadvantaged?: boolean
  hasOrganicFocus?: boolean
  hasConservationFocus?: boolean
  hasExportFocus?: boolean
  farmType?: string
  // Research
  researchField?: string
  careerStage?: string
  isCitizen?: boolean
  institutionType?: string
  // Arts
  artsDiscipline?: string
  projectType?: string
  // Veterans
  hasHonorableDischarge?: boolean
  hasServiceDisability?: boolean
  hasEducationGoals?: boolean
  hasEmploymentGoals?: boolean
  isHomeless?: boolean
  // Individual
  isUsResident?: boolean
  isStudent?: boolean
  studentLevel?: string
  householdIncome?: number
}

// ─── Category metadata ───────────────────────────────────────────────────────

const CATEGORIES: { key: Category; label: string; icon: string; desc: string }[] = [
  { key: "small_business", label: "Small Business",  icon: "🏢", desc: "Grants for entrepreneurs, startups, and growing companies" },
  { key: "agricultural",   label: "Agricultural",    icon: "🌾", desc: "Funding for farmers, ranchers, and agricultural producers" },
  { key: "research",       label: "Research",        icon: "🔬", desc: "Grants for scientific research and academic innovation" },
  { key: "arts",           label: "Arts",            icon: "🎨", desc: "Grants for artists, performers, and cultural projects" },
  { key: "veterans",       label: "Veterans",        icon: "🎖️", desc: "Grants and scholarships for veterans and military families" },
  { key: "individual",     label: "Individual",      icon: "👤", desc: "Scholarships and awards open to individuals and families" },
]

// ─── Matching logic ──────────────────────────────────────────────────────────

function matchGrants(profile: Profile, all: Grant[]): Grant[] {
  return all.filter((g) => {
    if (g.category !== profile.category) return false
    if (Array.isArray(g.eligibility_criteria)) return true

    const c = g.eligibility_criteria as EligibilityCriteria

    if (profile.category === "small_business") {
      if (c.max_employees !== undefined && profile.employeeCount !== undefined)
        if (profile.employeeCount > c.max_employees) return false
      if (c.max_revenue !== undefined && profile.revenue !== undefined)
        if (profile.revenue > c.max_revenue) return false
      if (c.requires_minority_owned && !profile.isMinorityOwned) return false
      if (c.requires_woman_owned && !profile.isWomanOwned) return false
      if (c.requires_rural && !profile.isRural) return false
      if (c.industries?.length && profile.industry)
        if (!c.industries.includes(profile.industry)) return false
    }

    if (profile.category === "individual") {
      if (c.requires_us_citizen && !profile.isCitizen) return false
      if (c.requires_us_resident && !profile.isUsResident) return false
      if (c.requires_student && !profile.isStudent) return false
      if (c.max_household_income && profile.householdIncome !== undefined)
        if (profile.householdIncome > c.max_household_income) return false
    }

    return true
  })
}

// ─── Shared UI helpers ───────────────────────────────────────────────────────

function formatAmount(n: number | null) {
  if (!n) return "Varies"
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

function Checkbox({ label, checked, onChange }: { label: string; checked?: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input type="checkbox" className="w-4 h-4 rounded" defaultChecked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="text-sm text-zinc-800">{label}</span>
    </label>
  )
}

function Select({ label, value, options, onChange }: { label: string; value?: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm text-zinc-800 mb-2">{label}</label>
      <select
        defaultValue={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-4 rounded-lg border border-zinc-300 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
      >
        <option value="">Select…</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

function NumberInput({ label, value, placeholder, prefix, onChange }: { label: string; value?: number; placeholder?: string; prefix?: string; onChange: (v: number | undefined) => void }) {
  return (
    <div>
      <label className="block text-sm text-zinc-800 mb-2">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">{prefix}</span>}
        <input
          type="number"
          defaultValue={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : undefined)}
          className={`w-full h-10 ${prefix ? "pl-7" : "px-4"} pr-4 rounded-lg border border-zinc-300 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900`}
        />
      </div>
    </div>
  )
}

function NavButtons({ onBack, onNext, nextLabel = "See Results" }: { onBack: () => void; onNext: () => void; nextLabel?: string }) {
  return (
    <div className="flex gap-3 mt-8">
      <button onClick={onBack} className="h-10 px-5 rounded-lg border border-zinc-300 text-sm font-medium text-zinc-700 hover:border-zinc-500 transition-colors">Back</button>
      <button onClick={onNext} className="h-10 px-5 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 transition-colors">{nextLabel}</button>
    </div>
  )
}

// ─── Step components ─────────────────────────────────────────────────────────

function StepCategory({ onSelect }: { onSelect: (c: Category) => void }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-zinc-900 mb-2">What type of grant are you looking for?</h2>
      <p className="text-zinc-500 mb-8">Select the category that best fits your situation.</p>
      <div className="grid grid-cols-2 gap-4">
        {CATEGORIES.map(({ key, label, icon, desc }) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className="rounded-xl border-2 border-zinc-200 p-5 text-left hover:border-zinc-900 transition-colors"
          >
            <div className="text-3xl mb-2">{icon}</div>
            <h3 className="font-semibold text-zinc-900 mb-1">{label}</h3>
            <p className="text-xs text-zinc-500">{desc}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

function StepSmallBusiness({ profile, onChange, onNext, onBack }: { profile: Profile; onChange: (u: Partial<Profile>) => void; onNext: () => void; onBack: () => void }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-zinc-900 mb-2">About your business</h2>
      <p className="text-zinc-500 mb-8">We&apos;ll use this to find matching grants.</p>
      <div className="space-y-5">
        <NumberInput label="Number of employees" value={profile.employeeCount} placeholder="e.g. 10" onChange={(v) => onChange({ employeeCount: v })} />
        <NumberInput label="Annual revenue (optional)" value={profile.revenue} placeholder="e.g. 500000" prefix="$" onChange={(v) => onChange({ revenue: v })} />
        <Select label="Industry" value={profile.industry} onChange={(v) => onChange({ industry: v })} options={[
          { value: "technology", label: "Technology" },
          { value: "science", label: "Science / R&D" },
          { value: "engineering", label: "Engineering / Manufacturing" },
          { value: "health", label: "Health / Life Sciences" },
          { value: "agriculture", label: "Agriculture / Food" },
          { value: "energy", label: "Clean Energy" },
          { value: "defense", label: "Defense" },
          { value: "retail", label: "Retail / Consumer" },
          { value: "other", label: "Other" },
        ]} />
        <div className="space-y-3 pt-1">
          <Checkbox label="Minority-owned business" checked={profile.isMinorityOwned} onChange={(v) => onChange({ isMinorityOwned: v })} />
          <Checkbox label="Woman-owned business" checked={profile.isWomanOwned} onChange={(v) => onChange({ isWomanOwned: v })} />
          <Checkbox label="Located in a rural area" checked={profile.isRural} onChange={(v) => onChange({ isRural: v })} />
        </div>
      </div>
      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  )
}

function StepAgricultural({ profile, onChange, onNext, onBack }: { profile: Profile; onChange: (u: Partial<Profile>) => void; onNext: () => void; onBack: () => void }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-zinc-900 mb-2">About your farm or operation</h2>
      <p className="text-zinc-500 mb-8">Tell us about your agricultural operation.</p>
      <div className="space-y-5">
        <Select label="Farm or operation type" value={profile.farmType} onChange={(v) => onChange({ farmType: v })} options={[
          { value: "row_crop", label: "Row crops (corn, soybeans, wheat, etc.)" },
          { value: "livestock", label: "Livestock / Poultry" },
          { value: "specialty_crop", label: "Specialty crops (fruits, vegetables, nuts)" },
          { value: "organic", label: "Organic production" },
          { value: "mixed", label: "Mixed / Diversified" },
          { value: "aquaculture", label: "Aquaculture / Fishing" },
          { value: "forestry", label: "Forestry / Agroforestry" },
        ]} />
        <div className="space-y-3 pt-1">
          <Checkbox label="Beginning farmer or rancher (in operation less than 10 years)" checked={profile.isBeginningFarmer} onChange={(v) => onChange({ isBeginningFarmer: v })} />
          <Checkbox label="Socially disadvantaged farmer (BIPOC, woman, or other underrepresented group)" checked={profile.isSociallyDisadvantaged} onChange={(v) => onChange({ isSociallyDisadvantaged: v })} />
          <Checkbox label="Focus on conservation or sustainable practices" checked={profile.hasConservationFocus} onChange={(v) => onChange({ hasConservationFocus: v })} />
          <Checkbox label="Organic or transitioning to organic" checked={profile.hasOrganicFocus} onChange={(v) => onChange({ hasOrganicFocus: v })} />
          <Checkbox label="Export or value-added product focus" checked={profile.hasExportFocus} onChange={(v) => onChange({ hasExportFocus: v })} />
        </div>
      </div>
      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  )
}

function StepResearch({ profile, onChange, onNext, onBack }: { profile: Profile; onChange: (u: Partial<Profile>) => void; onNext: () => void; onBack: () => void }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-zinc-900 mb-2">About your research</h2>
      <p className="text-zinc-500 mb-8">Tell us about your field and career stage.</p>
      <div className="space-y-5">
        <Select label="Field of research" value={profile.researchField} onChange={(v) => onChange({ researchField: v })} options={[
          { value: "biomedical", label: "Biomedical / Health Sciences" },
          { value: "physical_sciences", label: "Physical Sciences / Chemistry / Physics" },
          { value: "computer_science", label: "Computer Science / AI / Engineering" },
          { value: "social_sciences", label: "Social Sciences / Humanities" },
          { value: "environmental", label: "Environmental / Earth Sciences" },
          { value: "agriculture", label: "Agriculture / Food Science" },
          { value: "energy", label: "Energy / Clean Technology" },
          { value: "defense", label: "Defense / National Security" },
        ]} />
        <Select label="Career stage" value={profile.careerStage} onChange={(v) => onChange({ careerStage: v })} options={[
          { value: "undergraduate", label: "Undergraduate student" },
          { value: "graduate", label: "Graduate student (MS / PhD)" },
          { value: "postdoc", label: "Postdoctoral researcher" },
          { value: "early_career", label: "Early-career faculty or researcher" },
          { value: "established", label: "Established researcher / PI" },
          { value: "small_business", label: "Researcher at a small business" },
        ]} />
        <Select label="Institution type" value={profile.institutionType} onChange={(v) => onChange({ institutionType: v })} options={[
          { value: "university", label: "University or college" },
          { value: "nonprofit", label: "Nonprofit research institution" },
          { value: "federal_lab", label: "Federal laboratory" },
          { value: "small_business", label: "Small business" },
          { value: "hospital", label: "Hospital or medical center" },
        ]} />
        <Checkbox label="US citizen or permanent resident" checked={profile.isCitizen} onChange={(v) => onChange({ isCitizen: v })} />
      </div>
      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  )
}

function StepArts({ profile, onChange, onNext, onBack }: { profile: Profile; onChange: (u: Partial<Profile>) => void; onNext: () => void; onBack: () => void }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-zinc-900 mb-2">About your arts practice</h2>
      <p className="text-zinc-500 mb-8">Tell us about your discipline and project.</p>
      <div className="space-y-5">
        <Select label="Arts discipline" value={profile.artsDiscipline} onChange={(v) => onChange({ artsDiscipline: v })} options={[
          { value: "visual_arts", label: "Visual arts (painting, sculpture, photography, etc.)" },
          { value: "performing_arts", label: "Performing arts (theater, dance)" },
          { value: "music", label: "Music / Composition" },
          { value: "literature", label: "Literature / Creative writing / Translation" },
          { value: "film", label: "Film / Media arts" },
          { value: "multidisciplinary", label: "Multidisciplinary / Experimental" },
          { value: "craft", label: "Craft / Folk / Traditional arts" },
          { value: "public_art", label: "Public art / Community arts" },
        ]} />
        <Select label="Type of project" value={profile.projectType} onChange={(v) => onChange({ projectType: v })} options={[
          { value: "creation", label: "Creating new work" },
          { value: "exhibition", label: "Exhibition or presentation" },
          { value: "performance", label: "Performance or production" },
          { value: "residency", label: "Residency or fellowship" },
          { value: "community", label: "Community arts project" },
          { value: "translation", label: "Translation or scholarly edition" },
        ]} />
        <Checkbox label="US citizen or permanent resident" checked={profile.isCitizen} onChange={(v) => onChange({ isCitizen: v })} />
      </div>
      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  )
}

function StepVeterans({ profile, onChange, onNext, onBack }: { profile: Profile; onChange: (u: Partial<Profile>) => void; onNext: () => void; onBack: () => void }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-zinc-900 mb-2">About your service</h2>
      <p className="text-zinc-500 mb-8">Tell us about your military background and goals.</p>
      <div className="space-y-4">
        <Checkbox label="Honorably discharged from military service" checked={profile.hasHonorableDischarge} onChange={(v) => onChange({ hasHonorableDischarge: v })} />
        <Checkbox label="Have a service-connected disability rating" checked={profile.hasServiceDisability} onChange={(v) => onChange({ hasServiceDisability: v })} />
        <Checkbox label="Looking for education funding (college, vocational training)" checked={profile.hasEducationGoals} onChange={(v) => onChange({ hasEducationGoals: v })} />
        <Checkbox label="Looking for employment or vocational rehabilitation support" checked={profile.hasEmploymentGoals} onChange={(v) => onChange({ hasEmploymentGoals: v })} />
        <Checkbox label="Experiencing housing instability or homelessness" checked={profile.isHomeless} onChange={(v) => onChange({ isHomeless: v })} />
      </div>
      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  )
}

function StepIndividual({ profile, onChange, onNext, onBack }: { profile: Profile; onChange: (u: Partial<Profile>) => void; onNext: () => void; onBack: () => void }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-zinc-900 mb-2">About you</h2>
      <p className="text-zinc-500 mb-8">Tell us about your background to find matching grants.</p>
      <div className="space-y-5">
        <Select label="Current student status" value={profile.studentLevel} onChange={(v) => onChange({ studentLevel: v, isStudent: v !== "" && v !== "none" })} options={[
          { value: "none", label: "Not currently a student" },
          { value: "undergraduate", label: "Undergraduate (bachelor's)" },
          { value: "graduate", label: "Graduate student (master's / PhD)" },
          { value: "professional", label: "Professional degree (law, medicine, etc.)" },
        ]} />
        <NumberInput label="Annual household income (optional)" value={profile.householdIncome} placeholder="e.g. 45000" prefix="$" onChange={(v) => onChange({ householdIncome: v })} />
        <div className="space-y-3 pt-1">
          <Checkbox label="US citizen" checked={profile.isCitizen} onChange={(v) => onChange({ isCitizen: v })} />
          <Checkbox label="US resident or permanent resident" checked={profile.isUsResident} onChange={(v) => onChange({ isUsResident: v })} />
        </div>
      </div>
      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  )
}

function Results({ matches, category, onReset }: { matches: Grant[]; category: Category; onReset: () => void }) {
  const catLabel = CATEGORIES.find((c) => c.key === category)?.label ?? category
  return (
    <div>
      <h2 className="text-2xl font-semibold text-zinc-900 mb-2">
        {matches.length > 0
          ? `${matches.length} ${catLabel} grant${matches.length === 1 ? "" : "s"} found`
          : "No exact matches found"}
      </h2>
      <p className="text-zinc-500 mb-8">
        {matches.length > 0
          ? "Based on your answers. Always verify eligibility directly with the granting agency."
          : "Try browsing all grants in this category or adjusting your answers."}
      </p>

      {matches.length === 0 ? (
        <Link href={`/grants?category=${category}`} className="inline-flex items-center h-10 px-5 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 transition-colors mb-6">
          Browse All {catLabel} Grants
        </Link>
      ) : (
        <div className="space-y-4 mb-8">
          {matches.map((g) => (
            <div key={g.id} className="rounded-xl border border-zinc-200 p-5">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="font-semibold text-zinc-900">{g.name}</h3>
                <span className="shrink-0 text-sm font-semibold bg-zinc-100 px-2 py-0.5 rounded-full">{formatAmount(g.max_amount)}</span>
              </div>
              <p className="text-sm text-zinc-500 mb-1">{g.agency}</p>
              <p className="text-sm text-zinc-600 mb-3 line-clamp-2">{g.description}</p>
              {g.required_documents.length > 0 && (
                <p className="text-xs text-zinc-500 mb-3">
                  <span className="font-medium">Docs needed: </span>
                  {g.required_documents.slice(0, 3).join(" · ")}
                  {g.required_documents.length > 3 && ` · +${g.required_documents.length - 3} more`}
                </p>
              )}
              <Link href={`/grants/${g.slug}`} className="text-sm font-medium text-zinc-900 hover:underline">View details →</Link>
            </div>
          ))}
        </div>
      )}

      <button onClick={onReset} className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">← Start over</button>
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────

const CACHE_KEY = "__grants_cache__"

export default function GrantsQuizPage() {
  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState<Profile>({ category: null })
  const [matches, setMatches] = useState<Grant[] | null>(null)
  const [loading, setLoading] = useState(false)

  function update(updates: Partial<Profile>) {
    setProfile((prev) => ({ ...prev, ...updates }))
  }

  async function fetchAndMatch(finalProfile: Profile) {
    setLoading(true)
    try {
      const cached = sessionStorage.getItem(CACHE_KEY)
      let all: Grant[]
      if (cached) {
        all = JSON.parse(cached)
      } else {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/grants?select=*&type=eq.grant`,
          { headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}` } }
        )
        all = await res.json()
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(all))
      }
      setMatches(matchGrants(finalProfile, all))
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setStep(0)
    setProfile({ category: null })
    setMatches(null)
  }

  if (matches !== null) {
    return (
      <Layout>
        <Results matches={matches} category={profile.category!} onReset={reset} />
      </Layout>
    )
  }

  const stepProps = { profile, onChange: update, onNext: () => fetchAndMatch(profile), onBack: () => setStep(0) }

  return (
    <Layout>
      {step > 0 && (
        <div className="h-1 rounded-full bg-zinc-200 mb-10 overflow-hidden">
          <div className="h-full bg-zinc-900 rounded-full w-1/2 transition-all" />
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-zinc-500">Finding your grants…</div>
      ) : step === 0 ? (
        <StepCategory onSelect={(c) => { update({ category: c }); setStep(1) }} />
      ) : profile.category === "small_business" ? (
        <StepSmallBusiness {...stepProps} />
      ) : profile.category === "agricultural" ? (
        <StepAgricultural {...stepProps} />
      ) : profile.category === "research" ? (
        <StepResearch {...stepProps} />
      ) : profile.category === "arts" ? (
        <StepArts {...stepProps} />
      ) : profile.category === "veterans" ? (
        <StepVeterans {...stepProps} />
      ) : (
        <StepIndividual {...stepProps} />
      )}
    </Layout>
  )
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-full">
      <nav className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold text-zinc-900">GrantFinder</Link>
          <div className="flex gap-6 text-sm font-medium text-zinc-600">
            <Link href="/grants" className="hover:text-zinc-900 transition-colors">Grants</Link>
            <Link href="/benefits" className="hover:text-zinc-900 transition-colors">Benefits</Link>
            <Link href="/quiz" className="hover:text-zinc-900 transition-colors">Eligibility Quiz</Link>
          </div>
        </div>
      </nav>
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">
        <div className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
          <Link href="/quiz" className="hover:text-zinc-900 transition-colors">Quiz</Link>
          <span>/</span>
          <span className="text-zinc-900">Grants</span>
        </div>
        {children}
      </main>
      <footer className="border-t border-zinc-200 py-8 px-6 text-center text-sm text-zinc-500">
        Grant information is for reference only. Verify eligibility with the issuing agency.
      </footer>
    </div>
  )
}
