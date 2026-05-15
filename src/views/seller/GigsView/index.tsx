"use client"

import { useState, useMemo, useCallback } from "react"
import Link from "next/link"
import { Plus, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { GigsStatsBar }  from "./GigsStatsBar"
import { StatusTabs }    from "./filters/StatusTabs"
import { SortSelect }    from "./filters/SortSelect"
import { SearchInput }   from "./filters/SearchInput"
import { PerPageSelect } from "./filters/PerPageSelect"
import { buildGigsColumns } from "./columns/gigsColumns"
import { useGigsQuery }  from "./hooks/useGigsQuery"
import { DEFAULT_PARAMS } from "./types"
import type { GigsQueryParams } from "./types"

export function GigsView() {
  const [params, setParams] = useState<GigsQueryParams>(DEFAULT_PARAMS)

  const { data, isLoading, isFetching, refetch } = useGigsQuery(params)

  function update(patch: Partial<GigsQueryParams>) {
    setParams(prev => ({
      ...prev,
      ...patch,
      page: "page" in patch ? (patch.page ?? 1) : 1,
    }))
  }

  const SORT_TO_COLUMN: Record<string, string> = {
    newest: "newest", oldest: "newest",
    orders: "orders", impressions: "impressions",
    price_asc: "price_asc", price_desc: "price_asc",
  }

  const currentSort = useMemo(() => ({
    id:   SORT_TO_COLUMN[params.sort] ?? "newest",
    desc: !["oldest", "price_asc"].includes(params.sort),
  }), [params.sort])

  function handleSort(column: string) {
    const TOGGLE: Record<string, [string, string]> = {
      newest:      ["newest",      "oldest"],
      orders:      ["orders",      "orders"],
      impressions: ["impressions", "impressions"],
      price_asc:   ["price_asc",   "price_desc"],
    }
    const [asc, desc] = TOGGLE[column] ?? ["newest", "newest"]
    const next = currentSort.id === column && !currentSort.desc ? desc : asc
    update({ sort: next })
  }

  const handleMutate = useCallback(() => { refetch() }, [refetch])

  const columns = useMemo(
    () => buildGigsColumns(currentSort, handleSort, handleMutate),
    [currentSort, handleMutate] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const statusCounts: Record<string, number> = useMemo(() => ({
    "":      data?.total ?? 0,
    active:  data?.data.filter(g => g.status === "active").length  ?? 0,
    paused:  data?.data.filter(g => g.status === "paused").length  ?? 0,
    draft:   data?.data.filter(g => g.status === "draft").length   ?? 0,
  }), [data])

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Gigs</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {data ? `${data.total} gig${data.total !== 1 ? "s" : ""}` : "Loading…"}
          </p>
        </div>
        <Button size="sm" render={<Link href="/seller/gigs/new" />}>
          <Plus className="w-4 h-4 mr-1.5" />
          New Gig
        </Button>
      </div>

      {/* Stats bar */}
      {data && <GigsStatsBar gigs={data.data} />}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <StatusTabs
          value={params.status}
          onChange={v => update({ status: v })}
          counts={statusCounts}
        />
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <SearchInput
            value={params.search}
            onChange={v => update({ search: v })}
          />
          <SortSelect
            value={params.sort}
            onChange={v => update({ sort: v })}
          />
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        isFetching={isFetching}
        page={params.page}
        pageCount={data?.pageCount ?? 1}
        total={data?.total ?? 0}
        perPage={params.perPage}
        onPage={page => update({ page })}
        emptyMessage={
          params.search || params.status
            ? "No gigs match your filters."
            : "You haven't created any gigs yet."
        }
        skeletonRows={params.perPage}
      />

      {/* Per-page */}
      <div className="flex justify-end">
        <PerPageSelect
          value={params.perPage}
          onChange={v => update({ perPage: v })}
        />
      </div>
    </div>
  )
}
