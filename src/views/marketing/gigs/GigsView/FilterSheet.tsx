"use client";

import { useState, useEffect } from "react";
import {
  SlidersHorizontal,
  Star,
  X,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/shared/utils";
import type { GigFilters } from "./types";
import type { CategoryWithChildren } from "@/types/categories";

const DELIVERY_OPTIONS = [
  { label: "Any", value: "" },
  { label: "24h", value: "1" },
  { label: "3 days", value: "3" },
  { label: "7 days", value: "7" },
  { label: "14 days", value: "14" },
];

const SELLER_LEVELS = [
  { label: "Any", value: "" },
  { label: "Top Rated", value: "top_rated" },
  { label: "Level 2", value: "level_2" },
  { label: "Level 1", value: "level_1" },
  { label: "New Seller", value: "new" },
];

const RATING_OPTIONS = [
  { label: "Any", value: "" },
  { label: "3.5+", value: "3.5" },
  { label: "4.0+", value: "4.0" },
  { label: "4.5+", value: "4.5" },
];

interface ChipGroupProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}

function ChipGroup({ options, value, onChange }: ChipGroupProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <Button
          key={opt.value}
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange(opt.value)}
          className={cn(
            "h-9 rounded-full border text-sm transition-all",
            value === opt.value
              ? "border-brand-500 bg-brand-50 text-brand-700 font-semibold hover:bg-brand-50"
              : "border-border text-text-secondary hover:border-brand-300 hover:bg-transparent",
          )}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}

interface ComboboxFieldProps {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
}

function ComboboxField({
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder,
  emptyText,
}: ComboboxFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-sm ring-offset-background transition-colors",
          "hover:border-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
          !value && "text-text-tertiary",
        )}
      >
        <span className="truncate">{selected?.label ?? placeholder}</span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-text-tertiary" />
      </PopoverTrigger>
      <PopoverContent className="w-(--anchor-width) p-0" align="start">
        <Command>
          <CommandInput hideIcon placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="__all__"
                onSelect={() => {
                  onChange("");
                  setOpen(false);
                }}
                data-checked={value === ""}
              >
                All
              </CommandItem>
              {options.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.value}
                  onSelect={(v) => {
                    onChange(v);
                    setOpen(false);
                  }}
                  data-checked={value === opt.value}
                >
                  {opt.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface FilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: GigFilters;
  categories: CategoryWithChildren[];
  onApply: (filters: GigFilters) => void;
  onReset: () => void;
  activeCount: number;
}

