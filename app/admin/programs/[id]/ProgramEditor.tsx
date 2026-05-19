"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { SupabaseClient } from "@supabase/supabase-js"
import { getBrowserSupabase } from "@/lib/supabase-browser"
import type { BenefitSubcategory, Grant, GrantCategory } from "@/lib/types"
import { Badge } from "@/components/ui/Badge"
import { createGrant, deleteGrant, updateGrant } from "./actions"

type EditableProgram = Pick<
  Grant,
  | "name"
  | "agency"
  | "category"
  | "subcategory"
  | "type"
  | "description"
  | "max_amount"
  | "is_recurring"
  | "deadline"
  | "eligibility_criteria"
  | "required_documents"
  | "application_url"
  | "official_source_url"
  | "form_numbers"
  | "processing_time_days"
  | "slug"
>

const GRANT_CATEGORIES: GrantCategory[] = [
  "small_business",
  "individual",
  "agricultural",
  "research",
  "education",
  "veterans",
  "arts",
  "housing",
  "energy",
  "health",
]

const BENEFIT_SUBCATEGORIES: BenefitSubcategory[] = [
  "housing",
  "food",
  "disability",
  "education",
  "childcare",
  "energy",
  "health",
]

function textList(value: string[]) {
  return (value ?? []).join("\n")
}

function parseTextList(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
}

function stringifyCriteria(value: Grant["eligibility_criteria"]) {
  if (Array.isArray(value)) return value.join("\n")
  return JSON.stringify(value ?? {}, null, 2)
}

function parseCriteria(value: string): Grant["eligibility_criteria"] {
  const trimmed = value.trim()
  if (!trimmed) return []
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    const parsed = JSON.parse(trimmed) as Grant["eligibility_criteria"]
    if (!Array.isArray(parsed) && (typeof parsed !== "object" || parsed === null)) {
      throw new Error("Eligibility criteria must be a JSON object, JSON array, or one criterion per line.")
    }
    return parsed
  }
  return parseTextList(value)
}

function formatDateInput(value: string | null) {
  if (!value) return ""
  return value.slice(0, 10)
}

function nullableNumber(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed)
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error("Amounts, employee-style counts, and processing days must be zero or positive numbers.")
  }
  return parsed
}

function fieldClass(error?: string) {
  return `rounded-lg border px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${
    error ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-white"
  }`
}

function TextField({
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  type?: string
  placeholder?: string
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`h-11 ${fieldClass(error)}`}
      />
      {error && <span className="text-xs font-medium text-rose-600">{error}</span>}
    </label>
  )
}

function TextAreaField({
  label,
  value,
  onChange,
  error,
  rows = 5,
  note,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  rows?: number
  note?: string
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {note && <span className="text-xs leading-5 text-slate-500">{note}</span>}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        className={`resize-y py-3 ${fieldClass(error)}`}
      />
      {error && <span className="text-xs font-medium text-rose-600">{error}</span>}
    </label>
  )
}

const EMPTY_FORM: EditableProgram = {
  name: "",
  agency: "",
  category: "small_business",
  subcategory: null,
  type: "grant",
  description: "",
  max_amount: null,
  is_recurring: false,
  deadline: null,
  eligibility_criteria: [],
  required_documents: [],
  application_url: "",
  official_source_url: "",
  form_numbers: [],
  processing_time_days: null,
  slug: "",
}

