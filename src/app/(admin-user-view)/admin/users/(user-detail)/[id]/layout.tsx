import { requireAuth } from "@/lib/server/auth"
import { UserRole } from "@/lib/shared/constants"
import { prisma } from "@/lib/server/prisma"
import { notFound } from "next/navigation"
import { getAllRoles } from "@/actions/admin/permissions"
import { AppHeader } from "@/components/layout/AppHeader"
import { SidebarProvider } from "@/components/ui/sidebar"
import { UserDashboardSidebar } from "@/components/admin/UserDashboardSidebar"

interface Props {
  children: React.ReactNode
  params:   Promise<{ id: string }>
}

export default async function UserDashboardLayout({ children, params }: Props) {
  const session = await requireAuth(UserRole.Admin)
  const { id }  = await params

  const profile = await prisma.profile.findUnique({
    where:  { userId: id },
    select: {
      userId:    true,
      fullName:  true,
      username:  true,
      avatarUrl: true,
      roles:     true,
      isBlocked: true,
      sellerProfile: {
        select: {
          id:              true,
          completedOrders: true,
          _count: { select: { gigs: { where: { status: { not: "suspended" } } } } },
        },
      },
    },
  })

  if (!profile) notFound()

  const isSeller   = !!profile.sellerProfile
  const gigCount   = profile.sellerProfile?._count.gigs    ?? 0
  const orderCount = profile.sellerProfile?.completedOrders ?? 0

  const rolesResult = await getAllRoles()

  return (
    <SidebarProvider>
    <div className="flex flex-col min-h-screen bg-surface-subtle w-full">
      <AppHeader variant="dashboard" session={session} hideDefaultBell hideRoleToggle />
      <div className="flex flex-1 pt-16">
        <UserDashboardSidebar
          userId={profile.userId}
          fullName={profile.fullName}
          username={profile.username}
          avatarUrl={profile.avatarUrl ?? null}
          roles={profile.roles}
          isBlocked={profile.isBlocked}
          isSeller={isSeller}
          gigCount={gigCount}
          orderCount={orderCount}
          availableRoles={rolesResult.data ?? []}
          isSuperAdmin={session.isSuperAdmin}
        />
        <div className="flex-1 overflow-y-auto min-w-0">
          {children}
        </div>
      </div>
    </div>
    </SidebarProvider>
  )
}
