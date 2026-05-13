"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/shared/utils"

interface RoleToggleProps {
  activeRole: "buyer" | "seller"
  hasSeller: boolean
}

export function RoleToggle({ activeRole, hasSeller }: RoleToggleProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSwitch(role: "buyer" | "seller") {
    if (role === activeRole) return

    startTransition(async () => {
      const res = await fetch("/api/role/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      })
      if (res.ok) {
        router.push(`/${role}/dashboard`)
        router.refresh()
      }
    })
  }

  return (
    <div
      className={cn(
        "flex items-center bg-surface-muted border border-border rounded-lg p-0.5 text-sm font-medium transition-opacity",
        isPending && "opacity-60 pointer-events-none"
      )}
      role="group"
      aria-label="Switch role"
    >
      <button
        onClick={() => handleSwitch("buyer")}
        className={cn(
          "px-3 py-1.5 rounded-md transition-all duration-150",
          activeRole === "buyer"
            ? "bg-surface text-text-primary shadow-xs"
            : "text-text-secondary hover:text-text-primary"
        )}
        aria-pressed={activeRole === "buyer"}
      >
        Buyer
      </button>

      {hasSeller ? (
        <button
          onClick={() => handleSwitch("seller")}
          className={cn(
            "px-3 py-1.5 rounded-md transition-all duration-150",
            activeRole === "seller"
              ? "bg-surface text-text-primary shadow-xs"
              : "text-text-secondary hover:text-text-primary"
          )}
          aria-pressed={activeRole === "seller"}
        >
          Seller
        </button>
      ) : (
        <a
          href="/seller-setup/step-1"
          className="px-3 py-1.5 rounded-md text-brand-500 hover:text-brand-600 transition-colors flex items-center gap-1"
        >
          Become a Seller
          <span aria-hidden="true">→</span>
        </a>
      )}
    </div>
  )
}
