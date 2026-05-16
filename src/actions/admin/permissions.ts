"use server"

import { z } from "zod"
import { requireAuth } from "@/lib/server/auth"
import { requireSuperAdmin } from "@/lib/server/permissions"
import { prisma } from "@/lib/server/prisma"
import { BUILT_IN_PERMISSIONS } from "@/types/admin"
import { UserRole } from "@/lib/shared/constants"
import type { ActionResult } from "@/types/shared"
import type { RoleRow, PermissionRow } from "@/types/admin"

// ─── Permissions ─────────────────────────────────────────────────────────────

export async function getAllPermissions(): Promise<ActionResult<PermissionRow[]>> {
  await requireAuth(UserRole.Admin)
  const rows = await prisma.permission.findMany({ orderBy: [{ resource: "asc" }, { action: "asc" }] })
  return {
    success: true,
    data: rows.map((r: (typeof rows)[number]) => ({
      id:          r.id,
      key:         r.key,
      label:       r.label,
      description: r.description,
      resource:    r.resource,
      action:      r.action,
      isBuiltIn:   r.isBuiltIn,
    })),
  }
}

const PermissionSchema = z.object({
  label:       z.string().min(1, "Label is required").max(80).trim(),
  key:         z.string().min(1, "Key is required").max(80).trim()
               .regex(/^[a-z0-9_]+:[a-z0-9_]+$/, "Key must be resource:action format (lowercase)"),
  resource:    z.string().min(1, "Resource is required").max(60).trim()
               .regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers, underscores only"),
  action:      z.string().min(1, "Action is required").max(60).trim()
               .regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers, underscores only"),
  description: z.string().max(300).trim().optional().default(""),
  roleIds:     z.array(z.string()).default([]),
})

export async function createPermission(raw: unknown): Promise<ActionResult<PermissionRow>> {
  const session = await requireAuth(UserRole.Admin)
  await requireSuperAdmin(session)

  const parsed = PermissionSchema.safeParse(raw)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const { label, key, resource, action, description, roleIds } = parsed.data

  const existing = await prisma.permission.findUnique({ where: { key } })
  if (existing) return { success: false, error: `A permission with key "${key}" already exists.` }

  const permission = await prisma.permission.create({
    data: { key, label, description, resource, action, isBuiltIn: false },
  })

  // Always auto-assign to the built-in admin role (super admins inherit all admin role permissions)
  const adminRole = await prisma.role.findUnique({ where: { slug: UserRole.Admin } })
  const autoAssignRoleIds = new Set(roleIds)
  if (adminRole) autoAssignRoleIds.add(adminRole.id)

  if (autoAssignRoleIds.size > 0) {
    const roles = await prisma.role.findMany({
      where:  { id: { in: [...autoAssignRoleIds] } },
      select: { id: true, permissions: true },
    })
    await Promise.all(
      roles.map((r: { id: string; permissions: string[] }) =>
        prisma.role.update({
          where: { id: r.id },
          data:  { permissions: [...new Set([...r.permissions, key])] },
        })
      )
    )
  }

  return {
    success: true,
    data: {
      id:          permission.id,
      key:         permission.key,
      label:       permission.label,
      description: permission.description,
      resource:    permission.resource,
      action:      permission.action,
      isBuiltIn:   permission.isBuiltIn,
    },
  }
}

export async function deletePermission(id: string): Promise<ActionResult> {
  const session = await requireAuth(UserRole.Admin)
  await requireSuperAdmin(session)

  const existing = await prisma.permission.findUnique({ where: { id } })
  if (!existing) return { success: false, error: "Permission not found." }
  if (existing.isBuiltIn) return { success: false, error: "Built-in permissions cannot be deleted." }

  // Remove this key from all roles that have it
  const rolesWithPerm = await prisma.role.findMany({
    where:  { permissions: { has: existing.key } },
    select: { id: true, permissions: true },
  })
  await Promise.all(
    rolesWithPerm.map(r =>
      prisma.role.update({
        where: { id: r.id },
        data:  { permissions: r.permissions.filter(p => p !== existing.key) },
      })
    )
  )

  await prisma.permission.delete({ where: { id } })
  return { success: true }
}

// ─── Roles ────────────────────────────────────────────────────────────────────

