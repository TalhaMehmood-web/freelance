"use client"

import { useEffect, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { Shield } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { PermissionMatrix } from "./PermissionMatrix"
import { createRole, updateRole } from "@/actions/admin/permissions"
import type { RoleRow, PermissionRow } from "@/types/admin"

const schema = z.object({
  label:       z.string().min(1, "Name is required").max(60),
  slug:        z.string().min(1, "Slug is required").max(60)
               .regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers, underscores only"),
  description: z.string().max(300),
  permissions: z.array(z.string()),
})

type FormValues = z.infer<typeof schema>

interface PermissionsResponse {
  data: PermissionRow[]
}

interface RoleFormProps {
  open:         boolean
  onClose:      () => void
  onSaved:      (role: RoleRow) => void
  role?:        RoleRow | null
  isSuperAdmin: boolean
}

export function RoleForm({ open, onClose, onSaved, role, isSuperAdmin }: RoleFormProps) {
  const [isPending, startTransition] = useTransition()

  const { data: permsData } = useQuery<PermissionsResponse>({
    queryKey: ["admin-permissions", { page: 1, search: "", resource: "", sortBy: "resource", sortDir: "asc" }],
    queryFn:  () => axios.get("/api/admin/permissions", {
      params: { page: 1, perPage: 500, sortBy: "resource", sortDir: "asc" },
    }).then(r => r.data),
    enabled: open,
  })

  const permissions: PermissionRow[] = permsData?.data ?? []
  const isEdit = !!role

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      label:       role?.label ?? "",
      slug:        role?.slug ?? "",
      description: role?.description ?? "",
      permissions: role?.permissions ?? [],
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        label:       role?.label ?? "",
        slug:        role?.slug ?? "",
        description: role?.description ?? "",
        permissions: role?.permissions ?? [],
      })
    }
  }, [open, role])

  function autoSlug(label: string) {
    return label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "")
  }

  function handlePermissionChange(key: string, checked: boolean) {
    const current = getValues("permissions")
    setValue(
      "permissions",
      checked ? [...current, key] : current.filter(k => k !== key),
      { shouldDirty: true }
    )
  }

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = isEdit
        ? await updateRole(role!.id, values)
        : await createRole(values)

      if (!result.success) {
        setError("root", { message: result.error ?? "Something went wrong." })
        return
      }
      onSaved(result.data!)
    })
  }

  const selectedPermissions = watch("permissions")

  return (
    <Sheet open={open} onOpenChange={v => { if (!v) onClose() }}>
      <SheetContent side="right" className="w-full sm:max-w-xl flex flex-col gap-0 p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-500" />
            {isEdit ? "Edit Role" : "Create Role"}
          </SheetTitle>
          <SheetDescription>
            {isEdit ? `Editing "${role?.label}"` : "Define a new role and assign permissions to it."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* Name + slug row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="label">Role Name</Label>
                <Input
                  id="label"
                  placeholder="Support Agent"
                  {...register("label")}
                  onChange={e => {
                    register("label").onChange(e)
                    if (!isEdit) setValue("slug", autoSlug(e.target.value))
                  }}
                />
                {errors.label && (
                  <p className="text-xs text-danger-600">{errors.label.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  placeholder="support_agent"
                  {...register("slug")}
                  disabled={isEdit && (role?.isBuiltIn ?? false)}
                />
                {errors.slug && (
                  <p className="text-xs text-danger-600">{errors.slug.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">
                Description{" "}
                <span className="text-text-tertiary font-normal">(optional)</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Briefly describe what this role can do…"
                className="resize-none"
                rows={2}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-danger-600">{errors.description.message}</p>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-text-primary mb-3">Permissions</p>
              <PermissionMatrix
                permissions={permissions}
                selected={selectedPermissions}
                onChange={handlePermissionChange}
                disabled={isPending}
                isSuperAdmin={isSuperAdmin}
              />
            </div>

            {errors.root && (
              <p className="text-sm text-danger-600 bg-danger-50 border border-danger-100 rounded-xl px-4 py-3">
                {errors.root.message}
              </p>
            )}
          </div>

          <div className="shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-surface">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              <Shield className="w-4 h-4" />
              {isPending ? "Saving…" : isEdit ? "Save Changes" : "Create Role"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
