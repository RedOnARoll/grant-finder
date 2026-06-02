"use client"

import { useEffect, useMemo, useState } from "react"
import { FileDown, Loader2 } from "lucide-react"
import { getBrowserSupabase } from "@/lib/supabase-browser"
import PaywallModal from "@/components/PaywallModal"

type State = "loading" | "ready" | "locked" | "downloading" | "error"

export default function PrefillButton({
  grantSlug,
  grantName,
}: {
  grantSlug: string
  grantName: string
}) {
  const supabase = useMemo(() => getBrowserSupabase(), [])
  const [state, setState] = useState<State>("loading")
  const [projectTitle, setProjectTitle] = useState("")
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    let alive = true
    async function checkAccess() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { if (alive) setState("locked"); return }

      const { data } = await supabase
        .from("profiles")
        .select("is_premium, is_admin, subscription_tier")
        .eq("user_id", user.id)
        .maybeSingle()

      if (!alive) return
      const profile = data as { is_premium?: boolean; is_admin?: boolean; subscription_tier?: string } | null
      const isPremium = Boolean(profile?.is_premium) && profile?.subscription_tier === "premium"
      const isAdmin = Boolean(profile?.is_admin)
      setState(isPremium || isAdmin ? "ready" : "locked")
    }
    checkAccess().catch(() => { if (alive) setState("locked") })
    return () => { alive = false }
  }, [supabase])

  async function handlePrefill() {
    setState("downloading")
    setErrorMsg("")

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token ?? ""

      const res = await fetch("/api/grants/prefill", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ grant_slug: grantSlug, project_title: projectTitle || undefined }),
      })

      if (res.status === 403) {
        setState("locked")
        setPaywallOpen(true)
        return
      }

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || `Error ${res.status}`)
      }

      const blob = await res.blob()
      const disposition = res.headers.get("Content-Disposition") ?? ""
      const filenameMatch = disposition.match(/filename="?([^";]+)"?/)
      const filename = filenameMatch?.[1] ?? `SF424-${grantSlug}.pdf`

      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setState("ready")
    } catch (err) {
      console.error("[prefill]", err)
      setErrorMsg(err instanceof Error ? err.message : "Download failed. Please try again.")
      setState("error")
    }
  }

  // Don't render anything while checking auth or if user is not premium
  if (state === "loading") return null
  if (state === "locked") {
    return (
      <>
        <button
          type="button"
          onClick={() => setPaywallOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          title="Premium feature — pre-fill SF-424 with your profile"
        >
          <FileDown className="h-4 w-4" />
          Pre-fill SF-424
        </button>
        <PaywallModal isOpen={paywallOpen} onClose={() => setPaywallOpen(false)} grantName={grantName} />
      </>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={projectTitle}
          onChange={e => setProjectTitle(e.target.value)}
          placeholder="Project title (optional)"
          className="h-10 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
          disabled={state === "downloading"}
        />
        <button
          type="button"
          onClick={handlePrefill}
          disabled={state === "downloading"}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {state === "downloading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileDown className="h-4 w-4" />
          )}
          {state === "downloading" ? "Generating…" : "Pre-fill SF-424"}
        </button>
      </div>
      {state === "error" && (
        <p className="text-xs text-rose-600">{errorMsg}</p>
      )}
      <p className="text-xs text-slate-500">
        Downloads a pre-filled SF-424 cover sheet based on your profile.
      </p>
    </div>
  )
}
