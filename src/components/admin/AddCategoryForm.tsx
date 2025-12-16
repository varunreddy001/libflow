import { useState, FormEvent } from 'react'
import { Button, Input } from '../ui'
import type { Category } from '../../types/database'

interface AddCategoryFormProps {
  onSubmit: (data: { name: string }) => Promise<Category | null>
  onSuccess?: () => void
}

export function AddCategoryForm({ onSubmit, onSuccess }: AddCategoryFormProps) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!name.trim()) return

    setLoading(true)

    const category = await onSubmit({
      name: name.trim(),
    })

    setLoading(false)

    if (category) {
      setName('')
      onSuccess?.()
    }
  }

  const isValid = name.trim().length >= 2

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="category-name"
        label="Category Name"
        placeholder="e.g., Science Fiction"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        minLength={2}
        disabled={loading}
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="submit"
          loading={loading}
          disabled={!isValid}
        >
          Add Category
        </Button>
      </div>
    </form>
  )
}

