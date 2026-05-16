"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient } from "@/lib/client/axios"
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
      const res = await apiClient.post("/api/admin/categories", data)
      return res.data
    },
    onSuccess: (_data, vars) => {
      invalidate(vars.parentId)
      toast.success("Category created")
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CategoryUpdateData; parentId?: string }) => {
      const res = await apiClient.patch(`/api/admin/categories/${id}`, data)
      return res.data
    },
    onSuccess: (_data, vars) => {
      invalidate(vars.parentId)
      toast.success("Category updated")
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive, parentId }: { id: string; isActive: boolean; parentId?: string }) => {
      const res = await apiClient.patch(`/api/admin/categories/${id}`, { isActive })
      return res.data
    },
    onSuccess: (_data, vars) => invalidate(vars.parentId),
    onError: (err: Error) => toast.error(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async ({ id, parentId }: { id: string; parentId?: string }) => {
      const res = await apiClient.delete(`/api/admin/categories/${id}`)
      return res.data
    },
    onSuccess: (_data, vars) => {
      invalidate(vars.parentId)
      toast.success("Category deleted")
    },
  })

  return { createMutation, updateMutation, toggleMutation, deleteMutation }
}
