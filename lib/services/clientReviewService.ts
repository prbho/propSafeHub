// lib/services/clientReviewService.ts
import { Review } from '@/types'

class ClientReviewService {
  private baseUrl = '/api/reviews'

  async getAgentReviews(agentId: string): Promise<Review[]> {
    try {
      const response = await fetch(`${this.baseUrl}?agentId=${agentId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch agent reviews')
      }

      const data = await response.json()
      return data.reviews || []
    } catch (error) {
      console.error('Error fetching agent reviews:', error)
      return []
    }
  }

  async getPropertyReviews(propertyId: string): Promise<Review[]> {
    try {
      const response = await fetch(`${this.baseUrl}?propertyId=${propertyId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch property reviews')
      }

      const data = await response.json()
      return data.reviews || []
    } catch (error) {
      console.error('Error fetching property reviews:', error)
      return []
    }
  }

  async getReviewStats(
    targetId: string,
    type: 'property' | 'agent'
  ): Promise<{
    averageRating: number
    totalReviews: number
    ratingDistribution: { [key: number]: number }
  }> {
    try {
      const response = await fetch(
        `/api/reviews/stats?targetId=${targetId}&type=${type}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch review stats')
      }

      const data = await response.json()
      return (
        data.stats || {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        }
      )
    } catch (error) {
      console.error('Error fetching review stats:', error)
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      }
    }
  }

  async createReview(reviewData: {
    propertyId?: string
    agentId?: string
    userId: string
    rating: number
    title: string
    comment: string
    userName: string
    userAvatar?: string
    propertyTitle?: string
    agentName?: string
  }): Promise<Review> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create review')
      }

      const data = await response.json()
      return data.review
    } catch (error) {
      console.error('Error creating review:', error)
      throw error
    }
  }

  async updateReview(
    reviewId: string,
    updates: {
      rating?: number
      title?: string
      comment?: string
    }
  ): Promise<Review> {
    try {
      const response = await fetch(`${this.baseUrl}/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update review')
      }

      const data = await response.json()
      return data.review
    } catch (error) {
      console.error('Error updating review:', error)
      throw error
    }
  }

  async deleteReview(reviewId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${reviewId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete review')
      }
    } catch (error) {
      console.error('Error deleting review:', error)
      throw error
    }
  }
}

export const clientReviewService = new ClientReviewService()
