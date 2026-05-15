import type { PlanTier } from "../shared/constants"
import type { PlanFeatures } from "../shared/types"
import { PLATFORM_FEE_PERCENT, PROPOSAL_DAILY_LIMIT } from "../shared/constants"

const PLAN_FEATURES: Record<PlanTier, PlanFeatures> = {
  free: {
    maxMembers: 1,
    milestoneProjects: false,
    teamCollaboration: false,
    approvalWorkflows: false,
    apiAccess: false,
    ssoEnabled: false,
    whitelabelEnabled: false,
    auditLogDays: 0,
    customContracts: false,
    dedicatedAccountManager: false,
    savedSearches: 3,
    preferredSellers: 5,
    platformFeePercent: PLATFORM_FEE_PERCENT.free,
    proposalDailyLimit: PROPOSAL_DAILY_LIMIT.free,
  },
  pro: {
    maxMembers: 10,
    milestoneProjects: true,
    teamCollaboration: false,
    approvalWorkflows: false,
    apiAccess: false,
    ssoEnabled: false,
    whitelabelEnabled: false,
    auditLogDays: 30,
    customContracts: false,
    dedicatedAccountManager: false,
    savedSearches: 20,
    preferredSellers: 20,
    platformFeePercent: PLATFORM_FEE_PERCENT.pro,
    proposalDailyLimit: PROPOSAL_DAILY_LIMIT.pro,
  },
  business: {
    maxMembers: 50,
    milestoneProjects: true,
    teamCollaboration: true,
    approvalWorkflows: true,
    apiAccess: true,
    ssoEnabled: false,
    whitelabelEnabled: false,
    auditLogDays: 365,
    customContracts: true,
    dedicatedAccountManager: false,
    savedSearches: "unlimited",
    preferredSellers: "unlimited",
    platformFeePercent: PLATFORM_FEE_PERCENT.business,
    proposalDailyLimit: PROPOSAL_DAILY_LIMIT.business,
  },
  enterprise: {
    maxMembers: "unlimited",
    milestoneProjects: true,
    teamCollaboration: true,
    approvalWorkflows: true,
    apiAccess: true,
    ssoEnabled: true,
    whitelabelEnabled: true,
    auditLogDays: "unlimited",
    customContracts: true,
    dedicatedAccountManager: true,
    savedSearches: "unlimited",
    preferredSellers: "unlimited",
    platformFeePercent: PLATFORM_FEE_PERCENT.enterprise,
    proposalDailyLimit: "unlimited",
  },
}

export function getPlanFeatures(plan: PlanTier): PlanFeatures {
  return PLAN_FEATURES[plan]
}

export class UpgradeRequiredError extends Error {
  readonly feature: keyof PlanFeatures
  readonly requiredPlan: PlanTier

  constructor(feature: keyof PlanFeatures, requiredPlan: PlanTier) {
    super(`Feature "${String(feature)}" requires the ${requiredPlan} plan or higher.`)
    this.name = "UpgradeRequiredError"
    this.feature = feature
    this.requiredPlan = requiredPlan
  }
}

export function requirePlanFeature<K extends keyof PlanFeatures>(
  features: PlanFeatures,
  feature: K,
  currentPlan: PlanTier
): void {
  const value = features[feature]
  if (value === false || value === 0) {
    const planOrder: PlanTier[] = ["free", "pro", "business", "enterprise"]
    const requiredPlan = planOrder.find(
      (p) => PLAN_FEATURES[p][feature] !== false && PLAN_FEATURES[p][feature] !== 0
    ) as PlanTier
    throw new UpgradeRequiredError(feature, requiredPlan ?? "enterprise")
  }
}

export function canUsePlanFeature(features: PlanFeatures, feature: keyof PlanFeatures): boolean {
  const value = features[feature]
  return value !== false && value !== 0
}
