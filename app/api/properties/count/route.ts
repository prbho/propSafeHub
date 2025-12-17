// app/api/properties/count/route.ts
import { NextRequest, NextResponse } from 'next/server'

import {
  DATABASE_ID,
  databases,
  PROPERTIES_COLLECTION_ID,
  Query,
} from '@/lib/appwrite'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const status = searchParams.get('status')
    const propertyType = searchParams.get('propertyType')

    console.log('🔢 Counting properties with params:', {
      city,
      status,
      propertyType,
    })

    // Build queries array for counting
    const queries = [Query.equal('isActive', true)]

    // Add filters if provided
    if (city) {
      queries.push(Query.equal('city', city))
    }
    if (status) {
      queries.push(Query.equal('status', status))
    }
    if (propertyType) {
      queries.push(Query.equal('propertyType', propertyType))
    }

    // Get total count of properties matching the filters
    const result = await databases.listDocuments(
      DATABASE_ID,
      PROPERTIES_COLLECTION_ID,
      [...queries, Query.limit(1)]
    )

    console.log('✅ Count result:', result.total)

    return NextResponse.json({
      success: true,
      count: result.total,
      city,
      status,
      propertyType,
    })
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to count properties',
      },
      { status: 500 }
    )
  }
}
