"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { CATEGORIES_QUERY_KEY } from "./useCategoriesQuery"
import type { CategoryFormData, CategoryUpdateData } from "@/schemas/admin/categories"

export function useCategoryMutations() {
  const queryClient = useQueryClient()

  function invalidate(categoryId?: string) {
    queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
    if (categoryId) {
      queryClient.invalidateQueries({ queryKey: ["admin-category", categoryId] })
    }
  }

  const createMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const res = await fetch("/api/admin/categories", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed to create category")
      return json
    },
    onSuccess: (_data, vars) => {
      invalidate(vars.parentId)
      toast.success("Category created")
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CategoryUpdateData; parentId?: string }) => {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed to update category")
      return json
    },
    onSuccess: (_data, vars) => {
      invalidate(vars.parentId)
      toast.success("Category updated")
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive, parentId }: { id: string; isActive: boolean; parentId?: string }) => {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ isActive }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed to update category")
      return json
    },
    onSuccess: (_data, vars) => invalidate(vars.parentId),
    onError: (err: Error) => toast.error(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async ({ id, parentId }: { id: string; parentId?: string }) => {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed to delete category")
      return json
    },
    onSuccess: (_data, vars) => {
      invalidate(vars.parentId)
      toast.success("Category deleted")
    },
  })

  return { createMutation, updateMutation, toggleMutation, deleteMutation }
}
