import { requireAuth } from "@/lib/server/auth"
import { AppHeader } from "@/components/layout/AppHeader"
import { SellerSidebar } from "@/components/layout/SellerSidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { QueryProvider } from "@/components/providers/QueryProvider"

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth("seller")

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <QueryProvider>
        <SidebarProvider className="flex flex-col flex-1">
          <AppHeader variant="dashboard" session={session} />
          <div className="flex flex-1 pt-16 min-w-0">
            <SellerSidebar />
            <SidebarInset className="bg-surface-subtle p-6 min-w-0 overflow-x-hidden">
              {children}
            </SidebarInset>
          </div>
        </SidebarProvider>
      </QueryProvider>
    </div>
  )
}
