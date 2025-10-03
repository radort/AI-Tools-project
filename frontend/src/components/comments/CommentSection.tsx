'use client'

import { useEffect, useState } from 'react'
import CommentForm from './CommentForm'
import CommentList from './CommentList'
import { commentApi } from '@/lib/api/comments'
import { Comment, CommentsResponse, CommentFormData } from '@/types/comments'

interface CommentSectionProps {
  toolId: number
  userToken?: string
}

export default function CommentSection({ toolId, userToken }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalComments, setTotalComments] = useState(0)

  useEffect(() => {
    fetchComments(1)
  }, [toolId])

  const fetchComments = async (page: number) => {
    try {
      setLoading(true)
      setError(null)

      const response: CommentsResponse = await commentApi.getComments(toolId, page)

      if (page === 1) {
        setComments(response.data)
      } else {
        setComments(prev => [...prev, ...response.data])
      }

      setCurrentPage(response.meta.current_page)
      setTotalPages(response.meta.last_page)
      setTotalComments(response.meta.total)
    } catch (err) {
      setError('Failed to load comments')
      console.error('Error fetching comments:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCommentSubmit = async (data: CommentFormData) => {
    if (!userToken) {
      setError('Please log in to post a comment')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      await commentApi.createComment(toolId, data, userToken)

      // Refresh comments to show the new one
      await fetchComments(1)
    } catch (err) {
      setError('Failed to post comment')
      console.error('Error creating comment:', err)
      throw err
    } finally {
      setSubmitting(false)
    }
  }

  const handleCommentUpdate = async () => {
    // Refresh comments when a comment is updated or deleted
    await fetchComments(1)
  }

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      fetchComments(currentPage + 1)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Comments ({totalComments})
        </h3>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Comment Form */}
      {userToken ? (
        <CommentForm
          onSubmit={handleCommentSubmit}
          isLoading={submitting}
        />
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-gray-600">Please log in to post a comment.</p>
        </div>
      )}

      {/* Comments List */}
      {loading && comments.length === 0 ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse border-b border-gray-200 py-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <CommentList
          comments={comments}
          toolId={toolId}
          userToken={userToken}
          onCommentUpdate={handleCommentUpdate}
        />
      )}

      {/* Load More Button */}
      {currentPage < totalPages && (
        <div className="text-center">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More Comments'}
          </button>
        </div>
      )}

      {comments.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          No comments yet. Be the first to share your thoughts!
        </div>
      )}
    </div>
  )
}