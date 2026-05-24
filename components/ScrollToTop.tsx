"use client"

import { useEffect } from "react"

/**
 * Forces the page to the top on mount.
 * Fixes Next.js App Router scroll-restoration that can leave
 * users scrolled to a previous position when opening a detail page.
 */
export default function ScrollToTop() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" })
  }, [])
  return null
}
