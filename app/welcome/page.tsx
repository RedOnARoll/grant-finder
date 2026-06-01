import Link from "next/link"
import SiteNav from "@/components/SiteNav"
import SetupAccountForm from "./SetupAccountForm"

export const metadata = {
  title: "Welcome to GrantWay Premium",
}

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ setup?: string; session_id?: string; returnTo?: string }>
}) {
  const { setup, session_id: sessionId, returnTo } = await searchParams

  const safeReturnTo =
    typeof returnTo === "string" && returnTo.startsWith("/") && !returnTo.startsWith("//")
      ? returnTo
      : null

  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      <SiteNav />

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        {setup === "1" && sessionId ? (
          <SetupAccountForm sessionId={sessionId} returnTo={safeReturnTo} />
        ) : (
          <div className="w-full max-w-md text-center">
            <h1 className="text-3xl font-bold text-slate-900">Welcome to GrantWay!</h1>
            <p className="mt-4 leading-7 text-slate-600">
              Your access is ready.{" "}
              <Link href="/auth" className="font-medium text-blue-600 hover:underline">
                Sign in to your account
              </Link>{" "}
              to get started.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
