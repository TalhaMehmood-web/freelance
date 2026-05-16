import { redirect } from "next/navigation"

export default async function UserRootPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/admin/users/${id}/overview`)
}
