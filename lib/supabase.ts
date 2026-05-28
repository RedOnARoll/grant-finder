import { createClient } from "@supabase/supabase-js"
import { unstable_cache } from "next/cache"
import type { Grant } from "./types"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const getGrants = unstable_cache(
  async (): Promise<Grant[]> => {
    const { data, error } = await supabase
      .from("grants")
      .select("*")
      .eq("type", "grant")
      .order("name")
    if (error) throw error
    return data ?? []
  },
  ["grants"],
  { revalidate: 3600, tags: ["grants"] }
)

const _getGrantBySlug = unstable_cache(
  async (slug: string): Promise<Grant | null> => {
    const { data, error } = await supabase
      .from("grants")
      .select("*")
      .eq("slug", slug)
      .eq("type", "grant")
      .single()
    if (error) return null
    return data
  },
  ["grant-by-slug"],
  { revalidate: 3600, tags: ["grants"] }
)
export async function getGrantBySlug(slug: string) { return _getGrantBySlug(slug) }

export const getBenefits = unstable_cache(
  async (): Promise<Grant[]> => {
    const { data, error } = await supabase
      .from("grants")
      .select("*")
      .eq("type", "benefit")
      .order("name")
    if (error) throw error
    return data ?? []
  },
  ["benefits"],
  { revalidate: 3600, tags: ["benefits"] }
)

const _getBenefitBySlug = unstable_cache(
  async (slug: string): Promise<Grant | null> => {
    const { data, error } = await supabase
      .from("grants")
      .select("*")
      .eq("slug", slug)
      .eq("type", "benefit")
      .single()
    if (error) return null
    return data
  },
  ["benefit-by-slug"],
  { revalidate: 3600, tags: ["benefits"] }
)
export async function getBenefitBySlug(slug: string) { return _getBenefitBySlug(slug) }

export const getAllPrograms = unstable_cache(
  async (): Promise<Grant[]> => {
    const { data, error } = await supabase
      .from("grants")
      .select("*")
      .order("name")
    if (error) throw error
    return data ?? []
  },
  ["all-programs"],
  { revalidate: 3600, tags: ["grants", "benefits"] }
)
