'use client'

import { useState } from 'react'
import { Comment } from '@/types/comments'
import CommentForm from './CommentForm'
import { commentApi } from '@/lib/api/comments'

interface CommentListProps {
  comments: Comment[]
  toolId: number
  userToken?: string
  onCommentUpdate: () => void
}

interface CommentItemProps {
  comment: Comment
  toolId: number
  userToken?: string
  onCommentUpdate: () => void
}

function CommentItem({ comment, toolId, userToken, onCommentUpdate }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleEdit = async (data: { content: string }) => {
    if (!userToken) return

    try {
      await commentApi.updateComment(toolId, comment.id, data, userToken)
      setIsEditing(false)
      onCommentUpdate()
    } catch (error) {
      console.error('Error updating comment:', error)
      throw error
    }
  }

  const handleDelete = async () => {
    if (!userToken || !confirm('Are you sure you want to delete this comment?')) return

    try {
      setIsDeleting(true)
      await commentApi.deleteComment(toolId, comment.id, userToken)
      onCommentUpdate()
    } catch (error) {
      console.error('Error deleting comment:', error)
      setIsDeleting(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  return (
    <div className={`border-b border-gray-200 py-4 ${isDeleting ? 'opacity-50' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {comment.author.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-gray-900">{comment.author.name}</div>
            <div className="text-sm text-gray-500">{formatDate(comment.created_at)}</div>
          </div>
        </div>

        {userToken && (comment.can_edit || comment.can_delete) && (
          <div className="flex gap-2">
            {comment.can_edit && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                disabled={isDeleting}
                className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                Edit
              </button>
            )}
            {comment.can_delete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting || isEditing}
                className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <CommentForm
          initialValue={comment.content}
          onSubmit={handleEdit}
          submitLabel="Update Comment"
          onCancel={handleCancelEdit}
        />
      ) : (
        <div className="text-gray-700 whitespace-pre-wrap">{comment.content}</div>
      )}

      {comment.updated_at !== comment.created_at && !isEditing && (
        <div className="text-xs text-gray-400 mt-2">
          Edited {formatDate(comment.updated_at)}
        </div>
      )}
    </div>
  )
}

export default function CommentList({ comments, toolId, userToken, onCommentUpdate }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No comments yet. Be the first to share your thoughts!
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          toolId={toolId}
          userToken={userToken}
          onCommentUpdate={onCommentUpdate}
        />
      ))}
    </div>
  )
}