export async function getAllRoles(): Promise<ActionResult<RoleRow[]>> {
  await requireAuth(UserRole.Admin)
  const rows = await prisma.role.findMany({ orderBy: { createdAt: "asc" } })
  return {
    success: true,
    data: rows.map((r: (typeof rows)[number]) => ({
      id:          r.id,
      slug:        r.slug,
      label:       r.label,
      description: r.description,
      isBuiltIn:   r.isBuiltIn,
      permissions: r.permissions,
      updatedAt:   r.updatedAt.toISOString(),
      updatedById: r.updatedById,
    })),
  }
}

const RoleSchema = z.object({
  label:       z.string().min(1).max(60).trim(),
  slug:        z.string().min(1).max(60).trim().regex(/^[a-z0-9_]+$/, "Slug must be lowercase letters, numbers, underscores only"),
  description: z.string().max(300).trim().optional().default(""),
  permissions: z.array(z.string()).default([]),
})

export async function createRole(raw: unknown): Promise<ActionResult<RoleRow>> {
  const session = await requireAuth(UserRole.Admin)
  await requireSuperAdmin(session)

  const parsed = RoleSchema.safeParse(raw)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const { label, slug, description, permissions } = parsed.data

  const existing = await prisma.role.findUnique({ where: { slug } })
  if (existing) return { success: false, error: `A role with slug "${slug}" already exists.` }

  const role = await prisma.role.create({
    data: { slug, label, description, permissions, isBuiltIn: false, updatedById: session.userId },
  })

  return {
    success: true,
    data: {
      id: role.id, slug: role.slug, label: role.label, description: role.description,
      isBuiltIn: role.isBuiltIn, permissions: role.permissions,
      updatedAt: role.updatedAt.toISOString(), updatedById: role.updatedById,
    },
  }
}

export async function updateRole(id: string, raw: unknown): Promise<ActionResult<RoleRow>> {
  const session = await requireAuth(UserRole.Admin)
  await requireSuperAdmin(session)

  const existing = await prisma.role.findUnique({ where: { id } })
  if (!existing) return { success: false, error: "Role not found." }

  const parsed = RoleSchema.safeParse(raw)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const { label, slug, description, permissions } = parsed.data

  if (existing.isBuiltIn && slug !== existing.slug) {
    return { success: false, error: "Cannot change the slug of a built-in role." }
  }

  const slugConflict = await prisma.role.findFirst({ where: { slug, NOT: { id } } })
  if (slugConflict) return { success: false, error: `A role with slug "${slug}" already exists.` }

  const role = await prisma.role.update({
    where: { id },
    data:  { label, slug, description, permissions, updatedById: session.userId },
  })

  return {
    success: true,
    data: {
      id: role.id, slug: role.slug, label: role.label, description: role.description,
      isBuiltIn: role.isBuiltIn, permissions: role.permissions,
      updatedAt: role.updatedAt.toISOString(), updatedById: role.updatedById,
    },
  }
}

export async function deleteRole(id: string): Promise<ActionResult> {
  const session = await requireAuth(UserRole.Admin)
  await requireSuperAdmin(session)

  const existing = await prisma.role.findUnique({ where: { id } })
  if (!existing) return { success: false, error: "Role not found." }
  if (existing.isBuiltIn) return { success: false, error: "Built-in roles cannot be deleted." }

  await prisma.role.delete({ where: { id } })
  return { success: true }
}

// ─── Seed ─────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any

const BUILT_IN_RESOURCES = [
  { slug: "users",      label: "Users"         },
  { slug: "gigs",       label: "Gigs"          },
  { slug: "payments",   label: "Payments"      },
  { slug: "disputes",   label: "Disputes"      },
  { slug: "categories", label: "Categories"    },
  { slug: "coupons",    label: "Coupons"       },
  { slug: "orgs",       label: "Organizations" },
  { slug: "audit_logs", label: "Audit Logs"    },
  { slug: "roles",      label: "Roles"         },
]

const BUILT_IN_ACTIONS = [
  { slug: "read",   label: "Read"   },
  { slug: "create", label: "Create" },
  { slug: "edit",   label: "Edit"   },
  { slug: "delete", label: "Delete" },
  { slug: "update", label: "Update" },
  { slug: "manage", label: "Manage" },
]

