"use client"

import { Children, ReactNode, useMemo, useState } from "react"

const PAGE_SIZE = 15

export default function ProgramGrid({
  children,
  itemLabel = "programs",
  className = "",
}: {
  children: ReactNode
  itemLabel?: string
  className?: string
}) {
  const items = useMemo(() => {
    return Children.toArray(children)
  }, [children])
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const visibleItems = items.slice(0, visibleCount)
  const remaining = Math.max(items.length - visibleItems.length, 0)

  return (
    <div>
      <div className={`grid gap-4 md:grid-cols-2 xl:grid-cols-3 ${className}`}>
        {visibleItems}
      </div>
      {remaining > 0 && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            className="h-11 rounded-full border border-zinc-300 bg-white px-6 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-500 hover:text-zinc-900"
          >
            Show more {itemLabel} ({remaining} left)
          </button>
        </div>
      )}
    </div>
  )
}
