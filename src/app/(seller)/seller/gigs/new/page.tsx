import type { Metadata } from "next"
import { requireAuth } from "@/lib/server/auth"
import { UserRole } from "@/lib/shared/constants"
import { GigCreateView } from "@/views/seller/GigCreateView"
import { getCategories } from "@/actions/categories"

export const metadata: Metadata = {
  title: "Create a New Gig | FreelanceHub",
}

export default async function GigCreatePage() {
  await requireAuth(UserRole.Seller)
  const categories = await getCategories()
  return <GigCreateView categories={categories} />
}
