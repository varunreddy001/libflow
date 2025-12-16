import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, BookOpen, User as UserIcon, Tag } from 'lucide-react'
import { Input, Card, Button } from '../components/ui'
import { supabase } from '../lib/supabase'
import type { Book, Category, Author } from '../types/database'

export function Catalog() {
  const [books, setBooks] = useState<Book[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [selectedAuthor, setSelectedAuthor] = useState<number | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)

    const [booksRes, categoriesRes, authorsRes] = await Promise.all([
      supabase
        .from('books')
        .select('*, author:authors(*), category:categories(*)')
        .order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
      supabase.from('authors').select('*').order('name'),
    ])

    if (booksRes.data) setBooks(booksRes.data)
    if (categoriesRes.data) setCategories(categoriesRes.data)
    if (authorsRes.data) setAuthors(authorsRes.data)

    setLoading(false)
  }

  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || book.category_id === selectedCategory
    const matchesAuthor = !selectedAuthor || book.author_id === selectedAuthor
    return matchesSearch && matchesCategory && matchesAuthor
  })

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory(null)
    setSelectedAuthor(null)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">Browse Catalog</h1>
        <p className="text-gray-400">Discover your next favorite book from our collection</p>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <Input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <select
              value={selectedCategory ?? ''}
              onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
              className="w-full lg:w-48 pl-10 pr-4 py-2.5 bg-primary-900 border border-primary-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-500 appearance-none cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Author Filter */}
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <select
              value={selectedAuthor ?? ''}
              onChange={(e) => setSelectedAuthor(e.target.value ? Number(e.target.value) : null)}
              className="w-full lg:w-48 pl-10 pr-4 py-2.5 bg-primary-900 border border-primary-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-500 appearance-none cursor-pointer"
            >
              <option value="">All Authors</option>
              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </select>
          </div>

          {(searchTerm || selectedCategory || selectedAuthor) && (
            <Button variant="ghost" onClick={clearFilters}>
              <Filter className="w-4 h-4" />
              Clear
            </Button>
          )}
        </div>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-[3/4] bg-primary-800 rounded-lg mb-4" />
              <div className="h-4 bg-primary-800 rounded mb-2" />
              <div className="h-3 bg-primary-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filteredBooks.length === 0 ? (
        <Card className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No books found</h3>
          <p className="text-gray-400 mb-4">
            {searchTerm || selectedCategory || selectedAuthor
              ? 'Try adjusting your filters'
              : 'The catalog is empty. Check back later!'}
          </p>
          {(searchTerm || selectedCategory || selectedAuthor) && (
            <Button variant="secondary" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </Card>
      ) : (
        <>
          <p className="text-gray-400 text-sm mb-4">
            Showing {filteredBooks.length} book{filteredBooks.length !== 1 ? 's' : ''}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function BookCard({ book }: { book: Book }) {
  const isAvailable = book.available_copies > 0

  return (
    <Link to={`/books/${book.id}`} className="group">
      <Card className="h-full transition-all duration-300 group-hover:border-primary-600 group-hover:-translate-y-1">
        {/* Cover */}
        <div className="aspect-[3/4] bg-gradient-to-br from-primary-700 to-primary-800 rounded-lg mb-4 overflow-hidden relative">
          {book.cover_url ? (
            <img
              src={book.cover_url}
              alt={book.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-primary-600" />
            </div>
          )}

          {/* Availability Badge */}
          <div
            className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-medium ${
              isAvailable
                ? 'bg-green-500/90 text-white'
                : 'bg-red-500/90 text-white'
            }`}
          >
            {isAvailable ? `${book.available_copies} available` : 'Out of Stock'}
          </div>
        </div>

        {/* Info */}
        <h3 className="font-semibold text-white mb-1 line-clamp-2 group-hover:text-accent-400 transition-colors">
          {book.title}
        </h3>
        <p className="text-sm text-gray-400 mb-1">{book.author?.name}</p>
        <p className="text-xs text-gray-500">{book.category?.name}</p>
      </Card>
    </Link>
  )
}