export default function ProgramEditor({ id }: { id: string }) {
  const isNew = id === "new"
  const router = useRouter()
  const supabase = useMemo(() => getBrowserSupabase() as SupabaseClient, [])
  const [program, setProgram] = useState<Grant | null>(null)
  const [form, setForm] = useState<EditableProgram | null>(isNew ? EMPTY_FORM : null)
  const [criteriaText, setCriteriaText] = useState("")
  const [documentsText, setDocumentsText] = useState("")
  const [formsText, setFormsText] = useState("")
  const [deadlineValue, setDeadlineValue] = useState("")
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isNew) return
    let mounted = true

    async function load() {
      const { data, error: loadError } = await supabase
        .from("grants")
        .select("*")
        .eq("id", id)
        .single()

      if (!mounted) return

      if (loadError || !data) {
        setError(loadError?.message ?? "Program not found.")
        setLoading(false)
        return
      }

      const nextProgram = data as Grant
      setProgram(nextProgram)
      setForm({
        name: nextProgram.name ?? "",
        agency: nextProgram.agency ?? "",
        category: nextProgram.category,
        subcategory: nextProgram.subcategory,
        type: nextProgram.type,
        description: nextProgram.description ?? "",
        max_amount: nextProgram.max_amount,
        is_recurring: Boolean(nextProgram.is_recurring),
        deadline: nextProgram.deadline,
        eligibility_criteria: nextProgram.eligibility_criteria,
        required_documents: nextProgram.required_documents ?? [],
        application_url: nextProgram.application_url ?? "",
        official_source_url: nextProgram.official_source_url ?? "",
        form_numbers: nextProgram.form_numbers ?? [],
        processing_time_days: nextProgram.processing_time_days,
        slug: nextProgram.slug ?? "",
      })
      setCriteriaText(stringifyCriteria(nextProgram.eligibility_criteria))
      setDocumentsText(textList(nextProgram.required_documents ?? []))
      setFormsText(textList(nextProgram.form_numbers ?? []))
      setDeadlineValue(formatDateInput(nextProgram.deadline))
      setLoading(false)
    }

    load()

    return () => {
      mounted = false
    }
  }, [id, isNew, supabase])

  function update<K extends keyof EditableProgram>(key: K, value: EditableProgram[K]) {
    setForm((current) => current ? { ...current, [key]: value } : current)
    setFieldErrors((current) => ({ ...current, [key]: "" }))
    setError(null)
    setMessage(null)
  }

  function validate(nextForm: EditableProgram) {
    const errors: Record<string, string> = {}
    if (!nextForm.name.trim()) errors.name = "Name is required."
    if (!nextForm.slug.trim()) errors.slug = "Slug is required."
    if (!nextForm.agency.trim()) errors.agency = "Agency is required."
    if (!nextForm.description.trim()) errors.description = "Description is required."
    if (nextForm.application_url && !/^https?:\/\//i.test(nextForm.application_url)) {
      errors.application_url = "Use a valid http(s) URL."
    }
    if (nextForm.official_source_url && !/^https?:\/\//i.test(nextForm.official_source_url)) {
      errors.official_source_url = "Use a valid http(s) URL."
    }
    return errors
  }

  function applyProgram(saved: Grant) {
    setProgram(saved)
    setForm({
      name: saved.name,
      agency: saved.agency,
      category: saved.category,
      subcategory: saved.subcategory,
      type: saved.type,
      description: saved.description,
      max_amount: saved.max_amount,
      is_recurring: saved.is_recurring,
      deadline: saved.deadline,
      eligibility_criteria: saved.eligibility_criteria,
      required_documents: saved.required_documents ?? [],
      application_url: saved.application_url,
      official_source_url: saved.official_source_url,
      form_numbers: saved.form_numbers ?? [],
      processing_time_days: saved.processing_time_days,
      slug: saved.slug,
    })
    setCriteriaText(stringifyCriteria(saved.eligibility_criteria))
    setDocumentsText(textList(saved.required_documents ?? []))
    setFormsText(textList(saved.form_numbers ?? []))
    setDeadlineValue(formatDateInput(saved.deadline))
    setFieldErrors({})
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form) return

    setSaving(true)
    setError(null)
    setMessage(null)

    try {
      const nextErrors = validate(form)
      if (Object.keys(nextErrors).length > 0) {
        setFieldErrors(nextErrors)
        setSaving(false)
        return
      }

      const eligibilityCriteria = parseCriteria(criteriaText)
      const payload: Partial<Grant> = {
        name: form.name.trim(),
        agency: form.agency.trim(),
        category: form.category,
        subcategory: form.subcategory || null,
        type: form.type,
        description: form.description.trim(),
        max_amount: nullableNumber(String(form.max_amount ?? "")),
        is_recurring: form.is_recurring,
        deadline: deadlineValue || null,
        eligibility_criteria: eligibilityCriteria,
        required_documents: parseTextList(documentsText),
        application_url: form.application_url.trim(),
        official_source_url: form.official_source_url.trim(),
        form_numbers: parseTextList(formsText),
        processing_time_days: nullableNumber(String(form.processing_time_days ?? "")),
        slug: form.slug.trim(),
      }

      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token ?? ""

      if (isNew) {
        const { data: created, error: createError } = await createGrant(token, payload)
        if (createError) throw new Error(createError)
        if (!created) throw new Error("No data returned from create.")
        router.replace(`/admin/programs/${created.id}`)
      } else {
        const { data: savedRaw, error: saveError } = await updateGrant(token, id, payload)
        if (saveError) throw new Error(saveError)
        if (!savedRaw) throw new Error("No data returned from save.")
        applyProgram(savedRaw)
        setMessage("Program saved.")
        router.refresh()
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save program.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!program) return
    if (!window.confirm(`Delete "${program.name}"? This cannot be undone.`)) return
    setDeleting(true)
    setError(null)
    const { data: { session } } = await supabase.auth.getSession()
    const { error: deleteError } = await deleteGrant(session?.access_token ?? "", program.id)
    if (deleteError) {
      setError(deleteError)
      setDeleting(false)
    } else {
      router.push("/admin/programs")
    }
  }

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  if (!form || !program) {
    return (
      <div className="max-w-3xl rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        {error ?? "Program not found."}
      </div>
    )
  }

  const publicPath = `/${form.type === "benefit" ? "benefits" : "grants"}/${form.slug}`

  return (
    <form onSubmit={save} className="max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Link href="/admin/programs" className="text-sm font-medium text-blue-600 hover:underline">
              Programs
            </Link>
            <span className="text-sm text-slate-400">/</span>
            {!isNew && <Badge variant={form.type === "grant" ? "amber" : "green"}>{form.type}</Badge>}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{isNew ? "New Program" : "Edit Program"}</h1>
          {!isNew && <p className="mt-1 text-sm text-slate-500">{program?.name}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {!isNew && form.slug && (
            <Link
              href={publicPath}
              target="_blank"
              className="inline-flex h-10 items-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              View public page
            </Link>
          )}
          {!isNew && program && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex h-10 items-center rounded-lg border border-rose-200 bg-white px-4 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-10 items-center rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : isNew ? "Create program" : "Save changes"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">Basic Info</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <TextField label="Name" value={form.name} onChange={(value) => update("name", value)} error={fieldErrors.name} />
          <TextField label="Slug" value={form.slug} onChange={(value) => update("slug", value)} error={fieldErrors.slug} />
          <TextField label="Agency" value={form.agency} onChange={(value) => update("agency", value)} error={fieldErrors.agency} />
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-slate-700">Type</span>
            <select
              value={form.type}
              onChange={(event) => update("type", event.target.value as "grant" | "benefit")}
              className={`h-11 ${fieldClass()}`}
            >
              <option value="grant">Grant</option>
              <option value="benefit">Benefit</option>
            </select>
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-slate-700">Category</span>
            <select
              value={form.category}
              onChange={(event) => update("category", event.target.value as GrantCategory)}
              className={`h-11 ${fieldClass()}`}
            >
              {GRANT_CATEGORIES.map((category) => (
                <option key={category} value={category}>{category.replace("_", " ")}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-slate-700">Benefit subcategory</span>
            <select
              value={form.subcategory ?? ""}
              onChange={(event) => update("subcategory", event.target.value || null)}
              className={`h-11 ${fieldClass()}`}
            >
              <option value="">None</option>
              {BENEFIT_SUBCATEGORIES.map((subcategory) => (
                <option key={subcategory} value={subcategory}>{subcategory}</option>
              ))}
            </select>
          </label>
          <TextField
            label={form.type === "benefit" ? "Max benefit amount" : "Max award amount"}
            value={String(form.max_amount ?? "")}
            onChange={(value) => update("max_amount", value ? Number(value) : null)}
            type="number"
          />
          <TextField
            label="Processing time days"
            value={String(form.processing_time_days ?? "")}
            onChange={(value) => update("processing_time_days", value ? Number(value) : null)}
            type="number"
          />
          <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
            <input
              type="checkbox"
              checked={form.is_recurring}
              onChange={(event) => update("is_recurring", event.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            <span className="text-sm font-medium text-slate-700">Recurring / open enrollment</span>
          </label>
          <TextField
            label="Deadline"
            value={deadlineValue}
            onChange={setDeadlineValue}
            type="date"
          />
        </div>
        <div className="mt-5">
          <TextAreaField
            label="Description"
            value={form.description}
            onChange={(value) => update("description", value)}
            error={fieldErrors.description}
            rows={8}
          />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">Eligibility & Documents</h2>
        <div className="grid gap-5">
          <TextAreaField
            label="Eligibility criteria"
            value={criteriaText}
            onChange={setCriteriaText}
            rows={10}
            note="Use valid JSON object/array, or write one criterion per line."
          />
          <TextAreaField
            label="Required documents"
            value={documentsText}
            onChange={setDocumentsText}
            rows={7}
            note="One document per line."
          />
          <TextAreaField
            label="Form numbers"
            value={formsText}
            onChange={setFormsText}
            rows={4}
            note="Optional. One form number per line."
          />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">Links</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <TextField
            label="Application URL"
            value={form.application_url}
            onChange={(value) => update("application_url", value)}
            error={fieldErrors.application_url}
            placeholder="https://..."
          />
          <TextField
            label="Official source URL"
            value={form.official_source_url}
            onChange={(value) => update("official_source_url", value)}
            error={fieldErrors.official_source_url}
            placeholder="https://..."
          />
        </div>
      </section>

      <div className="sticky bottom-0 flex items-center justify-between gap-4 border-t border-slate-200 bg-slate-50/95 py-4 backdrop-blur">
        <Link href="/admin/programs" className="text-sm font-medium text-slate-500 hover:text-slate-900">
          Back to programs
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-11 items-center rounded-lg bg-blue-600 px-6 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  )
}
