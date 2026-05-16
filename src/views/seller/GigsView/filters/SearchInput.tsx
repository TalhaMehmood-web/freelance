"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"

const Schema = z.object({ search: z.string() })
type Form = z.infer<typeof Schema>

interface SearchInputProps {
  value:    string
  onChange: (value: string) => void
}

export function SearchInput({ value, onChange }: SearchInputProps) {
  const [local, setLocal] = useState(value)

  // Debounce: fire onChange 300ms after user stops typing
  useEffect(() => {
    const t = setTimeout(() => {
      if (local !== value) onChange(local)
    }, 300)
    return () => clearTimeout(t)
  }, [local]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync if parent clears
  useEffect(() => { if (value === "") setLocal("") }, [value])

  return (
    <div className="relative min-w-0 flex-1 max-w-xs">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary pointer-events-none" />
      <Input
        placeholder="Search gigs…"
        value={local}
        onChange={e => setLocal(e.target.value)}
        className="pl-8 pr-8 h-8 text-sm"
      />
      {local && (
        <button
          type="button"
          onClick={() => { setLocal(""); onChange("") }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
