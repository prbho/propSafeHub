// components/reviews/ReviewsList.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useState } from 'react'
import { Review } from '@/types'
import { Filter, Star } from 'lucide-react'

import ReviewCard from './ReviewCard'

interface ReviewsListProps {
  reviews: Review[]
  onEdit?: (review: Review) => void
  onDelete?: (reviewId: string) => void
  canModify?: boolean
}

export default function ReviewsList({
  reviews,
  onEdit,
  onDelete,
  canModify = false,
}: ReviewsListProps) {
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest'>(
    'newest'
  )
  const [filterRating, setFilterRating] = useState<number | null>(null)

  // Sort and filter reviews
  const processedReviews = reviews
    .filter((review) => (filterRating ? review.rating === filterRating : true))
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (
            new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
          )
        case 'highest':
          return b.rating - a.rating
        case 'lowest':
          return a.rating - b.rating
        default:
          return 0
      }
    })

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Rating:</span>
          <select
            value={filterRating || ''}
            onChange={(e) =>
              setFilterRating(e.target.value ? parseInt(e.target.value) : null)
            }
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
          >
            <option value="">All Ratings</option>
            {[5, 4, 3, 2, 1].map((rating) => (
              <option key={rating} value={rating}>
                {rating} Star{rating !== 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reviews Count */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing {processedReviews.length} of {reviews.length} reviews
          {filterRating && ` (${filterRating} stars)`}
        </p>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {processedReviews.length > 0 ? (
          processedReviews.map((review) => (
            <ReviewCard
              key={review.$id}
              review={review}
              onEdit={onEdit}
              onDelete={onDelete}
              canModify={canModify}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>No reviews found</p>
            {filterRating && (
              <p className="text-sm mt-1">Try changing your filter settings</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
