import { requireAuth } from "@/lib/server/auth"
import { AppHeader } from "@/components/layout/AppHeader"
import { BuyerSidebar } from "@/components/layout/BuyerSidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { PermissionsBootstrap } from "@/components/providers/PermissionsBootstrap"
import { NotificationBell } from "@/components/shared/NotificationBellDynamic"

export default async function BuyerLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth()

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <PermissionsBootstrap />
      <SidebarProvider className="flex flex-col flex-1">
        <AppHeader
          variant="dashboard"
          session={session}
          notificationBell={<NotificationBell userId={session.userId} roleBase="buyer" />}
        />
        <div className="flex flex-1 pt-16 min-w-0">
          <BuyerSidebar />
          <SidebarInset className="bg-surface-subtle p-6 min-w-0 overflow-x-hidden">
            {children}
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
