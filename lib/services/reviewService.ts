// lib/services/reviewService.ts
import { Review } from '@/types'
import { ID, Models, Query } from 'node-appwrite'

import {
  AGENTS_COLLECTION_ID,
  DATABASE_ID,
  PROPERTIES_COLLECTION_ID,
  REVIEWS_COLLECTION_ID,
  serverDatabases,
  USERS_COLLECTION_ID,
} from '@/lib/appwrite-server'

// Define document types for Appwrite responses
interface ReviewDocument extends Models.Document {
  reviewId: string
  propertyId?: string
  agentId?: string
  userId: string
  rating: number
  title: string
  comment: string
  isVerified: boolean
  userName?: string
  userAvatar?: string
  propertyTitle?: string
  agentName?: string
}

interface UserDocument extends Models.Document {
  name: string
  email: string
  avatar?: string
}

interface AgentDocument extends Models.Document {
  name: string
  agency: string
  avatar?: string
}

interface PropertyDocument extends Models.Document {
  title: string
  address: string
  images: string[]
}

export class ReviewService {
  private static isConfigured(): boolean {
    const essentials = [
      'NEXT_PUBLIC_APPWRITE_ENDPOINT',
      'NEXT_PUBLIC_APPWRITE_PROJECT_ID',
      'APPWRITE_API_KEY',
      'NEXT_PUBLIC_APPWRITE_DATABASE_ID',
    ]

    const missingEssentials = essentials.filter((key) => !process.env[key])

    if (missingEssentials.length > 0 && typeof window === 'undefined') {
      console.warn(
        '⚠️ Missing essential Appwrite configuration:',
        missingEssentials
      )
      return false
    }

    if (!process.env.NEXT_PUBLIC_APPWRITE_REVIEWS_TABLE_ID) {
      console.warn('⚠️ Reviews collection ID not configured')
      return false
    }

    return true
  }

  // Get reviews for a property with user relationships
  static async getPropertyReviews(propertyId: string): Promise<Review[]> {
    if (!this.isConfigured()) {
      console.warn('⚠️ Appwrite not configured, returning empty reviews array')
      return []
    }

    try {
      const response = await serverDatabases.listDocuments<ReviewDocument>(
        DATABASE_ID!,
        REVIEWS_COLLECTION_ID!,
        [
          Query.equal('propertyId', propertyId),
          Query.orderDesc('$createdAt'),
          Query.limit(50),
        ]
      )

      // Populate user data for each review
      const reviewsWithUsers = await Promise.all(
        response.documents.map(async (doc) => {
          let userData: UserDocument | null = null
          try {
            userData = await serverDatabases.getDocument<UserDocument>(
              DATABASE_ID!,
              USERS_COLLECTION_ID!,
              doc.userId
            )
          } catch {
            console.warn('Could not fetch user data for review:', doc.userId)
          }

          return {
            ...doc,
            user: userData
              ? {
                  $id: userData.$id,
                  name: userData.name,
                  email: userData.email,
                  avatar: userData.avatar,
                }
              : undefined,
          } as Review
        })
      )

      return reviewsWithUsers
    } catch (error) {
      console.error('Error fetching property reviews:', error)
      return []
    }
  }

  // Get reviews for an agent with user relationships
  static async getAgentReviews(agentId: string): Promise<Review[]> {
    if (!this.isConfigured()) {
      console.warn('⚠️ Appwrite not configured, returning empty reviews array')
      return []
    }

    try {
      const response = await serverDatabases.listDocuments<ReviewDocument>(
        DATABASE_ID!,
        REVIEWS_COLLECTION_ID!,
        [
          Query.equal('agentId', agentId),
          Query.orderDesc('$createdAt'),
          Query.limit(50),
        ]
      )

      // Populate user data for each review
      const reviewsWithUsers = await Promise.all(
        response.documents.map(async (doc) => {
          let userData: UserDocument | null = null
          try {
            userData = await serverDatabases.getDocument<UserDocument>(
              DATABASE_ID!,
              USERS_COLLECTION_ID!,
              doc.userId
            )
          } catch {
            console.warn('Could not fetch user data for review:', doc.userId)
          }

          return {
            ...doc,
            user: userData
              ? {
                  $id: userData.$id,
                  name: userData.name,
                  email: userData.email,
                  avatar: userData.avatar,
                }
              : undefined,
          } as Review
        })
      )

      return reviewsWithUsers
    } catch (error) {
      console.error('Error fetching agent reviews:', error)
      return []
    }
  }

