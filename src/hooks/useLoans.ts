import { useState, useEffect, useCallback } from 'react'
import { loansService } from '../services/loans'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import type { Loan } from '../types/database'

/**
 * Hook for managing user loans
 * Provides borrowing, returning, and loan status checking
 */
export function useLoans() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [activeLoans, setActiveLoans] = useState<Loan[]>([])
  const [loanHistory, setLoanHistory] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [activeLoanCount, setActiveLoanCount] = useState(0)

  const MAX_LOANS = 3

  const fetchLoans = useCallback(async () => {
    if (!user) {
      setActiveLoans([])
      setLoanHistory([])
      setActiveLoanCount(0)
      setLoading(false)
      return
    }

    setLoading(true)

    const [activeRes, historyRes, countRes] = await Promise.all([
      loansService.getActiveLoans(user.id),
      loansService.getLoanHistory(user.id),
      loansService.getActiveLoanCount(user.id),
    ])

    if (activeRes.error) {
      addToast('Failed to load active loans', 'error')
    } else {
      setActiveLoans(activeRes.loans)
    }

    if (!historyRes.error) {
      setLoanHistory(historyRes.loans)
    }

    if (!countRes.error) {
      setActiveLoanCount(countRes.count)
    }

    setLoading(false)
  }, [user, addToast])

  useEffect(() => {
    fetchLoans()
  }, [fetchLoans])

  /**
   * Borrow a book
   * Returns true if successful, false otherwise
   */
  const borrowBook = useCallback(async (bookId: string): Promise<boolean> => {
    if (!user) {
      addToast('Please sign in to borrow books', 'warning')
      return false
    }

    // Check loan limit
    if (activeLoanCount >= MAX_LOANS) {
      addToast(`You've reached the maximum limit of ${MAX_LOANS} active loans`, 'error')
      return false
    }

    const result = await loansService.borrowBook(bookId, user.id)

    if (!result.success) {
      addToast(result.error || 'Failed to borrow book', 'error')
      return false
    }

    addToast('Book borrowed successfully! Due in 14 days.', 'success')
    
    // Refresh loans
    await fetchLoans()
    
    return true
  }, [user, activeLoanCount, addToast, fetchLoans])

  /**
   * Return a book
   * Returns true if successful, false otherwise
   */
  const returnBook = useCallback(async (loanId: string): Promise<boolean> => {
    const result = await loansService.returnBook(loanId)

    if (!result.success) {
      addToast(result.error || 'Failed to return book', 'error')
      return false
    }

    addToast('Book returned successfully!', 'success')
    
    // Refresh loans
    await fetchLoans()
    
    return true
  }, [addToast, fetchLoans])

  /**
   * Check if user has already borrowed a specific book
   */
  const checkExistingLoan = useCallback(async (bookId: string): Promise<{ hasLoan: boolean; loan?: Loan }> => {
    if (!user) {
      return { hasLoan: false }
    }

    const result = await loansService.hasActiveLoan(user.id, bookId)
    return { hasLoan: result.hasLoan, loan: result.loan }
  }, [user])

  /**
   * Check if user can borrow more books
   */
  const canBorrow = activeLoanCount < MAX_LOANS

  /**
   * Get remaining borrow slots
   */
  const remainingSlots = MAX_LOANS - activeLoanCount

  return {
    activeLoans,
    loanHistory,
    loading,
    activeLoanCount,
    maxLoans: MAX_LOANS,
    canBorrow,
    remainingSlots,
    borrowBook,
    returnBook,
    checkExistingLoan,
    refresh: fetchLoans,
  }
}

/**
 * Hook for checking loan status of a specific book
 */
export function useBookLoanStatus(bookId: string | undefined) {
  const { user } = useAuth()
  const [hasActiveLoan, setHasActiveLoan] = useState(false)
  const [existingLoan, setExistingLoan] = useState<Loan | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkLoan = async () => {
      if (!user || !bookId) {
        setHasActiveLoan(false)
        setExistingLoan(null)
        setLoading(false)
        return
      }

      setLoading(true)
      const result = await loansService.hasActiveLoan(user.id, bookId)
      setHasActiveLoan(result.hasLoan)
      setExistingLoan(result.loan || null)
      setLoading(false)
    }

    checkLoan()
  }, [user, bookId])

  return { hasActiveLoan, existingLoan, loading }
}

