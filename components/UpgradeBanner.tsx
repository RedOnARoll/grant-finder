"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, X } from "lucide-react"

export default function UpgradeBanner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (searchParams.get("upgrade") === "success") {
      setVisible(true)

      const url = new URL(window.location.href)
      const returnPath = url.searchParams.get("next")
      url.searchParams.delete("upgrade")
      url.searchParams.delete("next")
      window.history.replaceState({}, "", url.toString())

      const timer = setTimeout(() => {
        setVisible(false)
        if (returnPath && returnPath.startsWith("/") && !returnPath.startsWith("//")) {
          router.push(returnPath)
        }
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [searchParams, router])

  if (!visible) return null

  return (
    <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-6">
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
