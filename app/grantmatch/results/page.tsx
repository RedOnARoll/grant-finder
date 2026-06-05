import { Lock, Sparkles, ArrowUpRight } from "lucide-react"
import { getGrants } from "@/lib/supabase"

export default async function GrantMatchResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; smart_q?: string; topic?: string }>
}) {
  const { q = "", smart_q = "", topic = "" } = await searchParams

  const grants = await getGrants()
  const keywords = smart_q ? smart_q.split("|").filter(Boolean) : []
  const categories = topic ? topic.split(",").filter(Boolean) : []

  const scored = grants
    .map(g => ({ grant: g, ...scoreGrant(g, { q, keywords, categories }) }))
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">

      {/* Header */}
      <header className="border-b border-slate-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-bold text-sm">GrantMatch</span>
            <span className="text-[10px] font-bold uppercase tracking-wide bg-amber-500 text-slate-900 px-1.5 py-0.5 rounded">
              Preview
            </span>
          </div>
          <span className="text-slate-500 text-xs">by GrantWay</span>
        </div>
      </header>

      {/* Launch banner */}
      <div className="bg-blue-600/20 border-b border-blue-500/30 px-4 py-3">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-blue-300 text-sm">
            <span className="font-semibold">GrantWay launches soon.</span>{" "}
            Check your email — we&apos;ll send you a link to finish setting up your account and apply for these grants.
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-10">

        {q && (
          <p className="text-slate-500 text-sm mb-1 uppercase tracking-wide font-medium">Matched for</p>
        )}
        <h1 className="text-2xl font-bold text-white mb-1">
          {scored.length > 0
            ? `Your top ${scored.length} grant match${scored.length !== 1 ? "es" : ""}`
            : "No strong matches found"}
        </h1>
        {q && (
          <p className="text-slate-400 text-sm mb-8">&ldquo;{q}&rdquo;</p>
        )}
        {!q && <div className="mb-8" />}

        {scored.length > 0 ? (
          <div className="flex flex-col gap-4">
            {scored.map(({ grant, score, reasons }, idx) => (
              <GrantCard key={grant.slug} grant={grant} score={score} reasons={reasons} rank={idx + 1} />
            ))}
          </div>
        ) : (
          <div className="bg-slate-800 rounded-xl p-8 text-center">
            <p className="text-slate-400">No strong matches found for this website. When GrantWay launches you&apos;ll have access to personalized matching.</p>
          </div>
        )}

        {/* Lock notice */}
        <div className="mt-8 flex items-center gap-3 bg-slate-800/60 border border-slate-700 rounded-xl px-5 py-4">
          <Lock className="w-4 h-4 text-slate-400 shrink-0" />
          <p className="text-slate-400 text-sm">
            Full grant details, eligibility checklists, and one-click applications unlock when GrantWay launches.
            We&apos;ll email you the moment it&apos;s live.
          </p>
        </div>
      </main>

      <footer className="border-t border-slate-800 px-4 py-5 text-center">
        <p className="text-slate-600 text-xs">GrantMatch by GrantWay &mdash; Coming Soon</p>
      </footer>
    </div>
  )
}

// ─── Scoring ─────────────────────────────────────────────────────────────────

function scoreGrant(
  grant: { category?: string | null; name: string; description?: string | null; deadline?: string | null; is_recurring?: boolean | null; max_amount?: number | null },
  { q, keywords, categories }: { q: string; keywords: string[]; categories: string[] }
): { score: number; reasons: string[] } {
  let score = 0
  const reasons: string[] = []

  if (grant.category && categories.includes(grant.category)) {
    score += 40
    reasons.push(`Covers ${grant.category.replace(/_/g, " ")} directly`)
  }

  const searchText = `${grant.name} ${grant.description ?? ""}`.toLowerCase()
  const matchedKw = keywords.filter(kw => searchText.includes(kw.toLowerCase()))
  if (matchedKw.length > 0) {
    score += Math.min(matchedKw.length * 8, 24)
    reasons.push(`Matches your keywords: ${matchedKw.slice(0, 2).join(", ")}`)
  }

  if (q) {
    const qLower = q.toLowerCase()
    if (searchText.includes(qLower) || qLower.split(" ").some(w => w.length > 3 && searchText.includes(w))) {
      score += 10
    }
  }

  if (grant.deadline && !grant.is_recurring) {
    const days = Math.ceil((new Date(grant.deadline).getTime() - Date.now()) / 86400000)
    if (days > 0 && days < 60) {
      score += 8
      reasons.push(`Closes in ${days} days — apply soon`)
    }
  }

  if (grant.max_amount && grant.max_amount >= 100_000) {
    score += 5
    if (reasons.length < 3) reasons.push(`Up to ${formatAmt(grant.max_amount)} per award`)
  }

  return { score: Math.min(score, 95), reasons: reasons.slice(0, 3) }
}

function formatAmt(amount: number | null | undefined): string {
  if (!amount) return ""
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`
  return `$${amount}`
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function GrantCard({
  grant,
  score,
  reasons,
  rank,
}: {
  grant: { slug: string; name: string; agency: string; max_amount?: number | null; deadline?: string | null; is_recurring?: boolean | null; application_url: string }
  score: number
  reasons: string[]
  rank: number
}) {
  const confidence = score >= 80 ? "Strong match" : score >= 50 ? "Possible match" : "Worth exploring"
  const confClass = score >= 80 ? "bg-emerald-900/60 text-emerald-300" : score >= 50 ? "bg-amber-900/60 text-amber-300" : "bg-slate-700 text-slate-300"
  const isClosed = !!grant.deadline && new Date(grant.deadline).getTime() < Date.now()
  const deadline = grant.deadline
    ? new Date(grant.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Open enrollment"

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="w-6 h-6 rounded-md bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
          #{rank}
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded-full">
          Grant
        </span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${confClass}`}>
          {confidence}
        </span>
        {isClosed && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-900/60 text-rose-300">Closed</span>
        )}
      </div>

      <h2 className={`text-base font-bold mb-0.5 leading-snug ${isClosed ? "text-slate-500" : "text-white"}`}>
        {grant.name}
      </h2>
      <p className="text-slate-400 text-sm mb-4">{grant.agency}</p>

      {reasons.length > 0 && (
        <div className="bg-blue-950/40 border border-blue-800/30 rounded-lg p-3 mb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-400 mb-2">Why this matches</p>
          <ul className="space-y-1">
            {reasons.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-blue-400 shrink-0">✓</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-4 text-sm text-slate-400">
          {grant.max_amount && (
            <span>
              Up to{" "}
              <span className="font-bold text-white tabular-nums">{formatAmt(grant.max_amount)}</span>
            </span>
          )}
          <span>
            Deadline:{" "}
            <span className={`font-medium tabular-nums ${isClosed ? "text-rose-400 line-through" : "text-slate-200"}`}>
              {deadline}
            </span>
          </span>
        </div>

        {grant.application_url && (
          <a
            href={grant.application_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            Official site <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  )
}
