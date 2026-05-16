import Link from "next/link"
import AuthForm from "@/components/AuthForm"
import SiteNav from "@/components/SiteNav"

export const metadata = {
  title: "Log in or sign up - GrantFinder",
}

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; next?: string }>
}) {
  const { mode, next } = await searchParams
  const initialMode = mode === "signup" ? "signup" : "login"
  const safeNext = next?.startsWith("/") ? next : "/account"

  return (
    <div className="flex min-h-full flex-col">
      <SiteNav active="account" />
      <main className="flex-1 bg-zinc-50 px-6 py-16">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[1fr_420px] md:items-start">
          <section className="pt-4">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Your GrantFinder account
            </p>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900">
              Save your place and come back ready to apply.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-zinc-600">
              Create an account to use Google, Microsoft, or email/password sign-in.
              Once you are signed in, your account page gives you one place to return after quizzes,
              benefit prep, and grant research.
            </p>
            <div className="mt-8 flex gap-3 text-sm text-zinc-500">
              <Link href="/grants" className="font-medium text-zinc-900 hover:underline">
                Browse grants
              </Link>
              <span>/</span>
              <Link href="/benefits" className="font-medium text-zinc-900 hover:underline">
                Browse benefits
              </Link>
            </div>
          </section>
          <AuthForm initialMode={initialMode} next={safeNext} />
        </div>
      </main>
    </div>
  )
}
