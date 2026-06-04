"use client"

import { useState } from "react"
import { getDocumentGenerationAction } from "@/lib/document-generation"

function isApplicationItem(doc: string): boolean {
  const d = doc.toLowerCase()
  if (!d.includes("fafsa") && (d.includes("application") || d.includes("enrollment form"))) return true
  return (
    d.includes("submission portal") || d.includes("apply via") || d.includes("apply through") ||
    d.includes("apply online") || d.includes("submit via") || d.includes("submit through") ||
    d.includes("application portal") || d.includes("grants.gov")
  )
}

export default function DocumentChecklist({ documents }: { documents: string[] }) {
  const filtered = documents.filter(doc => !isApplicationItem(doc))
  const [checked, setChecked] = useState<Set<number>>(new Set())

  function toggle(i: number) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(i)) {
        next.delete(i)
      } else {
        next.add(i)
      }
      return next
    })
  }

  const done = checked.size
  const total = filtered.length

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
        {filtered.map((doc, i) => {
          const generationAction = getDocumentGenerationAction(doc)

          return (
            <li key={i}>
              <div className="flex flex-wrap items-start gap-3">
                <label className="flex min-w-0 flex-1 items-start gap-3 cursor-pointer group">
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
                {generationAction && (
                  <button
                    type="button"
                    data-document-generator={generationAction.documentType}
                    data-document-name={doc}
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent("grant-document-draft-request", {
                        detail: {
                          documentName: doc,
                          documentType: generationAction.documentType,
                        },
                      }))
                    }}
                    className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 transition-colors hover:border-amber-300 hover:bg-amber-100"
                  >
                    {generationAction.label}
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      {done === total && total > 0 && filtered.length > 0 && (
        <p className="mt-5 text-sm font-medium text-green-700 bg-green-50 px-4 py-2.5 rounded-lg">
          All documents gathered — you&apos;re ready to apply!
        </p>
      )}
    </div>
  )
}
