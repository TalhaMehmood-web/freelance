"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/client/axios";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { createSupabaseBrowserClient, createAuthenticatedRealtimeClient } from "@/lib/client/supabase";
import type {
  RealtimeChannel,
  RealtimePostgresInsertPayload,
} from "@supabase/supabase-js";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  data: NotificationItem[];
  unreadCount: number;
}

function timeAgo(iso: string) {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return "just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

interface NotificationBellProps {
  userId: string;
  roleBase: "buyer" | "seller";
}

export function NotificationBell({ userId, roleBase }: NotificationBellProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery<NotificationsResponse>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res =
        await apiClient.get<NotificationsResponse>("/api/notifications");
      return res.data;
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  useEffect(() => {
    const anonClient = createSupabaseBrowserClient();
    let activeChannel: RealtimeChannel | null = null;
    let isMounted = true;

    anonClient.auth.getSession().then((result: any) => {
      if (!isMounted) return;

      const token = result.data?.session?.access_token;
      // Use authenticated client so WS handshake carries JWT from the start
      const supabase = token ? createAuthenticatedRealtimeClient(token) : anonClient;

      const channel = supabase
        .channel(`notifications:${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`, // ✅ Server-side filter is faster and safer than JS checks
          },
          (payload: RealtimePostgresInsertPayload<Record<string, unknown>>) => {
            console.log(
              "[NotificationBell] received notification:",
              payload.new,
            );

            const raw = payload.new as any;
            // Normalize your data format from snake_case to camelCase
            const row: NotificationItem = {
              id: raw.id,
              type: raw.type,
              title: raw.title,
              body: raw.body,
              data: raw.data || {},
              isRead: raw.is_read ?? raw.isRead ?? false,
              createdAt:
                raw.created_at ?? raw.createdAt ?? new Date().toISOString(),
            };

            queryClient.setQueryData<NotificationsResponse>(
              ["notifications"],
              (old) =>
                old
                  ? {
                      data: [row, ...old.data],
                      unreadCount: old.unreadCount + 1,
                    }
                  : old,
            );

            toast(row.title, {
              description: row.body,
              duration: 8000,
              action: {
                label: "View",
                onClick: () => handleNavigation(row),
              },
            });
          },
        )
        .subscribe((status: string, err?: Error) => {
          console.log("[NotificationBell] realtime status:", status, err ?? "");
        });

      activeChannel = channel;
      channelRef.current = channel;
    });

    return () => {
      isMounted = false;
      if (activeChannel) {
        anonClient.removeChannel(activeChannel);
      }
      channelRef.current = null;
    };
  }, [userId, queryClient]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function handleNavigation(n: NotificationItem) {
    const conversationId = n.data?.conversationId as string | undefined;
    if (conversationId) router.push(`/${roleBase}/messages/${conversationId}`);
    else router.push(`/${roleBase}/dashboard`);
  }

  async function handleMarkAllRead() {
    await apiClient.patch("/api/notifications");
    queryClient.setQueryData<NotificationsResponse>(["notifications"], (old) =>
      old
        ? {
            data: old.data.map((n) => ({ ...n, isRead: true })),
            unreadCount: 0,
          }
        : old,
    );
  }

  async function handleClickNotification(n: NotificationItem) {
    if (!n.isRead) {
      await apiClient.patch(`/api/notifications?id=${n.id}`);
      queryClient.setQueryData<NotificationsResponse>(
        ["notifications"],
        (old) =>
          old
            ? {
                data: old.data.map((x) =>
                  x.id === n.id ? { ...x, isRead: true } : x,
                ),
                unreadCount: Math.max(0, old.unreadCount - 1),
              }
            : old,
      );
    }
    setOpen(false);
    handleNavigation(n);
  }

  const notifications = data?.data ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-xl hover:bg-surface-subtle transition-colors"
        aria-label="Notifications"
      >
        <Bell
          className={`w-5 h-5 ${unreadCount > 0 ? "text-brand-600" : "text-text-secondary"}`}
        />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-4.5 h-4.5 flex items-center justify-center bg-danger-500 text-white text-[10px] font-bold rounded-full px-1 leading-none animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-surface border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-semibold text-text-primary">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-text-tertiary">
                <Bell className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleClickNotification(n)}
                  className={`w-full text-left px-4 py-3 hover:bg-surface-subtle transition-colors ${!n.isRead ? "bg-brand-50/60" : ""}`}
                >
                  <div className="flex items-start gap-2">
                    {!n.isRead && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500 animate-pulse" />
                    )}
                    <div className={!n.isRead ? "" : "ml-4"}>
                      <p className="text-sm font-semibold text-text-primary leading-snug">
                        {n.title}
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
                        {n.body}
                      </p>
                      <p className="text-xs text-text-tertiary mt-1">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
