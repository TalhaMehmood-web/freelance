"use client"

import { useEffect, useState } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface DebouncedSearchInputProps {
  value:           string
  onChange:        (value: string) => void
  placeholder?:    string
  className?:      string
  debounceMs?:     number
  triggerOnEnter?: boolean
}

export function DebouncedSearchInput({
  value,
  onChange,
  placeholder = "Search…",
  className,
  debounceMs = 300,
  triggerOnEnter = false,
}: DebouncedSearchInputProps) {
  const [local, setLocal] = useState(value)

  // When triggerOnEnter is false: fire after debounce as before
  useEffect(() => {
    if (triggerOnEnter) return
    const t = setTimeout(() => {
      if (local !== value) onChange(local)
    }, debounceMs)
    return () => clearTimeout(t)
  }, [local]) // eslint-disable-line react-hooks/exhaustive-deps

  // Keep local in sync when parent resets value to ""
  useEffect(() => {
    if (value === "") setLocal("")
  }, [value])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (triggerOnEnter && e.key === "Enter") {
      onChange(local)
    }
  }

  function handleClear() {
    setLocal("")
    onChange("")
  }

  return (
    <div className={cn("relative min-w-0 flex-1", className)}>
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary pointer-events-none" />
      <Input
        placeholder={triggerOnEnter ? `${placeholder} (Enter to search)` : placeholder}
        value={local}
        onChange={e => setLocal(e.target.value)}
        onKeyDown={handleKeyDown}
        className="pl-8 pr-8 h-9 text-sm"
      />
      {local && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
