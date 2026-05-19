import ProgramEditor from "./ProgramEditor"

export default async function AdminProgramEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ProgramEditor id={id} />
}
