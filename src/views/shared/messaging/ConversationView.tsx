"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { formatDistanceToNowStrict, format, isToday, isYesterday } from "date-fns"
import {
  ArrowLeft, Send, Loader2, ShieldCheck, ShoppingBag,
  Paperclip, MoreVertical, Phone, Video,
} from "lucide-react"
import { apiClient } from "@/lib/client/axios"
import { subscribeToTable, unsubscribeChannel } from "@/lib/client/realtime"
import { cn } from "@/lib/shared/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import DImage from "@/components/ui/d-image"
import type { ChatMessage, ConversationListItem } from "@/types/messages"
import type { RealtimeChannel } from "@supabase/supabase-js"

interface ConversationViewProps {
  conversationId: string
  currentUserId:  string
  roleBase:       "buyer" | "seller" | "admin"
}

function formatMessageTime(iso: string) {
  const d = new Date(iso)
  if (isToday(d))     return format(d, "h:mm a")
  if (isYesterday(d)) return `Yesterday ${format(d, "h:mm a")}`
  return format(d, "MMM d, h:mm a")
}

function groupByDate(messages: ChatMessage[]) {
  const groups: { date: string; items: ChatMessage[] }[] = []
  for (const msg of messages) {
    const d = new Date(msg.createdAt)
    const label = isToday(d) ? "Today" : isYesterday(d) ? "Yesterday" : format(d, "MMMM d, yyyy")
    const last  = groups[groups.length - 1]
    if (last?.date === label) {
      last.items.push(msg)
    } else {
      groups.push({ date: label, items: [msg] })
    }
  }
  return groups
}

function Avatar({ name, url, size = 8 }: { name: string; url: string | null; size?: number }) {
  const cls = `w-${size} h-${size} rounded-full overflow-hidden bg-surface-muted border border-border shrink-0`
  return (
    <div className={cls}>
      {url ? (
        <DImage src={url} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-text-secondary">
          {name?.[0]?.toUpperCase() ?? "?"}
        </div>
      )}
    </div>
  )
}

