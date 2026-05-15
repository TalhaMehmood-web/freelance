import { requireAuth } from "@/lib/server/auth"
import { redirect } from "next/navigation"
import { AppHeader } from "@/components/layout/AppHeader"
import { AdminSidebar } from "@/components/layout/AdminSidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth()

  if (!session.grantedRoles.includes("admin")) {
    redirect("/buyer/dashboard")
  }

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <SidebarProvider className="flex flex-col flex-1">
        <AppHeader variant="dashboard" session={session} />
        <div className="flex flex-1 pt-16 min-w-0">
          <AdminSidebar />
          <SidebarInset className="bg-surface-subtle p-6 min-w-0 overflow-x-hidden">
            {children}
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
