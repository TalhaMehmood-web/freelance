"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, ShoppingBag, Briefcase, Heart, BarChart2,
  FileText, Users, Settings, Search, Star, FolderKanban,
  Bell, MessageSquare, UserCircle,
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
      { label: "Dashboard",        href: "/buyer/dashboard",       icon: LayoutDashboard },
      { label: "Browse Gigs",      href: "/gigs",                  icon: Search },
      { label: "Find Freelancers", href: "/freelancers",           icon: Users },
    ],
  },
  {
    label: "My Work",
    items: [
      { label: "My Orders",   href: "/buyer/orders",    icon: ShoppingBag },
      { label: "My Projects", href: "/buyer/projects",  icon: FolderKanban },
      { label: "My Jobs",     href: "/buyer/jobs",      icon: Briefcase },
      { label: "Messages",    href: "/buyer/messages",  icon: MessageSquare },
    ],
  },
  {
    label: "Saved",
    items: [
      { label: "Talent Shortlists", href: "/buyer/saved/talent",   icon: Heart },
      { label: "Saved Searches",    href: "/buyer/saved/searches", icon: Search },
      { label: "Preferred Sellers", href: "/buyer/saved/preferred",icon: Star },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Spend Analytics", href: "/buyer/spend",          icon: BarChart2 },
      { label: "Templates",       href: "/buyer/templates",      icon: FileText },
      { label: "Team",            href: "/buyer/team",           icon: Users },
      { label: "Notifications",   href: "/buyer/notifications",  icon: Bell },
      { label: "Profile",         href: "/buyer/profile",        icon: UserCircle },
      { label: "Settings",        href: "/buyer/settings",       icon: Settings },
    ],
  },
]

export function BuyerSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="offcanvas" className="top-16! h-[calc(100svh-4rem)]! border-r border-sidebar-border">
      <SidebarContent>
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
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
        ))}
      </SidebarContent>
    </Sidebar>
  )
}
