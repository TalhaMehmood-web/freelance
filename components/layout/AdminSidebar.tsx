"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Users, Building2, AlertTriangle, Package,
  CreditCard, Star, Tag, UserCog, ShieldCheck,
} from "lucide-react"
import { cn } from "@/lib/shared/utils"

const NAV_ITEMS = [
  { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Organizations", href: "/admin/orgs", icon: Building2 },
  { label: "Gig Moderation", href: "/admin/gigs", icon: Package },
  { label: "Disputes", href: "/admin/disputes", icon: AlertTriangle },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
  { label: "Coupons", href: "/admin/coupons", icon: Tag },
  { label: "Account Managers", href: "/admin/account-managers", icon: UserCog },
  { label: "Verification Queue", href: "/admin/verification-queue", icon: ShieldCheck },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed top-16 left-0 bottom-0 w-64 bg-surface border-r border-border overflow-y-auto z-raised">
      <div className="p-4 border-b border-border">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-danger-600 bg-danger-50 border border-danger-100 px-2 py-1 rounded-md">
          Admin Panel
        </span>
      </div>
      <nav className="p-4">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
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
      </nav>
    </aside>
  )
}
