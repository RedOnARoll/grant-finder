import Link from "next/link"
import { Sparkles, ArrowRight } from "lucide-react"
import { getGrants, getBenefits } from "@/lib/supabase"
import SiteNav from "@/components/SiteNav"

export default async function AIResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; smart_q?: string; topic?: string; hint?: string }>
}) {
  const { q = "", smart_q = "", topic = "", hint = "" } = await searchParams

  const [grants, benefits] = await Promise.all([getGrants(), getBenefits()])
  const allPrograms = [...grants, ...benefits]

  const keywords = smart_q ? smart_q.split("|").filter(Boolean) : []
  const categories = topic ? topic.split(",").filter(Boolean) : []

  const scored = allPrograms
    .map(p => {
      const result = scoreProgram(p, { q, keywords, categories })
      return { program: p, ...result }
    })
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)

  const topMatches = scored.slice(0, 3)
  const otherMatches = scored.slice(3, 12)

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <SiteNav />

      {/* Header band */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">AI Match</p>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-amber-500 text-slate-900">Beta</span>
              </div>
              <p className="text-lg font-medium text-white leading-snug">&ldquo;{q}&rdquo;</p>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Results are keyword-based and not personalized. Always verify eligibility directly with the program.
              </p>
            </div>
          </div>

          {(hint || categories.length > 0 || keywords.length > 0) && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-3">
                Here&apos;s what I understood
              </p>
              <div className="flex flex-wrap gap-2">
                {hint && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-white text-xs font-medium">
                    <span className="text-slate-400">Summary:</span> {hint}
                  </span>
                )}
                {categories.map(cat => (
                  <span key={cat} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-emerald-300 text-xs font-medium capitalize">
                    <span className="text-slate-400">Category:</span> {cat.replace(/_/g, " ")}
                  </span>
                ))}
                {keywords.slice(0, 4).map(kw => (
                  <span key={kw} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-blue-300 text-xs font-medium">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

        {/* Top matches */}
        <div className="flex items-baseline gap-3 mb-2">
          <h2 className="text-xl font-bold text-slate-900">
            {topMatches.length > 0
              ? `${topMatches.length} strong match${topMatches.length !== 1 ? "es" : ""} for you`
              : "No strong matches found"}
          </h2>
          {topMatches.length > 0 && (
            <span className="text-sm text-slate-500">· Ranked by likelihood you qualify</span>
          )}
        </div>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          We score each program on eligibility signals, urgency, and value.
          Final eligibility is decided by the program — we just help you focus.
        </p>

        {topMatches.length > 0 ? (
          <div className="flex flex-col gap-4 mb-10">
            {topMatches.map(({ program, score, reasons }, idx) => (
              <TopMatchCard
                key={program.slug}
                program={program}
                score={score}
                reasons={reasons}
                rank={idx + 1}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center mb-10">
            <p className="text-slate-500 mb-4">No strong matches found. Try rephrasing your search.</p>
            <Link href="/programs" className="inline-flex items-center gap-2 text-blue-600 text-sm font-medium hover:underline">
              Browse all programs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Other matches */}
        {otherMatches.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-900">
                Other programs worth a look ({otherMatches.length})
              </h3>
              <Link href="/programs" className="text-sm text-blue-600 font-medium hover:underline">
                Browse all programs →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {otherMatches.map(({ program, score, reasons }) => (
                <CompactMatchCard
                  key={program.slug}
                  program={program}
                  score={score}
                  reasons={reasons}
                />
              ))}
            </div>
          </div>
        )}

        {/* Save CTA */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-700 mb-1">Don&apos;t lose these</p>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Save these matches to a free account</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Track eligibility checklists, applications, and deadlines — free forever, no credit card.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link href="/auth" className="h-10 px-4 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors inline-flex items-center whitespace-nowrap">
              Create free account
            </Link>
            <Link href="/auth" className="h-10 px-4 border border-slate-200 bg-white text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors inline-flex items-center whitespace-nowrap">
              Sign in
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatAmt(amount: number | null | undefined): string {
  if (!amount) return ""
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`
  return `$${amount}`
}

function scoreProgram(
  program: {
    type: string
    category?: string | null
    subcategory?: string | null
    name: string
    description?: string | null
    deadline?: string | null
    is_recurring?: boolean | null
    max_amount?: number | null
    funding_source?: string | null
  },
  { q, keywords, categories }: { q: string; keywords: string[]; categories: string[] }
): { score: number; reasons: string[] } {
  let score = 0
  const reasons: string[] = []
  const lower = q.toLowerCase()

  // Audience match
  const wantsBenefit = /\b(family|parent|rent|housing|food|medicaid|snap|childcare|utility|utilities|disabled|disability|healthcare)\b/.test(lower)
  const wantsGrant = /\b(business|company|startup|research|grant|nonprofit|farm|farmer|artist|veteran)\b/.test(lower)

  if (wantsBenefit && program.type === "benefit") {
    score += 20
    reasons.push("Designed for individuals and families")
  } else if (wantsGrant && program.type === "grant") {
    score += 20
    reasons.push("Open to organizations and businesses like yours")
  } else if (!wantsBenefit && !wantsGrant) {
    score += 5
  }

  // Category match
  const programTopic = program.type === "grant" ? program.category : program.subcategory
  if (programTopic && categories.includes(programTopic)) {
    score += 40
    reasons.push(`Covers ${programTopic.replace(/_/g, " ")} directly`)
  }

  // Keyword match in name or description
  const searchText = `${program.name} ${program.description ?? ""}`.toLowerCase()
  const matchedKw = keywords.filter(kw => searchText.includes(kw.toLowerCase()))
  if (matchedKw.length > 0) {
    score += Math.min(matchedKw.length * 8, 20)
    if (reasons.length < 3) reasons.push(`Matches your keywords: ${matchedKw.slice(0, 2).join(", ")}`)
  }

  // Urgency / timing
  if (program.deadline && !program.is_recurring) {
    const days = Math.ceil((new Date(program.deadline).getTime() - Date.now()) / 86400000)
    if (days > 0 && days < 60) {
      score += 8
      if (reasons.length < 3) reasons.push(`Closes in ${days} days — apply soon`)
    }
  }
  if (program.is_recurring && program.type === "benefit") {
    score += 12
    if (reasons.length < 3) reasons.push("Year-round enrollment — no deadline pressure")
  }

  // Value boost
  if (program.max_amount && program.max_amount >= 100000) {
    score += 5
    if (reasons.length < 3) reasons.push(`Up to ${formatAmt(program.max_amount)} per award`)
  }

  return { score: Math.min(score, 95), reasons: reasons.slice(0, 3) }
}

// ─── Cards ───────────────────────────────────────────────────────────────────

function TopMatchCard({
  program,
  score,
  reasons,
  rank,
}: {
  program: {
    slug: string
    name: string
    agency: string
    type: string
    max_amount?: number | null
    deadline?: string | null
    is_recurring?: boolean | null
  }
  score: number
  reasons: string[]
  rank: number
}) {
  const isGrant = program.type === "grant"
  const accentBorder = isGrant ? "border-l-blue-600" : "border-l-emerald-600"
  const accentBg = isGrant ? "bg-blue-50" : "bg-emerald-50"
  const accentText = isGrant ? "text-blue-700" : "text-emerald-700"
  const detailHref = `/${isGrant ? "grants" : "benefits"}/${program.slug}`

  const confidence = score >= 80 ? "strong" : score >= 50 ? "possible" : "exploratory"
  const confMeta = {
    strong:      { label: "Strong match",    className: "bg-emerald-50 text-emerald-700" },
    possible:    { label: "Possible match",  className: "bg-amber-50 text-amber-700" },
    exploratory: { label: "Worth exploring", className: "bg-slate-100 text-slate-700" },
  }[confidence]

  const formattedDeadline = program.deadline
    ? new Date(program.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Open enrollment"

  return (
    <div className={`bg-white border border-slate-200 border-l-4 ${accentBorder} rounded-xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex flex-col sm:flex-row gap-5">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-900 text-white text-xs font-bold">
              #{rank}
            </span>
            <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${isGrant ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}>
              {isGrant ? "Grant" : "Benefit"}
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1 leading-snug">{program.name}</h3>
          <p className="text-sm text-slate-500 mb-4">{program.agency}</p>

          {reasons.length > 0 && (
            <div className={`${accentBg} rounded-lg p-3 mb-4`}>
              <p className={`text-xs font-semibold uppercase tracking-wide ${accentText} mb-2`}>Why this is a match</p>
              <ul className="space-y-1">
                {reasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className={`${accentText} shrink-0`}>✓</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            {program.max_amount && (
              <span>
                <span className="text-slate-400">Up to </span>
                <span className="font-bold text-slate-900 tabular-nums">{formatAmt(program.max_amount)}</span>
              </span>
            )}
            <span>
              <span className="text-slate-400">Deadline: </span>
              <span className="font-medium text-slate-900">{formattedDeadline}</span>
            </span>
          </div>
        </div>

        <div className="flex sm:flex-col gap-2 sm:items-stretch sm:w-40 shrink-0">
          <div className="text-center mb-1">
            <span className={`inline-block text-sm font-bold px-3 py-1.5 rounded-full ${confMeta.className}`}>
              {confMeta.label}
            </span>
          </div>
          <Link
            href={detailHref}
            className={`h-9 px-4 rounded-lg text-white text-sm font-semibold ${isGrant ? "bg-blue-600 hover:bg-blue-700" : "bg-emerald-600 hover:bg-emerald-700"} transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap`}
          >
            View program <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

function CompactMatchCard({
  program,
  score,
  reasons,
}: {
  program: {
    slug: string
    name: string
    agency: string
    type: string
    max_amount?: number | null
  }
  score: number
  reasons: string[]
}) {
  const isGrant = program.type === "grant"
  const href = `/${isGrant ? "grants" : "benefits"}/${program.slug}`
  const confidence = score >= 80 ? "Strong" : score >= 50 ? "Possible" : "Worth a look"
  const confColor = score >= 80 ? "text-emerald-700" : score >= 50 ? "text-amber-700" : "text-slate-600"

  return (
    <Link href={href} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow flex flex-col">
      <div className="flex justify-between items-start gap-2 mb-2">
        <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded-full ${isGrant ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}>
          {isGrant ? "Grant" : "Benefit"}
        </span>
        <span className={`text-xs font-semibold uppercase tracking-wide ${confColor} whitespace-nowrap`}>
          {confidence}
        </span>
      </div>
      <p className="text-xs text-slate-400 mb-1">{program.agency}</p>
      <h4 className="text-sm font-semibold text-slate-900 mb-2 leading-snug line-clamp-2">{program.name}</h4>
      {reasons[0] && (
        <p className="text-xs text-slate-500 leading-relaxed mb-3 flex-1">{reasons[0]}</p>
      )}
      <div className="flex justify-between items-center mt-auto">
        <span className="text-xs font-bold text-slate-900 tabular-nums">
          {formatAmt(program.max_amount)}
        </span>
        <span className="text-xs text-blue-600 font-medium">View →</span>
      </div>
    </Link>
  )
}
