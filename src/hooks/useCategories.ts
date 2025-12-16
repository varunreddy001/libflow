import { useState, useEffect, useCallback } from 'react'
import { categoryService, CreateCategoryData } from '../services/inventory'
import { useToast } from '../contexts/ToastContext'
import type { Category } from '../types/database'

/**
 * Hook for managing categories
 * Handles fetching, creating, updating, and deleting categories
 */
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addToast } = useToast()

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { categories, error } = await categoryService.getAll()

    if (error) {
      setError(error)
      addToast('Failed to load categories', 'error')
    } else {
      setCategories(categories)
    }

    setLoading(false)
  }, [addToast])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const createCategory = useCallback(async (data: CreateCategoryData): Promise<Category | null> => {
    const { category, error } = await categoryService.create(data)

    if (error) {
      addToast(error, 'error')
      return null
    }

    if (category) {
      setCategories(prev => [...prev, category].sort((a, b) => a.name.localeCompare(b.name)))
      addToast('Category added successfully!', 'success')
    }

    return category
  }, [addToast])

  const updateCategory = useCallback(async (id: number, name: string): Promise<boolean> => {
    const { success, error } = await categoryService.update(id, name)

    if (error) {
      addToast(error, 'error')
      return false
    }

    if (success) {
      setCategories(prev => 
        prev.map(c => c.id === id ? { ...c, name } : c)
            .sort((a, b) => a.name.localeCompare(b.name))
      )
      addToast('Category updated successfully!', 'success')
    }

    return success
  }, [addToast])

  const deleteCategory = useCallback(async (id: number): Promise<boolean> => {
    const { success, error } = await categoryService.delete(id)

    if (error) {
      addToast(error, 'error')
      return false
    }

    if (success) {
      setCategories(prev => prev.filter(c => c.id !== id))
      addToast('Category deleted successfully!', 'success')
    }

    return success
  }, [addToast])

  return {
    categories,
    loading,
    error,
    refresh: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  }
}

