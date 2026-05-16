"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import SiteNav from "@/components/SiteNav"
import { getBrowserSupabase } from "@/lib/supabase-browser"
import { profileCompletion, type UserProfile } from "@/lib/profile"

export default function AccountPage() {
  const router = useRouter()
  const supabase = useMemo(() => getBrowserSupabase(), [])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })
  }, [supabase])

  async function signOut() {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex min-h-full flex-col">
        <SiteNav active="account" />
        <main className="flex-1 px-6 py-16">
          <div className="mx-auto max-w-3xl text-zinc-500">Loading account...</div>
        </main>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-full flex-col">
        <SiteNav active="account" />
        <main className="flex-1 bg-zinc-50 px-6 py-16">
          <div className="mx-auto max-w-xl rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
            <h1 className="mb-3 text-2xl font-bold text-zinc-900">Log in to view your account</h1>
            <p className="mb-6 text-zinc-500">
              Use Google, Microsoft, or email/password to access your GrantFinder account.
            </p>
            <Link
              href="/auth?next=/account"
              className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
            >
              Log in or sign up
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const displayName = user.user_metadata?.full_name || user.email
  const profile = user.user_metadata?.grantfinder_profile as Partial<UserProfile> | undefined
  const completion = profileCompletion(profile)

  return (
    <div className="flex min-h-full flex-col">
      <SiteNav active="account" />
      <main className="flex-1 bg-zinc-50 px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-zinc-900">Account</h1>
            <p className="text-zinc-500">You are signed in as {displayName}.</p>
          </div>

          <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-start justify-between gap-6">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">Profile</h2>
                <p className="text-sm text-zinc-500">Authentication and profile data are managed securely by Supabase.</p>
              </div>
              <div className="flex flex-wrap justify-end gap-3">
                <Link
                  href="/account/dashboard"
                  className="inline-flex h-10 items-center justify-center rounded-full bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
                >
                  Dashboard
                </Link>
                <Link
                  href="/account/profile"
                  className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-300 px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                >
                  {completion === 100 ? "Edit profile" : "Complete profile"}
                </Link>
                <button
                  type="button"
                  onClick={signOut}
                  className="h-10 rounded-full border border-zinc-300 px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                >
                  Sign out
                </button>
              </div>
            </div>

            <div className="mb-6">
              <div className="mb-1 flex items-center justify-between text-xs font-medium text-zinc-500">
                <span>Profile complete</span>
                <span>{completion}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                <div className="h-full rounded-full bg-zinc-900 transition-all" style={{ width: `${completion}%` }} />
              </div>
            </div>

            <dl className="grid gap-4 text-sm sm:grid-cols-3">
              <div className="rounded-lg bg-zinc-50 p-4">
                <dt className="mb-1 font-medium text-zinc-500">Email</dt>
                <dd className="break-words text-zinc-900">{user.email}</dd>
              </div>
              <div className="rounded-lg bg-zinc-50 p-4">
                <dt className="mb-1 font-medium text-zinc-500">Sign-in method</dt>
                <dd className="capitalize text-zinc-900">{user.app_metadata.provider ?? "email"}</dd>
              </div>
              <div className="rounded-lg bg-zinc-50 p-4">
                <dt className="mb-1 font-medium text-zinc-500">State</dt>
                <dd className="text-zinc-900">{profile?.state || "Not set"}</dd>
              </div>
            </dl>
          </section>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Link href="/account/eligible" className="rounded-xl border border-zinc-200 bg-white p-5 font-medium text-zinc-900 transition-colors hover:border-zinc-400">
              Eligible benefits
            </Link>
            <Link href="/account/dashboard" className="rounded-xl border border-zinc-200 bg-white p-5 font-medium text-zinc-900 transition-colors hover:border-zinc-400">
              Application dashboard
            </Link>
            <Link href="/quiz" className="rounded-xl border border-zinc-200 bg-white p-5 font-medium text-zinc-900 transition-colors hover:border-zinc-400">
              Eligibility quiz
            </Link>
            <Link href="/grants" className="rounded-xl border border-zinc-200 bg-white p-5 font-medium text-zinc-900 transition-colors hover:border-zinc-400">
              Browse grants
            </Link>
            <Link href="/benefits" className="rounded-xl border border-zinc-200 bg-white p-5 font-medium text-zinc-900 transition-colors hover:border-zinc-400">
              Browse benefits
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
