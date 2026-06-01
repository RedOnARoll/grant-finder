"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getBrowserSupabase } from "@/lib/supabase-browser"

export default function SaveResultsBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    getBrowserSupabase().auth.getUser().then(({ data: { user } }) => {
      setShow(!user)
    })
  }, [])

  if (!show) return null

  return (
    <div className="bg-blue-600 text-white rounded-xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
      <div>
        <p className="font-semibold text-base leading-snug">Save your results — free, no credit card</p>
        <p className="text-sm text-blue-100 mt-0.5">Track deadlines, documents, and eligibility checklists for every match.</p>
      </div>
      <div className="flex gap-2 shrink-0">
        <Link
          href="/auth"
          className="h-9 px-4 bg-white text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors inline-flex items-center whitespace-nowrap"
        >
          Create free account
        </Link>
        <Link
          href="/auth"
          className="h-9 px-4 bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors inline-flex items-center whitespace-nowrap"
        >
          Sign in
        </Link>
      </div>
    </div>
  )
}
