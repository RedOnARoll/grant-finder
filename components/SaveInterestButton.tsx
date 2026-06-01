"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { getSavedPrograms, migrateAccountMetadata, removeSavedProgram, saveProgram } from "@/lib/account-db"
import { getBrowserSupabase } from "@/lib/supabase-browser"
import AuthPromptModal from "@/components/AuthPromptModal"

const PENDING_SAVE_KEY = "grantfinder_pending_save"

type SaveInterestButtonProps = {
  slug: string
  type: "grant" | "benefit"
  label?: "icon" | "full"
}

function readPendingSave() {
  try {
    const raw = window.localStorage.getItem(PENDING_SAVE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<Pick<SaveInterestButtonProps, "slug" | "type">>
    return parsed.slug && (parsed.type === "grant" || parsed.type === "benefit") ? parsed : null
  } catch {
    return null
  }
}

function clearPendingSave() {
  window.localStorage.removeItem(PENDING_SAVE_KEY)
}

export default function SaveInterestButton({ slug, type, label = "full" }: SaveInterestButtonProps) {
  const supabase = useMemo(() => getBrowserSupabase(), [])
  const [saved, setSaved] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [pending, setPending] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  const syncSavedState = useCallback(async (user: User | null) => {
    if (user) await migrateAccountMetadata(supabase, user)
    const savedPrograms = user ? await getSavedPrograms(supabase, user.id) : []
    const alreadySaved = savedPrograms.some((item) => item.slug === slug && item.type === type)
    const pendingSave = user ? readPendingSave() : null

    if (user && pendingSave?.slug === slug && pendingSave.type === type && !alreadySaved) {
      try {
        await saveProgram(supabase, user.id, slug, type)
        clearPendingSave()
        setSaved(true)
      } catch {
        setSaved(false)
      }
      return
    }

    if (pendingSave?.slug === slug && pendingSave.type === type) clearPendingSave()
    setSaved(alreadySaved)
  }, [slug, supabase, type])

  useEffect(() => {
    let alive = true

    supabase.auth.getUser().then(async ({ data }) => {
      if (!alive) return
      await syncSavedState(data.user)
      if (!alive) return
      setLoaded(true)
    })

    return () => {
      alive = false
    }
  }, [supabase, syncSavedState])

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) return
      void syncSavedState(session.user).then(() => {
        setAuthModalOpen(false)
        setLoaded(true)
      })
    })

    return () => listener.subscription.unsubscribe()
  }, [supabase, syncSavedState])

  async function toggleSaved() {
    setPending(true)
    const previousSaved = saved

    const { data } = await supabase.auth.getUser()
    const user = data.user

    if (!user) {
      window.localStorage.setItem(PENDING_SAVE_KEY, JSON.stringify({ slug, type }))
      setPending(false)
      setAuthModalOpen(true)
      return
    }

    await migrateAccountMetadata(supabase, user)
    const savedPrograms = await getSavedPrograms(supabase, user.id)
    const alreadySaved = savedPrograms.some((item) => item.slug === slug && item.type === type)
    setSaved(!alreadySaved)

    try {
      if (alreadySaved) {
        await removeSavedProgram(supabase, user.id, slug, type)
      } else {
        await saveProgram(supabase, user.id, slug, type)
      }
    } catch {
      setSaved(previousSaved)
    }

    setPending(false)
  }

  const text = saved ? "Saved" : "Save & Track"
  const symbol = saved ? "★" : "☆"
  const title = saved ? "Remove from dashboard" : "Save to dashboard and get deadline reminders"

  return (
    <>
      <button
        type="button"
        onClick={toggleSaved}
        disabled={!loaded || pending}
        title={title}
        aria-pressed={saved}
        className={`inline-flex h-10 items-center justify-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          saved
            ? "border-yellow-300 bg-yellow-50 text-zinc-900 hover:bg-yellow-100"
            : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500 hover:text-zinc-900"
        } ${label === "icon" ? "w-10 px-0" : ""}`}
      >
        <span className={`text-base leading-none ${saved ? "text-yellow-500" : "text-zinc-400"}`}>
          {symbol}
        </span>
        {label === "full" && <span>{text}</span>}
      </button>
      <AuthPromptModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode="save"
      />
    </>
  )
}
