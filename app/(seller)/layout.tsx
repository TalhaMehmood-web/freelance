import { requireAuth } from "@/lib/server/auth"
import { AppHeader } from "@/components/layout/AppHeader"
import { SellerSidebar } from "@/components/layout/SellerSidebar"

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth("seller")

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader variant="dashboard" session={session} />
      <div className="flex flex-1 pt-16">
        <SellerSidebar />
        <main className="flex-1 ml-64 p-6 bg-surface-subtle min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  )
}
