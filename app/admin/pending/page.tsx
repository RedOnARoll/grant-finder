"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getBrowserSupabase } from "@/lib/supabase-browser"
import type { Grant } from "@/lib/types"
import { Badge } from "@/components/ui/Badge"

const PLACEHOLDER_MARKER = "could not be verified as a stable universal rule"

function hasPlaceholderCriteria(criteria: Grant["eligibility_criteria"]): boolean {
  if (!Array.isArray(criteria)) return false
  return criteria.some(
    (c) => typeof c === "string" && c.includes(PLACEHOLDER_MARKER)
  )
}

function categoryLabel(cat: string): string {
  return cat.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
}

export default function AdminPendingPage() {
  const [loading, setLoading] = useState(true)
  const [grants, setGrants] = useState<Grant[]>([])

  useEffect(() => {
    async function load() {
      const supabase = getBrowserSupabase()
      const { data } = await supabase
        .from("grants")
        .select("*")
        .eq("type", "grant")
        .order("name")

      const pending = ((data ?? []) as Grant[]).filter((g) =>
        hasPlaceholderCriteria(g.eligibility_criteria)
      )
      setGrants(pending)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-7 h-7 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Page title */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Pending Eligibility Criteria</h1>
        <Badge variant="amber">{grants.length} grants</Badge>
      </div>
      <p className="text-sm text-slate-600">
        These grants have placeholder eligibility criteria. Run{" "}
        <code className="bg-slate-100 rounded px-1 py-0.5 font-mono text-xs">
          fix-eligibility-criteria.sql
        </code>{" "}
        in the Supabase SQL editor to populate real criteria — they will automatically disappear from this list.
      </p>

      {grants.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
          <div className="text-4xl mb-4">✓</div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">All caught up!</h2>
          <p className="text-sm text-slate-600">No grants with placeholder criteria found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-5 py-3 font-medium text-slate-600">Grant Name</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Agency</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Category</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Slug</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {grants.map((grant) => (
                <tr key={grant.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-slate-900 max-w-xs">{grant.name}</td>
                  <td className="px-5 py-4 text-slate-600 max-w-[180px] truncate">{grant.agency}</td>
                  <td className="px-5 py-4">
                    <Badge variant="slate">{categoryLabel(grant.category)}</Badge>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-500">{grant.slug}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/grants/${grant.slug}`}
                        target="_blank"
                        className="text-blue-600 hover:underline text-xs font-medium"
                      >
                        View
                      </Link>
                      {grant.official_source_url && (
                        <a
                          href={grant.official_source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-500 hover:underline text-xs font-medium"
                        >
                          Source ↗
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-4 border-t border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-500">
              {grants.length} grant{grants.length !== 1 ? "s" : ""} with placeholder eligibility criteria.
            </p>
          </div>
        </div>
      )}

      {/* SQL instructions */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-2">How to fix these</h2>
        <ol className="text-sm text-slate-700 space-y-1 list-decimal list-inside">
          <li>Open the <strong>Supabase SQL editor</strong> for this project</li>
          <li>
            Copy the contents of{" "}
            <code className="bg-white/70 rounded px-1 font-mono text-xs">
              fix-eligibility-criteria.sql
            </code>{" "}
            from the repo root
          </li>
          <li>Paste and run it — each UPDATE sets real eligibility criteria for one grant</li>
          <li>Refresh this page to confirm the grants disappear from the list</li>
        </ol>
      </div>
    </div>
  )
}
