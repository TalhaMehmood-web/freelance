"use client"

import dynamic from "next/dynamic"

export const AdminNotificationBell = dynamic(
  () => import("./AdminNotificationBell").then((m) => m.AdminNotificationBell),
  { ssr: false }
)