  // Get user's reviews with agent/property relationships
  static async getUserReviews(userId: string): Promise<Review[]> {
    if (!this.isConfigured()) {
      console.warn('⚠️ Appwrite not configured, returning empty reviews array')
      return []
    }

    try {
      const response = await serverDatabases.listDocuments<ReviewDocument>(
        DATABASE_ID!,
        REVIEWS_COLLECTION_ID!,
        [
          Query.equal('userId', userId),
          Query.orderDesc('$createdAt'),
          Query.limit(50),
        ]
      )

      // Populate agent/property data for each review
      const reviewsWithRelations = await Promise.all(
        response.documents.map(async (doc) => {
          let agentData: AgentDocument | null = null
          let propertyData: PropertyDocument | null = null

          try {
            if (doc.agentId) {
              agentData = await serverDatabases.getDocument<AgentDocument>(
                DATABASE_ID!,
                AGENTS_COLLECTION_ID!,
                doc.agentId
              )
            }

            if (doc.propertyId) {
              propertyData =
                await serverDatabases.getDocument<PropertyDocument>(
                  DATABASE_ID!,
                  PROPERTIES_COLLECTION_ID!,
                  doc.propertyId
                )
            }
          } catch {
            console.warn(
              'Could not fetch relationship data for review:',
              doc.$id
            )
          }

          return {
            ...doc,
            agent: agentData
              ? {
                  $id: agentData.$id,
                  name: agentData.name,
                  agency: agentData.agency,
                  avatar: agentData.avatar,
                }
              : undefined,
            property: propertyData
              ? {
                  $id: propertyData.$id,
                  title: propertyData.title,
                  address: propertyData.address,
                  images: propertyData.images,
                }
              : undefined,
          } as Review
        })
      )

      return reviewsWithRelations
    } catch (error) {
      console.error('Error fetching user reviews:', error)
      return []
    }
  }

