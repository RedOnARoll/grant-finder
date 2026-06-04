"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { getBrowserSupabase } from "@/lib/supabase-browser"
import { getSavedPrograms, saveProgram } from "@/lib/account-db"

interface StartApplicationButtonProps {
  slug: string
  className?: string
  children?: React.ReactNode
}

export default function StartApplicationButton({ slug, className, children }: StartApplicationButtonProps) {
  const supabase = useMemo(() => getBrowserSupabase(), [])
  const router = useRouter()

  async function handleClick() {
    const { data } = await supabase.auth.getUser()
    if (data.user) {
      const saved = await getSavedPrograms(supabase, data.user.id)
      const alreadySaved = saved.some((s) => s.slug === slug && s.type === "grant")
      if (!alreadySaved) {
        await saveProgram(supabase, data.user.id, slug, "grant").catch(() => {})
      }
    }
    router.push(`/workspace?slug=${slug}`)
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  )
}
