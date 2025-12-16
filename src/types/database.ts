export interface Profile {
  id: string
  full_name: string
  role: 'admin' | 'member'
  created_at: string
}

export interface Author {
  id: number
  name: string
  bio: string | null
  created_at: string
}

export interface Category {
  id: number
  name: string
}

export interface Book {
  id: string
  title: string
  isbn: string
  author_id: number
  category_id: number
  total_copies: number
  available_copies: number
  cover_url: string | null
  description: string | null
  created_at: string
  // Joined fields
  author?: Author
  category?: Category
}

export interface Loan {
  id: string
  user_id: string
  book_id: string
  borrow_date: string
  due_date: string
  return_date: string | null
  status: 'active' | 'returned' | 'overdue'
  created_at: string
  // Joined fields
  book?: Book
  profile?: Profile
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      authors: {
        Row: Author
        Insert: Omit<Author, 'id' | 'created_at'>
        Update: Partial<Omit<Author, 'id' | 'created_at'>>
      }
      categories: {
        Row: Category
        Insert: Omit<Category, 'id'>
        Update: Partial<Omit<Category, 'id'>>
      }
      books: {
        Row: Book
        Insert: Omit<Book, 'id' | 'created_at' | 'author' | 'category'>
        Update: Partial<Omit<Book, 'id' | 'created_at' | 'author' | 'category'>>
      }
      loans: {
        Row: Loan
        Insert: Pick<Loan, 'user_id' | 'book_id'>
        Update: Partial<Pick<Loan, 'return_date' | 'status'>>
      }
    }
    Functions: {
      borrow_book: {
        Args: { p_book_id: string; p_user_id: string }
        Returns: { success: boolean; error?: string; loan_id?: string }
      }
      return_book: {
        Args: { p_loan_id: string }
        Returns: { success: boolean; error?: string }
      }
    }
  }
}

