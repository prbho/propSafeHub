import '@/lib/appwrite-build-fix'
// app/api/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server'

import { ReviewService } from '@/lib/services/reviewService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')
    const agentId = searchParams.get('agentId')
    const userId = searchParams.get('userId')
    // const limit = parseInt(searchParams.get('limit') || '50')

    let reviews = []

    if (propertyId) {
      reviews = await ReviewService.getPropertyReviews(propertyId)
    } else if (agentId) {
      reviews = await ReviewService.getAgentReviews(agentId)
    } else if (userId) {
      reviews = await ReviewService.getUserReviews(userId)
    } else {
      return NextResponse.json(
        { error: 'Please provide propertyId, agentId, or userId' },
        { status: 400 }
      )
    }

    return NextResponse.json({ reviews })
  } catch {
    return NextResponse.json({ status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const reviewData = await request.json()

    const review = await ReviewService.createReview(reviewData)

    return NextResponse.json({ review }, { status: 201 })
  } catch {
    return NextResponse.json({ status: 400 })
  }
}
