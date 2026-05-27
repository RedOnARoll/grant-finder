"use client"

import { FormEvent, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { getProfile, migrateAccountMetadata } from "@/lib/account-db"
import { sanitizeNextPath } from "@/lib/auth"
import { listenForAuthConfirmation, readLatestAuthConfirmation } from "@/lib/auth-confirmation"
import { profileCompletion, type UserProfile } from "@/lib/profile"
import { getBrowserSupabase } from "@/lib/supabase-browser"

type AuthMode = "login" | "signup" | "forgot"
type OAuthProvider = "google"

function getSiteOrigin() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configuredUrl) return new URL(configuredUrl).origin
  return window.location.origin
}

function getRedirectUrl(next: string, confirmed = false) {
  const url = new URL("/auth/callback", getSiteOrigin())
  url.searchParams.set("next", next)
  if (confirmed) url.searchParams.set("confirmed", "1")
  return url.toString()
}

export default function AuthForm({
  initialMode = "login",
  next = "/account",
}: {
  initialMode?: "login" | "signup"
  next?: string
}) {
  const router = useRouter()
  const supabase = useMemo(() => getBrowserSupabase(), [])
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const handledConfirmationAt = useRef(0)

  const safeNext = sanitizeNextPath(next)
  const targetAfterAuth = mode === "signup" && safeNext === "/account" ? "/account/profile" : safeNext

  function switchMode(next: AuthMode) {
    setMode(next)
    setError(null)
    setMessage(null)
  }

  useEffect(() => {
    function openConfirmedTarget(target: string, at?: number) {
      if (at && at <= handledConfirmationAt.current) return
      if (at) handledConfirmationAt.current = at
      const path = sanitizeNextPath(target, "/")
      router.replace(path)
      router.refresh()
      window.setTimeout(() => {
        if (window.location.pathname === "/auth") window.location.assign(path)
      }, 250)
    }

    const stopListening = listenForAuthConfirmation(
      ({ target, at }) => openConfirmedTarget(target, at),
      { replayLatest: true }
    )

    const poll = window.setInterval(() => {
      const payload = readLatestAuthConfirmation()
      if (payload) openConfirmedTarget(payload.target, payload.at)
    }, 1500)

    return () => {
      stopListening()
      window.clearInterval(poll)
    }
  }, [router])

  async function targetForUser(userId: string | undefined, userProfile?: Partial<UserProfile>) {
    let profile = userProfile
    if (userId) {
      try {
        const { data } = await supabase.auth.getUser()
        if (data.user) await migrateAccountMetadata(supabase, data.user)
        profile = await getProfile(supabase, userId) ?? undefined
      } catch {
        profile = userProfile
      }
    }

    if (targetAfterAuth.startsWith("/account") && targetAfterAuth !== "/account/profile" && profileCompletion(profile) === 0) {
      return "/account/profile"
    }

    return targetAfterAuth
  }

  async function continueWithProvider(provider: OAuthProvider) {
    setPending(true)
    setError(null)
    setMessage(null)

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: getRedirectUrl(targetAfterAuth) },
    })

    if (oauthError) {
      setError(oauthError.message)
      setPending(false)
    }
  }

  async function submitEmailPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)
    setMessage(null)

    const trimmedEmail = email.trim()
    if (mode === "signup") {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password, fullName }),
      })

      const payload = await response.json().catch(() => null) as { error?: string } | null
      setPending(false)

      if (!response.ok) {
        setError(payload?.error ?? "Could not create account.")
        return
      }

      setMessage("Check your email to confirm your account. Once confirmed, this tab will open the main page automatically.")
      return
    }

    const result = await supabase.auth.signInWithPassword({ email: trimmedEmail, password })
    setPending(false)

    if (result.error) {
      setError(result.error.message)
      return
    }

    const userProfile = result.data.user?.user_metadata?.grantfinder_profile as Partial<UserProfile> | undefined
    router.push(await targetForUser(result.data.user?.id, userProfile))
    router.refresh()
  }

  async function submitForgotPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)
    setMessage(null)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: getRedirectUrl("/auth/update-password"),
    })

    setPending(false)

    if (resetError) {
      setError(resetError.message)
      return
    }

    setMessage("Check your email for a password reset link. It expires in 1 hour.")
  }

  // ── Forgot password view ─────────────────────────────────────────────────
  if (mode === "forgot") {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-slate-900">Reset your password</h2>
          <p className="text-sm text-slate-500 mt-1">
            Enter your email and we&apos;ll send you a link to set a new password.
          </p>
        </div>

        <form onSubmit={submitForgotPassword} className="grid gap-4">
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="h-11 rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
            />
          </label>

          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
          )}
          {message && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="h-11 w-full rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Sending…" : "Send reset link"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => switchMode("login")}
          className="mt-4 w-full text-sm text-slate-500 hover:text-slate-900 text-center transition-colors"
        >
          ← Back to log in
        </button>
      </div>
    )
  }

  // ── Login / Signup view ──────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      {/* Mode toggle */}
      <div className="mb-6 flex rounded-lg bg-slate-100 p-1 gap-1">
        <button
          type="button"
          onClick={() => switchMode("login")}
          className={`h-10 flex-1 rounded-lg text-sm font-medium transition-all ${
            mode === "login" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Log in
        </button>
        <button
          type="button"
          onClick={() => switchMode("signup")}
          className={`h-10 flex-1 rounded-lg text-sm font-medium transition-all ${
            mode === "signup" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Sign up
        </button>
      </div>

      {/* OAuth */}
      <div className="grid gap-3">
        <button
          type="button"
          onClick={() => continueWithProvider("google")}
          disabled={pending}
          className="h-11 w-full rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-900 hover:bg-slate-50 transition-colors disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
        >
          <span className="flex items-center justify-center w-5 h-5 rounded bg-red-500 text-white text-xs font-bold shrink-0">G</span>
          Continue with Google
        </button>
      </div>

      {/* Divider */}
      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">or</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      {/* Email/password form */}
      <form onSubmit={submitEmailPassword} className="grid gap-4">
        {mode === "signup" && (
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-slate-700">Full name</span>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              autoComplete="name"
              className="h-11 rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
            />
          </label>
        )}

        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            required
            className="h-11 rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
          />
        </label>

        <div className="grid gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Password</span>
            {mode === "login" && (
              <button
                type="button"
                onClick={() => switchMode("forgot")}
                className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
              >
                Forgot password?
              </button>
            )}
          </div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            minLength={8}
            required
            className="h-11 rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
        )}
        {message && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-1 h-11 w-full rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Please wait…" : mode === "signup" ? "Create account" : "Log in"}
        </button>
      </form>
    </div>
  )
}
