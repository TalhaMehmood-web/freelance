"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { formatDistanceToNowStrict } from "date-fns"
import { MessageSquare, Search, Loader2, ShieldCheck, ShoppingBag, User } from "lucide-react"
import { apiClient } from "@/lib/client/axios"
import { cn } from "@/lib/shared/utils"
import { Input } from "@/components/ui/input"
import DImage from "@/components/ui/d-image"
import type { ConversationListItem } from "@/types/messages"

interface MessagesViewProps {
  roleBase:    "buyer" | "seller" | "admin"
  currentUserId: string
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  order:   <ShoppingBag className="h-3.5 w-3.5 text-brand-500" />,
  support: <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />,
  direct:  <User className="h-3.5 w-3.5 text-text-tertiary" />,
}

const TYPE_LABEL: Record<string, string> = {
  order:   "Order",
  support: "Support",
  direct:  "Direct",
}

function ConversationRow({
  conv,
  currentUserId,
  href,
}: {
  conv: ConversationListItem
  currentUserId: string
  href: string
}) {
  const router = useRouter()
  const other   = conv.participants.find((p) => p.userId !== currentUserId) ?? conv.participants[0]
  const hasUnread = conv.unreadCount > 0

  return (
    <button
      type="button"
      onClick={() => router.push(href)}
      className={cn(
        "w-full flex items-start gap-3 px-4 py-3.5 hover:bg-surface-muted transition-colors text-left border-b border-border last:border-0",
        hasUnread && "bg-brand-50/40"
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-muted border border-border">
          {other?.avatarUrl ? (
            <DImage src={other.avatarUrl} alt={other.fullName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-text-secondary">
              {other?.fullName?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
        </div>
        {hasUnread && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-brand-500 text-white text-2xs font-bold flex items-center justify-center">
            {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className={cn("text-sm truncate", hasUnread ? "font-semibold text-text-primary" : "font-medium text-text-primary")}>
            {conv.type === "support" ? "FreelanceHub Support" : (other?.fullName ?? "Unknown")}
          </span>
          <span className="text-2xs text-text-tertiary shrink-0">
            {conv.lastMessageAt
              ? formatDistanceToNowStrict(new Date(conv.lastMessageAt), { addSuffix: false })
              : ""}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 text-2xs text-text-tertiary shrink-0">
            {TYPE_ICON[conv.type]}
            {conv.type === "order" && conv.orderTitle
              ? <span className="truncate max-w-[80px]">{conv.orderTitle}</span>
              : TYPE_LABEL[conv.type]}
          </span>
          {conv.lastMessage && (
            <>
              <span className="text-text-tertiary text-2xs">·</span>
              <span className={cn("text-xs truncate", hasUnread ? "text-text-primary font-medium" : "text-text-secondary")}>
                {conv.lastMessage}
              </span>
            </>
          )}
        </div>
      </div>
    </button>
  )
}

export function MessagesView({ roleBase, currentUserId }: MessagesViewProps) {
  const [search, setSearch] = useState("")

  const { data, isLoading } = useQuery<{ data: ConversationListItem[] }>({
    queryKey:  ["conversations"],
    queryFn:   () => apiClient.get("/api/conversations").then((r) => r.data),
    staleTime: 30_000,
  })

  const conversations = data?.data ?? []

  const filtered = conversations.filter((c) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    const other = c.participants.find((p) => p.userId !== currentUserId)
    return (
      other?.fullName.toLowerCase().includes(q) ||
      other?.username.toLowerCase().includes(q) ||
      c.lastMessage?.toLowerCase().includes(q) ||
      c.orderTitle?.toLowerCase().includes(q)
    )
  })

  function hrefFor(conv: ConversationListItem) {
    return `/${roleBase}/messages/${conv.id}`
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Messages</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {conversations.length > 0
              ? `${conversations.length} conversation${conversations.length !== 1 ? "s" : ""}`
              : "No conversations yet"}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
        <Input
          placeholder="Search conversations…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* List */}
      <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden flex-1 min-h-0 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-text-tertiary">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mb-3">
              <MessageSquare className="h-6 w-6 text-brand-300" />
            </div>
            <p className="text-sm font-semibold text-text-primary mb-1">
              {search ? "No results found" : "No messages yet"}
            </p>
            <p className="text-xs text-text-secondary max-w-xs">
              {search
                ? "Try a different search term."
                : "When you start a conversation it will appear here."}
            </p>
          </div>
        ) : (
          filtered.map((conv) => (
            <ConversationRow
              key={conv.id}
              conv={conv}
              currentUserId={currentUserId}
              href={hrefFor(conv)}
            />
          ))
        )}
      </div>
    </div>
  )
}
