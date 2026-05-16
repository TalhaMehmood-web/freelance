import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/server/auth"
import { UserRole } from "@/lib/shared/constants"
import { getSellerSettings } from "@/actions/seller/settings"
import { SellerSettingsView } from "@/views/seller/SettingsView"

export const metadata: Metadata = { title: "Settings | FreelanceHub" }

export default async function SellerSettingsPage() {
  await requireAuth(UserRole.Seller)
  const result = await getSellerSettings()
  if (!result.success || !result.data) redirect("/seller/settings")
  return <SellerSettingsView settings={result.data} />
}
