import { NextRequest, NextResponse } from "next/server"

export const config = {
  matcher: ["/admin/:path*"],
}

function getAccessToken(request: NextRequest): string | null {
  // Supabase stores the session in a cookie named sb-{project-ref}-auth-token
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
  const projectRef = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1]

  if (projectRef) {
    // Try the primary cookie first
    const primary = request.cookies.get(`sb-${projectRef}-auth-token`)
    if (primary?.value) {
      try {
        const session = JSON.parse(decodeURIComponent(primary.value))
        if (session?.access_token) return session.access_token as string
      } catch { /* try next */ }
    }

    // Supabase may chunk large sessions across indexed cookies
    const chunks: string[] = []
    for (let i = 0; i < 5; i++) {
      const chunk = request.cookies.get(`sb-${projectRef}-auth-token.${i}`)
      if (!chunk?.value) break
      chunks.push(decodeURIComponent(chunk.value))
    }
    if (chunks.length > 0) {
      try {
        const session = JSON.parse(chunks.join(""))
        if (session?.access_token) return session.access_token as string
      } catch { /* fall through */ }
    }
  }

  return null
}

export async function middleware(request: NextRequest) {
  const token = getAccessToken(request)

  if (!token) {
    // The browser Supabase client stores sessions outside request cookies in this app.
    // Let AdminShell verify the signed-in user client-side instead of bouncing valid admins.
    return NextResponse.next()
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  try {
    // Verify the token and get the user ID
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: anonKey },
    })

    if (!userRes.ok) {
      return NextResponse.next()
    }

    const user = await userRes.json() as { id: string }

    // Check is_admin from the profiles table
    const profileRes = await fetch(
      `${supabaseUrl}/rest/v1/profiles?user_id=eq.${encodeURIComponent(user.id)}&select=is_admin&limit=1`,
      { headers: { Authorization: `Bearer ${serviceRoleKey}`, apikey: serviceRoleKey } }
    )

    if (profileRes.ok) {
      const profiles = await profileRes.json() as Array<{ is_admin?: boolean }>
      if (profiles?.[0]?.is_admin === true) {
        return NextResponse.next()
      }
    }
  } catch (err) {
    console.error("[middleware] admin check failed:", err)
  }

  return NextResponse.redirect(new URL("/", request.url))
}
