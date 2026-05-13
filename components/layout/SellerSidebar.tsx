"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Package, ShoppingBag, BarChart2, DollarSign,
  Image, Inbox, Settings, Bell, MessageSquare, UserCircle,
  TrendingUp, FileText, Calendar,
} from "lucide-react"
import { cn } from "@/lib/shared/utils"

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/seller/dashboard", icon: LayoutDashboard },
      { label: "Buyer Requests", href: "/seller/requests", icon: Inbox },
      { label: "Analytics", href: "/seller/analytics", icon: BarChart2 },
    ],
  },
  {
    label: "My Business",
    items: [
      { label: "My Gigs", href: "/seller/gigs", icon: Package },
      { label: "Orders", href: "/seller/orders", icon: ShoppingBag },
      { label: "Messages", href: "/seller/messages", icon: MessageSquare },
      { label: "Earnings", href: "/seller/earnings", icon: DollarSign },
    ],
  },
  {
    label: "Profile",
    items: [
      { label: "Portfolio", href: "/seller/portfolio", icon: Image },
      { label: "Profile Editor", href: "/seller/profile", icon: UserCircle },
      { label: "Availability", href: "/seller/settings/availability", icon: Calendar },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Transaction History", href: "/seller/earnings/transactions", icon: TrendingUp },
      { label: "Tax Documents", href: "/seller/settings/tax", icon: FileText },
      { label: "Notifications", href: "/seller/notifications", icon: Bell },
      { label: "Settings", href: "/seller/settings", icon: Settings },
    ],
  },
]

export function SellerSidebar() {
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
                const isActive = pathname === item.href || (item.href !== "/seller/settings" && pathname.startsWith(item.href + "/"))
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
