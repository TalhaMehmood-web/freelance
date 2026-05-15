"use client"

import { useState, useTransition } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table"
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Search, Shield } from "lucide-react"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserRoleModal } from "./UserRoleModal"
import type { AdminUserRow } from "@/types/admin"

const SearchSchema = z.object({ search: z.string() })
type SearchForm = z.infer<typeof SearchSchema>

interface UsersViewProps {
  initialUsers:  AdminUserRow[]
  total:         number
  pageCount:     number
  currentPage:   number
  currentSort:   { id: string; desc: boolean }
  currentSearch: string
  currentRole:   string
}

const ROLE_BADGE: Record<string, string> = {
  buyer:  "bg-blue-50 text-blue-700 border-blue-200",
  seller: "bg-brand-50 text-brand-700 border-brand-200",
  admin:  "bg-danger-50 text-danger-700 border-danger-200",
}

const FILTER_TABS = [
  { label: "All",     value: "" },
  { label: "Buyers",  value: "buyer" },
  { label: "Sellers", value: "seller" },
  { label: "Admins",  value: "admin" },
]

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

const col = createColumnHelper<AdminUserRow>()

export function AdminUsersView({
  initialUsers,
  total,
  pageCount,
  currentPage,
  currentSort,
  currentSearch,
  currentRole,
}: UsersViewProps) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  const [users, setUsers]               = useState(initialUsers)
  const [selectedUser, setSelectedUser] = useState<AdminUserRow | null>(null)
  const [modalOpen, setModalOpen]       = useState(false)
  const [, startTransition]             = useTransition()

  const searchForm = useForm<SearchForm>({
    resolver: zodResolver(SearchSchema),
    defaultValues: { search: currentSearch },
  })

  function navigate(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined || v === "") params.delete(k)
      else params.set(k, v)
    })
    if (!("page" in updates)) params.delete("page")
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  function handleSearchSubmit({ search }: SearchForm) {
    navigate({ search: search || undefined })
  }

  function handleSort(columnId: string) {
    const isCurrentCol = currentSort.id === columnId
    const nextDir = isCurrentCol && !currentSort.desc ? "desc" : "asc"
    navigate({ sortBy: columnId, sortDir: nextDir })
  }

  function handleRolesSaved(userId: string, roles: string[]) {
    setUsers(prev => prev.map(u => u.userId === userId ? { ...u, roles } : u))
  }

  const sorting: SortingState = [{ id: currentSort.id, desc: currentSort.desc }]

  const columns = [
    col.accessor("fullName", {
      header: () => (
        <button
          className="flex items-center gap-1 font-medium text-text-secondary hover:text-text-primary transition-colors"
          onClick={() => handleSort("fullName")}
        >
          User
          {currentSort.id === "fullName"
            ? currentSort.desc ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowUp className="w-3.5 h-3.5" />
            : <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />}
        </button>
      ),
      cell: ({ row }) => {
        const u = row.original
        return (
          <div className="flex items-center gap-3 py-1">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-brand-100 to-brand-200 flex items-center justify-center shrink-0">
              {u.avatarUrl
                ? <img src={u.avatarUrl} alt="" className="w-full h-full rounded-xl object-cover" />
                : <span className="text-xs font-bold text-brand-700">{getInitials(u.fullName)}</span>
              }
            </div>
            <div>
              <p className="font-medium text-text-primary leading-tight">{u.fullName}</p>
              <p className="text-xs text-text-tertiary">@{u.username} · {u.email}</p>
            </div>
          </div>
        )
      },
    }),
    col.accessor("roles", {
      header: () => <span className="font-medium text-text-secondary">Roles</span>,
      cell: ({ getValue }) => (
        <div className="flex flex-wrap gap-1">
          {(getValue() as string[]).map(role => (
            <Badge key={role} variant="outline" className={`text-xs ${ROLE_BADGE[role] ?? ""}`}>
              {role}
            </Badge>
          ))}
        </div>
      ),
    }),
    col.accessor("createdAt", {
      header: () => (
        <button
          className="flex items-center gap-1 font-medium text-text-secondary hover:text-text-primary transition-colors"
          onClick={() => handleSort("createdAt")}
        >
          Joined
          {currentSort.id === "createdAt"
            ? currentSort.desc ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowUp className="w-3.5 h-3.5" />
            : <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />}
        </button>
      ),
      cell: ({ getValue }) => (
        <span className="text-text-secondary text-sm">{formatDate(getValue() as string)}</span>
      ),
    }),
    col.display({
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => { setSelectedUser(row.original); setModalOpen(true) }}
          >
            <Shield className="w-3.5 h-3.5 mr-1.5" />
            Edit Roles
          </Button>
        </div>
      ),
    }),
  ]

  const table = useReactTable({
    data:             users,
    columns,
    state:            { sorting },
    manualSorting:    true,
    manualPagination: true,
    pageCount,
    getCoreRowModel:  getCoreRowModel(),
  })

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">User Management</h1>
        <p className="text-sm text-text-secondary mt-1">{total} total users</p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <form
          onSubmit={searchForm.handleSubmit(handleSearchSubmit)}
          className="relative flex-1 min-w-50 max-w-xs"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
          <Input
            placeholder="Search users…"
            {...searchForm.register("search")}
            className="pl-9"
          />
        </form>

        {/* Role tabs */}
        <div className="flex items-center gap-1 bg-surface-subtle border border-border rounded-xl p-1">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => navigate({ role: tab.value || undefined })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentRole === tab.value
                  ? "bg-white text-text-primary shadow-sm border border-border"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
        <Table>
          <TableHeader className="bg-surface-subtle">
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id} className="border-border">
                {hg.headers.map(header => (
                  <TableHead key={header.id} className="px-4 py-3">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-12 text-text-secondary">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} className="border-border hover:bg-surface-subtle">
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className="px-4 py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between text-sm text-text-secondary">
          <span>
            Page {currentPage} of {pageCount} · {total} users
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => navigate({ page: String(currentPage - 1) })}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= pageCount}
              onClick={() => navigate({ page: String(currentPage + 1) })}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <UserRoleModal
        user={selectedUser}
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedUser(null) }}
        onSaved={handleRolesSaved}
      />
    </div>
  )
}
