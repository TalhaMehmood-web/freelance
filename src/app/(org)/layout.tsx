import { requireAuth } from "@/lib/server/auth"
import { AppHeader } from "@/components/layout/AppHeader"
import { OrgSidebar } from "@/components/layout/OrgSidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default async function OrgLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth()

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader variant="dashboard" session={session} />
      <SidebarProvider className="flex flex-1 pt-16">
        <OrgSidebar />
        <SidebarInset className="bg-surface-subtle p-6">
          {children}
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
