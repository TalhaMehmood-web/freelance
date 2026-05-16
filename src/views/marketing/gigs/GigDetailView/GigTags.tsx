import Link from "next/link"
import { Hash } from "lucide-react"

export function GigTags({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null

  return (
    <div>
      <h3 className="text-2xs font-bold text-text-tertiary uppercase tracking-widest mb-3 flex items-center gap-1.5">
        <Hash className="h-3 w-3" /> Tags
      </h3>
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <Link
            key={tag}
            href={`/gigs?q=${tag}`}
            className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full border border-border bg-surface text-text-secondary hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 transition-all"
          >
            <Hash className="h-2.5 w-2.5 opacity-50" />{tag}
          </Link>
        ))}
      </div>
    </div>
  )
}
