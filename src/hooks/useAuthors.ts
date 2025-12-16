import { useState, useEffect, useCallback } from 'react'
import { authorService, CreateAuthorData, UpdateAuthorData } from '../services/inventory'
import { useToast } from '../contexts/ToastContext'
import type { Author } from '../types/database'

/**
 * Hook for managing authors
 * Handles fetching, creating, updating, and deleting authors
 */
export function useAuthors() {
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addToast } = useToast()

  const fetchAuthors = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { authors, error } = await authorService.getAll()

    if (error) {
      setError(error)
      addToast('Failed to load authors', 'error')
    } else {
      setAuthors(authors)
    }

    setLoading(false)
  }, [addToast])

  useEffect(() => {
    fetchAuthors()
  }, [fetchAuthors])

  const createAuthor = useCallback(async (data: CreateAuthorData): Promise<Author | null> => {
    const { author, error } = await authorService.create(data)

    if (error) {
      addToast(error, 'error')
      return null
    }

    if (author) {
      setAuthors(prev => [...prev, author].sort((a, b) => a.name.localeCompare(b.name)))
      addToast('Author added successfully!', 'success')
    }

    return author
  }, [addToast])

  const updateAuthor = useCallback(async (id: number, updates: UpdateAuthorData): Promise<boolean> => {
    const { success, error } = await authorService.update(id, updates)

    if (error) {
      addToast(error, 'error')
      return false
    }

    if (success) {
      // Refetch to get updated data
      await fetchAuthors()
      addToast('Author updated successfully!', 'success')
    }

    return success
  }, [addToast, fetchAuthors])

  const deleteAuthor = useCallback(async (id: number): Promise<boolean> => {
    const { success, error } = await authorService.delete(id)

    if (error) {
      addToast(error, 'error')
      return false
    }

    if (success) {
      setAuthors(prev => prev.filter(a => a.id !== id))
      addToast('Author deleted successfully!', 'success')
    }

    return success
  }, [addToast])

  return {
    authors,
    loading,
    error,
    refresh: fetchAuthors,
    createAuthor,
    updateAuthor,
    deleteAuthor,
  }
}

