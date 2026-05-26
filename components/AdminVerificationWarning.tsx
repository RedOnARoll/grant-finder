"use client"

import { useEffect, useState } from "react"
import { getBrowserSupabase } from "@/lib/supabase-browser"

interface Props {
  isVerified?: boolean
  lastVerifiedAt?: string | null
}

function isStale(lastVerifiedAt: string | null | undefined): boolean {
  if (!lastVerifiedAt) return true
  return new Date(lastVerifiedAt).getTime() < Date.now() - 30 * 24 * 60 * 60 * 1000
}

export default function AdminVerificationWarning({ isVerified, lastVerifiedAt }: Props) {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const supabase = getBrowserSupabase()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase.from("profiles").select("is_admin").eq("user_id", user.id).maybeSingle()
      setIsAdmin((data as { is_admin?: boolean } | null)?.is_admin === true)
    })
  }, [])

  if (!isAdmin) return null

  const stale = isStale(lastVerifiedAt)
  if (isVerified && !stale) return null

  const message = !isVerified
    ? "This record has not been verified against an official source yet."
    : "This record was last verified more than 30 days ago and may be outdated."

  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
      <span>{message} Always verify details directly with the issuing agency before applying.</span>
    </div>
  )
}