  // Create a new review with relationship validation
  static async createReview(reviewData: {
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
    if (!this.isConfigured()) {
      throw new Error(
        'Appwrite is not properly configured. Please check your environment variables.'
      )
    }

    try {
      // Validate that either propertyId or agentId is provided
      if (!reviewData.propertyId && !reviewData.agentId) {
        throw new Error('Either propertyId or agentId must be provided')
      }

      // Validate that the target exists
      if (reviewData.propertyId) {
        try {
          await serverDatabases.getDocument(
            DATABASE_ID!,
            PROPERTIES_COLLECTION_ID!,
            reviewData.propertyId
          )
        } catch {
          throw new Error('Property not found')
        }
      }

      if (reviewData.agentId) {
        try {
          await serverDatabases.getDocument(
            DATABASE_ID!,
            AGENTS_COLLECTION_ID!,
            reviewData.agentId
          )
        } catch {
          throw new Error('Agent not found')
        }
      }

      // Validate user exists
      try {
        await serverDatabases.getDocument(
          DATABASE_ID!,
          USERS_COLLECTION_ID!,
          reviewData.userId
        )
      } catch {
        throw new Error('User not found')
      }

      // Check if user has already reviewed this property/agent
      if (reviewData.propertyId) {
        const existingReview = await serverDatabases.listDocuments(
          DATABASE_ID!,
          REVIEWS_COLLECTION_ID!,
          [
            Query.equal('propertyId', reviewData.propertyId),
            Query.equal('userId', reviewData.userId),
          ]
        )
        if (existingReview.total > 0) {
          throw new Error('You have already reviewed this property')
        }
      }

      if (reviewData.agentId) {
        const existingReview = await serverDatabases.listDocuments(
          DATABASE_ID!,
          REVIEWS_COLLECTION_ID!,
          [
            Query.equal('agentId', reviewData.agentId),
            Query.equal('userId', reviewData.userId),
          ]
        )
        if (existingReview.total > 0) {
          throw new Error('You have already reviewed this agent')
        }
      }

      const review = await serverDatabases.createDocument<ReviewDocument>(
        DATABASE_ID!,
        REVIEWS_COLLECTION_ID!,
        ID.unique(),
        {
          reviewId: ID.unique(),
          ...reviewData,
          isVerified: false,
        }
      )

      // Update the target's stats after creating review
      await this.updateTargetStats(reviewData)

      return review as Review
    } catch (error) {
      console.error('Error creating review:', error)
      throw error
    }
  }

  // Update agent/property stats when review is created/updated/deleted
  private static async updateTargetStats(reviewData: {
    propertyId?: string
    agentId?: string
  }): Promise<void> {
    if (!this.isConfigured()) return

    try {
      if (reviewData.propertyId) {
        const stats = await this.getReviewStats(
          reviewData.propertyId,
          'property'
        )
        await serverDatabases.updateDocument(
          DATABASE_ID!,
          PROPERTIES_COLLECTION_ID!,
          reviewData.propertyId,
          {
            rating: stats.averageRating,
            reviewCount: stats.totalReviews,
          }
        )
      } else if (reviewData.agentId) {
        const stats = await this.getReviewStats(reviewData.agentId, 'agent')
        await serverDatabases.updateDocument(
          DATABASE_ID!,
          AGENTS_COLLECTION_ID!,
          reviewData.agentId,
          {
            rating: stats.averageRating,
            reviewCount: stats.totalReviews,
          }
        )
      }
    } catch (error) {
      console.error('Error updating target stats:', error)
    }
  }

  // Update a review
  static async updateReview(
    reviewId: string,
    updates: {
      rating?: number
      title?: string
      comment?: string
    }
  ): Promise<Review> {
    if (!this.isConfigured()) {
      throw new Error(
        'Appwrite is not properly configured. Please check your environment variables.'
      )
    }

    try {
      const review = await serverDatabases.updateDocument<ReviewDocument>(
        DATABASE_ID!,
        REVIEWS_COLLECTION_ID!,
        reviewId,
        updates
      )

      // Update the target's stats after updating review
      if (review.propertyId || review.agentId) {
        await this.updateTargetStats({
          propertyId: review.propertyId,
          agentId: review.agentId,
        })
      }

      return review as Review
    } catch (error) {
      console.error('Error updating review:', error)
      throw error
    }
  }

  // Delete a review and update stats
  static async deleteReview(reviewId: string): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error(
        'Appwrite is not properly configured. Please check your environment variables.'
      )
    }

