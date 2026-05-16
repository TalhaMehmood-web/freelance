// Permission key format: "resource:action"
export const BUILT_IN_PERMISSIONS = [
  { key: "users:read",        label: "View Users",           description: "Read user profiles and account details", resource: "users",      action: "read"   },
  { key: "users:create",      label: "Create Users",         description: "Create new user accounts",               resource: "users",      action: "create" },
  { key: "users:update",      label: "Update Users",         description: "Edit user profiles and block/unblock",   resource: "users",      action: "update" },
  { key: "users:delete",      label: "Delete Users",         description: "Permanently delete user accounts",       resource: "users",      action: "delete" },
  { key: "gigs:read",         label: "View Gigs",            description: "Read all gig listings",                  resource: "gigs",       action: "read"   },
  { key: "gigs:update",       label: "Moderate Gigs",        description: "Approve, pause, or suspend gigs",        resource: "gigs",       action: "update" },
  { key: "payments:read",     label: "View Payments",        description: "View transaction history",               resource: "payments",   action: "read"   },
  { key: "payments:manage",   label: "Manage Payments",      description: "Issue refunds and manage payouts",       resource: "payments",   action: "manage" },
  { key: "disputes:manage",   label: "Manage Disputes",      description: "Review and close buyer/seller disputes", resource: "disputes",   action: "manage" },
  { key: "categories:manage", label: "Manage Categories",    description: "Create and edit service categories",     resource: "categories", action: "manage" },
  { key: "coupons:manage",    label: "Manage Coupons",       description: "Create and delete discount coupons",     resource: "coupons",    action: "manage" },
  { key: "orgs:manage",       label: "Manage Organizations", description: "Suspend or modify organization accounts",resource: "orgs",       action: "manage" },
  { key: "audit_logs:read",   label: "View Audit Logs",      description: "Read-only access to the audit trail",   resource: "audit_logs", action: "read"   },
  { key: "roles:manage",      label: "Manage Roles",         description: "Create/edit roles and assign permissions — super admin only", resource: "roles", action: "manage" },
] as const

export type PermissionKey = (typeof BUILT_IN_PERMISSIONS)[number]["key"]

// Group permissions by resource for the UI matrix
export const PERMISSION_GROUPS: Record<string, typeof BUILT_IN_PERMISSIONS[number][]> = {}
for (const p of BUILT_IN_PERMISSIONS) {
  ;(PERMISSION_GROUPS[p.resource] ??= []).push(p)
}

export interface RoleRow {
  id:          string
  slug:        string
  label:       string
  description: string
  isBuiltIn:   boolean
  permissions: string[]
  updatedAt:   string
  updatedById: string | null
}

export interface PermissionRow {
  id:          string
  key:         string
  label:       string
  description: string
  resource:    string
  action:      string
  isBuiltIn:   boolean
}

export interface PermissionResourceRow {
  id:        string
  slug:      string
  label:     string
  isBuiltIn: boolean
  createdAt: string
}

export interface PermissionActionRow {
  id:        string
  slug:      string
  label:     string
  isBuiltIn: boolean
  createdAt: string
}

export interface AdminUserRow {
  id:              string
  userId:          string
  username:        string
  fullName:        string
  avatarUrl:       string | null
  email:           string
  roles:           string[]
  country?:        string | null
  createdAt:       string
  isBlocked:       boolean
  blockedAt:       string | null
  lastSignInAt:    string | null
  sellerLevel?:    string | null
  gigCount?:       number
  sellerProfileId?: string | null
}
