import { useState, FormEvent } from 'react'
import { Button, Input, Select, Textarea } from '../ui'
import type { Book, Author, Category } from '../../types/database'

interface AddBookFormProps {
  authors: Author[]
  categories: Category[]
  onSubmit: (data: {
    title: string
    isbn: string
    author_id: number
    category_id: number
    total_copies: number
    cover_url?: string
    description?: string
  }) => Promise<Book | null>
  onSuccess?: () => void
}

export function AddBookForm({ authors, categories, onSubmit, onSuccess }: AddBookFormProps) {
  const [title, setTitle] = useState('')
  const [isbn, setIsbn] = useState('')
  const [authorId, setAuthorId] = useState<string>('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [totalCopies, setTotalCopies] = useState('1')
  const [coverUrl, setCoverUrl] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !isbn.trim() || !authorId || !categoryId) return

    setLoading(true)

    const book = await onSubmit({
      title: title.trim(),
      isbn: isbn.trim(),
      author_id: parseInt(authorId),
      category_id: parseInt(categoryId),
      total_copies: parseInt(totalCopies) || 1,
      cover_url: coverUrl.trim() || undefined,
      description: description.trim() || undefined,
    })

    setLoading(false)

    if (book) {
      // Reset form
      setTitle('')
      setIsbn('')
      setAuthorId('')
      setCategoryId('')
      setTotalCopies('1')
      setCoverUrl('')
      setDescription('')
      onSuccess?.()
    }
  }

  const isValid = 
    title.trim().length >= 1 && 
    isbn.trim().length >= 1 && 
    authorId && 
    categoryId &&
    parseInt(totalCopies) > 0

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          id="book-title"
          label="Title"
          placeholder="e.g., Pride and Prejudice"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={loading}
        />

        <Input
          id="book-isbn"
          label="ISBN"
          placeholder="e.g., 978-3-16-148410-0"
          value={isbn}
          onChange={(e) => setIsbn(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Select
          id="book-author"
          label="Author"
          value={authorId}
          onChange={(e) => setAuthorId(e.target.value)}
          required
          disabled={loading}
        >
          <option value="">Select an author...</option>
          {authors.map((author) => (
            <option key={author.id} value={author.id}>
              {author.name}
            </option>
          ))}
        </Select>

        <Select
          id="book-category"
          label="Category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
          disabled={loading}
        >
          <option value="">Select a category...</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          id="book-copies"
          label="Total Copies"
          type="number"
          min="1"
          value={totalCopies}
          onChange={(e) => setTotalCopies(e.target.value)}
          required
          disabled={loading}
        />

        <Input
          id="book-cover"
          label="Cover Image URL (optional)"
          type="url"
          placeholder="https://example.com/cover.jpg"
          value={coverUrl}
          onChange={(e) => setCoverUrl(e.target.value)}
          disabled={loading}
        />
      </div>

      <Textarea
        id="book-description"
        label="Description (optional)"
        placeholder="Brief description of the book..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        disabled={loading}
      />

      {/* Preview */}
      {coverUrl && (
        <div className="p-4 bg-primary-800/50 rounded-lg">
          <p className="text-xs text-gray-400 mb-2">Cover Preview</p>
          <img
            src={coverUrl}
            alt="Cover preview"
            className="w-24 h-32 object-cover rounded-lg"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="submit"
          loading={loading}
          disabled={!isValid}
        >
          Add Book
        </Button>
      </div>
    </form>
  )
}

