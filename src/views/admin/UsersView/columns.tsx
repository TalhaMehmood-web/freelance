"use client";

import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import {
  MoreVertical,
  Eye,
  ShieldOff,
  ShieldCheck,
  Shield,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SortableHeader } from "@/components/ui/data-table";
import type { AdminUserRow } from "@/types/admin";

const ROLE_BADGE: Record<string, string> = {
  buyer: "bg-blue-50 text-blue-700 border-blue-200",
  seller: "bg-brand-50 text-brand-700 border-brand-200",
  admin: "bg-danger-50 text-danger-700 border-danger-200",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface ColumnOptions {
  currentSort: { id: string; desc: boolean };
  onSort: (col: string) => void;
  onBlock: (userId: string, action: "block" | "unblock") => void;
  onEditRoles: (user: AdminUserRow) => void;
  blockPending: boolean;
}

export function buildColumns({
  currentSort,
  onSort,
  onBlock,
  onEditRoles,
  blockPending,
}: ColumnOptions): ColumnDef<AdminUserRow, any>[] {
  return [
    {
      accessorKey: "fullName",
      header: () => (
        <SortableHeader
          label="User"
          column="fullName"
          currentSort={currentSort}
          onSort={onSort}
        />
      ),
      cell: ({ row }) => {
        const u = row.original;
        return (
          <Link
            href={`/admin/users/${u.userId}/overview`}
            className="flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-brand-100 to-brand-200 flex items-center justify-center shrink-0 overflow-hidden">
              {u.avatarUrl ? (
                <img
                  src={u.avatarUrl}
                  alt=""
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <span className="text-xs font-bold text-brand-700">
                  {getInitials(u.fullName)}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-text-primary group-hover:text-brand-600 transition-colors leading-tight truncate">
                {u.fullName}
              </p>
              <p className="text-xs text-text-tertiary">@{u.username}</p>
            </div>
          </Link>
        );
      },
    },
    {
      accessorKey: "roles",
      header: () => (
        <span className="font-medium text-text-secondary text-xs uppercase tracking-wide">
          Roles
        </span>
      ),
      cell: ({ getValue }) => (
        <div className="flex flex-wrap gap-1">
          {(getValue() as string[]).map((r) => (
            <Badge
              key={r}
              variant="outline"
              className={`text-xs capitalize ${ROLE_BADGE[r] ?? ""}`}
            >
              {r}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "isBlocked",
      header: () => (
        <span className="font-medium text-text-secondary text-xs uppercase tracking-wide">
          Status
        </span>
      ),
      cell: ({ getValue }) =>
        getValue() ? (
          <Badge
            variant="outline"
            className="text-xs bg-danger-50 text-danger-700 border-danger-200"
          >
            Blocked
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-xs bg-success-50 text-success-700 border-success-200"
          >
            Active
          </Badge>
        ),
    },
    {
      accessorKey: "gigCount",
      header: () => (
        <span className="font-medium text-text-secondary text-xs uppercase tracking-wide">
          Gigs
        </span>
      ),
      cell: ({ getValue, row }) => {
        if (!row.original.sellerProfileId)
          return <span className="text-xs text-text-tertiary">—</span>;
        return (
          <span className="text-sm text-text-secondary">
            {(getValue() as number) ?? 0}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: () => (
        <SortableHeader
          label="Joined"
          column="createdAt"
          currentSort={currentSort}
          onSort={onSort}
        />
      ),
      cell: ({ getValue }) => (
        <span className="text-sm text-text-secondary">
          {formatDate(getValue() as string)}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => (
        <span className="font-medium text-text-secondary text-xs uppercase tracking-wide">
          Actions
        </span>
      ),
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger nativeButton>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Open actions"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem nativeButton>
                  <Link
                    href={`/admin/users/${u.userId}/overview`}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-text-secondary" />
                    View Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => onEditRoles(u)}
                >
                  <Shield className="w-4 h-4 text-text-secondary" />
                  Edit Roles
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className={`flex items-center gap-2 cursor-pointer ${
                    u.isBlocked
                      ? "text-success-700 focus:text-success-700 focus:bg-success-50"
                      : "text-danger-700 focus:text-danger-700 focus:bg-danger-50"
                  }`}
                  disabled={blockPending}
                  onClick={() =>
                    onBlock(u.userId, u.isBlocked ? "unblock" : "block")
                  }
                >
                  {u.isBlocked ? (
                    <>
                      <ShieldCheck className="w-4 h-4" /> Unblock User
                    </>
                  ) : (
                    <>
                      <ShieldOff className="w-4 h-4" /> Block User
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
