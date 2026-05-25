import Link from "next/link"
import { CheckCircle, Mail } from "lucide-react"
import SiteNav from "@/components/SiteNav"

export const metadata = {
  title: "Welcome to GrantWay Premium",
}

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ setup?: string; returnTo?: string }>
}) {
  const { returnTo } = await searchParams

  // Validate returnTo — relative paths only
  const safeReturnTo =
    typeof returnTo === "string" && returnTo.startsWith("/") && !returnTo.startsWith("//")
      ? returnTo
      : null

  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      <SiteNav />

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>

          <h1 className="text-3xl font-bold text-slate-900">Payment confirmed!</h1>
          <p className="mt-4 leading-7 text-slate-600">
            Your GrantWay Premium access is active. We&apos;ve sent a sign-in link to your email
            — click it to access your account and start using all features.
          </p>

          <div className="mt-6 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-800">
            <Mail className="h-5 w-5 shrink-0 text-blue-500" />
            <span className="text-left">
              Check your inbox for an email from GrantWay with your sign-in link.
              It expires in 1&nbsp;hour.
            </span>
          </div>

          <div className="mt-8 space-y-3 text-sm text-slate-500">
            <p>
              Already have an account?{" "}
              <Link href="/auth" className="font-medium text-blue-600 hover:underline">
                Sign in
              </Link>
            </p>
            {safeReturnTo && (
              <p>
                After signing in you can{" "}
                <Link href={safeReturnTo} className="font-medium text-blue-600 hover:underline">
                  return to the page you were viewing
                </Link>
                .
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
