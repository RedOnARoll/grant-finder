"use client"

import { useState } from "react"

export default function DocumentChecklist({ documents }: { documents: string[] }) {
  const [checked, setChecked] = useState<Set<number>>(new Set())

  function toggle(i: number) {
    setChecked((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const done = checked.size
  const total = documents.length

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-zinc-900">Required Documents</h2>
        <span className="text-sm text-zinc-500">
          {done}/{total} gathered
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-zinc-100 rounded-full mb-5 overflow-hidden">
        <div
          className="h-full bg-zinc-900 rounded-full transition-all duration-300"
          style={{ width: total > 0 ? `${(done / total) * 100}%` : "0%" }}
        />
      </div>

      <ul className="space-y-3">
        {documents.map((doc, i) => (
          <li key={i}>
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked.has(i)}
                  onChange={() => toggle(i)}
                />
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    checked.has(i)
                      ? "bg-zinc-900 border-zinc-900"
                      : "border-zinc-300 group-hover:border-zinc-500"
                  }`}
                >
                  {checked.has(i) && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <span
                className={`text-sm leading-5 transition-colors ${
                  checked.has(i) ? "line-through text-zinc-400" : "text-zinc-700"
                }`}
              >
                {doc}
              </span>
            </label>
          </li>
        ))}
      </ul>

      {done === total && total > 0 && (
        <p className="mt-5 text-sm font-medium text-green-700 bg-green-50 px-4 py-2.5 rounded-lg">
          All documents gathered — you&apos;re ready to apply!
        </p>
      )}
    </div>
  )
}
