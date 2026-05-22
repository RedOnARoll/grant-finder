import SiteNav from "@/components/SiteNav"

function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-zinc-200 rounded animate-pulse ${className ?? ""}`} />
}

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-200 p-6">
      <div className="flex items-start justify-between gap-4 mb-3">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-1/3 mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-4/5 mb-4" />
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-5 w-12" />
      </div>
    </div>
  )
}

export default function GrantsLoading() {
  return (
    <div className="flex flex-col min-h-full">
      <SiteNav active="grants" />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        <div className="mb-8">
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>

        {/* Filter bar */}
        <div className="flex gap-3 mb-8 flex-wrap items-center">
          <Skeleton className="h-10 w-56 rounded-lg" />
          <Skeleton className="h-10 w-40 rounded-lg" />
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-24 rounded-lg" />
            ))}
          </div>
        </div>

        <Skeleton className="h-4 w-28 mb-4" />

        <div className="grid gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </main>

    </div>
  )
}
