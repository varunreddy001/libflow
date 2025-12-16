import { useState, FormEvent } from 'react'
import { Button, Input, Textarea } from '../ui'
import type { Author } from '../../types/database'

interface AddAuthorFormProps {
  onSubmit: (data: { name: string; bio?: string }) => Promise<Author | null>
  onSuccess?: () => void
}

export function AddAuthorForm({ onSubmit, onSuccess }: AddAuthorFormProps) {
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!name.trim()) return

    setLoading(true)

    const author = await onSubmit({
      name: name.trim(),
      bio: bio.trim() || undefined,
    })

    setLoading(false)

    if (author) {
      setName('')
      setBio('')
      onSuccess?.()
    }
  }

  const isValid = name.trim().length >= 2

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="author-name"
        label="Author Name"
        placeholder="e.g., Jane Austen"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        minLength={2}
        disabled={loading}
      />

      <Textarea
        id="author-bio"
        label="Biography (optional)"
        placeholder="Brief biography of the author..."
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        rows={3}
        disabled={loading}
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="submit"
          loading={loading}
          disabled={!isValid}
        >
          Add Author
        </Button>
      </div>
    </form>
  )
}

