import type { Metadata } from "next"
import { requireAuth } from "@/lib/server/auth"
import { NewProjectView } from "@/views/buyer/ProjectDetailView"

export const metadata: Metadata = { title: "New Project | FreelanceHub" }

export default async function NewProjectPage() {
  await requireAuth()
  return <NewProjectView />
}
