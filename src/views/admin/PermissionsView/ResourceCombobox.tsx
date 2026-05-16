"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { ChevronsUpDown, Check } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/shared/utils"
import type { PermissionResourceRow } from "@/types/admin"

interface ResourcesResponse {
  data: PermissionResourceRow[]
}

interface Props {
  value:       string
  onChange:    (value: string) => void
  className?:  string
  placeholder?: string
}

export function ResourceCombobox({ value, onChange, className, placeholder = "All resources" }: Props) {
  const [open, setOpen] = useState(false)

  const { data } = useQuery<ResourcesResponse>({
    queryKey: ["admin-resources"],
    queryFn:  () => axios.get("/api/admin/resources").then(r => r.data),
  })

  const options = [
    { label: placeholder, value: "all" },
    ...(data?.data ?? []).map(r => ({ label: r.label, value: r.slug })),
  ]

  const selected = options.find(o => o.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-sm shadow-sm outline-none hover:bg-surface-subtle transition-colors",
          className
        )}
      >
        <span className={value === "all" ? "text-text-tertiary" : "text-text-primary"}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronsUpDown className="w-4 h-4 text-text-tertiary shrink-0 ml-2" />
      </PopoverTrigger>
      <PopoverContent className="w-[var(--anchor-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search resource…" />
          <CommandList>
            <CommandEmpty>No resource found.</CommandEmpty>
            <CommandGroup>
              {options.map(opt => (
                <CommandItem
                  key={opt.value}
                  value={opt.label}
                  onSelect={() => {
                    onChange(opt.value)
                    setOpen(false)
                  }}
                >
                  {opt.label}
                  <Check className={cn("ml-auto w-4 h-4", value === opt.value ? "opacity-100" : "opacity-0")} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
