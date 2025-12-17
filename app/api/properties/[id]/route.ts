// app/api/properties/[id]/route.ts - FIXED
import { NextRequest, NextResponse } from 'next/server'

import {
  DATABASE_ID,
  PROPERTIES_COLLECTION_ID,
  serverDatabases,
} from '@/lib/appwrite-server'

interface Context {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: Context) {
  try {
    // Await the params Promise
    const params = await context.params
    const propertyId = params.id

    console.log('🔍 Fetching property with ID:', propertyId)

    const property = await serverDatabases.getDocument(
      DATABASE_ID,
      PROPERTIES_COLLECTION_ID,
      propertyId
    )

    console.log('✅ Property found:', property.title)

    // Increment view count
    try {
      await serverDatabases.updateDocument(
        DATABASE_ID,
        PROPERTIES_COLLECTION_ID,
        propertyId,
        {
          views: (property.views || 0) + 1,
        }
      )
      console.log('✅ View count incremented')
    } catch (updateError) {
      console.error('❌ Error updating view count:', updateError)
      // Don't fail the entire request if view count update fails
    }

    return NextResponse.json(property)
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
