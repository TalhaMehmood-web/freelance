import type { Metadata } from "next"
import { requireAuth } from "@/lib/server/auth"
import { BuyerSettingsView } from "@/views/buyer/SettingsView"

export const metadata: Metadata = { title: "Settings | FreelanceHub" }

export default async function BuyerSettingsPage() {
  await requireAuth()
  return <BuyerSettingsView />
}
