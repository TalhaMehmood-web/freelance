import type { Metadata } from "next"
import { requireAuth } from "@/lib/server/auth"
import { UserRole } from "@/lib/shared/constants"
import { CategoriesView } from "@/views/admin/CategoriesView"

export const metadata: Metadata = {
  title: "Categories | Admin — FreelanceHub",
}

export default async function AdminCategoriesPage() {
  await requireAuth(UserRole.Admin)
  return <CategoriesView />
}
