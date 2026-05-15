"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Package, ShoppingBag, BarChart2, DollarSign,
  Image, Inbox, Settings, Bell, MessageSquare, UserCircle,
  TrendingUp, FileText, Calendar,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard",       href: "/seller/dashboard",  icon: LayoutDashboard },
      { label: "Buyer Requests",  href: "/seller/requests",   icon: Inbox },
      { label: "Analytics",       href: "/seller/analytics",  icon: BarChart2 },
    ],
  },
  {
    label: "My Business",
    items: [
      { label: "My Gigs",  href: "/seller/gigs",     icon: Package },
      { label: "Orders",   href: "/seller/orders",   icon: ShoppingBag },
      { label: "Messages", href: "/seller/messages", icon: MessageSquare },
      { label: "Earnings", href: "/seller/earnings", icon: DollarSign },
    ],
  },
  {
    label: "Profile",
    items: [
      { label: "Portfolio",     href: "/seller/portfolio",               icon: Image },
      { label: "Profile Editor",href: "/seller/profile",                 icon: UserCircle },
      { label: "Availability",  href: "/seller/settings/availability",   icon: Calendar },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Transaction History", href: "/seller/earnings/transactions", icon: TrendingUp },
      { label: "Tax Documents",       href: "/seller/settings/tax",          icon: FileText },
      { label: "Notifications",       href: "/seller/notifications",         icon: Bell },
      { label: "Settings",            href: "/seller/settings",              icon: Settings },
    ],
  },
]

export function SellerSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="offcanvas" className="top-16 h-[calc(100svh-4rem)] border-r border-sidebar-border">
      <SidebarContent>
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/seller/settings" && pathname.startsWith(item.href + "/"))
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
        ))}
      </SidebarContent>
    </Sidebar>
  )
}
