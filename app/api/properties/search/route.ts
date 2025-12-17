import '@/lib/appwrite-build-fix'
// app/api/properties/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Query } from 'appwrite'

import {
  DATABASE_ID,
  databases,
  PROPERTIES_COLLECTION_ID,
} from '@/lib/appwrite'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query.trim()) {
      // Return popular properties when no query
      const popularProperties = await databases.listDocuments(
        DATABASE_ID,
        PROPERTIES_COLLECTION_ID,
        [
          Query.equal('isActive', true),
          Query.equal('isFeatured', true),
          Query.limit(limit),
          Query.orderDesc('listDate'),
        ]
      )

      return NextResponse.json(popularProperties)
    }

    // Build search queries
    const searchQueries = [
      Query.equal('isActive', true),
      Query.or([
        Query.search('title', query),
        Query.search('description', query),
        Query.search('city', query),
        Query.search('address', query),
        Query.search('neighborhood', query),
        Query.search('propertyType', query),
      ]),
      Query.limit(limit),
      Query.orderDesc('listDate'),
    ]

    const properties = await databases.listDocuments(
      DATABASE_ID,
      PROPERTIES_COLLECTION_ID,
      searchQueries
    )

    return NextResponse.json(properties)
  } catch {
    return NextResponse.json(
      {
        error: 'Failed to search properties',
      },
      { status: 500 }
    )
  }
}
