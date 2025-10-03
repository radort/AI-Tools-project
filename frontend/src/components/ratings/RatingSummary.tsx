'use client'

import { useEffect, useState } from 'react'
import StarRating from './StarRating'
import { ratingApi } from '@/lib/api/ratings'
import { RatingSummary as RatingSummaryType, RatingFormData } from '@/types/ratings'

interface RatingSummaryProps {
  toolId: number
  userToken?: string
}

export default function RatingSummary({ toolId, userToken }: RatingSummaryProps) {
  const [summary, setSummary] = useState<RatingSummaryType | null>(null)
  const [userRating, setUserRating] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [toolId])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch rating summary
      const summaryResponse = await ratingApi.getRatings(toolId)
      setSummary(summaryResponse.data)

      // Fetch user's rating if authenticated
      if (userToken) {
        try {
          const userRatingResponse = await ratingApi.getMyRating(toolId, userToken)
          setUserRating(userRatingResponse.data?.value || 0)
        } catch (err) {
          // User hasn't rated yet, which is fine
          setUserRating(0)
        }
      }
    } catch (err) {
      setError('Failed to load ratings')
      console.error('Error fetching ratings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRatingSubmit = async (value: number) => {
    if (!userToken) {
      setError('Please log in to rate this tool')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const data: RatingFormData = { value }
      await ratingApi.submitRating(toolId, data, userToken)

      setUserRating(value)
      // Refresh the summary to get updated data
      await fetchData()
    } catch (err) {
      setError('Failed to submit rating')
      console.error('Error submitting rating:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRatingDelete = async () => {
    if (!userToken) return

    try {
      setSubmitting(true)
      setError(null)

      await ratingApi.deleteRating(toolId, userToken)

      setUserRating(0)
      // Refresh the summary to get updated data
      await fetchData()
    } catch (err) {
      setError('Failed to delete rating')
      console.error('Error deleting rating:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    )
  }

  if (!summary) {
    return <div className="text-gray-500">No ratings available</div>
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Overall Rating */}
      <div className="flex items-center gap-4">
        <div className="text-3xl font-bold">
          {summary.average_rating.toFixed(1)}
        </div>
        <div>
          <StarRating value={summary.average_rating} readonly showValue={false} />
          <div className="text-sm text-gray-600">
            {summary.total_ratings} {summary.total_ratings === 1 ? 'rating' : 'ratings'}
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      {summary.total_ratings > 0 && (
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = summary.rating_distribution[stars as keyof typeof summary.rating_distribution]
            const percentage = summary.total_ratings > 0 ? (count / summary.total_ratings) * 100 : 0

            return (
              <div key={stars} className="flex items-center gap-2 text-sm">
                <span className="w-4">{stars}</span>
                <svg className="w-4 h-4 text-yellow-400 fill-current">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="w-8 text-gray-600">{count}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* User Rating Section */}
      {userToken && (
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Your Rating</h4>
          <div className="flex items-center gap-4">
            <StarRating
              value={userRating}
              onChange={handleRatingSubmit}
              readonly={submitting}
            />
            {userRating > 0 && (
              <button
                onClick={handleRatingDelete}
                disabled={submitting}
                className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
              >
                Remove rating
              </button>
            )}
          </div>
          {submitting && (
            <div className="text-sm text-gray-500 mt-1">Updating...</div>
          )}
        </div>
      )}
    </div>
  )
}