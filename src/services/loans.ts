import { supabase } from '../lib/supabase'
import type { Loan } from '../types/database'

export interface BorrowResult {
  success: boolean
  error?: string
  loan_id?: string
}

export interface ReturnResult {
  success: boolean
  error?: string
}

/**
 * Loans service - handles all loan-related Supabase operations
 */
export const loansService = {
  /**
   * Borrow a book using the database transaction function
   * This ensures atomic operations (decrement copies + create loan)
   */
  async borrowBook(bookId: string, userId: string): Promise<BorrowResult> {
    const { data, error } = await supabase.rpc('borrow_book', {
      p_book_id: bookId,
      p_user_id: userId,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return data as BorrowResult
  },

  /**
   * Return a book using the database transaction function
   * This ensures atomic operations (update loan + increment copies)
   */
  async returnBook(loanId: string): Promise<ReturnResult> {
    const { data, error } = await supabase.rpc('return_book', {
      p_loan_id: loanId,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return data as ReturnResult
  },

  /**
   * Get all loans for a specific user
   */
  async getUserLoans(userId: string): Promise<{ loans: Loan[]; error?: string }> {
    const { data, error } = await supabase
      .from('loans')
      .select('*, book:books(*, author:authors(*), category:categories(*))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return { loans: [], error: error.message }
    }

    return { loans: data || [] }
  },

  /**
   * Get active loans for a user (not returned)
   */
  async getActiveLoans(userId: string): Promise<{ loans: Loan[]; error?: string }> {
    const { data, error } = await supabase
      .from('loans')
      .select('*, book:books(*, author:authors(*), category:categories(*))')
      .eq('user_id', userId)
      .in('status', ['active', 'overdue'])
      .order('due_date', { ascending: true })

    if (error) {
      return { loans: [], error: error.message }
    }

    return { loans: data || [] }
  },

  /**
   * Get loan history for a user (returned books)
   */
  async getLoanHistory(userId: string): Promise<{ loans: Loan[]; error?: string }> {
    const { data, error } = await supabase
      .from('loans')
      .select('*, book:books(*, author:authors(*), category:categories(*))')
      .eq('user_id', userId)
      .eq('status', 'returned')
      .order('return_date', { ascending: false })

    if (error) {
      return { loans: [], error: error.message }
    }

    return { loans: data || [] }
  },

  /**
   * Check if a user has already borrowed a specific book (and not returned it)
   */
  async hasActiveLoan(userId: string, bookId: string): Promise<{ hasLoan: boolean; loan?: Loan; error?: string }> {
    const { data, error } = await supabase
      .from('loans')
      .select('*, book:books(*, author:authors(*))')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .in('status', ['active', 'overdue'])
      .maybeSingle()

    if (error) {
      return { hasLoan: false, error: error.message }
    }

    return { hasLoan: !!data, loan: data || undefined }
  },

  /**
   * Get count of active loans for a user
   */
  async getActiveLoanCount(userId: string): Promise<{ count: number; error?: string }> {
    const { count, error } = await supabase
      .from('loans')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('status', ['active', 'overdue'])

    if (error) {
      return { count: 0, error: error.message }
    }

    return { count: count || 0 }
  },

  /**
   * Get all active loans (admin)
   */
  async getAllActiveLoans(): Promise<{ loans: Loan[]; error?: string }> {
    const { data, error } = await supabase
      .from('loans')
      .select('*, book:books(*, author:authors(*)), profile:profiles(*)')
      .in('status', ['active', 'overdue'])
      .order('due_date', { ascending: true })

    if (error) {
      return { loans: [], error: error.message }
    }

    return { loans: data || [] }
  },
}

