import SiteNav from "@/components/SiteNav"
import SiteFooter from "@/components/SiteFooter"
import WorkspaceClient from "@/components/WorkspaceClient"

export const metadata = { title: "Workspace — GrantWay" }

export default function WorkspacePage() {
  return (
    <>
      <SiteNav active="workspace" />
      <WorkspaceClient />
      <SiteFooter />
    </>
  )
}
