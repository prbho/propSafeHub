// components/reviews/ReviewsSection.tsx - Updated to use client-side service
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Review } from '@/types'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

import { clientReviewService } from '@/lib/services/clientReviewService'

import ReviewForm from './ReviewForm'
import ReviewsList from './ReviewsList'
import ReviewStats from './ReviewStats'

interface ReviewsSectionProps {
  targetId: string
  targetType: 'property' | 'agent'
  targetName: string
}

export default function ReviewsSection({
  targetId,
  targetType,
  targetName,
}: ReviewsSectionProps) {
  const { user } = useAuth()
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as {
      [key: number]: number
    },
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadReviews()
    loadReviewStats()
  }, [targetId, targetType])

  const loadReviews = async () => {
    try {
      setIsLoading(true)
      let fetchedReviews: Review[] = []

      if (targetType === 'agent') {
        fetchedReviews = await clientReviewService.getAgentReviews(targetId)
      } else {
        fetchedReviews = await clientReviewService.getPropertyReviews(targetId)
      }

      setReviews(fetchedReviews)
    } catch (error) {
      console.error('Error loading reviews:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadReviewStats = async () => {
    try {
      const stats = await clientReviewService.getReviewStats(
        targetId,
        targetType
      )
      setReviewStats(stats)
    } catch (error) {
      console.error('Error loading review stats:', error)
    }
  }

  const userReview = user
    ? reviews.find((review) => review.userId === user.$id)
    : undefined

  const handleSubmitReview = async (data: {
    rating: number
    title: string
    comment: string
  }) => {
    if (!user) {
      toast.error('Please sign in to submit a review')
      return
    }

    setIsSubmitting(true)
    try {
      const reviewData = {
        ...data,
        userId: user.$id,
        userName: user.name,
        userAvatar: user.avatar,
        ...(targetType === 'property'
          ? { propertyId: targetId, propertyTitle: targetName }
          : { agentId: targetId, agentName: targetName }),
      }

      if (editingReview) {
        // Update existing review
        const updatedReview = await clientReviewService.updateReview(
          editingReview.$id,
          data
        )
        setReviews((prev) =>
          prev.map((r) => (r.$id === updatedReview.$id ? updatedReview : r))
        )
        setEditingReview(null)
      } else {
        // Create new review
        const newReview = await clientReviewService.createReview(reviewData)
        setReviews((prev) => [newReview, ...prev])
        setShowReviewForm(false)
      }

      // Reload stats after creating/updating review
      await loadReviewStats()
    } catch {
      toast.error('Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditReview = (review: Review) => {
    setEditingReview(review)
    setShowReviewForm(true)
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return

    try {
      await clientReviewService.deleteReview(reviewId)
      setReviews((prev) => prev.filter((r) => r.$id !== reviewId))

      // Reload stats after deleting review
      await loadReviewStats()
    } catch {
      toast.error('Failed to delete review')
    }
  }

  const canModify = (review: Review) => {
    return user?.$id === review.userId
  }

  if (isLoading) {
    return (
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
          <p className="text-gray-600 mt-1">
            See what others are saying about this {targetType}
          </p>
        </div>

        {user && !userReview && !showReviewForm && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Write a Review
          </button>
        )}
      </div>

      {/* Review Stats */}
      <ReviewStats stats={reviewStats} />

      {/* Review Form */}
      {(showReviewForm || editingReview) && (
        <div className="mb-8">
          <ReviewForm
            onSubmit={handleSubmitReview}
            onCancel={() => {
              setShowReviewForm(false)
              setEditingReview(null)
            }}
            initialData={
              editingReview
                ? {
                    rating: editingReview.rating,
                    title: editingReview.title,
                    comment: editingReview.comment,
                  }
                : undefined
            }
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* User's Existing Review */}
      {userReview && !editingReview && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">Your Review</h3>
              <p className="text-blue-700 text-sm">
                You&apos;ve already reviewed this {targetType}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEditReview(userReview)}
                className="text-emerald-600 hover:text-blue-700 text-sm font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteReview(userReview.$id)}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <ReviewsList
        reviews={reviews}
        onEdit={handleEditReview}
        onDelete={handleDeleteReview}
        canModify={!!user}
      />
    </section>
  )
}
