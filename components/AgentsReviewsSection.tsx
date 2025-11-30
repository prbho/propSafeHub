// components/agents/ReviewsSection.tsx
'use client'

import { useState } from 'react'
import { Calendar, Star, User } from 'lucide-react'

interface Review {
  id: string
  userName: string
  rating: number
  comment: string
  date: string
  property: string
}

interface ReviewsSectionProps {
  agentId: string
}

// Mock reviews data - you'll replace this with actual data from your database
const mockReviews: Review[] = [
  {
    id: '1',
    userName: 'James Adeyemi',
    rating: 5,
    comment:
      'Adebayo was exceptional in helping us find our dream home. His knowledge of the Lagos market is unparalleled.',
    date: '2024-01-15',
    property: 'Luxury Apartment in Victoria Island',
  },
  {
    id: '2',
    userName: 'Sarah Johnson',
    rating: 5,
    comment:
      'Professional, responsive, and truly cares about his clients. Made the entire process smooth and stress-free.',
    date: '2024-01-10',
    property: 'Modern Duplex in Lekki',
  },
  {
    id: '3',
    userName: 'Michael Chen',
    rating: 4,
    comment:
      'Great service and good communication throughout the process. Would recommend to others.',
    date: '2024-01-05',
    property: 'Commercial Space in Ikeja',
  },
]

export default function AgentsReviewsSection({ agentId }: ReviewsSectionProps) {
  const [reviews] = useState<Review[]>(mockReviews)

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Client Reviews</h2>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {review.userName}
                  </h4>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(review.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-gray-900">
                  {review.rating}
                </span>
              </div>
            </div>

            <p className="text-gray-700 mb-2">{review.comment}</p>

            <div className="text-sm text-gray-600">
              Property: <span className="font-medium">{review.property}</span>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-6 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium">
        Load More Reviews
      </button>
    </section>
  )
}
