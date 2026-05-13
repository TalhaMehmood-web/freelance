import { requireAuth } from "@/lib/server/auth"
import { redirect } from "next/navigation"
import { AppHeader } from "@/components/layout/AppHeader"
import { AdminSidebar } from "@/components/layout/AdminSidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth()

  if (!session.grantedRoles.includes("admin")) {
    redirect("/buyer/dashboard")
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader variant="dashboard" session={session} />
      <div className="flex flex-1 pt-16">
        <AdminSidebar />
        <main className="flex-1 ml-64 p-6 bg-surface-subtle min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  )
}
