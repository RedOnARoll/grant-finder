import type { ReactNode } from "react"

type BadgeVariant = "blue" | "amber" | "coral" | "green" | "slate"

const variantClasses: Record<BadgeVariant, string> = {
  blue:  "bg-blue-50 text-blue-700",
  amber: "bg-amber-50 text-amber-700",
  coral: "bg-rose-50 text-rose-600",
  green: "bg-emerald-50 text-emerald-700",
  slate: "bg-slate-100 text-slate-600",
}

export function Badge({
  children,
  variant = "slate",
  className = "",
}: {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}

type StatusType = "open" | "rolling" | "closing_soon" | "closed"

const statusConfig: Record<StatusType, { label: string; classes: string }> = {
  open:         { label: "Open",         classes: "bg-emerald-50 text-emerald-700" },
  rolling:      { label: "Rolling",      classes: "bg-slate-100 text-slate-600" },
  closing_soon: { label: "Closing Soon", classes: "bg-amber-50 text-amber-700" },
  closed:       { label: "Closed",       classes: "bg-rose-50 text-rose-600" },
}

export function StatusBadge({ deadline, isRecurring }: { deadline: string | null; isRecurring?: boolean }) {
  let status: StatusType = "open"

  if (isRecurring) {
    status = "rolling"
  } else if (deadline) {
    const daysUntil = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (daysUntil < 0) status = "closed"
    else if (daysUntil <= 30) status = "closing_soon"
    else status = "open"
  } else {
    status = "rolling"
  }

  const { label, classes } = statusConfig[status]

  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${classes}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  )
}
