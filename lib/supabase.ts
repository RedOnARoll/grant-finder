import { createClient } from "@supabase/supabase-js"
import type { Grant } from "./types"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { global: { fetch: (url, opts) => fetch(url, { ...opts, cache: "no-store" }) } }
)

export async function getGrants(): Promise<Grant[]> {
  const { data, error } = await supabase
    .from("grants")
    .select("*")
    .order("name")
  if (error) throw error
  return data ?? []
}

export async function getGrantBySlug(slug: string): Promise<Grant | null> {
  const { data, error } = await supabase
    .from("grants")
    .select("*")
    .eq("slug", slug)
    .single()
  if (error) return null
  return data
}
