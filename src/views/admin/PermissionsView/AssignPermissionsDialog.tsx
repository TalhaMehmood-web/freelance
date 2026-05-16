"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
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
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PermissionMatrix } from "./PermissionMatrix"
import { ResourceCombobox } from "./ResourceCombobox"
import type { RoleRow, PermissionRow } from "@/types/admin"

interface FormValues {
  permissions: string[]
}

interface PermissionsResponse {
  data:      PermissionRow[]
  total:     number
  pageCount: number
}

interface Props {
  role:         RoleRow | null
  open:         boolean
  onClose:      () => void
  isSuperAdmin: boolean
}

export function AssignPermissionsDialog({ role, open, onClose, isSuperAdmin }: Props) {
  const queryClient = useQueryClient()
  const [resource, setResource] = useState("all")

  const { data: permsData } = useQuery<PermissionsResponse>({
    queryKey: ["admin-permissions", { page: 1, search: "", resource, sortBy: "resource", sortDir: "asc" }],
    queryFn:  () => axios.get("/api/admin/permissions", {
      params: {
        page:     1,
        perPage:  500,
        sortBy:   "resource",
        sortDir:  "asc",
        resource: resource === "all" ? "" : resource,
      },
    }).then(r => r.data),
    enabled: open,
  })

  const allPerms: PermissionRow[] = permsData?.data ?? []

  const { watch, setValue, getValues, reset } = useForm<FormValues>({
    defaultValues: { permissions: [] },
  })

  useEffect(() => {
    if (open && role) {
      reset({ permissions: role.permissions })
      setResource("all")
    }
  }, [open, role]) // eslint-disable-line react-hooks/exhaustive-deps

  const mutation = useMutation({
    mutationFn: (permissions: string[]) =>
      axios.patch(`/api/admin/roles/${role!.id}/permissions`, { permissions }),
    onSuccess: () => {
      toast.success("Permissions updated successfully.")
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] })
      onClose()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error ?? "Failed to update permissions.")
    },
  })

  function handlePermissionChange(key: string, checked: boolean) {
    const current = getValues("permissions")
    setValue("permissions", checked ? [...current, key] : current.filter(k => k !== key))
  }

  function handleSubmit() {
    mutation.mutate(getValues("permissions"))
  }

  const selected = watch("permissions")

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
      <DialogContent
        showCloseButton
        className="sm:max-w-2xl max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden"
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-brand-500" />
            Assign Permissions
          </DialogTitle>
          <DialogDescription>
            {role ? `Editing permissions for "${role.label}"` : "Select permissions to assign."}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-3 border-b border-border shrink-0">
          <ResourceCombobox value={resource} onChange={setResource} />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <PermissionMatrix
            permissions={allPerms}
            selected={selected}
            onChange={handlePermissionChange}
            disabled={mutation.isPending}
            isSuperAdmin={isSuperAdmin}
          />
        </div>

        <DialogFooter className="shrink-0 border-t border-border bg-surface p-4! rounded-b-xl">
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            <KeyRound className="w-4 h-4" />
            {mutation.isPending ? "Saving…" : "Save Permissions"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
