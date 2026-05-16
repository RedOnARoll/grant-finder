"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getBrowserSupabase } from "@/lib/supabase-browser"

function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => getBrowserSupabase(), [])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function finishSignIn() {
      const next = searchParams.get("next")
      const safeNext = next?.startsWith("/") ? next : "/account"
      const code = searchParams.get("code")

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (exchangeError) {
          setError(exchangeError.message)
          return
        }
      } else {
        const { data, error: sessionError } = await supabase.auth.getSession()
        if (sessionError || !data.session) {
          setError(sessionError?.message ?? "We could not complete sign-in. Please try again.")
          return
        }
      }

      router.replace(safeNext)
      router.refresh()
    }

    finishSignIn()
  }, [router, searchParams, supabase])

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 text-center shadow-sm">
        <h1 className="mb-2 text-xl font-semibold text-zinc-900">
          {error ? "Sign-in needs another try" : "Finishing sign-in..."}
        </h1>
        <p className="text-sm text-zinc-500">
          {error ?? "You will be redirected in a moment."}
        </p>
      </div>
    </main>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <AuthCallback />
    </Suspense>
  )
}
