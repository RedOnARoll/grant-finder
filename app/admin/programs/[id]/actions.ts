"use server"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { Grant } from "@/lib/types"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getClients(accessToken: string): { verifyClient: SupabaseClient<any>; adminClient: SupabaseClient<any> } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) throw new Error("Server misconfiguration: missing Supabase service role key.")
  const verifyClient = createClient(url, anonKey ?? serviceKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const adminClient = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return { verifyClient, adminClient }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function verifyAdmin(verifyClient: SupabaseClient<any>, adminClient: SupabaseClient<any>) {
  const { data: { user }, error } = await verifyClient.auth.getUser()
  if (error || !user) throw new Error("Unauthorized.")
  const { data: profile } = await adminClient.from("profiles").select("is_admin").eq("user_id", user.id).maybeSingle()
  if (!profile?.is_admin) throw new Error("Unauthorized.")
}

export async function updateGrant(
  accessToken: string,
  id: string,
  payload: Partial<Grant>
): Promise<{ data?: Grant; error?: string }> {
  try {
    const { verifyClient, adminClient } = getClients(accessToken)
    await verifyAdmin(verifyClient)
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

export async function createGrant(
  accessToken: string,
  payload: Partial<Grant>
): Promise<{ data?: Grant; error?: string }> {
  try {
    const { verifyClient, adminClient } = getClients(accessToken)
    await verifyAdmin(verifyClient)
    const { data, error } = await adminClient
      .from("grants")
      .insert({ ...payload, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .select("*")
      .single()
    if (error) return { error: error.message }
    return { data: data as Grant }
  } catch (err) {
    console.error("[createGrant]", err)
    return { error: err instanceof Error ? err.message : "Unexpected server error." }
  }
}

export async function deleteGrant(
  accessToken: string,
  id: string
): Promise<{ error?: string }> {
  try {
    const { verifyClient, adminClient } = getClients(accessToken)
    await verifyAdmin(verifyClient)
    const { error } = await adminClient.from("grants").delete().eq("id", id)
    if (error) return { error: error.message }
    return {}
  } catch (err) {
    console.error("[deleteGrant]", err)
    return { error: err instanceof Error ? err.message : "Unexpected server error." }
  }
}
