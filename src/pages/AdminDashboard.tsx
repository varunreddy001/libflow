import { useState, useEffect, useMemo } from 'react'
import { 
  BookOpen, Users, ArrowUpDown, CheckCircle, Plus, Search, 
  User, Tag, Trash2, Loader2, AlertTriangle, Clock, Filter,
  RefreshCw, Calendar
} from 'lucide-react'
import { Card, Button, Input, Modal } from '../components/ui'
import { AddAuthorForm, AddCategoryForm, AddBookForm } from '../components/admin'
import { useBooks, useAuthors, useCategories } from '../hooks'
import { loansService } from '../services/loans'
import { supabase } from '../lib/supabase'
import { useToast } from '../contexts/ToastContext'
import type { Loan } from '../types/database'

type Tab = 'overview' | 'loans' | 'inventory' | 'authors' | 'categories'
type LoanFilter = 'all' | 'active' | 'overdue' | 'returned'

export function AdminDashboard() {
  const { addToast } = useToast()
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [stats, setStats] = useState({ books: 0, activeLoans: 0, overdueLoans: 0, members: 0 })
  const [loans, setLoans] = useState<Loan[]>([])
  const [loansLoading, setLoansLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [loanSearchTerm, setLoanSearchTerm] = useState('')
  const [loanFilter, setLoanFilter] = useState<LoanFilter>('active')
  const [returningLoanId, setReturningLoanId] = useState<string | null>(null)

  // Modal states
  const [showAddAuthor, setShowAddAuthor] = useState(false)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showAddBook, setShowAddBook] = useState(false)

  // Use hooks for data management
  const { books, loading: booksLoading, refresh: refreshBooks, createBook, deleteBook } = useBooks()
  const { authors, loading: authorsLoading, refresh: refreshAuthors, createAuthor, deleteAuthor } = useAuthors()
  const { categories, loading: categoriesLoading, refresh: refreshCategories, createCategory, deleteCategory } = useCategories()

  useEffect(() => {
    fetchLoansAndStats()
  }, [])

  // Update stats when books change
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      books: books.length,
    }))
  }, [books])

  const fetchLoansAndStats = async () => {
    setLoansLoading(true)

    const [loansRes, profilesRes] = await Promise.all([
      supabase
        .from('loans')
        .select('*, book:books(*, author:authors(*)), profile:profiles(*)')
        .order('created_at', { ascending: false }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'member'),
    ])

    if (loansRes.data) {
      setLoans(loansRes.data)
      const activeCount = loansRes.data.filter((l) => l.status === 'active' || l.status === 'overdue').length
      const overdueCount = loansRes.data.filter((l) => 
        (l.status === 'active' || l.status === 'overdue') && new Date(l.due_date) < new Date()
      ).length
      setStats(prev => ({
        ...prev,
        activeLoans: activeCount,
        overdueLoans: overdueCount,
      }))
    }

    setStats(prev => ({
      ...prev,
      members: profilesRes.count || 0,
    }))

    setLoansLoading(false)
  }

  const handleReturnBook = async (loanId: string) => {
    setReturningLoanId(loanId)
    
    const result = await loansService.returnBook(loanId)

    if (!result.success) {
      addToast(result.error || 'Failed to process return', 'error')
      setReturningLoanId(null)
      return
    }

    addToast('Book returned successfully!', 'success')
    await fetchLoansAndStats()
    refreshBooks()
    setReturningLoanId(null)
  }

  const handleDeleteAuthor = async (id: number) => {
    if (confirm('Are you sure you want to delete this author? This cannot be undone.')) {
      await deleteAuthor(id)
    }
  }

  const handleDeleteCategory = async (id: number) => {
    if (confirm('Are you sure you want to delete this category? This cannot be undone.')) {
      await deleteCategory(id)
    }
  }

  const handleDeleteBook = async (id: string) => {
    if (confirm('Are you sure you want to delete this book? This cannot be undone.')) {
      await deleteBook(id)
    }
  }

  // Filter loans based on search and filter
  const filteredLoans = useMemo(() => {
    return loans.filter((loan) => {
      // Apply status filter
      const now = new Date()
      const isOverdue = new Date(loan.due_date) < now && loan.status !== 'returned'
      
      if (loanFilter === 'active' && (loan.status === 'returned' || isOverdue)) return false
      if (loanFilter === 'overdue' && !isOverdue) return false
      if (loanFilter === 'returned' && loan.status !== 'returned') return false

      // Apply search filter
      if (loanSearchTerm) {
        const search = loanSearchTerm.toLowerCase()
        const matchesBook = loan.book?.title?.toLowerCase().includes(search)
        const matchesMember = loan.profile?.full_name?.toLowerCase().includes(search)
        const matchesAuthor = loan.book?.author?.name?.toLowerCase().includes(search)
        return matchesBook || matchesMember || matchesAuthor
      }

      return true
    })
  }, [loans, loanFilter, loanSearchTerm])

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'loans', label: 'Loan Manager', badge: stats.overdueLoans > 0 ? stats.overdueLoans : undefined },
    { id: 'inventory', label: 'Books' },
    { id: 'authors', label: 'Authors' },
    { id: 'categories', label: 'Categories' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-400">Manage inventory, track loans, and oversee library operations</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-primary-800 pb-px overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors relative whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab.id
                ? 'text-accent-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
            {tab.badge && (
              <span className="px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                {tab.badge}
              </span>
            )}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-400" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <OverviewTab 
          stats={stats} 
          loans={loans} 
          loading={loansLoading}
          onReturnBook={handleReturnBook}
          returningLoanId={returningLoanId}
        />
      )}

      {activeTab === 'loans' && (
        <LoanManagerTab
          loans={filteredLoans}
          loading={loansLoading}
          searchTerm={loanSearchTerm}
          onSearchChange={setLoanSearchTerm}
          filter={loanFilter}
          onFilterChange={setLoanFilter}
          onReturn={handleReturnBook}
          onRefresh={fetchLoansAndStats}
          returningLoanId={returningLoanId}
          stats={{ active: stats.activeLoans, overdue: stats.overdueLoans }}
        />
      )}

      {activeTab === 'inventory' && (
        <InventoryTab
          books={filteredBooks}
          loading={booksLoading}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onAddClick={() => setShowAddBook(true)}
          onDelete={handleDeleteBook}
        />
      )}

      {activeTab === 'authors' && (
        <AuthorsTab
          authors={authors}
          loading={authorsLoading}
          onAddClick={() => setShowAddAuthor(true)}
          onDelete={handleDeleteAuthor}
        />
      )}

      {activeTab === 'categories' && (
        <CategoriesTab
          categories={categories}
          loading={categoriesLoading}
          onAddClick={() => setShowAddCategory(true)}
          onDelete={handleDeleteCategory}
        />
      )}

      {/* Modals */}
      <Modal
        isOpen={showAddAuthor}
        onClose={() => setShowAddAuthor(false)}
        title="Add New Author"
      >
        <AddAuthorForm
          onSubmit={createAuthor}
          onSuccess={() => {
            setShowAddAuthor(false)
            refreshAuthors()
          }}
        />
      </Modal>

      <Modal
        isOpen={showAddCategory}
        onClose={() => setShowAddCategory(false)}
        title="Add New Category"
        size="sm"
      >
        <AddCategoryForm
          onSubmit={createCategory}
          onSuccess={() => {
            setShowAddCategory(false)
            refreshCategories()
          }}
        />
      </Modal>

      <Modal
        isOpen={showAddBook}
        onClose={() => setShowAddBook(false)}
        title="Add New Book"
        size="lg"
      >
        {authors.length === 0 || categories.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">
              You need to add at least one author and one category before adding books.
            </p>
            <div className="flex justify-center gap-3">
              {authors.length === 0 && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowAddBook(false)
                    setShowAddAuthor(true)
                  }}
                >
                  Add Author First
                </Button>
              )}
              {categories.length === 0 && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowAddBook(false)
                    setShowAddCategory(true)
                  }}
                >
                  Add Category First
                </Button>
              )}
            </div>
          </div>
        ) : (
          <AddBookForm
            authors={authors}
            categories={categories}
            onSubmit={createBook}
            onSuccess={() => {
              setShowAddBook(false)
              refreshBooks()
            }}
          />
        )}
      </Modal>
    </div>
  )
}

