"use client"

import { useMemo, useState } from "react"
import { Trash2 } from "lucide-react"
import { getBrowserSupabase } from "@/lib/supabase-browser"

export default function DeleteAccountButton() {
  const supabase = useMemo(() => getBrowserSupabase(), [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    if (!confirm("Delete your account? This permanently removes all your data and cancels any active subscription. This cannot be undone.")) return
    setLoading(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token ?? ""}` },
      })
      const json = await res.json() as { ok?: boolean; error?: string }
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Could not delete account.")
      await supabase.auth.signOut()
      window.location.href = "/"
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
      setLoading(false)
    }
  }

  return (
    <div className="border border-rose-200 rounded-xl p-6 mt-10">
      <h2 className="text-sm font-semibold text-rose-700 mb-1">Danger Zone</h2>
      <p className="text-sm text-slate-500 mb-4">
        Permanently delete your account and all associated data. Any active subscription will be cancelled immediately.
      </p>
      {error && <p className="text-xs text-rose-600 mb-3">{error}</p>}
      <button
        onClick={handleDelete}
        disabled={loading}
        className="inline-flex items-center gap-2 h-9 rounded-lg border border-rose-300 text-rose-600 px-4 text-sm font-medium hover:bg-rose-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading
          ? <span className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
          : <><Trash2 className="w-3.5 h-3.5" /> Delete account</>}
      </button>
    </div>
  )
}