    try {
      // Get the review first to know what to update
      const review = await serverDatabases.getDocument<ReviewDocument>(
        DATABASE_ID!,
        REVIEWS_COLLECTION_ID!,
        reviewId
      )

      await serverDatabases.deleteDocument(
        DATABASE_ID!,
        REVIEWS_COLLECTION_ID!,
        reviewId
      )

      // Update the target's stats after deleting review
      if (review.propertyId || review.agentId) {
        await this.updateTargetStats({
          propertyId: review.propertyId,
          agentId: review.agentId,
        })
      }
    } catch (error) {
      console.error('Error deleting review:', error)
      throw error
    }
  }

  // Get review statistics
  static async getReviewStats(
    targetId: string,
    type: 'property' | 'agent'
  ): Promise<{
    averageRating: number
    totalReviews: number
    ratingDistribution: { [key: number]: number }
  }> {
    if (!this.isConfigured()) {
      console.warn('⚠️ Appwrite not configured, returning default review stats')
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      }
    }

    try {
      const field = type === 'property' ? 'propertyId' : 'agentId'
      const reviews = await serverDatabases.listDocuments<ReviewDocument>(
        DATABASE_ID!,
        REVIEWS_COLLECTION_ID!,
        [Query.equal(field, targetId)]
      )

      if (reviews.total === 0) {
        return {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        }
      }

      const totalRating = reviews.documents.reduce(
        (sum, review) => sum + review.rating,
        0
      )
      const averageRating = totalRating / reviews.total

      const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      reviews.documents.forEach((review) => {
        const rating = review.rating as keyof typeof ratingDistribution
        ratingDistribution[rating]++
      })

      return {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: reviews.total,
        ratingDistribution,
      }
    } catch (error) {
      console.error('Error getting review stats:', error)
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      }
    }
  }

  // Get reviews with all relationships populated
  static async getDetailedReviews(filters: {
    propertyId?: string
    agentId?: string
    userId?: string
    limit?: number
  }): Promise<Review[]> {
    if (!this.isConfigured()) {
      return []
    }

    try {
      const queries = []

      if (filters.propertyId) {
        queries.push(Query.equal('propertyId', filters.propertyId))
      }
      if (filters.agentId) {
        queries.push(Query.equal('agentId', filters.agentId))
      }
      if (filters.userId) {
        queries.push(Query.equal('userId', filters.userId))
      }

      queries.push(Query.orderDesc('$createdAt'))
      queries.push(Query.limit(filters.limit || 20))

      const response = await serverDatabases.listDocuments<ReviewDocument>(
        DATABASE_ID!,
        REVIEWS_COLLECTION_ID!,
        queries
      )

      // Populate all relationships
      const detailedReviews = await Promise.all(
        response.documents.map(async (doc) => {
          let userData: UserDocument | null = null
          let agentData: AgentDocument | null = null
          let propertyData: PropertyDocument | null = null

          try {
            // Fetch user
            userData = await serverDatabases.getDocument<UserDocument>(
              DATABASE_ID!,
              USERS_COLLECTION_ID!,
              doc.userId
            )

            // Fetch agent if exists
            if (doc.agentId) {
              agentData = await serverDatabases.getDocument<AgentDocument>(
                DATABASE_ID!,
                AGENTS_COLLECTION_ID!,
                doc.agentId
              )
            }

            // Fetch property if exists
            if (doc.propertyId) {
              propertyData =
                await serverDatabases.getDocument<PropertyDocument>(
                  DATABASE_ID!,
                  PROPERTIES_COLLECTION_ID!,
                  doc.propertyId
                )
            }
          } catch {
            console.warn(
              'Could not fetch relationship data for review:',
              doc.$id
            )
          }

          return {
            ...doc,
            user: userData
              ? {
                  $id: userData.$id,
                  name: userData.name,
                  email: userData.email,
                  avatar: userData.avatar,
                }
              : undefined,
            agent: agentData
              ? {
                  $id: agentData.$id,
                  name: agentData.name,
                  agency: agentData.agency,
                  avatar: agentData.avatar,
                }
              : undefined,
            property: propertyData
              ? {
                  $id: propertyData.$id,
                  title: propertyData.title,
                  address: propertyData.address,
                  images: propertyData.images,
                }
              : undefined,
          } as Review
        })
      )

      return detailedReviews
    } catch (error) {
      console.error('Error fetching detailed reviews:', error)
      return []
    }
  }

  // Verify a review (admin function)
  static async verifyReview(reviewId: string): Promise<Review> {
    if (!this.isConfigured()) {
      throw new Error(
        'Appwrite is not properly configured. Please check your environment variables.'
      )
    }

    try {
      const review = await serverDatabases.updateDocument<ReviewDocument>(
        DATABASE_ID!,
        REVIEWS_COLLECTION_ID!,
        reviewId,
        { isVerified: true }
      )
      return review as Review
    } catch (error) {
      console.error('Error verifying review:', error)
      throw error
    }
  }

  // Check if user can review (has purchased/rented from agent or property)
  static async canUserReview(
    userId: string,
    targetId: string,
    type: 'property' | 'agent'
  ): Promise<{ canReview: boolean; reason?: string }> {
    if (!this.isConfigured()) {
      return { canReview: false, reason: 'System not configured' }
    }

    try {
      // Check if user has already reviewed
      const field = type === 'property' ? 'propertyId' : 'agentId'
      const existingReview = await serverDatabases.listDocuments(
        DATABASE_ID!,
        REVIEWS_COLLECTION_ID!,
        [Query.equal(field, targetId), Query.equal('userId', userId)]
      )

      if (existingReview.total > 0) {
        return {
          canReview: false,
          reason: 'You have already reviewed this ' + type,
        }
      }

      // Here you could add additional business logic, for example:
      // - Check if user has actually purchased/rented the property
      // - Check if user has worked with the agent
      // - Check if enough time has passed since the transaction

      // For now, we'll assume any authenticated user can review
      return { canReview: true }
    } catch (error) {
      console.error('Error checking if user can review:', error)
      return { canReview: false, reason: 'Error checking review eligibility' }
    }
  }
}
