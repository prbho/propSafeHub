// app/api/reviews/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'

import { ReviewService } from '@/lib/services/reviewService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const targetId = searchParams.get('targetId')
    const type = searchParams.get('type') as 'property' | 'agent'

    if (!targetId || !type) {
      return NextResponse.json(
        { error: 'Missing targetId or type parameters' },
        { status: 400 }
      )
    }

    if (type !== 'property' && type !== 'agent') {
      return NextResponse.json(
        { error: 'Type must be either "property" or "agent"' },
        { status: 400 }
      )
    }

    const stats = await ReviewService.getReviewStats(targetId, type)

    return NextResponse.json({ stats })
  } catch {
    return NextResponse.json({ status: 500 })
  }
}
