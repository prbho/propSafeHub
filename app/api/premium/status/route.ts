// app/api/premium/status/route.ts
import { NextRequest, NextResponse } from 'next/server'

import { PremiumListingService } from '@/lib/services/premium-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Get user's active premium listings
    const activeListings =
      await PremiumListingService.getAgentPremiumListings(userId)

    const hasPremium = activeListings.length > 0
    const activePlans = [
      ...new Set(activeListings.map((listing) => listing.planType)),
    ]

    // Get the earliest start date and latest expiration
    const startDate =
      activeListings.length > 0
        ? activeListings.reduce(
            (earliest, listing) =>
              new Date(listing.startDate) < new Date(earliest)
                ? listing.startDate
                : earliest,
            activeListings[0].startDate
          )
        : null

    const expiresAt =
      activeListings.length > 0
        ? activeListings.reduce(
            (latest, listing) =>
              new Date(listing.endDate) > new Date(latest)
                ? listing.endDate
                : latest,
            activeListings[0].endDate
          )
        : null

    return NextResponse.json({
      hasPremium,
      activePlans,
      startDate,
      expiresAt,
      activeListings: activeListings.length,
    })
  } catch (error) {
    console.error('Error fetching premium status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch premium status' },
      { status: 500 }
    )
  }
}
