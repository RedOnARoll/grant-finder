import SiteNav from "@/components/SiteNav"
import SiteFooter from "@/components/SiteFooter"
import WorkspaceClient from "@/components/WorkspaceClient"

export const metadata = { title: "Workspace — GrantWay" }

export default async function WorkspacePage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>
}) {
  const { slug } = await searchParams
  return (
    <>
      <SiteNav active="workspace" />
      <WorkspaceClient initialSlug={slug} />
      <SiteFooter />
    </>
  )
}
