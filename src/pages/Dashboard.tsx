import { Link } from 'react-router-dom'
import { 
  BookOpen, Clock, CheckCircle, AlertTriangle, ArrowRight, 
  Loader2, Calendar, TrendingUp 
} from 'lucide-react'
import { Card, Button } from '../components/ui'
import { useAuth } from '../contexts/AuthContext'
import { useLoans } from '../hooks'
import type { Loan } from '../types/database'

export function Dashboard() {
  const { profile } = useAuth()
  const { 
    activeLoans, 
    loanHistory, 
    loading, 
    activeLoanCount, 
    maxLoans,
    remainingSlots 
  } = useLoans()

  const overdueLoans = activeLoans.filter(
    (loan) => new Date(loan.due_date) < new Date()
  )

  const dueSoonLoans = activeLoans.filter((loan) => {
    const dueDate = new Date(loan.due_date)
    const now = new Date()
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilDue > 0 && daysUntilDue <= 3
  })

  // Calculate reading stats
  const totalBooksRead = loanHistory.length
  const currentMonth = new Date().getMonth()
  const booksThisMonth = loanHistory.filter((loan) => {
    const returnDate = new Date(loan.return_date!)
    return returnDate.getMonth() === currentMonth
  }).length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          Welcome back, {profile?.full_name}!
        </h1>
        <p className="text-gray-400">Track your borrowed books and reading history</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-accent-500/10">
            <BookOpen className="w-6 h-6 text-accent-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {activeLoanCount}
              <span className="text-lg text-gray-500">/{maxLoans}</span>
            </p>
            <p className="text-sm text-gray-400">Active Loans</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${overdueLoans.length > 0 ? 'bg-red-500/10' : 'bg-yellow-500/10'}`}>
            <AlertTriangle className={`w-6 h-6 ${overdueLoans.length > 0 ? 'text-red-400' : 'text-yellow-400'}`} />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{overdueLoans.length}</p>
            <p className="text-sm text-gray-400">Overdue</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-500/10">
            <CheckCircle className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{totalBooksRead}</p>
            <p className="text-sm text-gray-400">Books Read</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10">
            <TrendingUp className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{booksThisMonth}</p>
            <p className="text-sm text-gray-400">This Month</p>
          </div>
        </Card>
      </div>

      {/* Alerts Section */}
      {(overdueLoans.length > 0 || dueSoonLoans.length > 0) && (
        <div className="space-y-3 mb-8">
          {overdueLoans.length > 0 && (
            <Card className="border-red-500/50 bg-red-500/5">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <div>
                  <p className="text-red-400 font-medium">
                    {overdueLoans.length} book{overdueLoans.length > 1 ? 's are' : ' is'} overdue!
                  </p>
                  <p className="text-sm text-gray-400">
                    Please return {overdueLoans.map(l => l.book?.title).join(', ')} as soon as possible.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {dueSoonLoans.length > 0 && overdueLoans.length === 0 && (
            <Card className="border-yellow-500/50 bg-yellow-500/5">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <div>
                  <p className="text-yellow-400 font-medium">
                    {dueSoonLoans.length} book{dueSoonLoans.length > 1 ? 's are' : ' is'} due soon
                  </p>
                  <p className="text-sm text-gray-400">
                    Remember to return or renew before the due date.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Loan Capacity Indicator */}
      <Card className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-300">Borrowing Capacity</span>
          <span className="text-sm text-gray-400">
            {remainingSlots} slot{remainingSlots !== 1 ? 's' : ''} remaining
          </span>
        </div>
        <div className="h-3 bg-primary-800 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              remainingSlots === 0 
                ? 'bg-red-500' 
                : remainingSlots === 1 
                  ? 'bg-yellow-500' 
                  : 'bg-accent-500'
            }`}
            style={{ width: `${(activeLoanCount / maxLoans) * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          You can borrow up to {maxLoans} books at a time. Each loan period is 14 days.
        </p>
      </Card>

      {/* Active Loans */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-semibold text-white">
            Active Loans
            {activeLoans.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({activeLoans.length})
              </span>
            )}
          </h2>
          <Link to="/catalog">
            <Button variant="ghost" size="sm">
              Browse More
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
          </div>
        ) : activeLoans.length === 0 ? (
          <Card className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No active loans</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Start exploring our catalog to find your next great read. 
              You can borrow up to {maxLoans} books at a time!
            </p>
            <Link to="/catalog">
              <Button size="lg">
                <BookOpen className="w-5 h-5" />
                Browse Catalog
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeLoans
              .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
              .map((loan) => (
                <LoanCard key={loan.id} loan={loan} />
              ))}
          </div>
        )}
      </section>

      {/* Loan History */}
      {loanHistory.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-semibold text-white">
              Reading History
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({loanHistory.length} books)
              </span>
            </h2>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loanHistory.slice(0, 6).map((loan) => (
              <LoanCard key={loan.id} loan={loan} />
            ))}
          </div>
          
          {loanHistory.length > 6 && (
            <div className="text-center mt-6">
              <p className="text-gray-500 text-sm">
                And {loanHistory.length - 6} more books in your reading history
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  )
}

function LoanCard({ loan }: { loan: Loan }) {
  const isOverdue = loan.status !== 'returned' && new Date(loan.due_date) < new Date()
  const isReturned = loan.status === 'returned'

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getDaysRemaining = () => {
    const due = new Date(loan.due_date)
    const now = new Date()
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const daysRemaining = getDaysRemaining()

  return (
    <Link to={`/books/${loan.book_id}`}>
      <Card className={`h-full transition-all hover:-translate-y-1 group ${
        isOverdue 
          ? 'border-red-500/50 hover:border-red-500 bg-red-500/5' 
          : 'hover:border-primary-600'
      }`}>
        <div className="flex gap-4">
          {/* Book Cover */}
          <div className="w-20 h-28 bg-gradient-to-br from-primary-700 to-primary-800 rounded-lg flex-shrink-0 overflow-hidden shadow-lg">
            {loan.book?.cover_url ? (
              <img
                src={loan.book.cover_url}
                alt={loan.book.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-primary-600" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 flex flex-col">
            <h3 className="font-semibold text-white line-clamp-2 mb-1 group-hover:text-accent-400 transition-colors">
              {loan.book?.title}
            </h3>
            <p className="text-sm text-gray-400 mb-auto">{loan.book?.author?.name}</p>

            {/* Status Badge */}
            <div className="mt-3">
              {isReturned ? (
                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 text-xs text-green-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Returned {formatDate(loan.return_date!)}</span>
                </div>
              ) : isOverdue ? (
                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/20 text-xs text-red-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Overdue by {Math.abs(daysRemaining)} day{Math.abs(daysRemaining) !== 1 ? 's' : ''}</span>
                </div>
              ) : daysRemaining <= 3 ? (
                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-yellow-500/10 text-xs text-yellow-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Due in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary-700/50 text-xs text-gray-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Due {formatDate(loan.due_date)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
