"use client"

import { useRouter } from "next/navigation"
import { useTransition, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Zap } from "lucide-react"
import { cn } from "@/lib/shared/utils"

const SUGGESTED_SKILLS = [
  "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python", "Django",
  "PostgreSQL", "Figma", "UI Design", "UX Research", "SEO", "Copywriting",
  "Video Editing", "Motion Graphics", "WordPress", "Shopify", "AWS", "DevOps", "Docker",
]

export function Step2Skills() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [selected, setSelected] = useState<string[]>([])
  const [input, setInput] = useState("")

  function addSkill(skill: string) {
    const normalized = skill.trim()
    if (!normalized || selected.includes(normalized) || selected.length >= 15) return
    setSelected((prev) => [...prev, normalized])
    setInput("")
  }

  function removeSkill(skill: string) {
    setSelected((prev) => prev.filter((s) => s !== skill))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addSkill(input)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (selected.length === 0) return
    sessionStorage.setItem("seller_step2", JSON.stringify({ skillNames: selected }))
    startTransition(() => router.push("/seller-setup/step-3"))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-start gap-3 mb-2">
        <div className="h-10 w-10 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
          <Zap className="h-5 w-5 text-brand-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-text-primary">Your skills</h2>
          <p className="text-sm text-text-secondary mt-0.5">
            Add skills that best represent your expertise. These help buyers find you.
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-text-primary">Add a skill</label>
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a skill and press Enter or comma"
            className="w-full h-10 px-3 pr-16 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
          />
          <button
            type="button"
            onClick={() => addSkill(input)}
            disabled={!input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded-md bg-brand-500 text-white disabled:opacity-40 hover:bg-brand-600 transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-tertiary">Press Enter or comma to add</p>
          <p className={cn("text-xs font-medium", selected.length >= 15 ? "text-danger-500" : "text-text-tertiary")}>
            {selected.length}/15
          </p>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="bg-brand-50 border border-brand-100 rounded-xl p-3">
          <p className="text-xs font-semibold text-brand-700 mb-2">Your selected skills</p>
          <div className="flex flex-wrap gap-2">
            {selected.map((skill) => (
              <Badge key={skill} className="gap-1.5 pr-1.5 bg-brand-500 text-white hover:bg-brand-600">
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="rounded-full hover:text-white/70 transition-colors"
                  aria-label={`Remove ${skill}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">Suggested skills</p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_SKILLS.filter((s) => !selected.includes(s)).map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => addSkill(skill)}
              className="text-xs px-3 py-1.5 rounded-full border border-border bg-surface text-text-secondary hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50 transition-all"
            >
              + {skill}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={() => router.push("/seller-setup/step-1")}>
          ← Back
        </Button>
        <Button type="submit" disabled={pending || selected.length === 0}>
          {pending ? "Saving…" : "Continue →"}
        </Button>
      </div>
    </form>
  )
}
