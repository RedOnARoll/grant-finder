export function HeroIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 340"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Large document card - back */}
      <rect x="80" y="60" width="200" height="240" rx="12" fill="#3B82F6" opacity="0.15" />
      {/* Mid document card */}
      <rect x="110" y="40" width="200" height="240" rx="12" fill="#3B82F6" opacity="0.25" />
      {/* Front document card */}
      <rect x="140" y="20" width="200" height="240" rx="12" fill="#1E3A5F" opacity="0.9" />
      {/* Lines on front card */}
      <rect x="168" y="56" width="120" height="8" rx="4" fill="#3B82F6" opacity="0.6" />
      <rect x="168" y="76" width="88" height="6" rx="3" fill="#3B82F6" opacity="0.3" />
      <rect x="168" y="104" width="140" height="5" rx="2.5" fill="#3B82F6" opacity="0.2" />
      <rect x="168" y="117" width="116" height="5" rx="2.5" fill="#3B82F6" opacity="0.2" />
      <rect x="168" y="130" width="128" height="5" rx="2.5" fill="#3B82F6" opacity="0.2" />
      {/* Amber accent badge */}
      <rect x="160" y="164" width="80" height="28" rx="8" fill="#F59E0B" opacity="0.9" />
      <rect x="172" y="172" width="56" height="6" rx="3" fill="#0F172A" opacity="0.4" />
      {/* Circle accent */}
      <circle cx="340" cy="80" r="40" fill="#F59E0B" opacity="0.12" />
      <circle cx="340" cy="80" r="24" fill="#F59E0B" opacity="0.15" />
      {/* Small navy square */}
      <rect x="60" y="230" width="40" height="40" rx="6" fill="#0F172A" opacity="0.2" />
      {/* Decorative line */}
      <line x1="70" y1="300" x2="360" y2="300" stroke="#3B82F6" strokeWidth="2" opacity="0.1" />
    </svg>
  )
}

export function QuizIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect x="20" y="20" width="160" height="120" rx="10" fill="#3B82F6" opacity="0.1" />
      <circle cx="60" cy="60" r="20" fill="#F59E0B" opacity="0.25" />
      <rect x="90" y="46" width="70" height="8" rx="4" fill="#0F172A" opacity="0.15" />
      <rect x="90" y="62" width="50" height="6" rx="3" fill="#3B82F6" opacity="0.2" />
      <rect x="30" y="100" width="60" height="24" rx="6" fill="#3B82F6" opacity="0.2" />
      <rect x="100" y="100" width="60" height="24" rx="6" fill="#0F172A" opacity="0.1" />
    </svg>
  )
}

export function EmptyStateIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect x="20" y="20" width="80" height="60" rx="8" fill="#3B82F6" opacity="0.08" />
      <rect x="34" y="34" width="52" height="6" rx="3" fill="#94A3B8" opacity="0.4" />
      <rect x="34" y="46" width="38" height="5" rx="2.5" fill="#94A3B8" opacity="0.25" />
      <circle cx="96" cy="28" r="12" fill="#F59E0B" opacity="0.15" />
    </svg>
  )
}

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Navy square */}
      <rect x="0" y="4" width="14" height="14" rx="3" fill="#0F172A" />
      {/* Blue circle overlapping */}
      <circle cx="16" cy="14" r="8" fill="#3B82F6" />
      {/* Small amber dot */}
      <circle cx="16" cy="14" r="3" fill="#F59E0B" />
    </svg>
  )
}
