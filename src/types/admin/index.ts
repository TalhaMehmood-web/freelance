export const PERMISSION_KEYS = [
  "manage_users",
  "moderate_gigs",
  "resolve_disputes",
  "manage_payments",
  "manage_coupons",
  "manage_orgs",
  "view_audit_logs",
  "manage_permissions",
] as const

export type PermissionKey = (typeof PERMISSION_KEYS)[number]

export const PERMISSION_LABELS: Record<PermissionKey, { label: string; description: string }> = {
  manage_users:       { label: "Manage Users",       description: "Assign and revoke platform roles for any user" },
  moderate_gigs:      { label: "Moderate Gigs",      description: "Approve, pause, or suspend seller gigs" },
  resolve_disputes:   { label: "Resolve Disputes",   description: "Review and close buyer/seller disputes" },
  manage_payments:    { label: "Manage Payments",     description: "View transactions and issue refunds" },
  manage_coupons:     { label: "Manage Coupons",      description: "Create, edit, and delete discount coupons" },
  manage_orgs:        { label: "Manage Orgs",         description: "Suspend or modify organization accounts" },
  view_audit_logs:    { label: "View Audit Logs",     description: "Read-only access to the platform audit trail" },
  manage_permissions: { label: "Manage Permissions",  description: "Edit role permission sets (super admin only)" },
}

export const DEFAULT_ADMIN_PERMISSIONS: PermissionKey[] = [
  "manage_users",
  "moderate_gigs",
  "resolve_disputes",
  "manage_payments",
  "manage_coupons",
  "manage_orgs",
  "view_audit_logs",
]

export interface AdminUserRow {
  id:           string
  userId:       string
  username:     string
  fullName:     string
  avatarUrl:    string | null
  email:        string
  roles:        string[]
  createdAt:    string
  sellerLevel?: string | null
}
