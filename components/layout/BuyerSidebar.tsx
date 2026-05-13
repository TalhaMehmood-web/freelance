"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, ShoppingBag, Briefcase, Heart, BarChart2,
  FileText, Users, Settings, Search, Star, FolderKanban,
  Bell, MessageSquare, UserCircle,
} from "lucide-react"
import { cn } from "@/lib/shared/utils"

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/buyer/dashboard", icon: LayoutDashboard },
      { label: "Browse Gigs", href: "/gigs", icon: Search },
      { label: "Find Freelancers", href: "/freelancers", icon: Users },
    ],
  },
  {
    label: "My Work",
    items: [
      { label: "My Orders", href: "/buyer/orders", icon: ShoppingBag },
      { label: "My Projects", href: "/buyer/projects", icon: FolderKanban },
      { label: "My Jobs", href: "/buyer/jobs", icon: Briefcase },
      { label: "Messages", href: "/buyer/messages", icon: MessageSquare },
    ],
  },
  {
    label: "Saved",
    items: [
      { label: "Talent Shortlists", href: "/buyer/saved/talent", icon: Heart },
      { label: "Saved Searches", href: "/buyer/saved/searches", icon: Search },
      { label: "Preferred Sellers", href: "/buyer/saved/preferred", icon: Star },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Spend Analytics", href: "/buyer/spend", icon: BarChart2 },
      { label: "Templates", href: "/buyer/templates", icon: FileText },
      { label: "Team", href: "/buyer/team", icon: Users },
      { label: "Notifications", href: "/buyer/notifications", icon: Bell },
      { label: "Profile", href: "/buyer/profile", icon: UserCircle },
      { label: "Settings", href: "/buyer/settings", icon: Settings },
    ],
  },
]

export function BuyerSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed top-16 left-0 bottom-0 w-64 bg-surface border-r border-border overflow-y-auto z-raised">
      <nav className="p-4 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 text-2xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                        isActive
                          ? "bg-brand-50 text-brand-600 font-medium"
                          : "text-text-secondary hover:text-text-primary hover:bg-surface-muted"
                      )}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
