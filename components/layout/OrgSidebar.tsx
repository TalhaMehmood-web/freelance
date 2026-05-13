"use client"

import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import {
  LayoutDashboard, Users, BarChart2, CheckSquare, FileText,
  ScrollText, Settings, CreditCard, Key,
} from "lucide-react"
import { cn } from "@/lib/shared/utils"

export function OrgSidebar() {
  const pathname = usePathname()
  const params = useParams()
  const slug = params?.slug as string ?? ""
  const base = `/org/${slug}`

  const NAV_ITEMS = [
    { label: "Dashboard", href: `${base}/dashboard`, icon: LayoutDashboard },
    { label: "Members", href: `${base}/members`, icon: Users },
    { label: "Spend", href: `${base}/spend`, icon: BarChart2 },
    { label: "Approvals", href: `${base}/approvals`, icon: CheckSquare },
    { label: "Contracts", href: `${base}/contracts`, icon: FileText },
    { label: "Audit Log", href: `${base}/audit-log`, icon: ScrollText },
    { label: "Billing", href: `${base}/billing`, icon: CreditCard },
    { label: "API Access", href: `${base}/api`, icon: Key },
    { label: "Settings", href: `${base}/settings`, icon: Settings },
  ]

  return (
    <aside className="fixed top-16 left-0 bottom-0 w-64 bg-surface border-r border-border overflow-y-auto z-raised">
      <div className="p-4 border-b border-border">
        <p className="text-xs text-text-tertiary font-medium uppercase tracking-wider">Organization</p>
        <p className="text-sm font-semibold text-text-primary mt-1 capitalize">{slug.replace(/-/g, " ")}</p>
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
