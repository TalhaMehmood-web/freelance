import type { UserRole, ActiveRole, OrgMemberRole, PlanTier } from "@/lib/shared/constants"

export interface Session {
  userId: string
  email: string
  grantedRoles: UserRole[]
  activeRole: ActiveRole
  isSuperAdmin: boolean
  orgId: string | null
  orgRole: OrgMemberRole | null
  orgPlan: PlanTier | null
  sellerProfileId: string | null
}

export interface PlanFeatures {
  maxMembers: number | "unlimited"
  milestoneProjects: boolean
  teamCollaboration: boolean
  approvalWorkflows: boolean
  apiAccess: boolean
  ssoEnabled: boolean
  whitelabelEnabled: boolean
  auditLogDays: number | "unlimited"
  customContracts: boolean
  dedicatedAccountManager: boolean
  savedSearches: number | "unlimited"
  preferredSellers: number | "unlimited"
  platformFeePercent: number
  proposalDailyLimit: number | "unlimited"
}

export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

export interface CursorPage<T> {
  items: T[]
  nextCursor: string | null
  hasMore: boolean
  total?: number
}

export interface UploadResult {
  path: string
  publicUrl: string
}

export interface Notification {
  id: string
  type: string
  title: string
  body: string
  data: Record<string, unknown>
  isRead: boolean
  createdAt: string
}
