import '@/lib/appwrite-build-fix'
// app/api/cron/premium-expiry/route.ts
import { NextRequest, NextResponse } from 'next/server'

import { PremiumListingService } from '@/lib/services/premium-service'

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret (for security)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Process expired premium listings
    const expiredResult = await PremiumListingService.processExpiredListings()

    // Sync all premium properties to update featured status
    const syncResult = await PremiumListingService.syncAllPremiumProperties()

    return NextResponse.json({
      success: true,
      expired: expiredResult.expired,
      synced: syncResult.successful,
      total: syncResult.total,
      message: 'Premium expiry processing completed',
    })
  } catch {
    return NextResponse.json({ status: 500 })
  }
}
