"use client"

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient as axios } from "@/lib/client/axios"
import { toast } from "sonner"
import { KeyRound } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ResourceCombobox } from "./ResourceCombobox"
import type { RoleRow, PermissionActionRow } from "@/types/admin"

interface RolesResponse   { data: RoleRow[]            }
interface ActionsResponse { data: PermissionActionRow[] }

const schema = z.object({
  label:       z.string().min(1, "Label is required").max(80),
  key:         z.string().min(1, "Key is required").max(80)
               .regex(/^[a-z0-9_]+:[a-z0-9_]+$/, "Must be resource:action format, e.g. orders:read"),
  resource:    z.string().min(1, "Resource is required").max(60)
               .regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers, underscores only"),
  action:      z.string().min(1, "Action is required"),
  description: z.string().max(300),
  roleIds:     z.array(z.string()),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open:    boolean
  onClose: () => void
}

export function PermissionForm({ open, onClose }: Props) {
  const queryClient = useQueryClient()

  const { data: rolesData } = useQuery<RolesResponse>({
    queryKey: ["admin-roles", { page: 1, search: "", sortBy: "label", sortDir: "asc" }],
    queryFn:  () => axios.get("/api/admin/roles", {
      params: { page: 1, perPage: 100, sortBy: "label", sortDir: "asc" },
    }).then(r => r.data),
    enabled: open,
  })

  const { data: actionsData } = useQuery<ActionsResponse>({
    queryKey: ["admin-actions"],
    queryFn:  () => axios.get("/api/admin/actions").then(r => r.data),
    enabled:  open,
  })

  const availableRoles:   RoleRow[]            = rolesData?.data   ?? []
  const availableActions: PermissionActionRow[] = actionsData?.data ?? []

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    control,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { label: "", key: "", resource: "", action: "", description: "", roleIds: [] },
  })

  useEffect(() => {
    if (open) {
      reset({ label: "", key: "", resource: "", action: "", description: "", roleIds: [] })
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const watchResource = watch("resource")
  const watchAction   = watch("action")
  const watchRoleIds  = watch("roleIds")

  useEffect(() => {
    const res = watchResource.trim().toLowerCase().replace(/[^a-z0-9_]/g, "")
    const act = watchAction.trim().toLowerCase().replace(/[^a-z0-9_]/g, "")
    if (res && act) setValue("key", `${res}:${act}`)
  }, [watchResource, watchAction]) // eslint-disable-line react-hooks/exhaustive-deps

  const mutation = useMutation({
    mutationFn: (values: FormValues) => axios.post("/api/admin/permissions", values),
    onSuccess: () => {
      toast.success("Permission created and assigned to Admin role.")
      queryClient.invalidateQueries({ queryKey: ["admin-permissions"] })
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] })
      onClose()
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error ?? "Failed to create permission."
      toast.error(msg)
      setError("root", { message: msg })
    },
  })

  function onSubmit(values: FormValues) {
    mutation.mutate(values)
  }

  function toggleRole(id: string) {
    const current = getValues("roleIds")
    setValue(
      "roleIds",
      current.includes(id) ? current.filter(r => r !== id) : [...current, id],
      { shouldDirty: true }
    )
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-brand-500" />
            Create Permission
          </DialogTitle>
          <DialogDescription>
            New permissions are automatically assigned to the Admin role.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* Label */}
            <div className="space-y-1.5">
              <Label htmlFor="perm-label">Label</Label>
              <Input id="perm-label" placeholder="View Orders" {...register("label")} />
              {errors.label && <p className="text-xs text-danger-600">{errors.label.message}</p>}
            </div>

            {/* Resource + Action row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Resource</Label>
                <Controller
                  name="resource"
                  control={control}
                  render={({ field }) => (
                    <ResourceCombobox
                      value={field.value || "all"}
                      onChange={v => field.onChange(v === "all" ? "" : v)}
                      placeholder="Select resource…"
                    />
                  )}
                />
                {watchResource && (
                  <p className="text-[11px] text-text-tertiary font-mono">{watchResource}</p>
                )}
                {errors.resource && <p className="text-xs text-danger-600">{errors.resource.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Action</Label>
                <Controller
                  name="action"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={v => field.onChange(v ?? "")}>
                      <SelectTrigger size="sm" className="w-full">
                        <SelectValue placeholder="Select action…" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableActions.map(a => (
                          <SelectItem key={a.id} value={a.slug}>{a.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.action && <p className="text-xs text-danger-600">{errors.action.message}</p>}
              </div>
            </div>

            {/* Auto-built key preview (read-only) */}
            <div className="space-y-1.5">
              <Label htmlFor="perm-key">
                Key{" "}
                <span className="text-text-tertiary font-normal">(auto-built)</span>
              </Label>
              <Input
                id="perm-key"
                placeholder="orders:read"
                {...register("key")}
                className="font-mono bg-surface-subtle"
                readOnly
              />
              {errors.key && <p className="text-xs text-danger-600">{errors.key.message}</p>}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="perm-description">
                Description{" "}
                <span className="text-text-tertiary font-normal">(optional)</span>
              </Label>
              <Textarea
                id="perm-description"
                placeholder="Briefly describe what this permission grants…"
                className="resize-none"
                rows={2}
                {...register("description")}
              />
              {errors.description && <p className="text-xs text-danger-600">{errors.description.message}</p>}
            </div>

            {/* Assign to roles */}
            {availableRoles.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label>Also assign to roles</Label>
                  <button
                    type="button"
                    onClick={() => {
                      const allIds = availableRoles.map(r => r.id)
                      const allSelected = allIds.every(id => watchRoleIds.includes(id))
                      setValue("roleIds", allSelected ? [] : allIds, { shouldDirty: true })
                    }}
                    className="text-xs text-brand-500 hover:text-brand-600 font-medium transition-colors"
                  >
                    {availableRoles.every(r => watchRoleIds.includes(r.id)) ? "Deselect all" : "Assign to all"}
                  </button>
                </div>
                <p className="text-xs text-text-tertiary">
                  The Admin role is always included automatically.
                </p>
                <div className="bg-surface rounded-xl border border-border divide-y divide-border overflow-hidden">
                  {availableRoles.map(role => (
                    <label
                      key={role.id}
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-surface-subtle transition-colors"
                    >
                      <Checkbox
                        checked={watchRoleIds.includes(role.id)}
                        onCheckedChange={() => toggleRole(role.id)}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary">{role.label}</p>
                        <p className="text-xs text-text-tertiary font-mono">{role.slug}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {errors.root && (
              <p className="text-sm text-danger-600 bg-danger-50 border border-danger-100 rounded-xl px-4 py-3">
                {errors.root.message}
              </p>
            )}
          </div>

          <div className="shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-surface">
            <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              <KeyRound className="w-4 h-4" />
              {mutation.isPending ? "Creating…" : "Create Permission"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
