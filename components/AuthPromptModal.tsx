"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { LogIn, X } from "lucide-react"
import AuthForm from "@/components/AuthForm"

interface Props {
  isOpen: boolean
  onClose: () => void
  mode: "save" | "apply"
  next?: string
}

const COPY = {
  save: {
    title: "Sign in or create an account",
    body: "We will save this program to your dashboard after you log in.",
  },
  apply: {
    title: "Sign in or create an account",
    body: "Track this application, get deadline reminders, and save your progress.",
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
          width: "480px", maxWidth: "calc(100vw - 32px)", maxHeight: "calc(100vh - 32px)",
        }}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50">
              <LogIn className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                {mode === "save" ? "Save & Track" : "Apply"}
              </p>
              <h2 className="mt-1 text-base font-semibold text-slate-900">{copy.title}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">{copy.body}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto bg-slate-50 p-4 sm:p-5">
          <AuthForm initialMode="login" next={nextParam} />
        </div>
      </div>
    </>,
    document.body
  )
}
