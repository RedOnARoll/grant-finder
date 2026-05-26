"use client"

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Clock, Database, ExternalLink } from "lucide-react"
import { getBrowserSupabase } from "@/lib/supabase-browser"
import { LogoMark } from "@/components/illustrations/GeoShapes"

const NAV = [
  { label: "Dashboard",       href: "/admin",         icon: LayoutDashboard },
  { label: "Programs",        href: "/admin/programs", icon: Database        },
  { label: "Pending Criteria", href: "/admin/pending", icon: Clock           },
]

export default function AdminShell({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"loading" | "unauthorized" | "ready">("loading")
  const pathname = usePathname()

  useEffect(() => {
    const supabase = getBrowserSupabase()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setStatus("unauthorized"); return }
      const { data } = await supabase.from("profiles").select("is_admin").eq("user_id", user.id).maybeSingle()
      setStatus(data?.is_admin ? "ready" : "unauthorized")
    })
  }, [])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (status === "unauthorized") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 px-4">
        <LogoMark className="w-10 h-10" />
        <h1 className="text-xl font-semibold text-slate-900">Access Denied</h1>
        <p className="text-sm text-slate-600">This area is restricted to administrators.</p>
        <Link href="/" className="text-sm text-blue-600 hover:underline">Back to home</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <LogoMark className="w-6 h-6" />
          <span className="font-semibold text-white">GrantWay</span>
          <span className="text-slate-500 text-sm">/ Admin</span>
        </div>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View site
        </Link>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside className="w-52 bg-white border-r border-slate-200 shrink-0 py-4 px-3">
          <nav className="space-y-0.5">
            {NAV.map(({ label, href, icon: Icon }) => {
              const active = pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`))
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
