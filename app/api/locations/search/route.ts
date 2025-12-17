import '@/lib/appwrite-build-fix'
// app/api/locations/search/route.ts
import { NextRequest, NextResponse } from 'next/server'

import { LocationService } from '@/lib/locations/locationService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '10')

    console.log('📍 API Route - Search query:', query)

    if (!query.trim()) {
      return NextResponse.json({ locations: [] })
    }

    const locations = await LocationService.searchLocations(query, limit)

    console.log('📍 API Route - Found locations:', locations.length)

    return NextResponse.json({
      locations,
      success: true,
    })
  } catch {
    return NextResponse.json({ status: 500 })
  }
}
