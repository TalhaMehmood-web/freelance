"use client"

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { CategoryFormSchema, type CategoryFormData } from "@/schemas/admin/categories"
import type { CategoryWithChildren } from "./hooks/useCategoriesQuery"
import type { Category } from "@prisma/client"

interface CategoryFormDialogProps {
  open:                 boolean
  onOpenChange:         (open: boolean) => void
  editing?:             Category | null
  preselectedParentId?: string
  parents:              CategoryWithChildren[]
  onSubmit:             (data: CategoryFormData) => Promise<void>
  isPending:            boolean
}

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export function CategoryFormDialog({
  open, onOpenChange, editing, preselectedParentId, parents, onSubmit, isPending,
}: CategoryFormDialogProps) {
  const isEdit = !!editing

  const title = isEdit
    ? "Edit Category"
    : preselectedParentId ? "Add Subcategory" : "Add Category"

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(CategoryFormSchema) as any,
    defaultValues: {
      name:      "",
      slug:      "",
      parentId:  undefined,
      icon:      "",
      sortOrder: 0,
    },
  })

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = form

  useEffect(() => {
    if (open) {
      if (editing) {
        reset({
          name:      editing.name,
          slug:      editing.slug,
          parentId:  editing.parentId ?? undefined,
          icon:      editing.icon ?? "",
          sortOrder: editing.sortOrder,
        })
      } else {
        reset({
          name:      "",
          slug:      "",
          parentId:  preselectedParentId ?? undefined,
          icon:      "",
          sortOrder: 0,
        })
      }
    }
  }, [open, editing, preselectedParentId, reset])

  const nameValue = watch("name")

  useEffect(() => {
    if (!isEdit && nameValue) {
      setValue("slug", toSlug(nameValue), { shouldValidate: false })
    }
  }, [nameValue, isEdit, setValue])

  const parentOptions = parents.filter(p => p.id !== editing?.id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="cat-name">
              Name <span className="text-danger-500">*</span>
            </Label>
            <Input
              id="cat-name"
              placeholder="e.g. Development & IT"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            {errors.name && <p className="text-xs text-danger-600">{errors.name.message}</p>}
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <Label htmlFor="cat-slug">
              Slug <span className="text-danger-500">*</span>
            </Label>
            <Input
              id="cat-slug"
              placeholder="e.g. development-it"
              className="font-mono text-sm"
              aria-invalid={!!errors.slug}
              {...register("slug")}
            />
            {errors.slug
              ? <p className="text-xs text-danger-600">{errors.slug.message}</p>
              : <p className="text-xs text-text-tertiary">Lowercase letters, numbers and hyphens only</p>
            }
          </div>

          {/* Parent category */}
          <div className="space-y-1.5">
            <Label>Parent Category</Label>
            <Controller
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={v => field.onChange(v === "__none__" ? undefined : v)}
                  disabled={!!preselectedParentId && !isEdit}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Top-level category (no parent)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Top-level category</SelectItem>
                    {parentOptions.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <p className="text-xs text-text-tertiary">Leave blank to create a top-level category</p>
          </div>

          {/* Icon */}
          <div className="space-y-1.5">
            <Label htmlFor="cat-icon">Icon (optional)</Label>
            <Input
              id="cat-icon"
              placeholder="e.g. 💻 or code"
              {...register("icon")}
            />
            <p className="text-xs text-text-tertiary">Emoji or short icon name shown next to category name</p>
          </div>

          {/* Sort order */}
          <div className="space-y-1.5">
            <Label htmlFor="cat-sort">Sort Order</Label>
            <Input
              id="cat-sort"
              type="number"
              min={0}
              placeholder="0"
              className="max-w-24"
              {...register("sortOrder")}
            />
            {errors.sortOrder && <p className="text-xs text-danger-600">{errors.sortOrder.message}</p>}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="min-w-24">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : isEdit ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