export function FilterSheet({
  open,
  onOpenChange,
  filters,
  categories,
  onApply,
  onReset,
  activeCount,
}: FilterSheetProps) {
  const [draft, setDraft] = useState<GigFilters>(filters);

  // Sync draft whenever the external filters change (e.g. pill removal from page)
  useEffect(() => {
    setDraft(filters);
  }, [filters]);

  function update<K extends keyof GigFilters>(key: K, value: GigFilters[K]) {
    setDraft((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "category") next.subcategory = "";
      return next;
    });
  }

  function handleOpen(next: boolean) {
    if (next) setDraft(filters);
    onOpenChange(next);
  }

  function handleApply() {
    onApply(draft);
    onOpenChange(false);
  }

  function handleClear() {
    const cleared: GigFilters = {
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
    setDraft(cleared);
    onReset();
    onOpenChange(false);
  }

  const draftActiveCount = [
    draft.category,
    draft.subcategory,
    draft.minPrice || draft.maxPrice,
    draft.deliveryDays,
    draft.sellerLevel,
    draft.minRating,
  ].filter(Boolean).length;

  const selectedCategory = categories.find((c) => c.slug === draft.category);

  const categoryOptions = categories.map((c) => ({
    label: c.name,
    value: c.slug,
  }));
  const subcategoryOptions =
    selectedCategory?.children.map((c) => ({ label: c.name, value: c.slug })) ??
    [];

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0 gap-0"
      >
        <SheetHeader className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base font-bold text-text-primary flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-brand-500" />
              Filters
              {draftActiveCount > 0 && (
                <Badge className="h-5 min-w-5 px-1.5 rounded-full bg-brand-500 text-white text-xs font-bold">
                  {draftActiveCount}
                </Badge>
              )}
            </SheetTitle>
            <SheetClose
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-text-tertiary"
                />
              }
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </SheetClose>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Category */}
          <div>
            <p className="text-sm font-semibold text-text-primary mb-2">
              Category
            </p>
            <ComboboxField
              value={draft.category}
              onChange={(v) => update("category", v)}
              options={categoryOptions}
              placeholder="Select a category"
              searchPlaceholder="Search categories…"
              emptyText="No categories found."
            />
          </div>

          {/* Subcategory */}
          {selectedCategory && subcategoryOptions.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-text-primary mb-2">
                Subcategory
              </p>
              <ComboboxField
                value={draft.subcategory}
                onChange={(v) => update("subcategory", v)}
                options={subcategoryOptions}
                placeholder="Select a subcategory"
                searchPlaceholder="Search subcategories…"
                emptyText="No subcategories found."
              />
            </div>
          )}

          <Separator />

          {/* Budget */}
          <div>
            <p className="text-sm font-semibold text-text-primary mb-3">
              Budget
            </p>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Label
                  htmlFor="sheet-minPrice"
                  className="text-xs text-text-tertiary mb-1.5 block"
                >
                  Min ($)
                </Label>
                <Input
                  id="sheet-minPrice"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={draft.minPrice}
                  onChange={(e) => update("minPrice", e.target.value)}
                  className="h-10"
                />
              </div>
              <span className="text-text-tertiary pb-2.5 shrink-0">—</span>
              <div className="flex-1">
                <Label
                  htmlFor="sheet-maxPrice"
                  className="text-xs text-text-tertiary mb-1.5 block"
                >
                  Max ($)
                </Label>
                <Input
                  id="sheet-maxPrice"
                  type="number"
                  min={0}
                  placeholder="Any"
                  value={draft.maxPrice}
                  onChange={(e) => update("maxPrice", e.target.value)}
                  className="h-10"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Delivery Time */}
          <div>
            <p className="text-sm font-semibold text-text-primary mb-3">
              Delivery Time
            </p>
            <ChipGroup
              options={DELIVERY_OPTIONS}
              value={draft.deliveryDays}
              onChange={(v) => update("deliveryDays", v)}
            />
          </div>

          <Separator />

          {/* Seller Level */}
          <div>
            <p className="text-sm font-semibold text-text-primary mb-3">
              Seller Level
            </p>
            <ChipGroup
              options={SELLER_LEVELS}
              value={draft.sellerLevel}
              onChange={(v) => update("sellerLevel", v)}
            />
          </div>

          <Separator />

          {/* Rating */}
          <div>
            <p className="text-sm font-semibold text-text-primary mb-3">
              Minimum Rating
            </p>
            <div className="flex flex-wrap gap-2">
              {RATING_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => update("minRating", opt.value)}
                  className={cn(
                    "h-9 rounded-full border text-sm transition-all gap-1.5",
                    draft.minRating === opt.value
                      ? "border-brand-500 bg-brand-50 text-brand-700 font-semibold hover:bg-brand-50"
                      : "border-border text-text-secondary hover:border-brand-300 hover:bg-transparent",
                  )}
                >
                  {opt.value && (
                    <Star className="h-3.5 w-3.5 fill-accent-500 text-accent-500 shrink-0" />
                  )}
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <SheetFooter className="px-6 py-4 border-t border-border bg-surface-subtle gap-3 flex-row">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={handleClear}
          >
            Clear all
          </Button>
          <Button type="button" className="flex-1" onClick={handleApply}>
            Show results
            {draftActiveCount > 0 && (
              <span className="ml-1.5 text-xs opacity-80">
                · {draftActiveCount} active
              </span>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
