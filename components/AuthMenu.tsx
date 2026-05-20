"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import type { User } from "@supabase/supabase-js"
import { getBrowserSupabase } from "@/lib/supabase-browser"

type ProfileData = {
  is_premium?: boolean
  is_admin?: boolean
  subscription_tier?: string
} | null

export default function AuthMenu() {
  const supabase = useMemo(() => getBrowserSupabase(), [])
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<ProfileData>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let mounted = true

    async function load() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!mounted) return
      setUser(currentUser)

      if (currentUser) {
        const { data } = await supabase
          .from("profiles")
          .select("is_premium, is_admin, subscription_tier")
          .eq("user_id", currentUser.id)
          .maybeSingle()
        if (mounted) setProfile(data as ProfileData)
      }

      if (mounted) setLoaded(true)
    }

    load().catch(() => { if (mounted) setLoaded(true) })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) setProfile(null)
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
    setProfile(null)
  }

  if (!loaded) {
    return <span className="inline-block h-8 w-20 rounded-lg bg-slate-100 animate-pulse" aria-hidden="true" />
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/auth"
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/auth"
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Get Started
        </Link>
      </div>
    )
  }

  const label =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Account"

  const initials = label
    .split(" ")
    .slice(0, 2)
    .map((word: string) => word[0]?.toUpperCase() ?? "")
    .join("")

  const isAdmin = Boolean(profile?.is_admin) || user.email === "redonaroll09@gmail.com"
  const isPremium = Boolean(profile?.is_premium)
  const tier = profile?.subscription_tier as string | undefined

  const badge = isAdmin
    ? null
    : isPremium
    ? { label: "Premium", className: "bg-blue-100 text-blue-700" }
    : tier === "grant_helper"
    ? { label: "Helper", className: "bg-amber-100 text-amber-700" }
    : null

  return (
    <div className="flex items-center gap-3">
      {isAdmin && (
        <Link
          href="/admin"
          className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
        >
          Admin
        </Link>
      )}
      <Link href="/account" className="flex items-center gap-2">
        <span className="w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-semibold flex items-center justify-center shrink-0">
          {initials}
        </span>
        <span className="text-sm text-slate-700 hover:text-slate-900 max-w-24 truncate">
          {label}
        </span>
        {badge && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.className}`}>
            {badge.label}
          </span>
        )}
      </Link>
      <button
        type="button"
        onClick={signOut}
        className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
      >
        Sign out
      </button>
    </div>
  )
}
