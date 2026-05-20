import { createClient } from "@supabase/supabase-js"

export type AccessInfo = {
  isPremium: boolean
  isAdmin: boolean
  tier: "free" | "grant_helper" | "premium"
  credits: number
  hasAIAccess: boolean
}

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function checkUserAccess(userId: string): Promise<AccessInfo> {
  try {
    const { data } = await adminClient()
      .from("profiles")
      .select("is_premium, is_admin, subscription_tier, one_time_credits")
      .eq("user_id", userId)
      .maybeSingle()

    const isPremium = Boolean(data?.is_premium)
    const isAdmin = Boolean(data?.is_admin)
    const tier = (data?.subscription_tier as AccessInfo["tier"]) ?? "free"
    const credits = Number(data?.one_time_credits ?? 0)

    return {
      isPremium,
      isAdmin,
      tier,
      credits,
      hasAIAccess: isAdmin || isPremium || credits > 0,
    }
  } catch {
    return { isPremium: false, isAdmin: false, tier: "free", credits: 0, hasAIAccess: false }
  }
}

export async function decrementOneTimeCredit(userId: string): Promise<number> {
  const supabase = adminClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier, one_time_credits")
    .eq("user_id", userId)
    .maybeSingle()

  if (!profile || profile.subscription_tier !== "grant_helper") return 0

  const newCredits = Math.max(0, Number(profile.one_time_credits ?? 0) - 1)

  await supabase
    .from("profiles")
    .update({
      one_time_credits: newCredits,
      ...(newCredits === 0 ? { is_premium: false } : {}),
    })
    .eq("user_id", userId)

  return newCredits
}
