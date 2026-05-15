import type { Metadata } from "next"
import { requireAuth } from "@/lib/server/auth"
import { SavedSearchesView } from "@/views/buyer/SavedSearchesView"

export const metadata: Metadata = { title: "Saved Searches | FreelanceHub" }

export default async function SavedSearchesPage() {
  await requireAuth()
  return <SavedSearchesView />
}
