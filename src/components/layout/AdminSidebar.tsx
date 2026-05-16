"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Users, Building2, AlertTriangle, Package,
  CreditCard, Star, Tag, UserCog, ShieldCheck, KeyRound, FolderTree, MessageSquare,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar"

const NAV_ITEMS = [
  { label: "Overview",           href: "/admin/dashboard",           icon: LayoutDashboard },
  { label: "Users",              href: "/admin/users",               icon: Users },
  { label: "Organizations",      href: "/admin/orgs",                icon: Building2 },
  { label: "Gig Moderation",     href: "/admin/gigs",                icon: Package },
  { label: "Support Inbox",      href: "/admin/support",             icon: MessageSquare },
  { label: "Disputes",           href: "/admin/disputes",            icon: AlertTriangle },
  { label: "Payments",           href: "/admin/payments",            icon: CreditCard },
  { label: "Reviews",            href: "/admin/reviews",             icon: Star },
  { label: "Coupons",            href: "/admin/coupons",             icon: Tag },
  { label: "Categories",         href: "/admin/categories",          icon: FolderTree },
  { label: "Account Managers",   href: "/admin/account-managers",    icon: UserCog },
  { label: "Verification Queue", href: "/admin/verification-queue",  icon: ShieldCheck },
  { label: "Permissions",        href: "/admin/permissions",         icon: KeyRound },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar
      collapsible="icon"
      className="top-16! h-[calc(100svh-4rem)]! border-r border-sidebar-border"
    >
      <SidebarHeader className="px-4 py-3 border-b border-sidebar-border group-data-[collapsible=icon]:hidden">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-danger-600 bg-danger-50 border border-danger-100 px-2 py-1 rounded-md w-fit">
          Admin Panel
        </span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.label}
                      render={<Link href={item.href} />}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
