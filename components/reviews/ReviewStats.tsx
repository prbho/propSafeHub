// components/reviews/ReviewStats.tsx
'use client'

import { Star } from 'lucide-react'

interface ReviewStatsProps {
  stats: {
    averageRating: number
    totalReviews: number
    ratingDistribution: { [key: number]: number }
  }
}

export default function ReviewStats({ stats }: ReviewStatsProps) {
  const { averageRating, totalReviews, ratingDistribution } = stats

  if (totalReviews === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p>No reviews yet</p>
        <p className="text-sm mt-1">Be the first to leave a review!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Average Rating */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-4xl font-bold text-gray-900">
            {averageRating}
          </span>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.floor(averageRating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : star === Math.ceil(averageRating) &&
                        averageRating % 1 !== 0
                      ? 'fill-yellow-200 text-yellow-400'
                      : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
        <p className="text-gray-600">
          {totalReviews} review{totalReviews !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Rating Distribution */}
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count =
            ratingDistribution[rating as keyof typeof ratingDistribution] || 0
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0

          return (
            <div key={rating} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-4">{rating}</span>
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-8 text-right">
                {count}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
