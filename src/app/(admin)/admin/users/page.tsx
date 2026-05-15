import type { Metadata } from "next"
import { requireAuth } from "@/lib/server/auth"
import { getUsers } from "@/actions/admin/users"
import { AdminUsersView } from "@/views/admin/UsersView"

export const metadata: Metadata = { title: "User Management | FreelanceHub" }

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function str(v: string | string[] | undefined): string | undefined {
  return typeof v === "string" ? v : undefined
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  await requireAuth("admin")
  const params = await searchParams

  const query = {
    search:  str(params.search),
    role:    str(params.role),
    page:    params.page    ? parseInt(str(params.page)    ?? "1",  10) : 1,
    sortBy:  (str(params.sortBy)  ?? "createdAt") as "fullName" | "username" | "createdAt",
    sortDir: (str(params.sortDir) ?? "desc")      as "asc" | "desc",
  }

  const result    = await getUsers(query)
  const users     = result.success ? (result.data?.users     ?? []) : []
  const total     = result.success ? (result.data?.total     ?? 0)  : 0
  const pageCount = result.success ? (result.data?.pageCount ?? 1)  : 1

  return (
    <AdminUsersView
      initialUsers={users}
      total={total}
      pageCount={pageCount}
      currentPage={query.page}
      currentSort={{ id: query.sortBy, desc: query.sortDir === "desc" }}
      currentSearch={query.search ?? ""}
      currentRole={query.role ?? ""}
    />
  )
}
