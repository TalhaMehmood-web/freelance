import { cn } from "@/lib/shared/utils"
import { SELLER_LEVELS } from "@/lib/shared/constants"
import type { SellerLevel } from "@/lib/shared/constants"

interface SellerLevelBadgeProps {
  level: SellerLevel
  className?: string
}

const LEVEL_STYLES: Record<SellerLevel, string> = {
  new: "text-text-tertiary",
  level_1: "text-success-600 bg-success-50",
  level_2: "text-brand-600 bg-brand-50",
  top_rated: "text-accent-600 bg-accent-50",
}

export function SellerLevelBadge({ level, className }: SellerLevelBadgeProps) {
  if (level === "new") return null

  return (
    <span
      className={cn(
        "inline-flex items-center text-2xs font-semibold px-1.5 py-0.5 rounded",
        LEVEL_STYLES[level],
        className
      )}
    >
      {SELLER_LEVELS[level].label}
    </span>
  )
}
