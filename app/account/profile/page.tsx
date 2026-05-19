import ProfileForm from "@/components/ProfileForm"
import SiteNav from "@/components/SiteNav"

export const metadata = {
  title: "Profile - GrantWay",
}

export default function AccountProfilePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteNav active="account" />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Complete Your Profile</h1>
            <p className="mt-1 text-slate-600">
              Add the details GrantWay needs to personalize benefit and grant matches.
            </p>
          </div>
          <ProfileForm />
        </div>
      </main>
    </div>
  )
}
