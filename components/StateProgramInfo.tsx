"use client"

import { STATE_PROGRAM_DETAILS } from "@/lib/state-program-details"
import { STATE_APPLY_URLS } from "@/lib/state-programs"

type Props = {
  slug: string
  stateCode: string | null
  stateName: string | null
}

type ProgramType =
  | "snap"
  | "tanf"
  | "medicaid"
  | "chip"
  | "section8"
  | "liheap"
  | "ccdf"
  | "heehra"
  | "able"
  | "vocrehab"
  | null

function detectProgram(slug: string): ProgramType {
  const s = slug.toLowerCase()
  if (s.includes("snap") || s.includes("food-stamp")) return "snap"
  if (s.includes("tanf") || s.includes("cash-assist")) return "tanf"
  if (s.includes("medicaid")) return "medicaid"
  if (s.includes("chip") || s.includes("childrens-health")) return "chip"
  if (s.includes("section-8") || s.includes("housing-choice")) return "section8"
  if (s.includes("liheap") || s.includes("energy-assist")) return "liheap"
  if (s.includes("child-care") || s.includes("ccdf")) return "ccdf"
  if (s.includes("heehra") || s.includes("homes-rebate")) return "heehra"
  if (s.includes("able")) return "able"
  if (s.includes("voc")) return "vocrehab"
  return null
}

type StripeColor = "blue" | "green" | "amber"

