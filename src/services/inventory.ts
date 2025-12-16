import { supabase } from '../lib/supabase'
import type { Book, Author, Category } from '../types/database'

// ============================================
// AUTHOR SERVICE
// ============================================

export interface CreateAuthorData {
  name: string
  bio?: string
}

export interface UpdateAuthorData {
  name?: string
  bio?: string
}

export const authorService = {
  async getAll(): Promise<{ authors: Author[]; error?: string }> {
    const { data, error } = await supabase
      .from('authors')
      .select('*')
      .order('name')

    if (error) {
      return { authors: [], error: error.message }
    }

    return { authors: data || [] }
  },

  async getById(id: number): Promise<{ author: Author | null; error?: string }> {
    const { data, error } = await supabase
      .from('authors')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return { author: null, error: error.message }
    }

    return { author: data }
  },

  async create(authorData: CreateAuthorData): Promise<{ author: Author | null; error?: string }> {
    console.log('👤 Creating author:', authorData)
    
    try {
      const { data, error } = await supabase
        .from('authors')
        .insert({
          name: authorData.name.trim(),
          bio: authorData.bio?.trim() || null,
        })
        .select()
        .single()

      console.log('👤 Author create response:', { data, error })

      if (error) {
        console.error('👤 Author create error:', error)
        if (error.code === '23505') {
          return { author: null, error: 'An author with this name already exists' }
        }
        return { author: null, error: error.message }
      }

      return { author: data }
    } catch (e) {
      console.error('👤 Author create exception:', e)
      return { author: null, error: 'An unexpected error occurred' }
    }
  },

  async update(id: number, updates: UpdateAuthorData): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('authors')
      .update({
        ...(updates.name && { name: updates.name.trim() }),
        ...(updates.bio !== undefined && { bio: updates.bio?.trim() || null }),
      })
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  },

  async delete(id: number): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('authors')
      .delete()
      .eq('id', id)

    if (error) {
      if (error.code === '23503') {
        return { success: false, error: 'Cannot delete author with associated books' }
      }
      return { success: false, error: error.message }
    }

    return { success: true }
  },
}

// ============================================
// CATEGORY SERVICE
// ============================================

export interface CreateCategoryData {
  name: string
}

export const categoryService = {
  async getAll(): Promise<{ categories: Category[]; error?: string }> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (error) {
      return { categories: [], error: error.message }
    }

    return { categories: data || [] }
  },

  async create(categoryData: CreateCategoryData): Promise<{ category: Category | null; error?: string }> {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: categoryData.name.trim(),
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return { category: null, error: 'A category with this name already exists' }
      }
      return { category: null, error: error.message }
    }

    return { category: data }
  },

  async update(id: number, name: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('categories')
      .update({ name: name.trim() })
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  },

  async delete(id: number): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) {
      if (error.code === '23503') {
        return { success: false, error: 'Cannot delete category with associated books' }
      }
      return { success: false, error: error.message }
    }

    return { success: true }
  },
}

// ============================================
// BOOK SERVICE
// ============================================

export interface CreateBookData {
  title: string
  isbn: string
  author_id: number
  category_id: number
  total_copies: number
  cover_url?: string
  description?: string
}

export interface UpdateBookData {
  title?: string
  isbn?: string
  author_id?: number
  category_id?: number
  total_copies?: number
  available_copies?: number
  cover_url?: string
  description?: string
}

export const bookService = {
  async getAll(): Promise<{ books: Book[]; error?: string }> {
    const { data, error } = await supabase
      .from('books')
      .select('*, author:authors(*), category:categories(*)')
      .order('created_at', { ascending: false })

    if (error) {
      return { books: [], error: error.message }
    }

    return { books: data || [] }
  },

  async getById(id: string): Promise<{ book: Book | null; error?: string }> {
    const { data, error } = await supabase
      .from('books')
      .select('*, author:authors(*), category:categories(*)')
      .eq('id', id)
      .single()

    if (error) {
      return { book: null, error: error.message }
    }

    return { book: data }
  },

  async getRecent(limit: number = 5): Promise<{ books: Book[]; error?: string }> {
    const { data, error } = await supabase
      .from('books')
      .select('*, author:authors(*), category:categories(*)')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      return { books: [], error: error.message }
    }

    return { books: data || [] }
  },

  async create(bookData: CreateBookData): Promise<{ book: Book | null; error?: string }> {
    console.log('📚 Creating book:', bookData)
    
    try {
      const { data, error } = await supabase
        .from('books')
        .insert({
          title: bookData.title.trim(),
          isbn: bookData.isbn.trim(),
          author_id: bookData.author_id,
          category_id: bookData.category_id,
          total_copies: bookData.total_copies,
          available_copies: bookData.total_copies, // New books start fully available
          cover_url: bookData.cover_url?.trim() || null,
          description: bookData.description?.trim() || null,
        })
        .select('*, author:authors(*), category:categories(*)')
        .single()

      console.log('📚 Book create response:', { data, error })

      if (error) {
        console.error('📚 Book create error:', error)
        if (error.code === '23505') {
          return { book: null, error: 'A book with this ISBN already exists' }
        }
        return { book: null, error: error.message }
      }

      return { book: data }
    } catch (e) {
      console.error('📚 Book create exception:', e)
      return { book: null, error: 'An unexpected error occurred' }
    }
  },

  async update(id: string, updates: UpdateBookData): Promise<{ success: boolean; error?: string }> {
    const updateData: Record<string, unknown> = {}

    if (updates.title) updateData.title = updates.title.trim()
    if (updates.isbn) updateData.isbn = updates.isbn.trim()
    if (updates.author_id) updateData.author_id = updates.author_id
    if (updates.category_id) updateData.category_id = updates.category_id
    if (updates.total_copies !== undefined) updateData.total_copies = updates.total_copies
    if (updates.available_copies !== undefined) updateData.available_copies = updates.available_copies
    if (updates.cover_url !== undefined) updateData.cover_url = updates.cover_url?.trim() || null
    if (updates.description !== undefined) updateData.description = updates.description?.trim() || null

    const { error } = await supabase
      .from('books')
      .update(updateData)
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  },

  async delete(id: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id)

    if (error) {
      if (error.code === '23503') {
        return { success: false, error: 'Cannot delete book with active loans' }
      }
      return { success: false, error: error.message }
    }

    return { success: true }
  },

  async search(query: string): Promise<{ books: Book[]; error?: string }> {
    const { data, error } = await supabase
      .from('books')
      .select('*, author:authors(*), category:categories(*)')
      .ilike('title', `%${query}%`)
      .order('title')

    if (error) {
      return { books: [], error: error.message }
    }

    return { books: data || [] }
  },

  async filterByCategory(categoryId: number): Promise<{ books: Book[]; error?: string }> {
    const { data, error } = await supabase
      .from('books')
      .select('*, author:authors(*), category:categories(*)')
      .eq('category_id', categoryId)
      .order('title')

    if (error) {
      return { books: [], error: error.message }
    }

    return { books: data || [] }
  },

  async filterByAuthor(authorId: number): Promise<{ books: Book[]; error?: string }> {
    const { data, error } = await supabase
      .from('books')
      .select('*, author:authors(*), category:categories(*)')
      .eq('author_id', authorId)
      .order('title')

    if (error) {
      return { books: [], error: error.message }
    }

    return { books: data || [] }
  },
}

