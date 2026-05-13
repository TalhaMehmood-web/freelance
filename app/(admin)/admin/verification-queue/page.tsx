import type { Metadata } from "next"
import { requireAuth } from "@/lib/server/auth"
import { VerificationQueueView } from "@/views/admin/VerificationQueueView"

export const metadata: Metadata = { title: "Verification Queue | FreelanceHub" }

export default async function VerificationQueuePage() {
  await requireAuth("admin")
  return <VerificationQueueView />
}
