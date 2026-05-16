import Link from "next/link"
import { FileText } from "lucide-react"
import type { SellerGigRow } from "@/types/gigs"

export function GigTitleCell({ gig }: { gig: SellerGigRow }) {
  return (
    <div className="flex items-center gap-3 min-w-0 w-full">
      {/* Thumbnail */}
      <div className="w-10 h-10 rounded-lg bg-linear-to-br from-brand-50 to-brand-100 border border-brand-100 flex items-center justify-center shrink-0 overflow-hidden">
        {gig.coverImageUrl ? (
          <img src={gig.coverImageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <FileText className="w-4 h-4 text-brand-400" />
        )}
      </div>
      {/* Title */}
      <div className="min-w-0">
        <Link
          href={`/seller/gigs/${gig.id}/edit`}
          className="text-sm font-medium text-text-primary hover:text-brand-600 line-clamp-2 leading-snug transition-colors"
        >
          {gig.title}
        </Link>
        <p className="text-xs text-text-tertiary font-mono mt-0.5">#{gig.id.slice(-8)}</p>
      </div>
    </div>
  )
}
