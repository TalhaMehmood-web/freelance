// AUTO-GENERATED — run `npm run gen:ability` to refresh. Do not edit manually.

export const Subject = {
  Gigs: "Gigs",
} as const

export type Subject = (typeof Subject)[keyof typeof Subject]

export const Action = {
  Create: "create",
  Delete: "delete",
  Edit: "edit",
  Overview: "overview",
  Pause: "pause",
} as const

export type Action = (typeof Action)[keyof typeof Action]
