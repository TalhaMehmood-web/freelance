"use client"

import { useState } from "react"
import { cn } from "@/lib/shared/utils"

export function GigDescription({ description }: { description: string }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = description.length > 600

  return (
    <div>
      <h2 className="text-sm font-bold text-text-primary mb-3">About This Service</h2>
      <div className={cn("relative text-sm text-text-secondary leading-relaxed", !expanded && isLong && "max-h-48 overflow-hidden")}>
        <div
          className="[&_h2]:font-bold [&_h2]:text-text-primary [&_h2]:mb-1.5 [&_h3]:font-semibold [&_h3]:text-text-primary [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-4 [&_blockquote]:border-l-2 [&_blockquote]:border-brand-200 [&_blockquote]:pl-3 [&_blockquote]:italic [&_strong]:font-semibold [&_p]:mb-2"
          dangerouslySetInnerHTML={{ __html: description.replace(/\n/g, "<br/>") }}
        />
        {!expanded && isLong && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-surface to-transparent" />
        )}
      </div>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded(e => !e)}
          className="mt-2 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
        >
          {expanded ? "Show less ↑" : "Show more ↓"}
        </button>
      )}
    </div>
  )
}
