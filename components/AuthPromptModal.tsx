"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { LogIn, X } from "lucide-react"

interface Props {
  isOpen: boolean
  onClose: () => void
  mode: "save" | "apply"
  next?: string
}

const COPY = {
  save: {
    title: "Sign in to save & track",
    body: "Create a free account to save programs, get deadline reminders, and track your applications.",
    cta: "Sign In to Save",
  },
  apply: {
    title: "Sign in to start applying",
    body: "Create a free account to track this application, get deadline reminders, and save your progress.",
    cta: "Sign In to Apply",
  },
}

export default function AuthPromptModal({ isOpen, onClose, mode, next }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!isOpen) return
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", h)
    return () => document.removeEventListener("keydown", h)
  }, [isOpen, onClose])

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  if (!isOpen || !mounted) return null

  const copy = COPY[mode]
  const nextParam = next ?? (typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/")
  const signInHref = `/auth?mode=login&next=${encodeURIComponent(nextParam)}`
  const signUpHref = `/auth?mode=signup&next=${encodeURIComponent(nextParam)}`

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[400] bg-slate-900/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed z-[401] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{
          top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: "380px", maxWidth: "calc(100vw - 32px)",
        }}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50">
              <LogIn className="h-4 w-4 text-blue-600" />
            </div>
            <h2 className="text-base font-semibold text-slate-900">{copy.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="px-5 pb-5 text-sm text-slate-500 leading-relaxed">{copy.body}</p>

        <div className="flex flex-col gap-2 px-5 pb-5">
          <a
            href={signInHref}
            className="flex h-10 items-center justify-center rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            {copy.cta}
          </a>
          <a
            href={signUpHref}
            className="flex h-10 items-center justify-center rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Create free account
          </a>
        </div>
      </div>
    </>,
    document.body
  )
}
