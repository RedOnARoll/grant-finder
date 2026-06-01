"use client"

import { useMemo, useState } from "react"
import { getBrowserSupabase } from "@/lib/supabase-browser"
import AuthPromptModal from "@/components/AuthPromptModal"
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
  const supabase = useMemo(() => getBrowserSupabase(), [])
  const [isOpen, setIsOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  async function handleClick() {
    const { data } = await supabase.auth.getUser()
    if (!data.user) {
      setAuthModalOpen(true)
    } else {
      setIsOpen(true)
    }
  }

  return (
    <>
      <button className={className} onClick={handleClick}>
        {children}
      </button>
      <PreApplyModal
        program={{ slug, type, name, agency, applicationUrl, officialSourceUrl, requiredDocuments }}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
      <AuthPromptModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode="apply"
      />
    </>
  )
}