function Card({
  title,
  stripe,
  portalUrl,
  stateName,
  children,
}: {
  title: string
  stripe: StripeColor
  portalUrl: string | null
  stateName: string
  children: React.ReactNode
}) {
  const stripeClass =
    stripe === "green"
      ? "bg-emerald-500"
      : stripe === "amber"
      ? "bg-amber-400"
      : "bg-blue-500"

  return (
    <div className="flex rounded-xl border border-slate-200 shadow-sm overflow-hidden bg-white">
      <div className={`w-1 shrink-0 ${stripeClass}`} />
      <div className="flex-1 p-4 space-y-3">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <div className="space-y-1 text-sm text-slate-600">{children}</div>
        {portalUrl && (
          <a
            href={portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            Apply in {stateName} &rarr;
          </a>
        )}
      </div>
    </div>
  )
}

function StaticCard({
  icon,
  title,
  note,
  portalUrl,
  stateName,
}: {
  icon: string
  title: string
  note: string
  portalUrl: string | null
  stateName: string
}) {
  return (
    <Card title={`${icon} ${title} in ${stateName}`} stripe="blue" portalUrl={portalUrl} stateName={stateName}>
      <p>{note}</p>
    </Card>
  )
}

export default function StateProgramInfo({ slug, stateCode, stateName }: Props) {
  const programType = detectProgram(slug)

  if (programType === null) return null

  if (!stateCode || !stateName) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
        <span className="text-base">📍</span>
        <span>Select your state above to see state-specific eligibility and benefit details.</span>
      </div>
    )
  }

  const detail = STATE_PROGRAM_DETAILS[stateCode]
  const portalUrl = STATE_APPLY_URLS[slug]?.[stateCode] ?? null

  if (programType === "medicaid") {
    if (!detail?.medicaid) {
      return (
        <StaticCard
          icon="🏥"
          title="Medicaid"
          note="Medicaid eligibility varies by state. Check your state portal for current income limits and enrollment options."
          portalUrl={portalUrl}
          stateName={stateName}
        />
      )
    }
    const { expanded, adultIncomeLimitPct, notes } = detail.medicaid
    const stripe: StripeColor = expanded ? "green" : "amber"
    return (
      <Card
        title={`🏥 Medicaid in ${stateName}`}
        stripe={stripe}
        portalUrl={portalUrl}
        stateName={stateName}
      >
        <p>
          <span className="font-medium">Expansion status:</span>{" "}
          {expanded ? (
            <span className="text-emerald-700 font-medium">✓ Expanded</span>
          ) : (
            <span className="text-amber-700 font-medium">Not expanded</span>
          )}
        </p>
        <p>
          <span className="font-medium">Adult income limit:</span>{" "}
          ~{adultIncomeLimitPct}% FPL
          {!expanded && adultIncomeLimitPct < 50 && " (very limited coverage)"}
        </p>
        {notes && <p className="text-xs text-slate-500">{notes}</p>}
      </Card>
    )
  }

  if (programType === "chip") {
    if (!detail?.chip) {
      return (
        <StaticCard
          icon="👶"
          title="CHIP"
          note="CHIP income limits vary by state. Most states cover children up to 200–300% FPL."
          portalUrl={portalUrl}
          stateName={stateName}
        />
      )
    }
    const { incomeLimitPct, programName } = detail.chip
    const displayName = programName ? `CHIP (${programName})` : "CHIP"
    return (
      <Card
        title={`👶 ${displayName} in ${stateName}`}
        stripe="green"
        portalUrl={portalUrl}
        stateName={stateName}
      >
        <p>
          <span className="font-medium">Children covered up to:</span> {incomeLimitPct}% FPL
        </p>
      </Card>
    )
  }

  if (programType === "tanf") {
    if (!detail?.tanf) {
      return (
        <StaticCard
          icon="💵"
          title="TANF Cash Assistance"
          note="TANF benefit amounts and time limits vary significantly by state. Check your state portal for details."
          portalUrl={portalUrl}
          stateName={stateName}
        />
      )
    }
    const { maxMonthlyBenefitFamily3, timeLimitMonths, notes } = detail.tanf
    const stripe: StripeColor = maxMonthlyBenefitFamily3 >= 500 ? "green" : maxMonthlyBenefitFamily3 < 300 ? "amber" : "blue"
    return (
      <Card
        title={`💵 TANF Cash Assistance in ${stateName}`}
        stripe={stripe}
        portalUrl={portalUrl}
        stateName={stateName}
      >
        <p>
          <span className="font-medium">Max benefit:</span> ${maxMonthlyBenefitFamily3}/month for a family of 3
        </p>
        <p>
          <span className="font-medium">Time limit:</span> {timeLimitMonths} months lifetime
        </p>
        {notes && <p className="text-xs text-slate-500">{notes}</p>}
      </Card>
    )
  }

  if (programType === "snap") {
    if (!detail?.snap) {
      return (
        <StaticCard
          icon="🛒"
          title="SNAP Food Benefits"
          note="SNAP eligibility and income limits vary by state. Federal allotments apply in most cases."
          portalUrl={portalUrl}
          stateName={stateName}
        />
      )
    }
    const { bbce, bbceIncomeLimitPct } = detail.snap
    const stripe: StripeColor = bbce ? "green" : "blue"
    return (
      <Card
        title={`🛒 SNAP Food Benefits in ${stateName}`}
        stripe={stripe}
        portalUrl={portalUrl}
        stateName={stateName}
      >
        <p>
          <span className="font-medium">Income limit:</span> up to {bbceIncomeLimitPct}% FPL
          {bbce && " (state uses broad-based categorical eligibility)"}
        </p>
        <p>Standard federal allotments apply.</p>
      </Card>
    )
  }

  if (programType === "section8") {
    return (
      <StaticCard
        icon="🏠"
        title="Section 8 Housing Choice Voucher"
        note="Vouchers are administered by local Public Housing Authorities (PHAs). Many areas have waitlists. Contact your local PHA for availability."
        portalUrl={portalUrl}
        stateName={stateName}
      />
    )
  }

  if (programType === "liheap") {
    return (
      <StaticCard
        icon="⚡"
        title="LIHEAP Energy Assistance"
        note="Benefit amounts and eligibility vary by state and season. Most states open enrollment in fall/winter."
        portalUrl={portalUrl}
        stateName={stateName}
      />
    )
  }

  if (programType === "ccdf") {
    return (
      <StaticCard
        icon="🧒"
        title="Child Care Development Fund"
        note="Income limits, co-pays, and provider choices vary by state. Some states have waitlists."
        portalUrl={portalUrl}
        stateName={stateName}
      />
    )
  }

  if (programType === "heehra") {
    return (
      <StaticCard
        icon="🔌"
        title="HEEHRA Home Energy Rebates"
        note="Rebate amounts and eligible upgrades vary by state program. Check your state energy office for launch status."
        portalUrl={portalUrl}
        stateName={stateName}
      />
    )
  }

  if (programType === "able") {
    return (
      <StaticCard
        icon="♿"
        title="ABLE Savings Account"
        note="Each state runs its own ABLE program. You can enroll in any state's program regardless of where you live."
        portalUrl={portalUrl}
        stateName={stateName}
      />
    )
  }

  if (programType === "vocrehab") {
    return (
      <StaticCard
        icon="🎓"
        title="Vocational Rehabilitation"
        note="Services and funding levels vary by state. Contact your state VR agency for an eligibility determination."
        portalUrl={portalUrl}
        stateName={stateName}
      />
    )
  }

  return null
}
