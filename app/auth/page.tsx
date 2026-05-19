import Link from "next/link"
import AuthForm from "@/components/AuthForm"
import { LogoMark } from "@/components/illustrations/GeoShapes"
import { sanitizeNextPath } from "@/lib/auth"
import { CheckCircle } from "lucide-react"

export const metadata = {
  title: "Log in or sign up - GrantWay",
}

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; next?: string }>
}) {
  const { mode, next } = await searchParams
  const initialMode = mode === "signup" ? "signup" : "login"
  const safeNext = sanitizeNextPath(next, initialMode === "signup" ? "/account/profile" : "/account")

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Minimal nav */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark className="w-6 h-6" />
            <span className="text-sm font-semibold text-slate-900">GrantWay</span>
          </Link>
          <Link
            href="/grants"
            className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            Back to Browse
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl grid md:grid-cols-[1fr_420px] gap-8 items-center">
          {/* Left panel — hidden on mobile */}
          <section className="hidden md:flex bg-slate-900 rounded-xl p-10 flex-col justify-center text-white min-h-[520px]">
            <div className="flex items-center gap-3 mb-10">
              <LogoMark className="w-8 h-8" />
              <span className="text-xl font-bold tracking-tight">GrantWay</span>
            </div>

            <h1 className="text-3xl font-bold leading-tight mb-4">
              Save your place and come back ready to apply.
            </h1>
            <p className="text-slate-300 text-base leading-relaxed mb-10">
              Create an account to track grants and benefits, complete your profile, and get personalized matches tailored to your situation.
            </p>

            <ul className="grid gap-4">
              {[
                "Personalized grant and benefit matches",
                "Track every application from saved to awarded",
                "Profile-based eligibility estimates",
                "Deadline reminders and quick reads",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Right panel — auth card */}
          <div>
            <AuthForm initialMode={initialMode} next={safeNext} />
          </div>
        </div>
      </main>
    </div>
  )
}
