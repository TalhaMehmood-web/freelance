import type { Metadata } from "next"
import { requireAuth } from "@/lib/server/auth"
import { UserRole } from "@/lib/shared/constants"
import { CategoryDetailView } from "@/views/admin/CategoryDetailView"

export const metadata: Metadata = {
  title: "Category Detail | Admin — FreelanceHub",
}

export default async function AdminCategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAuth(UserRole.Admin)
  const { id } = await params
  return <CategoryDetailView categoryId={id} />
}
