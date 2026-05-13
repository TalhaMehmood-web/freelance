import { requireAuth } from "@/lib/server/auth"
import { AppHeader } from "@/components/layout/AppHeader"
import { OrgSidebar } from "@/components/layout/OrgSidebar"

export default async function OrgLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth()

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader variant="dashboard" session={session} />
      <div className="flex flex-1 pt-16">
        <OrgSidebar />
        <main className="flex-1 ml-64 p-6 bg-surface-subtle min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  )
}