export async function createResource(raw: unknown): Promise<ActionResult<{ id: string; slug: string; label: string }>> {
  const session = await requireAuth(UserRole.Admin)
  await requireSuperAdmin(session)

  const parsed = z.object({
    slug:  z.string().min(1).max(60).trim().regex(/^[a-z0-9_]+$/, "Slug must be lowercase letters, numbers, underscores only"),
    label: z.string().min(1).max(80).trim(),
  }).safeParse(raw)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const { slug, label } = parsed.data
  const existing = await db.permissionResource.findUnique({ where: { slug } })
  if (existing) return { success: false, error: `Resource "${slug}" already exists.` }

  const row = await db.permissionResource.create({ data: { slug, label, isBuiltIn: false } })
  return { success: true, data: { id: row.id, slug: row.slug, label: row.label } }
}

export async function deleteResource(id: string): Promise<ActionResult> {
  const session = await requireAuth(UserRole.Admin)
  await requireSuperAdmin(session)

  const existing = await db.permissionResource.findUnique({ where: { id } })
  if (!existing) return { success: false, error: "Resource not found." }
  if (existing.isBuiltIn) return { success: false, error: "Built-in resources cannot be deleted." }

  await db.permissionResource.delete({ where: { id } })
  return { success: true }
}

export async function createAction(raw: unknown): Promise<ActionResult<{ id: string; slug: string; label: string }>> {
  const session = await requireAuth(UserRole.Admin)
  await requireSuperAdmin(session)

  const parsed = z.object({
    slug:  z.string().min(1).max(60).trim().regex(/^[a-z0-9_]+$/, "Slug must be lowercase letters, numbers, underscores only"),
    label: z.string().min(1).max(80).trim(),
  }).safeParse(raw)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const { slug, label } = parsed.data
  const existing = await db.permissionAction.findUnique({ where: { slug } })
  if (existing) return { success: false, error: `Action "${slug}" already exists.` }

  const row = await db.permissionAction.create({ data: { slug, label, isBuiltIn: false } })
  return { success: true, data: { id: row.id, slug: row.slug, label: row.label } }
}

export async function deleteAction(id: string): Promise<ActionResult> {
  const session = await requireAuth(UserRole.Admin)
  await requireSuperAdmin(session)

  const existing = await db.permissionAction.findUnique({ where: { id } })
  if (!existing) return { success: false, error: "Action not found." }
  if (existing.isBuiltIn) return { success: false, error: "Built-in actions cannot be deleted." }

  await db.permissionAction.delete({ where: { id } })
  return { success: true }
}

export async function seedBuiltInRolesAndPermissions(): Promise<ActionResult> {
  const session = await requireAuth(UserRole.Admin)
  await requireSuperAdmin(session)

  for (const r of BUILT_IN_RESOURCES) {
    await db.permissionResource.upsert({
      where:  { slug: r.slug },
      create: { slug: r.slug, label: r.label, isBuiltIn: true },
      update: { label: r.label },
    })
  }

  for (const a of BUILT_IN_ACTIONS) {
    await db.permissionAction.upsert({
      where:  { slug: a.slug },
      create: { slug: a.slug, label: a.label, isBuiltIn: true },
      update: { label: a.label },
    })
  }

  for (const p of BUILT_IN_PERMISSIONS) {
    await prisma.permission.upsert({
      where:  { key: p.key },
      create: { key: p.key, label: p.label, description: p.description, resource: p.resource, action: p.action, isBuiltIn: true },
      update: { label: p.label, description: p.description },
    })
  }

  const builtInRoles = [
    { slug: UserRole.Buyer,  label: "Buyer",  description: "Default buyer role — can browse and purchase gigs",     permissions: [] as string[] },
    { slug: UserRole.Seller, label: "Seller", description: "Seller role — can create gigs and fulfill orders",      permissions: [] as string[] },
    { slug: UserRole.Admin,  label: "Admin",  description: "Admin role — access to admin dashboard and moderation", permissions: BUILT_IN_PERMISSIONS.filter(p => p.key !== "roles:manage").map(p => p.key) },
  ]

  for (const r of builtInRoles) {
    await prisma.role.upsert({
      where:  { slug: r.slug },
      create: { ...r, isBuiltIn: true },
      update: { label: r.label, description: r.description },
    })
  }

  return { success: true }
}
