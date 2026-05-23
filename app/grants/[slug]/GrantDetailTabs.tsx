"use client"

import { useMemo, useState } from "react"
import { CheckCircle, FileText, Upload } from "lucide-react"
import type { EligibilityCriteria } from "@/lib/types"

type TabKey = "overview" | "eligibility" | "documents" | "reviewer" | "awards"

type GrantDetailTabsProps = {
  description: string
  agency: string
  eligibilityCriteria: EligibilityCriteria | string[]
  documents: string[]
  processingTimeDays?: number | null
}

function criteriaToList(criteria: EligibilityCriteria | string[]) {
  if (Array.isArray(criteria)) return criteria.filter(Boolean)

  const items: string[] = []
  if (criteria.requires_us_business) items.push("Your business or organization is based in the United States.")
  if (criteria.requires_us_ownership) items.push("The applicant is majority U.S.-owned.")
  if (criteria.requires_us_citizen) items.push("The primary applicant is a U.S. citizen or eligible non-citizen.")
  if (criteria.requires_us_resident) items.push("You currently live in the United States.")
  if (criteria.requires_rural) items.push("The project serves a rural area or eligible rural community.")
  if (criteria.requires_minority_owned) items.push("The business is minority-owned or serves an eligible minority community.")
  if (criteria.requires_woman_owned) items.push("The business is woman-owned or led by women.")
  if (criteria.requires_student) items.push("The applicant is enrolled as an eligible student.")
  if (criteria.min_employees) items.push(`Your organization has at least ${criteria.min_employees} employees.`)
  if (criteria.max_employees) items.push(`Your organization has ${criteria.max_employees} or fewer employees.`)
  if (criteria.max_revenue) items.push(`Annual revenue is at or below $${criteria.max_revenue.toLocaleString()}.`)
  if (criteria.industries?.length) items.push(`Your project fits one of these areas: ${criteria.industries.join(", ")}.`)

  return items.length > 0 ? items : ["Your project matches the program purpose and the official eligibility rules."]
}

function estimateHours(document: string) {
  const lower = document.toLowerCase()
  if (lower.includes("narrative") || lower.includes("proposal") || lower.includes("project")) return "8-20 hrs"
  if (lower.includes("budget")) return "2-4 hrs"
  if (lower.includes("letter")) return "1-2 weeks"
  if (lower.includes("tax") || lower.includes("financial")) return "1-2 hrs"
  return "30-60 min"
}

export default function GrantDetailTabs({
  description,
  agency,
  eligibilityCriteria,
  documents,
  processingTimeDays,
}: GrantDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("overview")
  const [checkedDocs, setCheckedDocs] = useState<Set<number>>(new Set())
  const eligibility = useMemo(() => criteriaToList(eligibilityCriteria), [eligibilityCriteria])
  const documentList = documents.length > 0 ? documents : ["Application form", "Project narrative", "Budget or financial information"]
  const progress = Math.round((checkedDocs.size / documentList.length) * 100)

  function toggleDocument(index: number) {
    setCheckedDocs((current) => {
      const next = new Set(current)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "eligibility", label: "Eligibility" },
    { key: "documents", label: `Documents (${checkedDocs.size}/${documentList.length})` },
    { key: "reviewer", label: "What funders look for" },
    { key: "awards", label: "Past awards" },
  ]

  return (
    <div className="space-y-5">
      <div className="overflow-x-auto border-b border-slate-200 bg-white">
        <div className="flex min-w-max gap-5 px-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "border-blue-600 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">About this grant</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Application cycle</p>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              {processingTimeDays
                ? `${agency} lists an estimated processing time of ${processingTimeDays} days.`
                : `Review timelines vary by program. Check ${agency}'s official source for the current cycle before you apply.`}
            </p>
          </div>
        </section>
      )}

      {activeTab === "eligibility" && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Eligibility in plain English</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            You are more likely to qualify if these statements fit your situation. The official source makes the final decision.
          </p>
          <ul className="mt-5 space-y-3">
            {eligibility.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-6 text-slate-700">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {activeTab === "documents" && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Document checklist</h2>
              <p className="mt-2 text-sm text-slate-600">Mark what you already have. Your progress is for this visit only.</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Ready</p>
              <p className="text-xl font-bold tabular-nums text-slate-900">{progress}%</p>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <ul className="mt-5 space-y-3">
            {documentList.map((document, index) => {
              const checked = checkedDocs.has(index)
              return (
                <li key={`${document}-${index}`}>
                  <label
                    className={`flex cursor-pointer gap-3 rounded-lg border p-4 transition-colors ${
                      checked ? "border-blue-100 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleDocument(index)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-slate-900">{document}</span>
                      <span className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                        <FileText className="h-3.5 w-3.5" />
                        Estimated prep: {estimateHours(document)}
                      </span>
                    </span>
                    <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-400 sm:flex">
                      <Upload className="h-4 w-4" />
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {activeTab === "reviewer" && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">What funders look for</h2>
          <div className="mt-5 grid gap-3">
            {[
              "Show that your project directly matches the funder's published priorities.",
              "Use measurable outcomes: jobs created, people served, revenue growth, research milestones, or community impact.",
              "Make the budget easy to scan and tie each cost to a concrete project activity.",
            ].map((note) => (
              <div key={note} className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                {note}
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === "awards" && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Past awards</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            GrantWay does not have verified past-award data for every program yet. Use the official source to compare recent awardees,
            typical award sizes, and reviewer priorities before drafting.
          </p>
        </section>
      )}
    </div>
  )
}
