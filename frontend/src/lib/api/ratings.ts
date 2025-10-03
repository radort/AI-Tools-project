import { RatingFormData, RatingsResponse, RatingResponse } from '@/types/ratings'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201/api'

export const ratingApi = {
  // Get rating summary for a tool
  getRatings: async (toolId: number): Promise<RatingsResponse> => {
    const response = await fetch(`${API_BASE}/tools/${toolId}/ratings`)
    if (!response.ok) {
      throw new Error('Failed to fetch ratings')
    }
    return response.json()
  },

  // Submit or update a rating
  submitRating: async (toolId: number, data: RatingFormData, token: string): Promise<RatingResponse> => {
    const response = await fetch(`${API_BASE}/tools/${toolId}/ratings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error('Failed to submit rating')
    }
    return response.json()
  },

  // Get current user's rating for a tool
  getMyRating: async (toolId: number, token: string): Promise<RatingResponse> => {
    const response = await fetch(`${API_BASE}/tools/${toolId}/my-rating`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      throw new Error('Failed to fetch user rating')
    }
    return response.json()
  },

  // Delete current user's rating
  deleteRating: async (toolId: number, token: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/tools/${toolId}/my-rating`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      throw new Error('Failed to delete rating')
    }
  },
}