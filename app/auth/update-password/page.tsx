"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getBrowserSupabase } from "@/lib/supabase-browser"
import { LogoMark } from "@/components/illustrations/GeoShapes"

export default function UpdatePasswordPage() {
  const router = useRouter()
  const supabase = useMemo(() => getBrowserSupabase(), [])
  const [ready, setReady] = useState(false)
  const [invalid, setInvalid] = useState(false)
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setReady(true)
      else setInvalid(true)
    })
  }, [supabase])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError("Passwords don't match.")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    setPending(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setPending(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setDone(true)
    setTimeout(() => router.replace("/account"), 2500)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark className="w-6 h-6" />
            <span className="text-sm font-semibold text-slate-900">GrantWay</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">

            {/* Loading */}
            {!ready && !invalid && (
              <div className="flex items-center justify-center h-24">
                <div className="w-6 h-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
              </div>
            )}

            {/* Expired / invalid link */}
            {invalid && (
              <div className="text-center space-y-4">
                <p className="text-base font-semibold text-slate-900">Link expired or invalid</p>
                <p className="text-sm text-slate-500">
                  Password reset links expire after 1 hour. Request a new one from the login page.
                </p>
                <Link
                  href="/auth"
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  Back to log in
                </Link>
              </div>
            )}

            {/* Success */}
            {done && (
              <div className="text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 20 20">
                    <path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-base font-semibold text-slate-900">Password updated</p>
                <p className="text-sm text-slate-500">Redirecting you to your account…</p>
              </div>
            )}

            {/* Form */}
            {ready && !done && (
              <>
                <div className="mb-6">
                  <h1 className="text-base font-semibold text-slate-900">Set a new password</h1>
                  <p className="text-sm text-slate-500 mt-1">Choose a strong password — at least 8 characters.</p>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-4">
                  <label className="grid gap-1.5">
                    <span className="text-sm font-medium text-slate-700">New password</span>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      autoComplete="new-password"
                      minLength={8}
                      required
                      className="h-11 rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    />
                  </label>

                  <label className="grid gap-1.5">
                    <span className="text-sm font-medium text-slate-700">Confirm password</span>
                    <input
                      type="password"
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      autoComplete="new-password"
                      minLength={8}
                      required
                      className="h-11 rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    />
                  </label>

                  {error && (
                    <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
                  )}

                  <button
                    type="submit"
                    disabled={pending}
                    className="h-11 w-full rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {pending ? "Saving…" : "Update password"}
                  </button>
                </form>
              </>
            )}

          </div>
        </div>
      </main>
    </div>
  )
}
