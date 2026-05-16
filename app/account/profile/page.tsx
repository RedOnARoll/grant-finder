import ProfileForm from "@/components/ProfileForm"
import SiteNav from "@/components/SiteNav"

export const metadata = {
  title: "Profile - GrantFinder",
}

export default function AccountProfilePage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteNav active="account" />
      <main className="flex-1 bg-zinc-50 px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Account setup
            </p>
            <h1 className="mb-3 text-3xl font-bold text-zinc-900">Complete your profile</h1>
            <p className="max-w-2xl text-zinc-500">
              Add the details GrantFinder needs to personalize benefit and grant matches.
            </p>
          </div>
          <ProfileForm />
        </div>
      </main>
    </div>
  )
}
