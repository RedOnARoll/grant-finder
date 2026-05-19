"use server"

import { createClient } from "@supabase/supabase-js"
import type { Grant } from "@/lib/types"

const ADMIN_EMAIL = "redonaroll09@gmail.com"

export async function updateGrant(
  accessToken: string,
  id: string,
  payload: Partial<Grant>
): Promise<{ data?: Grant; error?: string }> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !serviceKey) {
      return { error: "Server misconfiguration: missing Supabase service role key." }
    }

    // Verify the caller using their own access token (anon key + user JWT)
    const verifyClient = createClient(url, anonKey ?? serviceKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const { data: { user }, error: authError } = await verifyClient.auth.getUser()
    if (authError || !user || user.email !== ADMIN_EMAIL) {
      return { error: "Unauthorized." }
    }

    // Write using the service role client (bypasses RLS)
    const adminClient = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const { data, error } = await adminClient
      .from("grants")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single()

    if (error) return { error: error.message }
    return { data: data as Grant }
  } catch (err) {
    console.error("[updateGrant]", err)
    return { error: err instanceof Error ? err.message : "Unexpected server error." }
  }
}
