"use client"

import dynamic from "next/dynamic"

export const NotificationBell = dynamic(
  () => import("./NotificationBell").then((m) => m.NotificationBell),
  { ssr: false }
)
