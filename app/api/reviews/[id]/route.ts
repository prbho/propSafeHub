// app/api/reviews/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'

import { ReviewService } from '@/lib/services/reviewService'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // For now, we'll return reviews for this agent/property
    // You could modify this to fetch a specific review by ID if needed
    const reviews = await ReviewService.getDetailedReviews({
      limit: 50,
    })

    return NextResponse.json({ reviews })
  } catch {
    return NextResponse.json({ status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const updates = await request.json()

    const review = await ReviewService.updateReview(id, updates)

    return NextResponse.json({ review })
  } catch {
    return NextResponse.json({ status: 400 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    await ReviewService.deleteReview(id)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ status: 400 })
  }
}
