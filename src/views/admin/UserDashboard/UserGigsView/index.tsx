"use client"

import { useState, useMemo, useCallback } from "react"
import { DataTable } from "@/components/ui/data-table"
import { buildGigsColumns } from "@/views/seller/GigsView/columns/gigsColumns"
import { useUserGigsQuery, useToggleGigMutation } from "./hooks/useUserGigsQuery"

const STATUS_TABS = [
  { label: "All",    value: "" },
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
  { label: "Draft",  value: "draft" },
]

interface Props {
  userId: string
}

export function UserGigsView({ userId }: Props) {
  const [statusFilter, setStatusFilter] = useState("")

  const { data: allGigs, isLoading, isFetching, refetch } = useUserGigsQuery(userId)
  const toggleMutation = useToggleGigMutation(userId)

  const filtered = useMemo(
    () => (allGigs ?? []).filter(g => !statusFilter || g.status === statusFilter),
    [allGigs, statusFilter]
  )

  const handleMutate = useCallback(() => { refetch() }, [refetch])

  const columns = useMemo(
    () => buildGigsColumns(null, () => {}, handleMutate),
    [handleMutate]
  )

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <div>
        <h2 className="text-xl font-bold text-text-primary">Gigs</h2>
        <p className="text-sm text-text-secondary mt-0.5">
          {isLoading ? "Loading…" : `${allGigs?.length ?? 0} total gigs`}
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-1 bg-surface-subtle border border-border rounded-xl p-1 w-fit">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === tab.value
                ? "bg-white text-text-primary shadow-sm border border-border"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        isFetching={isFetching}
        emptyMessage={statusFilter ? "No gigs match this filter." : "This user has no gigs."}
        skeletonRows={5}
      />
    </div>
  )
}