// ============================================
// Overview Tab
// ============================================
function OverviewTab({ 
  stats, 
  loans, 
  loading,
  onReturnBook,
  returningLoanId
}: { 
  stats: { books: number; activeLoans: number; overdueLoans: number; members: number }
  loans: Loan[]
  loading: boolean
  onReturnBook: (id: string) => void
  returningLoanId: string | null
}) {
  const recentLoans = loans.slice(0, 5)
  const overdueLoans = loans.filter(l => 
    l.status !== 'returned' && new Date(l.due_date) < new Date()
  ).slice(0, 3)

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-accent-500/10">
            <BookOpen className="w-6 h-6 text-accent-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats.books}</p>
            <p className="text-sm text-gray-400">Total Books</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10">
            <ArrowUpDown className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats.activeLoans}</p>
            <p className="text-sm text-gray-400">Active Loans</p>
          </div>
        </Card>

        <Card className={`flex items-center gap-4 ${stats.overdueLoans > 0 ? 'border-red-500/50' : ''}`}>
          <div className={`p-3 rounded-xl ${stats.overdueLoans > 0 ? 'bg-red-500/10' : 'bg-yellow-500/10'}`}>
            <AlertTriangle className={`w-6 h-6 ${stats.overdueLoans > 0 ? 'text-red-400' : 'text-yellow-400'}`} />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats.overdueLoans}</p>
            <p className="text-sm text-gray-400">Overdue</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-500/10">
            <Users className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats.members}</p>
            <p className="text-sm text-gray-400">Members</p>
          </div>
        </Card>
      </div>

      {/* Overdue Alert */}
      {overdueLoans.length > 0 && (
        <Card className="border-red-500/50 bg-red-500/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h3 className="font-semibold text-red-400">Overdue Books Requiring Attention</h3>
            </div>
          </div>
          <div className="space-y-2">
            {overdueLoans.map((loan) => (
              <div key={loan.id} className="flex items-center justify-between py-2 border-b border-red-500/20 last:border-0">
                <div>
                  <p className="text-white font-medium">{loan.book?.title}</p>
                  <p className="text-sm text-gray-400">
                    {loan.profile?.full_name} • Due {new Date(loan.due_date).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onReturnBook(loan.id)}
                  loading={returningLoanId === loan.id}
                >
                  Mark Returned
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-display font-semibold text-white mb-4">Recent Activity</h2>
        {loading ? (
          <Card className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-accent-500" />
          </Card>
        ) : recentLoans.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-gray-400">No recent activity</p>
          </Card>
        ) : (
          <Card className="divide-y divide-primary-800">
            {recentLoans.map((loan) => {
              const isOverdue = loan.status !== 'returned' && new Date(loan.due_date) < new Date()
              return (
                <div key={loan.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-800 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{loan.book?.title}</p>
                      <p className="text-sm text-gray-400">
                        {loan.status === 'returned' ? 'Returned by' : 'Borrowed by'} {loan.profile?.full_name}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      loan.status === 'returned'
                        ? 'bg-green-500/10 text-green-400'
                        : isOverdue
                        ? 'bg-red-500/10 text-red-400'
                        : 'bg-blue-500/10 text-blue-400'
                    }`}
                  >
                    {loan.status === 'returned' ? 'Returned' : isOverdue ? 'Overdue' : 'Active'}
                  </span>
                </div>
              )
            })}
          </Card>
        )}
      </div>
    </div>
  )
}

// ============================================
// Loan Manager Tab
// ============================================
function LoanManagerTab({
  loans,
  loading,
  searchTerm,
  onSearchChange,
  filter,
  onFilterChange,
  onReturn,
  onRefresh,
  returningLoanId,
  stats
}: {
  loans: Loan[]
  loading: boolean
  searchTerm: string
  onSearchChange: (value: string) => void
  filter: LoanFilter
  onFilterChange: (filter: LoanFilter) => void
  onReturn: (id: string) => void
  onRefresh: () => void
  returningLoanId: string | null
  stats: { active: number; overdue: number }
}) {
  const filters: { id: LoanFilter; label: string; count?: number }[] = [
    { id: 'all', label: 'All Loans' },
    { id: 'active', label: 'Active', count: stats.active - stats.overdue },
    { id: 'overdue', label: 'Overdue', count: stats.overdue },
    { id: 'returned', label: 'Returned' },
  ]

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => onFilterChange(f.id)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                filter === f.id
                  ? 'bg-accent-500 text-white'
                  : 'bg-primary-800 text-gray-300 hover:bg-primary-700'
              }`}
            >
              {f.label}
              {f.count !== undefined && f.count > 0 && (
                <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                  filter === f.id ? 'bg-white/20' : 'bg-primary-700'
                }`}>
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search by book, member..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 py-2 text-sm"
            />
          </div>
          <Button variant="ghost" size="sm" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Loans Table */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-accent-500" />
          </div>
        ) : loans.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-400">
              {filter === 'overdue' 
                ? 'No overdue loans. Great!' 
                : filter === 'active'
                ? 'No active loans right now.'
                : 'No loans found matching your criteria.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Book</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Member</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Borrowed</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Due Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => {
                  const isOverdue = loan.status !== 'returned' && new Date(loan.due_date) < new Date()
                  const daysOverdue = isOverdue 
                    ? Math.ceil((new Date().getTime() - new Date(loan.due_date).getTime()) / (1000 * 60 * 60 * 24))
                    : 0

                  return (
                    <tr key={loan.id} className={`border-b border-primary-800 last:border-0 ${
                      isOverdue ? 'bg-red-500/5' : ''
                    }`}>
                      <td className="py-3 px-4">
                        <p className="text-white font-medium">{loan.book?.title}</p>
                        <p className="text-sm text-gray-400">{loan.book?.author?.name}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-gray-300">{loan.profile?.full_name}</p>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-sm">
                        {new Date(loan.borrow_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className={isOverdue ? 'text-red-400' : 'text-gray-300'}>
                            {new Date(loan.due_date).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {loan.status === 'returned' ? (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400">
                            <CheckCircle className="w-3 h-3" />
                            Returned
                          </span>
                        ) : isOverdue ? (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-400">
                            <AlertTriangle className="w-3 h-3" />
                            {daysOverdue}d overdue
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-400">
                            <Clock className="w-3 h-3" />
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {loan.status !== 'returned' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onReturn(loan.id)}
                            loading={returningLoanId === loan.id}
                          >
                            Mark Returned
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Summary */}
      <p className="text-sm text-gray-500 text-center">
        Showing {loans.length} loan{loans.length !== 1 ? 's' : ''}
      </p>
    </div>
  )
}

// ============================================
// Inventory Tab
// ============================================
function InventoryTab({ 
  books, 
  loading, 
  searchTerm, 
  onSearchChange, 
  onAddClick,
  onDelete
}: { 
  books: ReturnType<typeof useBooks>['books']
  loading: boolean
  searchTerm: string
  onSearchChange: (value: string) => void
  onAddClick: () => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <Input
            type="text"
            placeholder="Search by title or author..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={onAddClick}>
          <Plus className="w-4 h-4" />
          Add Book
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-accent-500" />
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">
              {searchTerm ? 'No books match your search' : 'No books in inventory. Add your first book!'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Title</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Author</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">ISBN</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Available</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.id} className="border-b border-primary-800 last:border-0">
                    <td className="py-3 px-4 text-white font-medium">{book.title}</td>
                    <td className="py-3 px-4 text-gray-300">{book.author?.name}</td>
                    <td className="py-3 px-4 text-gray-300">{book.category?.name}</td>
                    <td className="py-3 px-4 text-gray-400 font-mono text-sm">{book.isbn}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-sm font-medium ${
                          book.available_copies > 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {book.available_copies}/{book.total_copies}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(book.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

// ============================================
// Authors Tab
// ============================================
function AuthorsTab({ 
  authors, 
  loading, 
  onAddClick,
  onDelete
}: { 
  authors: ReturnType<typeof useAuthors>['authors']
  loading: boolean
  onAddClick: () => void
  onDelete: (id: number) => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={onAddClick}>
          <Plus className="w-4 h-4" />
          Add Author
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-accent-500" />
          </div>
        ) : authors.length === 0 ? (
          <div className="text-center py-8">
            <User className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No authors yet. Add your first author!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Biography</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Added</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {authors.map((author) => (
                  <tr key={author.id} className="border-b border-primary-800 last:border-0">
                    <td className="py-3 px-4 text-white font-medium">{author.name}</td>
                    <td className="py-3 px-4 text-gray-400 max-w-xs truncate">
                      {author.bio || <span className="italic text-gray-600">No bio</span>}
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-sm">
                      {new Date(author.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(author.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

// ============================================
// Categories Tab
// ============================================
function CategoriesTab({ 
  categories, 
  loading, 
  onAddClick,
  onDelete
}: { 
  categories: ReturnType<typeof useCategories>['categories']
  loading: boolean
  onAddClick: () => void
  onDelete: (id: number) => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={onAddClick}>
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-accent-500" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8">
            <Tag className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No categories yet. Add your first category!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <div 
                key={category.id} 
                className="flex items-center justify-between p-4 bg-primary-800/50 rounded-lg border border-primary-700"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent-500/10">
                    <Tag className="w-4 h-4 text-accent-400" />
                  </div>
                  <span className="text-white font-medium">{category.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(category.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
