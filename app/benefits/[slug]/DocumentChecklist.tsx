"use client"

import { useState } from "react"

export default function DocumentChecklist({ documents }: { documents: string[] }) {
  const [checked, setChecked] = useState<boolean[]>(documents.map(() => false))

  const toggle = (i: number) =>
    setChecked((prev) => prev.map((v, j) => (j === i ? !v : v)))

  const count = checked.filter(Boolean).length

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-zinc-900">Required Documents</h2>
        <span className="text-sm text-zinc-500">
          {count}/{documents.length} ready
        </span>
      </div>

      {count > 0 && (
        <div className="mb-4 h-2 rounded-full bg-zinc-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-zinc-900 transition-all"
            style={{ width: `${(count / documents.length) * 100}%` }}
          />
        </div>
      )}

      <ul className="space-y-2">
        {documents.map((doc, i) => (
          <li key={i}>
            <label className="flex items-start gap-3 cursor-pointer group">
              <span
                className={`mt-0.5 shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                  checked[i]
                    ? "bg-zinc-900 border-zinc-900"
                    : "border-zinc-300 group-hover:border-zinc-500"
                }`}
                onClick={() => toggle(i)}
              >
                {checked[i] && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span
                className={`text-sm leading-5 transition-colors ${
                  checked[i] ? "line-through text-zinc-400" : "text-zinc-700"
                }`}
                onClick={() => toggle(i)}
              >
                {doc}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}
