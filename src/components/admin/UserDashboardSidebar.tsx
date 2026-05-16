"use client"

import { useState, useTransition } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import {
  LayoutDashboard, Package, ShoppingBag, ShieldOff, ShieldCheck,
  Shield, ArrowLeft,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn, getInitials } from "@/lib/shared/utils"
import { UserRoleModal } from "@/views/admin/UsersView/UserRoleModal"
import type { AdminUserRow, RoleRow } from "@/types/admin"

const ROLE_BADGE: Record<string, string> = {
  buyer:  "bg-blue-50 text-blue-700 border-blue-200",
  seller: "bg-brand-50 text-brand-700 border-brand-200",
  admin:  "bg-danger-50 text-danger-700 border-danger-200",
}

interface UserDashboardSidebarProps {
  userId:    string
  fullName:  string
  username:  string
  avatarUrl: string | null
  roles:          string[]
  isBlocked:      boolean
  isSeller:       boolean
  gigCount:       number
  orderCount:     number
  availableRoles: RoleRow[]
  isSuperAdmin:   boolean
}

type NavItem = { label: string; href: string; icon: React.FC<{ className?: string }> }

export function UserDashboardSidebar({
  userId, fullName, username, avatarUrl,
  roles, isBlocked, isSeller, gigCount, orderCount,
  availableRoles, isSuperAdmin,
}: UserDashboardSidebarProps) {
  const pathname    = usePathname()
  const queryClient = useQueryClient()
  const [, startTransition] = useTransition()
  const [modalOpen, setModalOpen] = useState(false)

  const blockMutation = useMutation({
    mutationFn: async (action: "block" | "unblock") => {
      await axios.patch(`/api/admin/users/${userId}/block`, { action })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-detail", userId] })
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
    },
  })

  function handleToggleBlock() {
    startTransition(() => {
      blockMutation.mutate(isBlocked ? "unblock" : "block")
    })
  }

  const userRow: AdminUserRow = {
    id: userId, userId, username, fullName, avatarUrl,
    email: "", roles, createdAt: "", isBlocked, blockedAt: null, lastSignInAt: null,
  }

  const infoNav: NavItem[] = [
    { label: "Overview", href: `/admin/users/${userId}/overview`, icon: LayoutDashboard },
  ]

  const sellerNav: NavItem[] = isSeller ? [
    { label: `Gigs (${gigCount})`,    href: `/admin/users/${userId}/gigs`,   icon: Package },
    { label: `Orders (${orderCount})`, href: `/admin/users/${userId}/orders`, icon: ShoppingBag },
  ] : []

  function NavGroup({ title, items }: { title: string; items: NavItem[] }) {
    return (
      <div>
        <p className="px-3 py-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider">{title}</p>
        <nav className="space-y-0.5">
          {items.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-50 text-brand-700 border border-brand-100"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-subtle"
                )}
              >
                <item.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-brand-500" : "text-text-tertiary")} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    )
  }

  return (
    <>
      <div className="w-64 shrink-0 bg-surface border-r border-border flex flex-col h-full">
        {/* Back link */}
        <div className="px-4 py-3 border-b border-border">
          <Link
            href="/admin/users"
            className="flex items-center gap-1.5 text-xs font-medium text-text-tertiary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All Users
          </Link>
        </div>

        {/* User card */}
        <div className="px-4 py-5 border-b border-border">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-11 w-11 ring-2 ring-brand-100 shrink-0">
              <AvatarImage src={avatarUrl ?? undefined} />
              <AvatarFallback className="text-sm bg-brand-100 text-brand-700 font-bold">
                {getInitials(fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-semibold text-text-primary text-sm truncate leading-tight">{fullName}</p>
              <p className="text-xs text-text-tertiary">@{username}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            {roles.map(role => (
              <Badge key={role} variant="outline" className={`text-xs ${ROLE_BADGE[role] ?? ""}`}>
                {role}
              </Badge>
            ))}
          </div>
          {isBlocked
            ? <Badge variant="outline" className="text-xs bg-danger-50 text-danger-700 border-danger-200">Blocked</Badge>
            : <Badge variant="outline" className="text-xs bg-success-50 text-success-700 border-success-200">Active</Badge>
          }
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          <NavGroup title="User Info" items={infoNav} />
          {sellerNav.length > 0 && <NavGroup title="Seller Management" items={sellerNav} />}
        </div>

        {/* Account actions */}
        <div className="px-3 py-4 border-t border-border space-y-2">
          <p className="px-0 py-1 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Account</p>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => setModalOpen(true)}
          >
            <Shield className="w-3.5 h-3.5" />
            Edit Roles
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={blockMutation.isPending}
            className={cn(
              "w-full justify-start gap-2",
              isBlocked
                ? "text-success-700 border-success-200 hover:bg-success-50"
                : "text-danger-700 border-danger-200 hover:bg-danger-50"
            )}
            onClick={handleToggleBlock}
          >
            {isBlocked
              ? <><ShieldCheck className="w-3.5 h-3.5" /> Unblock User</>
              : <><ShieldOff   className="w-3.5 h-3.5" /> Block User</>
            }
          </Button>
        </div>
      </div>

      <UserRoleModal
        user={modalOpen ? userRow : null}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          setModalOpen(false)
          queryClient.invalidateQueries({ queryKey: ["admin-user-detail", userId] })
        }}
        availableRoles={availableRoles}
        isSuperAdmin={isSuperAdmin}
      />
    </>
  )
}
