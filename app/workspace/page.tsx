import SiteNav from "@/components/SiteNav"
import SiteFooter from "@/components/SiteFooter"

export default function WorkspacePage() {
  return (
    <>
      <SiteNav active="workspace" />
      <main className="min-h-[calc(100vh-64px)] bg-slate-50" />
      <SiteFooter />
    </>
  )
}
