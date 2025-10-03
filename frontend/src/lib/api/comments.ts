import { CommentFormData, CommentsResponse, CommentResponse } from '@/types/comments'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201/api'

export const commentApi = {
  // Get comments for a tool
  getComments: async (toolId: number, page = 1): Promise<CommentsResponse> => {
    const response = await fetch(`${API_BASE}/tools/${toolId}/comments?page=${page}`)
    if (!response.ok) {
      throw new Error('Failed to fetch comments')
    }
    return response.json()
  },

  // Create a new comment
  createComment: async (toolId: number, data: CommentFormData, token: string): Promise<CommentResponse> => {
    const response = await fetch(`${API_BASE}/tools/${toolId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error('Failed to create comment')
    }
    return response.json()
  },

  // Update a comment
  updateComment: async (toolId: number, commentId: number, data: CommentFormData, token: string): Promise<CommentResponse> => {
    const response = await fetch(`${API_BASE}/tools/${toolId}/comments/${commentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error('Failed to update comment')
    }
    return response.json()
  },

  // Delete a comment
  deleteComment: async (toolId: number, commentId: number, token: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/tools/${toolId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      throw new Error('Failed to delete comment')
    }
  },

  // Get a specific comment
  getComment: async (toolId: number, commentId: number): Promise<CommentResponse> => {
    const response = await fetch(`${API_BASE}/tools/${toolId}/comments/${commentId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch comment')
    }
    return response.json()
  },
}