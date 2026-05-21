"use client"

import { useState } from "react"
import PreApplyModal from "./PreApplyModal"

interface ApplyButtonProps {
  slug: string
  type: "grant" | "benefit"
  name: string
  agency: string
  applicationUrl?: string | null
  officialSourceUrl?: string | null
  requiredDocuments?: string[]
  className?: string
  children?: React.ReactNode
}

export default function ApplyButton({
  slug,
  type,
  name,
  agency,
  applicationUrl,
  officialSourceUrl,
  requiredDocuments,
  className,
  children,
}: ApplyButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button className={className} onClick={() => setIsOpen(true)}>
        {children}
      </button>
      <PreApplyModal
        program={{ slug, type, name, agency, applicationUrl, officialSourceUrl, requiredDocuments }}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}
