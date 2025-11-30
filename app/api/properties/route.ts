// app/api/properties/route.ts - UPDATED SEARCH LOGIC
import { NextRequest, NextResponse } from 'next/server'

import {
  DATABASE_ID,
  databases,
  PROPERTIES_COLLECTION_ID,
  Query,
} from '@/lib/appwrite'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Properties API called')

    const { searchParams } = new URL(request.url)

    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const city = searchParams.get('city')
    const state = searchParams.get('state')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const bedrooms = searchParams.get('bedrooms')
    const propertyType = searchParams.get('propertyType')
    const q = searchParams.get('q')

    console.log(
      '📋 All query params:',
      Object.fromEntries(searchParams.entries())
    )

    // Build queries array
    const queries = [Query.equal('isActive', true)]

    // Handle status/type
    let finalStatus = status
    if (type === 'buy') {
      finalStatus = 'for-sale'
    } else if (type === 'rent') {
      finalStatus = 'for-rent'
    }

    if (!finalStatus) {
      finalStatus = 'for-sale'
    }

    console.log(`🎯 Using status: ${finalStatus}`)
    queries.push(Query.equal('status', finalStatus))

    if (q) {
      console.log(`🔎 Searching EXACTLY for: "${q}"`)
      const cleanQuery = q.trim()

      // Only exact matches on city and state
      queries.push(
        Query.or([
          Query.equal('city', cleanQuery),
          Query.equal('state', cleanQuery),
        ])
      )

      console.log('🎯 Using exact location matching only')
    }

    // If specific city/state provided, use them (overrides general search)
    if (city && !q) {
      queries.push(Query.equal('city', city))
    }
    if (state && !q) {
      queries.push(Query.equal('state', state))
    }

    // Numeric filters
    if (minPrice) {
      queries.push(Query.greaterThanEqual('price', parseInt(minPrice)))
    }
    if (maxPrice) {
      queries.push(Query.lessThanEqual('price', parseInt(maxPrice)))
    }
    if (bedrooms) {
      queries.push(Query.equal('bedrooms', parseInt(bedrooms)))
    }
    if (propertyType) {
      queries.push(Query.equal('propertyType', propertyType))
    }

    // Add pagination and sorting
    const offset = (page - 1) * limit
    queries.push(Query.limit(limit))
    queries.push(Query.offset(offset))
    queries.push(Query.orderDesc('isFeatured'))
    queries.push(Query.orderDesc('listDate'))

    console.log('📤 Final queries count:', queries.length)
    console.log('🔍 Query details:', queries)

    // Execute query
    const properties = await databases.listDocuments(
      DATABASE_ID,
      PROPERTIES_COLLECTION_ID,
      queries
    )

    console.log('✅ Found properties:', properties.total)

    // Log the actual cities/states found for debugging
    if (properties.documents.length > 0) {
      const locations = properties.documents.map((p) => `${p.city}, ${p.state}`)
      console.log('📍 Properties locations:', [...new Set(locations)])
    }

    return NextResponse.json({
      success: true,
      documents: properties.documents,
      total: properties.total,
    })
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch properties',
      },
      { status: 500 }
    )
  }
}
