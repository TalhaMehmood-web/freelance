import { AbilityBuilder, createMongoAbility, type MongoAbility } from "@casl/ability"
import type { Action, Subject } from "./ability.generated"

export type AppAbility = MongoAbility<[Action | "manage", Subject | "all"]>

export function buildAbility(permissionKeys: string[], isSuperAdmin: boolean): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility)

  if (isSuperAdmin) {
    can("manage", "all")
  } else {
    for (const key of permissionKeys) {
      const colonIdx = key.indexOf(":")
      if (colonIdx === -1) continue
      const resource = key.slice(0, colonIdx)
      const action   = key.slice(colonIdx + 1)
      const subject  = (resource.charAt(0).toUpperCase() + resource.slice(1)) as Subject
      can(action as Action, subject)
    }
  }

  return build()
}
