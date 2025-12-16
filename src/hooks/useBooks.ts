import { useState, useEffect, useCallback } from 'react'
import { bookService, CreateBookData, UpdateBookData } from '../services/inventory'
import { useToast } from '../contexts/ToastContext'
import type { Book } from '../types/database'

/**
 * Hook for managing books
 * Handles fetching, creating, updating, and deleting books
 */
export function useBooks() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addToast } = useToast()

  const fetchBooks = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { books, error } = await bookService.getAll()

    if (error) {
      setError(error)
      addToast('Failed to load books', 'error')
    } else {
      setBooks(books)
    }

    setLoading(false)
  }, [addToast])

  useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

  const createBook = useCallback(async (data: CreateBookData): Promise<Book | null> => {
    const { book, error } = await bookService.create(data)

    if (error) {
      addToast(error, 'error')
      return null
    }

    if (book) {
      setBooks(prev => [book, ...prev])
      addToast('Book added successfully!', 'success')
    }

    return book
  }, [addToast])

  const updateBook = useCallback(async (id: string, updates: UpdateBookData): Promise<boolean> => {
    const { success, error } = await bookService.update(id, updates)

    if (error) {
      addToast(error, 'error')
      return false
    }

    if (success) {
      // Refetch to get updated data with joins
      await fetchBooks()
      addToast('Book updated successfully!', 'success')
    }

    return success
  }, [addToast, fetchBooks])

  const deleteBook = useCallback(async (id: string): Promise<boolean> => {
    const { success, error } = await bookService.delete(id)

    if (error) {
      addToast(error, 'error')
      return false
    }

    if (success) {
      setBooks(prev => prev.filter(b => b.id !== id))
      addToast('Book deleted successfully!', 'success')
    }

    return success
  }, [addToast])

  const getBookById = useCallback(async (id: string): Promise<Book | null> => {
    const { book, error } = await bookService.getById(id)

    if (error) {
      addToast(error, 'error')
      return null
    }

    return book
  }, [addToast])

  return {
    books,
    loading,
    error,
    refresh: fetchBooks,
    createBook,
    updateBook,
    deleteBook,
    getBookById,
  }
}

/**
 * Hook for fetching recent books (for landing page)
 */
export function useRecentBooks(limit: number = 5) {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecent = async () => {
      setLoading(true)
      const { books } = await bookService.getRecent(limit)
      setBooks(books)
      setLoading(false)
    }

    fetchRecent()
  }, [limit])

  return { books, loading }
}

