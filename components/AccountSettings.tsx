"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { User, Mail, Lock, CreditCard, ChevronRight } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { getProfile, migrateAccountMetadata } from "@/lib/account-db"
import { profileCompletion } from "@/lib/profile"
import { getBrowserSupabase } from "@/lib/supabase-browser"
import DeleteAccountButton from "@/components/DeleteAccountButton"

const TIER_LABELS: Record<string, string> = {
  free: "Free",
  grant_helper: "Grant Helper",
  premium: "Premium",
}

export default function AccountSettings() {
  const supabase = useMemo(() => getBrowserSupabase(), [])
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [completion, setCompletion] = useState(0)
  const [tier, setTier] = useState("free")
  const [isPremium, setIsPremium] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  const [name, setName] = useState("")
  const [editingName, setEditingName] = useState(false)
  const [savingName, setSavingName] = useState(false)
  const [nameMessage, setNameMessage] = useState<string | null>(null)

  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!mounted) return
      setUser(currentUser)

      if (currentUser) {
        setName(currentUser.user_metadata?.full_name || currentUser.email?.split("@")[0] || "")

        try {
          await migrateAccountMetadata(supabase, currentUser)
          const profile = await getProfile(supabase, currentUser.id)
          if (mounted) setCompletion(profileCompletion(profile))
        } catch {}

        const { data: profileData } = await supabase
          .from("profiles")
          .select("subscription_tier, is_premium, is_admin")
          .eq("user_id", currentUser.id)
          .maybeSingle()

        if (mounted && profileData) {
          const p = profileData as { subscription_tier?: string; is_premium?: boolean; is_admin?: boolean }
          setTier(p.subscription_tier ?? "free")
          setIsPremium(Boolean(p.is_premium))
          setIsAdmin(Boolean(p.is_admin))
        }
      }

      if (mounted) setLoading(false)
    }

    load()
    return () => { mounted = false }
  }, [supabase])

  async function saveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || !user) return
    setSavingName(true)
    setNameMessage(null)
    const { error } = await supabase.auth.updateUser({ data: { full_name: trimmed } })
    if (error) {
      setNameMessage("Could not update name.")
    } else {
      setNameMessage("Name updated.")
      setEditingName(false)
    }
    setSavingName(false)
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPasswordError(null)
    setPasswordMessage(null)
    if (newPassword !== confirmPassword) { setPasswordError("Passwords don't match."); return }
    if (newPassword.length < 8) { setPasswordError("Password must be at least 8 characters."); return }
    setSavingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSavingPassword(false)
    if (error) {
      setPasswordError(error.message)
    } else {
      setPasswordMessage("Password updated.")
      setNewPassword("")
      setConfirmPassword("")
      setShowPasswordForm(false)
    }
  }

  if (loading) {
    return <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-slate-500">Loading account…</div>
  }

  if (!user) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
        <h2 className="mb-3 text-xl font-bold text-slate-900">Sign in to manage your account</h2>
        <p className="mb-6 text-slate-600">Access your profile, security settings, and subscription.</p>
        <Link
          href="/auth?next=/account"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-blue-600 px-6 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Log in or sign up
        </Link>
      </div>
    )
  }

  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase() ?? "")
    .join("")

  const tierLabel = isAdmin ? "Admin" : (TIER_LABELS[tier] ?? "Free")
  const tierBadgeClass = isAdmin
    ? "bg-amber-100 text-amber-700"
    : isPremium
    ? "bg-blue-100 text-blue-700"
    : "bg-slate-100 text-slate-600"

  return (
    <div className="grid gap-5">
      {/* Identity card */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        {/* Avatar + overview */}
        <div className="flex items-center gap-4 p-6">
          <span className="w-14 h-14 rounded-full bg-slate-900 text-white text-lg font-semibold flex items-center justify-center shrink-0">
            {initials || "?"}
          </span>
          <div className="min-w-0">
            <p className="text-base font-semibold text-slate-900 truncate">{name || "No name set"}</p>
            <p className="text-sm text-slate-500 truncate">{user.email}</p>
          </div>
        </div>

        {/* Full name */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">Full name</span>
            </div>
            {!editingName && (
              <button
                type="button"
                onClick={() => { setEditingName(true); setNameMessage(null) }}
                className="text-sm text-blue-600 hover:underline"
              >
                Edit
              </button>
            )}
          </div>
          {editingName ? (
            <form onSubmit={saveName} className="flex gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="flex-1 h-9 rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
              />
              <button
                type="submit"
                disabled={savingName}
                className="h-9 px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {savingName ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setEditingName(false)}
                className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </form>
          ) : (
            <p className="text-sm text-slate-900">{name || <span className="text-slate-400">Not set</span>}</p>
          )}
          {nameMessage && <p className="mt-2 text-xs text-emerald-600">{nameMessage}</p>}
        </div>

        {/* Email */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Email address</span>
          </div>
          <p className="text-sm text-slate-900">{user.email}</p>
          <p className="mt-1 text-xs text-slate-400">Contact support to change your email.</p>
        </div>
      </section>

      {/* Grant profile */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Grant profile</h2>
            <p className="text-sm text-slate-500 mt-0.5">Used to match you with relevant grants and benefits.</p>
          </div>
          <Link href="/account/profile" className="shrink-0 text-sm font-medium text-blue-600 hover:underline">
            Edit profile
          </Link>
        </div>
        <div className="mb-2 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-slate-900 transition-all" style={{ width: `${completion}%` }} />
        </div>
        <p className="text-xs text-slate-500">{completion}% complete</p>
      </section>

      {/* Subscription */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CreditCard className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <h2 className="text-base font-semibold text-slate-900">Subscription</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tierBadgeClass}`}>
                  {tierLabel}
                </span>
                {isPremium && !isAdmin && <span className="text-xs text-slate-500">Active</span>}
              </div>
            </div>
          </div>
          <Link
            href="/account/manage-subscription"
            className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 shrink-0 transition-colors"
          >
            Manage <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Password */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-400" />
            <h2 className="text-base font-semibold text-slate-900">Password</h2>
          </div>
          {!showPasswordForm && (
            <button
              type="button"
              onClick={() => { setShowPasswordForm(true); setPasswordMessage(null) }}
              className="text-sm text-blue-600 hover:underline"
            >
              Change
            </button>
          )}
        </div>

        {!showPasswordForm && <p className="text-sm text-slate-400">••••••••</p>}

        {showPasswordForm && (
          <form onSubmit={changePassword} className="mt-4 grid gap-3">
            <label className="grid gap-1.5">
              <span className="text-sm font-medium text-slate-700">New password</span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
                className="h-10 rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-medium text-slate-700">Confirm new password</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
                className="h-10 rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
              />
            </label>
            {passwordError && <p className="text-xs text-rose-600">{passwordError}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={savingPassword}
                className="h-9 px-4 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-700 disabled:opacity-60 transition-colors"
              >
                {savingPassword ? "Saving…" : "Update password"}
              </button>
              <button
                type="button"
                onClick={() => { setShowPasswordForm(false); setPasswordError(null) }}
                className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
        {passwordMessage && <p className="mt-3 text-xs text-emerald-600">{passwordMessage}</p>}
      </section>

      <DeleteAccountButton />
    </div>
  )
}
