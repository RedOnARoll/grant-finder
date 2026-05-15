"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"

interface SortSelectProps {
  value: string
  options: { value: string; label: string }[]
}

export default function SortSelect({ value, options }: SortSelectProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function handleChange(sort: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (sort) params.set("sort", sort)
    else params.delete("sort")
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <select
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      className="h-10 px-3 rounded-lg border border-zinc-300 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
    >
      <option value="">Sort by…</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}
