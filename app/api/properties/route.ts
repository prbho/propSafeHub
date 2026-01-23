// app/api/properties/route.ts - FIXED
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

    // Handle status/type - FIXED LOGIC
    let finalStatus = status

    // If type is provided (from frontend), use it to determine status
    if (type === 'buy') {
      finalStatus = 'for-sale'
    } else if (type === 'rent') {
      finalStatus = 'for-rent'
    } else if (type === 'short-let') {
      finalStatus = 'short-let'
    } else if (type === 'all') {
      finalStatus = null
    }

    // Only add status filter if we have a specific status
    if (finalStatus && finalStatus !== 'all') {
      console.log(`🎯 Filtering by status: ${finalStatus}`)
      queries.push(Query.equal('status', finalStatus))
    } else {
      console.log('🌐 Showing all property types (no status filter)')
    }

    // Search functionality
    if (q) {
      console.log(`🔎 Searching for: "${q}"`)
      const cleanQuery = q.trim().toLowerCase()

      // Search across multiple fields (case-insensitive)
      queries.push(
        Query.or([
          Query.search('title', cleanQuery),
          Query.search('city', cleanQuery),
          Query.search('state', cleanQuery),
          Query.search('location', cleanQuery),
          Query.search('description', cleanQuery),
        ])
      )
    }

    // If specific city/state provided, use them
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
    console.log('📝 Page:', page, 'Limit:', limit, 'Offset:', offset)

    // Execute query
    const properties = await databases.listDocuments(
      DATABASE_ID,
      PROPERTIES_COLLECTION_ID,
      queries
    )

    console.log('✅ Found properties:', properties.documents.length)
    console.log('📊 Total documents in collection:', properties.total)

    return NextResponse.json({
      success: true,
      documents: properties.documents,
      total: properties.total,
      currentPage: page,
      limit: limit,
      hasMore: page * limit < properties.total,
    })
  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch properties',
      },
      { status: 500 }
    )
  }
}
