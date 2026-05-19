import SiteNav from "@/components/SiteNav"

function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-zinc-200 rounded animate-pulse ${className ?? ""}`} />
}

export default function GrantApplyLoading() {
  return (
    <div className="flex flex-col min-h-full">
      <SiteNav active="grants" />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <Skeleton className="h-4 w-12" />
          <span className="text-zinc-300">/</span>
          <Skeleton className="h-4 w-36" />
          <span className="text-zinc-300">/</span>
          <Skeleton className="h-4 w-12" />
        </div>

        <Skeleton className="h-9 w-2/3 mb-2" />
        <Skeleton className="h-5 w-1/2 mb-10" />

        {/* Before you start */}
        <div className="rounded-xl border border-zinc-200 p-6 mb-8">
          <Skeleton className="h-6 w-36 mb-4" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 mb-3">
              <Skeleton className="h-5 w-5 rounded-full shrink-0" />
              <Skeleton className="h-5 flex-1" />
            </div>
          ))}
        </div>

        {/* Document guide */}
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="grid gap-4 mb-10">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-zinc-200 p-5">
              <Skeleton className="h-5 w-40 mb-3" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>

        <Skeleton className="h-12 w-full rounded-xl" />
      </main>

      <footer className="border-t border-zinc-200 py-8 px-6 text-center text-sm text-zinc-500 mt-10">
        Grant information is for reference only. Verify eligibility with the issuing agency.
      </footer>
    </div>
  )
}
