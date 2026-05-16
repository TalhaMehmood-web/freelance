"use client"

import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import {
  LayoutDashboard, Users, BarChart2, CheckSquare, FileText,
  ScrollText, Settings, CreditCard, Key,
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
} from "@/components/ui/sidebar"

export function OrgSidebar() {
  const pathname = usePathname()
  const params = useParams()
  const slug = params?.slug as string ?? ""
  const base = `/org/${slug}`

  const NAV_ITEMS = [
    { label: "Dashboard", href: `${base}/dashboard`, icon: LayoutDashboard },
    { label: "Members",   href: `${base}/members`,   icon: Users },
    { label: "Spend",     href: `${base}/spend`,     icon: BarChart2 },
    { label: "Approvals", href: `${base}/approvals`, icon: CheckSquare },
    { label: "Contracts", href: `${base}/contracts`, icon: FileText },
    { label: "Audit Log", href: `${base}/audit-log`, icon: ScrollText },
    { label: "Billing",   href: `${base}/billing`,   icon: CreditCard },
    { label: "API Access",href: `${base}/api`,        icon: Key },
    { label: "Settings",  href: `${base}/settings`,  icon: Settings },
  ]

  return (
    <Sidebar collapsible="none" className="top-16 h-[calc(100svh-4rem)] border-r border-sidebar-border">
      <SidebarHeader className="px-4 py-3 border-b border-sidebar-border">
        <p className="text-xs text-text-tertiary font-medium uppercase tracking-wider">Organization</p>
        <p className="text-sm font-semibold text-text-primary mt-1 capitalize">{slug.replace(/-/g, " ")}</p>
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
    </Sidebar>
  )
}
