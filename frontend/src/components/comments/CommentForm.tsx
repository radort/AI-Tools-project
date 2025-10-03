'use client'

import { useState } from 'react'
import { CommentFormData } from '@/types/comments'

interface CommentFormProps {
  onSubmit: (data: CommentFormData) => Promise<void>
  initialValue?: string
  submitLabel?: string
  isLoading?: boolean
  onCancel?: () => void
}

export default function CommentForm({
  onSubmit,
  initialValue = '',
  submitLabel = 'Post Comment',
  isLoading = false,
  onCancel
}: CommentFormProps) {
  const [content, setContent] = useState(initialValue)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      setError('Comment content is required')
      return
    }

    if (content.length > 1000) {
      setError('Comment content cannot exceed 1000 characters')
      return
    }

    try {
      setError(null)
      await onSubmit({ content: content.trim() })

      // Only clear the form if it's a new comment (no initial value)
      if (!initialValue) {
        setContent('')
      }
    } catch (err) {
      setError('Failed to save comment')
      console.error('Error submitting comment:', err)
    }
  }

  const characterCount = content.length
  const isNearLimit = characterCount > 800
  const isOverLimit = characterCount > 1000

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
          Comment
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts about this tool..."
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical ${
            isOverLimit ? 'border-red-500' : 'border-gray-300'
          }`}
          rows={4}
          disabled={isLoading}
        />
        <div className={`text-right text-sm mt-1 ${
          isOverLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-gray-500'
        }`}>
          {characterCount}/1000
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading || !content.trim() || isOverLimit}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}