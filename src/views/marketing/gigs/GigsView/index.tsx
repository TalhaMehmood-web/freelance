"use client";

import {
  useState,
  useCallback,
  useTransition,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, SlidersHorizontal, Loader2, X } from "lucide-react";
import { GigCard } from "@/components/gigs/GigCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/shared/utils";
import { formatNumber } from "@/lib/shared/utils";
import { FilterSheet } from "./FilterSheet";
import { ActiveFilters } from "./ActiveFilters";
import { usePublicGigsQuery } from "./hooks/usePublicGigsQuery";
import type { GigFilters } from "./types";
import type { CategoryWithChildren } from "@/actions/categories";

const SORT_OPTIONS = [
  { label: "Best Match", value: "relevance" },
  { label: "Best Selling", value: "orders" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Top Rated", value: "rating" },
];

const PER_PAGE = 12;

interface GigsViewProps {
  initialFilters: GigFilters;
  categories: CategoryWithChildren[];
}

export function GigsView({ initialFilters, categories }: GigsViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [filters, setFilters] = useState<GigFilters>(initialFilters);
  const [sheetOpen, setSheetOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    usePublicGigsQuery({
      query: filters.q || undefined,
      categoryId: filters.category || undefined,
      subcategoryId: filters.subcategory || undefined,
      minPrice: filters.minPrice || undefined,
      maxPrice: filters.maxPrice || undefined,
      deliveryDays: filters.deliveryDays || undefined,
      sellerLevel: filters.sellerLevel || undefined,
      minRating: filters.minRating || undefined,
      sort: filters.sort || "newest",
      perPage: PER_PAGE,
    });

  const gigs = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data]);
  const total = data?.pages[0]?.total ?? 0;

  // Infinite scroll sentinel
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const pushFilters = useCallback(
    (next: GigFilters) => {
      const params = new URLSearchParams();
      Object.entries(next).forEach(([k, v]) => {
        if (v) params.set(k, v);
      });
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router],
  );

  const handleFilterChange = useCallback(
    (key: keyof GigFilters, value: string) => {
      const next = { ...filters, [key]: value };
      if (key === "category") next.subcategory = "";
      setFilters(next);
      pushFilters(next);
    },
    [filters, pushFilters],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      if (searchDebounce.current) clearTimeout(searchDebounce.current);
      searchDebounce.current = setTimeout(() => {
        const next = { ...filters, q: value };
        setFilters(next);
        pushFilters(next);
      }, 400);
    },
    [filters, pushFilters],
  );

  const handleApply = useCallback(
    (next: GigFilters) => {
      setFilters(next);
      pushFilters(next);
    },
    [pushFilters],
  );

  const handleReset = useCallback(() => {
    const next: GigFilters = {
      q: "",
      category: "",
      subcategory: "",
      minPrice: "",
      maxPrice: "",
      deliveryDays: "",
      sellerLevel: "",
      minRating: "",
      sort: "relevance",
    };
    setFilters(next);
    pushFilters(next);
  }, [pushFilters]);

  const handleRemoveFilter = useCallback(
    (key: keyof GigFilters) => {
      const next = { ...filters };
      if (key === "minPrice") {
        next.minPrice = "";
        next.maxPrice = "";
      } else if (key === "category") {
        next.category = "";
        next.subcategory = "";
      } else {
        next[key] = key === "sort" ? "relevance" : "";
      }
      setFilters(next);
      pushFilters(next);
    },
    [filters, pushFilters],
  );

  const activeFilterCount = [
    filters.category,
    filters.subcategory,
    filters.minPrice || filters.maxPrice,
    filters.deliveryDays,
    filters.sellerLevel,
    filters.minRating,
  ].filter(Boolean).length;

  const selectedCategory = categories.find((c) => c.slug === filters.category);
  const categoryLabel = selectedCategory?.name ?? "Browse Gigs";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary mb-1">
          {filters.q ? (
            <>
              Results for{" "}
              <span className="text-brand-500">&ldquo;{filters.q}&rdquo;</span>
            </>
          ) : filters.category ? (
            categoryLabel
          ) : (
            "Browse Gigs"
          )}
        </h1>
        <p className="text-sm text-text-secondary">
          {isLoading
            ? "Loading…"
            : `${formatNumber(total)} service${total !== 1 ? "s" : ""} available`}
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none z-10" />
        <Input
          type="search"
          defaultValue={filters.q}
          placeholder="Search services…"
          className="h-11 pl-10 pr-4 text-sm rounded-xl shadow-card"
          onChange={(e) => handleSearchChange(e.target.value.trim())}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (searchDebounce.current) clearTimeout(searchDebounce.current);
              const val = (e.target as HTMLInputElement).value.trim();
              const next = { ...filters, q: val };
              setFilters(next);
              pushFilters(next);
            }
          }}
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSheetOpen(true)}
          className="h-10 gap-2 rounded-xl border-border hover:border-brand-300 hover:bg-brand-50 transition-colors"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="h-5 min-w-5 px-1.5 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-nowrap text-text-secondary hidden sm:block">
            Sort by:
          </span>
          <div className="flex items-center gap-1">
            <Select
              value={filters.sort}
              onValueChange={(v) => v && handleFilterChange("sort", v)}
            >
              <SelectTrigger className="h-10 text-sm rounded-xl min-w-44 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filters.sort && filters.sort !== "relevance" && (
              <button
                type="button"
                onClick={() => handleFilterChange("sort", "relevance")}
                className="h-7 w-7 flex items-center justify-center rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-subtle transition-colors"
                aria-label="Reset sort"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Subcategory chips */}
      {selectedCategory && selectedCategory.children.length > 0 && (
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => handleFilterChange("subcategory", "")}
            className={cn(
              "shrink-0 h-8 px-3.5 rounded-full border text-sm font-medium transition-all whitespace-nowrap",
              !filters.subcategory
                ? "border-brand-500 bg-brand-50 text-brand-700"
                : "border-border text-text-secondary hover:border-brand-300 hover:bg-surface-subtle",
            )}
          >
            All
          </button>
          {selectedCategory.children.map((sub) => (
            <button
              key={sub.slug}
              onClick={() => handleFilterChange("subcategory", sub.slug)}
              className={cn(
                "shrink-0 h-8 px-3.5 rounded-full border text-sm font-medium transition-all whitespace-nowrap",
                filters.subcategory === sub.slug
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-border text-text-secondary hover:border-brand-300 hover:bg-surface-subtle",
              )}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}

      {/* Active pills */}
      <ActiveFilters
        filters={filters}
        categories={categories}
        onRemove={handleRemoveFilter}
      />

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: PER_PAGE }).map((_, i) => (
            <div
              key={i}
              className="bg-surface rounded-2xl border border-border shadow-card h-72 animate-pulse"
            />
          ))}
        </div>
      ) : gigs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-16 w-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-brand-300" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">
            No gigs found
          </h3>
          <p className="text-sm text-text-secondary mb-6 max-w-sm">
            Try adjusting your filters or search terms to find what you&apos;re
            looking for.
          </p>
          <Button variant="outline" onClick={handleReset}>
            Clear all filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {gigs.map((gig) => (
            <GigCard key={gig.id} gig={gig} />
          ))}
        </div>
      )}

      {/* Sentinel + loading */}
      <div ref={sentinelRef} className="h-1" />
      {isFetchingNextPage && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-brand-400" />
        </div>
      )}
      {!isLoading && !hasNextPage && gigs.length > 0 && (
        <p className="text-center text-sm text-text-tertiary py-8">
          Showing all {formatNumber(total)} result{total !== 1 ? "s" : ""}
        </p>
      )}

      {/* Filter Sheet */}
      <FilterSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        filters={filters}
        categories={categories}
        onApply={handleApply}
        onReset={handleReset}
        activeCount={activeFilterCount}
      />
    </div>
  );
}
