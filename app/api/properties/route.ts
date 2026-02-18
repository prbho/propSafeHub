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

    const queries = [Query.equal('isActive', true)]

    let finalStatus = status
    if (type === 'buy') {
      finalStatus = 'for-sale'
    } else if (type === 'rent') {
      finalStatus = 'for-rent'
    } else if (type === 'short-let') {
      finalStatus = 'short-let'
    } else if (type === 'all') {
      finalStatus = null
    }

    if (finalStatus && finalStatus !== 'all') {
      queries.push(Query.equal('status', finalStatus))
    }

    if (q) {
      const cleanQuery = q.trim().toLowerCase()
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

    if (city && !q) {
      queries.push(Query.equal('city', city))
    }
    if (state && !q) {
      queries.push(Query.equal('state', state))
    }

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

    const offset = (page - 1) * limit
    queries.push(Query.limit(limit))
    queries.push(Query.offset(offset))
    queries.push(Query.orderDesc('isFeatured'))
    queries.push(Query.orderDesc('listDate'))

    const properties = await databases.listDocuments(
      DATABASE_ID,
      PROPERTIES_COLLECTION_ID,
      queries
    )

    return NextResponse.json(
      {
        success: true,
        documents: properties.documents,
        total: properties.total,
        currentPage: page,
        limit,
        hasMore: page * limit < properties.total,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=15, stale-while-revalidate=30',
        },
      }
    )
  } catch (error) {
    console.error('Properties API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch properties',
      },
      { status: 500 }
    )
  }
}
