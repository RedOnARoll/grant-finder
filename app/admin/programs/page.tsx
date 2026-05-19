"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Plus, Search } from "lucide-react"
import { getBrowserSupabase } from "@/lib/supabase-browser"
import type { Grant } from "@/lib/types"
import { Badge, StatusBadge } from "@/components/ui/Badge"
import { deleteGrant } from "./[id]/actions"

function formatAmount(amount: number | null) {
  if (amount == null) return "Missing"
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`
  return `$${amount}`
}

function programPath(program: Grant) {
  return `/${program.type === "benefit" ? "benefits" : "grants"}/${program.slug}`
}

export default function AdminProgramsPage() {
  const supabase = useMemo(() => getBrowserSupabase(), [])
  const [programs, setPrograms] = useState<Grant[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [type, setType] = useState<"all" | "grant" | "benefit">("all")
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      const { data, error: loadError } = await supabase
        .from("grants")
        .select("*")
        .order("name")

      if (!mounted) return

      if (loadError) {
        setError(loadError.message)
      } else {
        setPrograms((data ?? []) as Grant[])
      }

      setLoading(false)
    }

    load()

    return () => {
      mounted = false
    }
  }, [supabase])

  async function handleDelete(program: Grant) {
    if (!window.confirm(`Delete "${program.name}"? This cannot be undone.`)) return
    setDeletingId(program.id)
    setError(null)
    const { data: { session } } = await supabase.auth.getSession()
    const { error: deleteError } = await deleteGrant(session?.access_token ?? "", program.id)
    if (deleteError) {
      setError(deleteError)
    } else {
      setPrograms((prev) => prev.filter((p) => p.id !== program.id))
    }
    setDeletingId(null)
  }

  const visiblePrograms = programs.filter((program) => {
    const q = query.trim().toLowerCase()
    if (type !== "all" && program.type !== type) return false
    if (!q) return true
    return (
      program.name.toLowerCase().includes(q) ||
      program.agency.toLowerCase().includes(q) ||
      program.slug.toLowerCase().includes(q) ||
      program.description.toLowerCase().includes(q)
    )
  })

  return (
    <div className="max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Programs</h1>
          <p className="mt-1 text-sm text-slate-500">
            Edit any grant or benefit record in the Supabase grants table.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="blue">{programs.length} total</Badge>
          <Link
            href="/admin/programs/new"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New program
          </Link>
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, agency, slug, or description..."
              className="h-11 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <select
            value={type}
            onChange={(event) => setType(event.target.value as "all" | "grant" | "benefit")}
            className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All types</option>
            <option value="grant">Grants</option>
            <option value="benefit">Benefits</option>
          </select>
        </div>
        {error && (
          <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : visiblePrograms.length === 0 ? (
          <div className="p-10 text-center">
            <h2 className="text-lg font-semibold text-slate-900">No programs found</h2>
            <p className="mt-1 text-sm text-slate-500">Try a different search or type filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-3 text-left font-medium text-slate-600">Program</th>
                  <th className="px-5 py-3 text-left font-medium text-slate-600">Type</th>
                  <th className="px-5 py-3 text-left font-medium text-slate-600">Category</th>
                  <th className="px-5 py-3 text-left font-medium text-slate-600">Amount</th>
                  <th className="px-5 py-3 text-left font-medium text-slate-600">Status</th>
                  <th className="px-5 py-3 text-left font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visiblePrograms.map((program) => (
                  <tr key={program.id} className="hover:bg-slate-50">
                    <td className="max-w-md px-5 py-4">
                      <p className="font-medium text-slate-900">{program.name}</p>
                      <p className="mt-1 truncate text-xs text-slate-500">{program.agency || "No agency"} · {program.slug}</p>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={program.type === "grant" ? "amber" : "green"}>
                        {program.type}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {program.subcategory || program.category}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{formatAmount(program.max_amount)}</td>
                    <td className="px-5 py-4">
                      <StatusBadge deadline={program.deadline} isRecurring={program.is_recurring} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/programs/${program.id}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          Edit
                        </Link>
                        <Link
                          href={programPath(program)}
                          target="_blank"
                          className="text-slate-500 hover:text-blue-600"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(program)}
                          disabled={deletingId === program.id}
                          className="text-rose-500 hover:text-rose-700 disabled:opacity-40"
                        >
                          {deletingId === program.id ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
