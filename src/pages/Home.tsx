import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Users, Clock, Sparkles, ChevronRight, Loader2 } from 'lucide-react'
import { Button, Card } from '../components/ui'
import { useRecentBooks } from '../hooks'
import type { Book } from '../types/database'

export function Home() {
  const { books: recentBooks, loading: booksLoading } = useRecentBooks(6)

  return (
    <div className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500/10 border border-accent-500/20 rounded-full text-accent-400 text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Modern Library Management</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white leading-tight mb-6">
            Discover, Borrow & 
            <span className="text-accent-400"> Explore</span> Books
          </h1>
          
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            LibFlow makes library management effortless. Browse thousands of books, 
            track your loans, and never miss a due date again.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/catalog">
              <Button size="lg" className="group">
                Browse Catalog
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="secondary" size="lg">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-16 bg-primary-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-display font-bold text-white mb-1">
                New Arrivals
              </h2>
              <p className="text-gray-400">Fresh additions to our collection</p>
            </div>
            <Link to="/catalog" className="group flex items-center gap-1 text-accent-400 hover:text-accent-300 transition-colors">
              View All
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {booksLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
            </div>
          ) : recentBooks.length === 0 ? (
            <Card className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No books available yet. Check back soon!</p>
            </Card>
          ) : (
            <div className="relative">
              {/* Horizontal Scroll Container */}
              <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                {recentBooks.map((book, index) => (
                  <NewArrivalCard key={book.id} book={book} index={index} />
                ))}
              </div>
              
              {/* Scroll hint gradient */}
              <div className="absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-l from-primary-950 to-transparent pointer-events-none hidden sm:block" />
            </div>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold text-white mb-4">
            Why LibFlow?
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            A modern library experience designed for readers and administrators alike.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={BookOpen}
            title="Vast Collection"
            description="Access thousands of books across every genre. From classics to the latest releases."
          />
          <FeatureCard
            icon={Clock}
            title="Track Your Loans"
            description="Never miss a due date. Get reminders and manage your borrowed books in one place."
          />
          <FeatureCard
            icon={Users}
            title="Easy Administration"
            description="Library staff can manage inventory, process returns, and track all loans effortlessly."
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard number="14" label="Day Loans" suffix=" days" />
            <StatCard number="3" label="Books at a Time" suffix=" max" />
            <StatCard number="0" label="Late Fees" prefix="$" />
            <StatCard number="24/7" label="Online Access" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent-600 to-accent-500 p-8 sm:p-12">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6bTAgMGMwLTItMi00LTItNHMtMiAyLTIgNCAyIDQgMiA0IDItMiAyLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          
          <div className="relative text-center">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-4">
              Ready to Start Reading?
            </h2>
            <p className="text-white/80 mb-6 max-w-lg mx-auto">
              Join LibFlow today and unlock access to our entire catalog. It's free to sign up!
            </p>
            <Link to="/signup">
              <Button variant="secondary" size="lg" className="bg-white text-accent-600 hover:bg-gray-100">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function NewArrivalCard({ book, index }: { book: Book; index: number }) {
  const isAvailable = book.available_copies > 0

  return (
    <Link 
      to={`/books/${book.id}`} 
      className="group flex-shrink-0 w-48 snap-start"
      style={{ 
        animationDelay: `${index * 100}ms`,
        animation: 'fadeInUp 0.5s ease-out forwards',
        opacity: 0,
      }}
    >
      <div className="relative aspect-[3/4] bg-gradient-to-br from-primary-700 to-primary-800 rounded-xl overflow-hidden mb-3 shadow-lg group-hover:shadow-xl group-hover:scale-[1.02] transition-all duration-300">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-primary-600" />
          </div>
        )}
        
        {/* Availability Badge */}
        <div
          className={`absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium ${
            isAvailable
              ? 'bg-green-500/90 text-white'
              : 'bg-red-500/90 text-white'
          }`}
        >
          {isAvailable ? 'Available' : 'Out'}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      
      <h3 className="font-medium text-white text-sm line-clamp-2 group-hover:text-accent-400 transition-colors">
        {book.title}
      </h3>
      <p className="text-xs text-gray-500 mt-1">{book.author?.name}</p>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Link>
  )
}

function FeatureCard({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: typeof BookOpen
  title: string
  description: string 
}) {
  return (
    <div className="card group hover:border-primary-600 transition-colors">
      <div className="w-12 h-12 rounded-xl bg-accent-500/10 flex items-center justify-center mb-4 group-hover:bg-accent-500/20 transition-colors">
        <Icon className="w-6 h-6 text-accent-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  )
}

function StatCard({ 
  number, 
  label, 
  prefix = '', 
  suffix = '' 
}: { 
  number: string
  label: string
  prefix?: string
  suffix?: string
}) {
  return (
    <div className="text-center">
      <p className="text-3xl sm:text-4xl font-display font-bold text-white mb-1">
        {prefix}{number}{suffix}
      </p>
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  )
}
