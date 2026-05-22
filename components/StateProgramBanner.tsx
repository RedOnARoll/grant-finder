"use client"

import { useState } from "react"
import StateSelector from "@/components/StateSelector"
import StateProgramInfo from "@/components/StateProgramInfo"
import { US_STATES } from "@/lib/state-programs"

type Props = {
  slug: string
}

export default function StateProgramBanner({ slug }: Props) {
  const [stateCode, setStateCode] = useState<string | null>(null)

  const stateName = stateCode
    ? (US_STATES.find((s) => s.code === stateCode)?.name ?? stateCode)
    : null

  return (
    <div className="space-y-3 my-5">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-slate-500 font-medium">See info for your state:</span>
        <StateSelector onStateChange={setStateCode} />
      </div>
      <StateProgramInfo slug={slug} stateCode={stateCode} stateName={stateName} />
    </div>
  )
}
