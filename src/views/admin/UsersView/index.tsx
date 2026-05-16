"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import { Search } from "lucide-react";
import { type SortingState } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { UserRoleModal } from "./UserRoleModal";
import { buildColumns } from "./columns";
import type { AdminUserRow, RoleRow } from "@/types/admin";
import { UserRole } from "@/lib/shared/constants";

const SearchSchema = z.object({ search: z.string() });
type SearchForm = z.infer<typeof SearchSchema>;

const FILTER_TABS = [
  { label: "All",     value: "" },
  { label: "Buyers",  value: UserRole.Buyer },
  { label: "Sellers", value: UserRole.Seller },
  { label: "Admins",  value: UserRole.Admin },
  { label: "Blocked", value: "blocked" },
];

const PER_PAGE = 20;

interface AdminUsersViewProps {
  availableRoles: RoleRow[]
  isSuperAdmin:   boolean
}

export function AdminUsersView({ availableRoles, isSuperAdmin }: AdminUsersViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [, startTransition] = useTransition();

  const [selectedUser, setSelectedUser] = useState<AdminUserRow | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const currentSearch = searchParams.get("search") ?? "";
  const currentRole = searchParams.get("role") ?? "";
  const currentStatus = searchParams.get("status") ?? "";
  const currentSortId = searchParams.get("sortBy") ?? "createdAt";
  const currentDesc = searchParams.get("sortDir") !== "asc";
  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);

  const searchForm = useForm<SearchForm>({
    resolver: zodResolver(SearchSchema),
    defaultValues: { search: currentSearch },
  });

  useEffect(() => {
    searchForm.setValue("search", currentSearch);
  }, [currentSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  function navigate(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined || v === "") params.delete(k);
      else params.set(k, v);
    });
    if (!("page" in updates)) params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  function handleSort(colId: string) {
    const isActive = currentSortId === colId;
    navigate({
      sortBy: colId,
      sortDir: isActive && currentDesc ? "asc" : "desc",
    });
  }

  const activeTab = currentStatus === "blocked" ? "blocked" : currentRole;

  const { data, isLoading, isFetching } = useQuery<{
    data: AdminUserRow[];
    total: number;
    pageCount: number;
    page: number;
  }>({
    queryKey: [
      "admin-users",
      currentSearch,
      currentRole,
      currentStatus,
      currentSortId,
      currentDesc,
      currentPage,
    ],
    queryFn: async () => {
      const p = new URLSearchParams({
        sortBy: currentSortId,
        sortDir: currentDesc ? "desc" : "asc",
        page: String(currentPage),
        perPage: String(PER_PAGE),
      });
      if (currentSearch) p.set("search", currentSearch);
      if (currentRole && currentStatus !== "blocked")
        p.set("role", currentRole);
      if (currentStatus) p.set("status", currentStatus);
      const { data } = await axios.get(`/api/admin/users?${p}`);
      return data;
    },
    staleTime: 10_000,
  });

  const users = data?.data ?? [];
  const realTotal = data?.total ?? 0;
  const realPages = data?.pageCount ?? 1;

  const blockMutation = useMutation({
    mutationFn: async ({
      userId,
      action,
    }: {
      userId: string;
      action: "block" | "unblock";
    }) => {
      await axios.patch(`/api/admin/users/${userId}/block`, { action });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const currentSort = { id: currentSortId, desc: currentDesc };
  const sorting: SortingState = [currentSort];

  const columns = buildColumns({
    currentSort,
    onSort: handleSort,
    onBlock: (userId, action) => blockMutation.mutate({ userId, action }),
    onEditRoles: (user) => {
      setSelectedUser(user);
      setModalOpen(true);
    },
    blockPending: blockMutation.isPending,
  });

  return (
    <div className="flex flex-col gap-6 ">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          User Management
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {isLoading ? "Loading…" : `${realTotal} total users`}
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <form
          onSubmit={searchForm.handleSubmit(({ search: s }) =>
            navigate({ search: s || undefined }),
          )}
          className="relative flex-1 max-w-xs"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
          <Input
            placeholder="Search name or username…"
            {...searchForm.register("search")}
            className="pl-9"
          />
        </form>

        <div className="flex items-center gap-1 bg-surface-subtle border border-border rounded-xl p-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                if (tab.value === "blocked") {
                  navigate({ status: "blocked", role: undefined });
                } else {
                  navigate({ role: tab.value || undefined, status: undefined });
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.value
                  ? "bg-white text-text-primary shadow-sm border border-border"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        isFetching={isFetching}
        sorting={sorting}
        onSortChange={(updater) => {
          const next =
            typeof updater === "function" ? updater(sorting) : updater;
          if (next[0]) handleSort(next[0].id);
        }}
        page={currentPage}
        pageCount={realPages}
        total={realTotal}
        perPage={PER_PAGE}
        onPage={(p) => navigate({ page: String(p) })}
        emptyMessage="No users found."
        skeletonRows={PER_PAGE}
      />

      <UserRoleModal
        user={selectedUser}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedUser(null);
        }}
        onSaved={() =>
          queryClient.invalidateQueries({ queryKey: ["admin-users"] })
        }
        availableRoles={availableRoles}
        isSuperAdmin={isSuperAdmin}
      />
    </div>
  );
}
