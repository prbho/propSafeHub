// components/reviews/ReviewCard.tsx
'use client'

import Image from 'next/image'
import { Review } from '@/types'
import { Calendar, CheckCircle, Star, User } from 'lucide-react'

interface ReviewCardProps {
  review: Review
  onEdit?: (review: Review) => void
  onDelete?: (reviewId: string) => void
  canModify?: boolean
}

export default function ReviewCard({
  review,
  onEdit,
  onDelete,
  canModify = false,
}: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            {review.userAvatar ? (
              <Image
                src={review.userAvatar}
                alt={review.userName || 'User'}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900">
                {review.userName || 'Anonymous User'}
              </h4>
              {review.isVerified && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(review.$createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${
                star <= review.rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
          <span className="ml-1 text-sm font-medium text-gray-900">
            {review.rating}.0
          </span>
        </div>
      </div>

      {/* Content */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">{review.title}</h3>
        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
      </div>

      {/* Actions */}
      {canModify && (onEdit || onDelete) && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
          {onEdit && (
            <button
              onClick={() => onEdit(review)}
              className="text-emerald-600 hover:text-blue-700 text-sm font-medium"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(review.$id)}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}
