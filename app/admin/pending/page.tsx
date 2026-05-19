"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getBrowserSupabase } from "@/lib/supabase-browser"
import type { Grant } from "@/lib/types"
import { LogoMark } from "@/components/illustrations/GeoShapes"
import { Badge } from "@/components/ui/Badge"

const ADMIN_EMAIL = "redonaroll09@gmail.com"

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
  const [status, setStatus] = useState<"loading" | "unauthorized" | "ready">("loading")
  const [grants, setGrants] = useState<Grant[]>([])

  useEffect(() => {
    const supabase = getBrowserSupabase()

    async function init() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user || user.email !== ADMIN_EMAIL) {
        setStatus("unauthorized")
        return
      }

      const { data, error } = await supabase
        .from("grants")
        .select("*")
        .eq("type", "grant")
        .order("name")

      if (error || !data) {
        setStatus("unauthorized")
        return
      }

      const pending = (data as Grant[]).filter((g) => hasPlaceholderCriteria(g.eligibility_criteria))
      setGrants(pending)
      setStatus("ready")
    }

    init()
  }, [])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (status === "unauthorized") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 px-4">
        <LogoMark className="w-10 h-10" />
        <h1 className="text-xl font-semibold text-slate-900">Access Denied</h1>
        <p className="text-sm text-slate-600">This page is restricted to administrators.</p>
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          Back to home
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin header */}
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LogoMark className="w-7 h-7" />
          <span className="font-semibold text-white">GrantWay Admin</span>
          <span className="text-slate-400 text-sm">/ Pending Review</span>
        </div>
        <Link href="/" className="text-sm text-slate-300 hover:text-white transition-colors">
          ← Back to site
        </Link>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-slate-900">Grants Pending Eligibility Review</h1>
            <Badge variant="amber">{grants.length} grants</Badge>
          </div>
          <p className="text-sm text-slate-600">
            These grants have placeholder eligibility criteria that need real requirements. Run{" "}
            <code className="bg-slate-100 rounded px-1 py-0.5 font-mono text-xs">fix-eligibility-criteria.sql</code>{" "}
            in the Supabase SQL editor to populate real criteria, then they will automatically disappear from this list.
          </p>
        </div>

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
                    <td className="px-5 py-4 font-medium text-slate-900 max-w-xs">
                      {grant.name}
                    </td>
                    <td className="px-5 py-4 text-slate-600 max-w-[180px] truncate">
                      {grant.agency}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant="slate">{categoryLabel(grant.category)}</Badge>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">
                      {grant.slug}
                    </td>
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
                Showing {grants.length} grant{grants.length !== 1 ? "s" : ""} with placeholder eligibility criteria.
              </p>
            </div>
          </div>
        )}

        {/* SQL instructions */}
        <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">How to fix these</h2>
          <ol className="text-sm text-slate-700 space-y-1 list-decimal list-inside">
            <li>Open the <strong>Supabase SQL editor</strong> for this project</li>
            <li>Copy the contents of <code className="bg-white/70 rounded px-1 font-mono text-xs">fix-eligibility-criteria.sql</code> from the repo root</li>
            <li>Paste and run it — each UPDATE sets real eligibility criteria for one grant</li>
            <li>Refresh this page to confirm the grants disappear from the list</li>
          </ol>
        </div>
      </main>
    </div>
  )
}
