import type { Metadata } from "next"
import { requireAuth } from "@/lib/server/auth"
import { GigCreateView } from "@/views/seller/GigCreateView"

export const metadata: Metadata = { title: "Create Gig | FreelanceHub" }

export default async function GigCreatePage() {
  await requireAuth()
  return <GigCreateView />
}
