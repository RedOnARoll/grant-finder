import { NextRequest, NextResponse } from "next/server"

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|coming-soon|api/dev-unlock).*)",
  ],
}

function getAccessToken(request: NextRequest): string | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
  const projectRef = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1]

  if (projectRef) {
    const primary = request.cookies.get(`sb-${projectRef}-auth-token`)
    if (primary?.value) {
      try {
        const session = JSON.parse(decodeURIComponent(primary.value))
        if (session?.access_token) return session.access_token as string
      } catch { /* try next */ }
    }

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
  const { pathname } = request.nextUrl

  // Coming soon gate — redirect everyone without the dev cookie
  const devAccess = request.cookies.get("dev_access")
  if (devAccess?.value !== "granted") {
    return NextResponse.redirect(new URL("/coming-soon", request.url))
  }

  // Admin-only gate for /admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next()
  }

  const token = getAccessToken(request)

  if (!token) {
    return NextResponse.next()
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  try {
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: anonKey },
    })

    if (!userRes.ok) {
      return NextResponse.next()
    }

    const user = await userRes.json() as { id: string }

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
