"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import type { User } from "@supabase/supabase-js"
import { getBrowserSupabase } from "@/lib/supabase-browser"

export default function AuthMenu() {
  const supabase = useMemo(() => getBrowserSupabase(), [])
  const [user, setUser] = useState<User | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let mounted = true

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return
      setUser(data.user)
      setLoaded(true)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoaded(true)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [supabase])

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (!loaded) {
    return <span className="h-9 w-16 rounded-full bg-zinc-100" aria-hidden="true" />
  }

  if (!user) {
    return (
      <Link
        href="/auth"
        className="inline-flex h-9 items-center justify-center rounded-full bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
      >
        Log in
      </Link>
    )
  }

  const label =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Account"

  return (
    <div className="flex items-center gap-3">
      <Link href="/account" className="max-w-32 truncate text-sm font-medium text-zinc-700 hover:text-zinc-900">
        {label}
      </Link>
      <button
        type="button"
        onClick={signOut}
        className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
      >
        Sign out
      </button>
    </div>
  )
}
