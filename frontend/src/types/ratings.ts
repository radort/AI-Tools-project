export interface Rater {
  id: number
  name: string
}

export interface Rating {
  id: number
  tool_id: number
  value: number
  rater: Rater
  created_at: string
  updated_at: string
  can_edit: boolean
}

export interface RatingFormData {
  value: number
}

export interface RatingDistribution {
  1: number
  2: number
  3: number
  4: number
  5: number
}

export interface RatingSummary {
  total_ratings: number
  average_rating: number
  rating_distribution: RatingDistribution
  ratings: Rating[]
}

export interface RatingsResponse {
  data: RatingSummary
}

export interface RatingResponse {
  data: Rating | null
  message?: string
}