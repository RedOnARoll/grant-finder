"use client"

import { FormEvent, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { sanitizeNextPath } from "@/lib/auth"
import { profileCompletion, type UserProfile } from "@/lib/profile"
import { getBrowserSupabase } from "@/lib/supabase-browser"

type AuthMode = "login" | "signup"
type OAuthProvider = "google" | "azure"

function getRedirectUrl(next: string) {
  const url = new URL("/auth/callback", window.location.origin)
  url.searchParams.set("next", next)
  return url.toString()
}

export default function AuthForm({
  initialMode = "login",
  next = "/account",
}: {
  initialMode?: AuthMode
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

  const safeNext = sanitizeNextPath(next)
  const targetAfterAuth = mode === "signup" && safeNext === "/account" ? "/account/profile" : safeNext

  function targetForUser(userProfile: Partial<UserProfile> | undefined) {
    if (targetAfterAuth.startsWith("/account") && targetAfterAuth !== "/account/profile" && profileCompletion(userProfile) === 0) {
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
      options: {
        redirectTo: getRedirectUrl(targetAfterAuth),
      },
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
    const result =
      mode === "signup"
        ? await supabase.auth.signUp({
            email: trimmedEmail,
            password,
            options: {
              data: { full_name: fullName.trim() },
              emailRedirectTo: getRedirectUrl(targetAfterAuth),
            },
          })
        : await supabase.auth.signInWithPassword({
            email: trimmedEmail,
            password,
          })

    setPending(false)

    if (result.error) {
      setError(result.error.message)
      return
    }

    if (mode === "signup" && !result.data.session) {
      setMessage("Check your email to confirm your account, then come back to sign in.")
      return
    }

    const userProfile = result.data.user?.user_metadata?.grantfinder_profile as Partial<UserProfile> | undefined
    router.push(targetForUser(userProfile))
    router.refresh()
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex rounded-lg border border-zinc-200 bg-zinc-50 p-1">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`h-10 flex-1 rounded-md text-sm font-medium transition-colors ${
            mode === "login" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
          }`}
        >
          Log in
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`h-10 flex-1 rounded-md text-sm font-medium transition-colors ${
            mode === "signup" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
          }`}
        >
          Sign up
        </button>
      </div>

      <div className="grid gap-3">
        <button
          type="button"
          onClick={() => continueWithProvider("google")}
          disabled={pending}
          className="h-11 rounded-lg border border-zinc-300 px-4 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Continue with Google
        </button>
        <button
          type="button"
          onClick={() => continueWithProvider("azure")}
          disabled={pending}
          className="h-11 rounded-lg border border-zinc-300 px-4 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Continue with Microsoft
        </button>
      </div>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-zinc-200" />
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">or</span>
        <span className="h-px flex-1 bg-zinc-200" />
      </div>

      <form onSubmit={submitEmailPassword} className="grid gap-4">
        {mode === "signup" && (
          <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
            Full name
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              autoComplete="name"
              className="h-11 rounded-lg border border-zinc-300 px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
            />
          </label>
        )}
        <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            className="h-11 rounded-lg border border-zinc-300 px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            minLength={8}
            required
            className="h-11 rounded-lg border border-zinc-300 px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
          />
        </label>

        {error && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {error}
          </div>
        )}
        {message && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-1 h-11 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Please wait..." : mode === "signup" ? "Create account" : "Log in"}
        </button>
      </form>
    </div>
  )
}