export function ConversationView({ conversationId, currentUserId, roleBase }: ConversationViewProps) {
  const router      = useRouter()
  const queryClient = useQueryClient()
  const bottomRef   = useRef<HTMLDivElement>(null)
  const channelRef  = useRef<RealtimeChannel | null>(null)
  const [draft, setDraft]       = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)

  // Load conversation meta
  const { data: convData } = useQuery<{ data: ConversationListItem[] }>({
    queryKey:  ["conversations"],
    queryFn:   () => apiClient.get("/api/conversations").then((r) => r.data),
    staleTime: 30_000,
  })
  const conv = convData?.data.find((c) => c.id === conversationId)
  const other = conv?.participants.find((p) => p.userId !== currentUserId) ?? conv?.participants[0]

  // Initial message load
  const { isLoading: loadingInitial } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn:  async () => {
      const r = await apiClient.get<{ data: ChatMessage[]; nextCursor: string | null }>(
        `/api/conversations/${conversationId}/messages`
      )
      setMessages(r.data.data)
      setNextCursor(r.data.nextCursor)
      return r.data
    },
    staleTime: 0,
  })

  // Mark read on mount
  useEffect(() => {
    apiClient.patch(`/api/conversations/${conversationId}/read`).catch(() => null)
    queryClient.setQueryData<{ data: ConversationListItem[] }>(["conversations"], (old) => {
      if (!old) return old
      return { data: old.data.map((c) => c.id === conversationId ? { ...c, unreadCount: 0 } : c) }
    })
  }, [conversationId, queryClient])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  // Realtime subscription
  useEffect(() => {
    let active = true

    subscribeToTable<Record<string, unknown>>({
      table:  "messages",
      event:  "INSERT",
      onData: (row) => {
        // Client-side filter — only process messages for this conversation
        if ((row.conversation_id as string) !== conversationId) return
        const senderId = row.sender_id as string
        // Hydrate sender from already-loaded conversation participants
        const convSnapshot = queryClient.getQueryData<{ data: ConversationListItem[] }>(["conversations"])
        const convItem     = convSnapshot?.data.find((c) => c.id === conversationId)
        const senderProfile = convItem?.participants.find((p) => p.userId === senderId)

        const newMsg: ChatMessage = {
          id:             row.id as string,
          conversationId: row.conversation_id as string,
          senderId,
          content:        row.content as string,
          attachments:    (row.attachments as string[]) ?? [],
          type:           (row.type as string) ?? "text",
          isRead:         (row.is_read as boolean) ?? false,
          createdAt:      row.created_at as string,
          sender: {
            userId:    senderId,
            username:  senderProfile?.username  ?? "",
            fullName:  senderProfile?.fullName  ?? "User",
            avatarUrl: senderProfile?.avatarUrl ?? null,
          },
        }
        // Avoid duplicates (optimistic message already appended by sender's own client)
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev
          return [...prev, newMsg]
        })
        // Mark read if not our own message, update conversation cache directly
        if (senderId !== currentUserId) {
          apiClient.patch(`/api/conversations/${conversationId}/read`).catch(() => null)
          queryClient.setQueryData<{ data: ConversationListItem[] }>(["conversations"], (old) => {
            if (!old) return old
            return {
              data: old.data.map((c) =>
                c.id === conversationId
                  ? { ...c, lastMessage: newMsg.content, lastMessageAt: newMsg.createdAt, unreadCount: c.unreadCount + 1 }
                  : c
              ),
            }
          })
        }
      },
    }).then((channel) => {
      if (active) channelRef.current = channel
      else unsubscribeChannel(channel)
    })

    return () => {
      active = false
      if (channelRef.current) {
        unsubscribeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [conversationId, currentUserId, queryClient])

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      apiClient
        .post<ChatMessage>(`/api/conversations/${conversationId}/messages`, { content })
        .then((r) => r.data),
    onMutate: (content) => {
      // Optimistic append
      const optimistic: ChatMessage = {
        id:             `optimistic-${Date.now()}`,
        conversationId,
        senderId:       currentUserId,
        content,
        attachments:    [],
        type:           "text",
        isRead:         false,
        createdAt:      new Date().toISOString(),
        sender: {
          userId:    currentUserId,
          username:  "",
          fullName:  "You",
          avatarUrl: null,
        },
      }
      setMessages((prev) => [...prev, optimistic])
      setDraft("")
    },
    onSuccess: (real) => {
      // Replace optimistic with real
      setMessages((prev) =>
        prev.map((m) => (m.id.startsWith("optimistic-") ? real : m))
      )
      queryClient.setQueryData<{ data: ConversationListItem[] }>(["conversations"], (old) => {
        if (!old) return old
        return {
          data: old.data.map((c) =>
            c.id === conversationId
              ? { ...c, lastMessage: real.content, lastMessageAt: real.createdAt }
              : c
          ),
        }
      })
    },
    onError: () => {
      // Remove optimistic on failure
      setMessages((prev) => prev.filter((m) => !m.id.startsWith("optimistic-")))
    },
  })

  // Load older messages
  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return
    setLoadingMore(true)
    try {
      const r = await apiClient.get<{ data: ChatMessage[]; nextCursor: string | null }>(
        `/api/conversations/${conversationId}/messages?cursor=${nextCursor}`
      )
      setMessages((prev) => [...r.data.data, ...prev])
      setNextCursor(r.data.nextCursor)
    } finally {
      setLoadingMore(false)
    }
  }, [conversationId, nextCursor, loadingMore])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  function submit() {
    const content = draft.trim()
    if (!content || sendMutation.isPending) return
    sendMutation.mutate(content)
  }

  const otherName = conv?.type === "support"
    ? "FreelanceHub Support"
    : (other?.fullName ?? "Conversation")

  const groups = groupByDate(messages)

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-surface rounded-2xl border border-border shadow-card overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface shrink-0">
        <button
          type="button"
          onClick={() => router.push(`/${roleBase}/messages`)}
          className="p-1.5 rounded-lg hover:bg-surface-muted transition-colors text-text-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        {conv?.type === "support" ? (
          <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-4.5 w-4.5 text-amber-500" />
          </div>
        ) : (
          <Avatar name={otherName} url={other?.avatarUrl ?? null} size={9} />
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary truncate">{otherName}</p>
          {conv?.type === "order" && conv.orderTitle && (
            <div className="flex items-center gap-1 text-xs text-text-tertiary">
              <ShoppingBag className="h-3 w-3" />
              <span className="truncate">{conv.orderTitle}</span>
            </div>
          )}
          {conv?.type === "support" && (
            <p className="text-xs text-text-tertiary">Platform Support</p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button type="button" className="p-1.5 rounded-lg hover:bg-surface-muted text-text-tertiary transition-colors" title="Voice call (coming soon)" disabled>
            <Phone className="h-4 w-4" />
          </button>
          <button type="button" className="p-1.5 rounded-lg hover:bg-surface-muted text-text-tertiary transition-colors" title="Video call (coming soon)" disabled>
            <Video className="h-4 w-4" />
          </button>
          <button type="button" className="p-1.5 rounded-lg hover:bg-surface-muted text-text-tertiary transition-colors">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Messages ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 bg-surface-subtle">

        {/* Load more */}
        {nextCursor && (
          <div className="flex justify-center pb-2">
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="text-xs text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1"
            >
              {loadingMore && <Loader2 className="h-3 w-3 animate-spin" />}
              {loadingMore ? "Loading…" : "Load earlier messages"}
            </button>
          </div>
        )}

        {loadingInitial ? (
          <div className="flex items-center justify-center py-16 text-text-tertiary">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          groups.map(({ date, items }) => (
            <div key={date}>
              {/* Date divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-2xs text-text-tertiary font-medium">{date}</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Messages */}
              {items.map((msg, i) => {
                const isMine    = msg.senderId === currentUserId
                const isOpt     = msg.id.startsWith("optimistic-")
                const prevMsg   = items[i - 1]
                const sameGroup = prevMsg && prevMsg.senderId === msg.senderId

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex items-end gap-2",
                      isMine ? "flex-row-reverse" : "flex-row",
                      sameGroup ? "mt-0.5" : "mt-3"
                    )}
                  >
                    {/* Avatar — only show for first in a group */}
                    <div className="w-7 shrink-0">
                      {!isMine && !sameGroup && (
                        <Avatar name={msg.sender.fullName} url={msg.sender.avatarUrl} size={7} />
                      )}
                    </div>

                    {/* Bubble */}
                    <div className={cn("max-w-[72%] group", isMine ? "items-end" : "items-start", "flex flex-col")}>
                      {!isMine && !sameGroup && (
                        <span className="text-2xs text-text-tertiary mb-1 ml-1">{msg.sender.fullName}</span>
                      )}
                      <div
                        className={cn(
                          "px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
                          isMine
                            ? "bg-brand-500 text-white rounded-br-sm"
                            : "bg-surface border border-border text-text-primary rounded-bl-sm",
                          isOpt && "opacity-60"
                        )}
                      >
                        {msg.content}
                      </div>
                      <span className="text-2xs text-text-tertiary mt-0.5 mx-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatMessageTime(msg.createdAt)}
                        {isMine && !isOpt && (
                          <span className="ml-1">{msg.isRead ? "· Read" : "· Sent"}</span>
                        )}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ))
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ──────────────────────────────────────────── */}
      <div className="shrink-0 px-4 py-3 border-t border-border bg-surface">
        <div className="flex items-end gap-2">
          <button
            type="button"
            className="p-2 rounded-lg hover:bg-surface-muted text-text-tertiary transition-colors shrink-0 mb-0.5"
            title="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </button>

          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
            rows={1}
            className="flex-1 resize-none min-h-[40px] max-h-[160px] text-sm py-2.5"
            style={{ height: "auto" }}
            onInput={(e) => {
              const t = e.currentTarget
              t.style.height = "auto"
              t.style.height = `${Math.min(t.scrollHeight, 160)}px`
            }}
          />

          <Button
            size="sm"
            className="shrink-0 mb-0.5 h-9 w-9 p-0"
            onClick={submit}
            disabled={!draft.trim() || sendMutation.isPending}
          >
            {sendMutation.isPending
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Send className="h-4 w-4" />
            }
          </Button>
        </div>
        <p className="text-2xs text-text-tertiary mt-1.5 text-center">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
