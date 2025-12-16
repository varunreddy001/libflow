import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  BookOpen, User, Tag, Calendar, ArrowLeft, Loader2, 
  Clock, CheckCircle, AlertTriangle, BookMarked 
} from 'lucide-react'
import { Button, Card } from '../components/ui'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useLoans, useBookLoanStatus } from '../hooks'
import type { Book } from '../types/database'

export function BookDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { borrowBook, activeLoanCount, maxLoans, canBorrow } = useLoans()
  const { hasActiveLoan, existingLoan, loading: loanStatusLoading } = useBookLoanStatus(id)
  
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [borrowing, setBorrowing] = useState(false)

  const fetchBook = useCallback(async () => {
    if (!id) return
    
    setLoading(true)
    const { data, error } = await supabase
      .from('books')
      .select('*, author:authors(*), category:categories(*)')
      .eq('id', id)
      .single()

    if (error) {
      navigate('/catalog')
      return
    }

    setBook(data)
    setLoading(false)
  }, [id, navigate])

  useEffect(() => {
    fetchBook()
  }, [fetchBook])

  const handleBorrow = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/books/${id}` } } })
      return
    }

    if (!book || book.available_copies <= 0) {
      return
    }

    setBorrowing(true)
    const success = await borrowBook(book.id)
    
    if (success) {
      // Refresh book data to get updated availability
      await fetchBook()
    }
    
    setBorrowing(false)
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
      </div>
    )
  }

  if (!book) {
    return null
  }

  const isAvailable = book.available_copies > 0
  const dueDate = existingLoan?.due_date ? new Date(existingLoan.due_date) : null
  const isOverdue = dueDate && dueDate < new Date()

  // Determine button state and text
  const getButtonState = () => {
    if (!isAuthenticated) {
      return { text: 'Sign in to Borrow', disabled: false, variant: 'primary' as const }
    }
    if (hasActiveLoan) {
      return { text: 'Already Borrowed', disabled: true, variant: 'secondary' as const }
    }
    if (!canBorrow) {
      return { text: `Loan Limit Reached (${maxLoans})`, disabled: true, variant: 'secondary' as const }
    }
    if (!isAvailable) {
      return { text: 'Out of Stock', disabled: true, variant: 'secondary' as const }
    }
    return { text: 'Borrow This Book', disabled: false, variant: 'primary' as const }
  }

  const buttonState = getButtonState()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Catalog
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Book Cover */}
        <div className="lg:col-span-1">
          <div className="aspect-[3/4] bg-gradient-to-br from-primary-700 to-primary-800 rounded-xl overflow-hidden sticky top-24 shadow-2xl">
            {book.cover_url ? (
              <img
                src={book.cover_url}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <BookOpen className="w-24 h-24 text-primary-600" />
              </div>
            )}
          </div>
        </div>

        {/* Book Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title and Meta */}
          <div>
            <h1 className="text-3xl lg:text-4xl font-display font-bold text-white mb-3">
              {book.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-gray-400">
              <Link 
                to={`/catalog?author=${book.author_id}`}
                className="flex items-center gap-2 hover:text-accent-400 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>{book.author?.name}</span>
              </Link>
              <Link 
                to={`/catalog?category=${book.category_id}`}
                className="flex items-center gap-2 hover:text-accent-400 transition-colors"
              >
                <Tag className="w-4 h-4" />
                <span>{book.category?.name}</span>
              </Link>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="font-mono text-sm">ISBN: {book.isbn}</span>
              </div>
            </div>
          </div>

          {/* Active Loan Notice */}
          {hasActiveLoan && existingLoan && (
            <Card className={`border-2 ${isOverdue ? 'border-red-500/50 bg-red-500/5' : 'border-accent-500/50 bg-accent-500/5'}`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${isOverdue ? 'bg-red-500/10' : 'bg-accent-500/10'}`}>
                  {isOverdue ? (
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                  ) : (
                    <BookMarked className="w-6 h-6 text-accent-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${isOverdue ? 'text-red-400' : 'text-accent-400'}`}>
                    {isOverdue ? 'Overdue!' : 'You have this book'}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {isOverdue ? (
                      <>Was due on {dueDate?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. Please return it as soon as possible.</>
                    ) : (
                      <>Due on {dueDate?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</>
                    )}
                  </p>
                  <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-accent-400 hover:text-accent-300 mt-2">
                    View in Dashboard →
                  </Link>
                </div>
              </div>
            </Card>
          )}

          {/* Availability Card */}
          <Card className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                  isAvailable
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}
              >
                {isAvailable ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Available
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4" />
                    Out of Stock
                  </>
                )}
              </div>
              <p className="text-gray-400 text-sm mt-2">
                {book.available_copies} of {book.total_copies} copies available
              </p>
              
              {/* User loan status */}
              {isAuthenticated && !loanStatusLoading && (
                <p className="text-gray-500 text-xs mt-1">
                  Your active loans: {activeLoanCount}/{maxLoans}
                </p>
              )}
            </div>

            <Button
              onClick={handleBorrow}
              disabled={buttonState.disabled || borrowing}
              loading={borrowing}
              variant={buttonState.variant}
              size="lg"
            >
              {buttonState.text}
            </Button>
          </Card>

          {/* Loan Info for non-authenticated users */}
          {!isAuthenticated && (
            <Card className="bg-primary-800/30">
              <div className="flex items-center gap-3 text-gray-400">
                <BookMarked className="w-5 h-5 text-accent-400" />
                <p className="text-sm">
                  <Link to="/login" state={{ from: { pathname: `/books/${id}` } }} className="text-accent-400 hover:text-accent-300">
                    Sign in
                  </Link>
                  {' '}or{' '}
                  <Link to="/signup" className="text-accent-400 hover:text-accent-300">
                    create an account
                  </Link>
                  {' '}to borrow books. Loans are free for 14 days!
                </p>
              </div>
            </Card>
          )}

          {/* Description */}
          {book.description && (
            <Card>
              <h2 className="text-lg font-semibold text-white mb-3">About this book</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                {book.description}
              </p>
            </Card>
          )}

          {/* Author Bio */}
          {book.author?.bio && (
            <Card>
              <h2 className="text-lg font-semibold text-white mb-3">About the Author</h2>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-700 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-white mb-1">{book.author.name}</p>
                  <p className="text-gray-300 leading-relaxed">{book.author.bio}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
