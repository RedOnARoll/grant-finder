import SiteNav from "@/components/SiteNav"

function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-zinc-200 rounded animate-pulse ${className ?? ""}`} />
}

export default function GrantDetailLoading() {
  return (
    <div className="flex flex-col min-h-full">
      <SiteNav active="grants" />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <Skeleton className="h-4 w-12" />
          <span className="text-zinc-300">/</span>
          <Skeleton className="h-4 w-48" />
        </div>

        {/* Tags */}
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>

        {/* Title + agency */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1">
            <Skeleton className="h-9 w-3/4 mb-2" />
            <Skeleton className="h-5 w-1/3" />
          </div>
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-8 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <Skeleton className="h-3 w-20 mb-2" />
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>

        <hr className="border-zinc-200 mb-8" />

        {/* Description */}
        <div className="mb-8">
          <Skeleton className="h-6 w-40 mb-3" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6 mb-2" />
          <Skeleton className="h-4 w-4/6" />
        </div>

        <hr className="border-zinc-200 mb-8" />

        {/* Quiz placeholder */}
        <div className="rounded-xl border border-zinc-200 p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6 mb-6" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </main>

    </div>
  )
}
