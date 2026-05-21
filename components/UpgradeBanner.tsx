"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle, X } from "lucide-react"

export default function UpgradeBanner() {
  const searchParams = useSearchParams()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (searchParams.get("upgrade") === "success") {
      setVisible(true)

      // Strip the param from the URL without a page reload
      const url = new URL(window.location.href)
      url.searchParams.delete("upgrade")
      window.history.replaceState({}, "", url.toString())
    }
  }, [searchParams])

  if (!visible) return null

  return (
    <div className="pointer-events-auto flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl shadow-lg px-4 py-3">
      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
      <p className="text-sm font-medium text-emerald-800 flex-1">
        Welcome to GrantWay Premium! Your account has been upgraded.
      </p>
      <button
        onClick={() => setVisible(false)}
        className="text-emerald-500 hover:text-emerald-700 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
