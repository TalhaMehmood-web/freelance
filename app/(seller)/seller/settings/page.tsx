import type { Metadata } from "next"
import { requireAuth } from "@/lib/server/auth"
import { SellerSettingsView } from "@/views/seller/SettingsView"

export const metadata: Metadata = { title: "Settings | FreelanceHub" }

export default async function SellerSettingsPage() {
  await requireAuth()
  return <SellerSettingsView />
}
