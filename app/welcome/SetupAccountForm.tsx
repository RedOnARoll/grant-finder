"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle } from "lucide-react"
import { getBrowserSupabase } from "@/lib/supabase-browser"

interface Props {
  sessionId: string
  returnTo?: string | null
}

export default function SetupAccountForm({ sessionId, returnTo }: Props) {
  const supabase = useMemo(() => getBrowserSupabase(), [])
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password !== confirm) {
      setError("Passwords do not match")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setPending(true)
    try {
      const res = await fetch("/api/stripe/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, email, password }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => null)
        if (json?.error === "already_claimed") {
          setError("This purchase is already linked to an account. Sign in to access it.")
          return
        }
        if (json?.error === "email_taken") {
          setError("An account with that email already exists. Sign in instead.")
          return
        }
        const text = await res.text().catch(() => "")
        setError(text || "Something went wrong. Please try again.")
        return
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        // Account was created but sign-in failed — send to login
        router.push(`/auth?mode=login&next=${encodeURIComponent(returnTo ?? "/grants")}`)
        return
      }

      router.push(returnTo ?? "/grants")
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mx-auto">
        <CheckCircle className="h-8 w-8 text-emerald-600" />
      </div>

      <h1 className="text-3xl font-bold text-slate-900 text-center">Payment confirmed!</h1>
      <p className="mt-3 text-slate-600 text-center leading-7">
        Create your account to access your new features. You can use any email address.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none ring-offset-1 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none ring-offset-1 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500"
            placeholder="At least 8 characters"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirm" className="text-sm font-medium text-slate-700">
            Confirm password
          </label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none ring-offset-1 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500"
            placeholder="Repeat password"
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Creating account…" : "Create account & continue"}
        </button>
      </form>
    </div>
  )
}
