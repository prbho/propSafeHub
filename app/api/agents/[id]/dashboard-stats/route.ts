// app/api/agents/[id]/dashboard-stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Query } from 'node-appwrite'

import {
  DATABASE_ID,
  PROPERTIES_COLLECTION_ID,
  SCHEDULE_VIEWING_COLLECTION_ID,
  serverDatabases,
} from '@/lib/appwrite-server'

interface Context {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: Context) {
  try {
    const params = await context.params
    const agentId = params.id

    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      )
    }

    // Get agent's properties
    const properties = await serverDatabases.listDocuments(
      DATABASE_ID,
      PROPERTIES_COLLECTION_ID,
      [Query.equal('agentId', agentId)]
    )

    // Get viewing requests
    const viewings = await serverDatabases.listDocuments(
      DATABASE_ID,
      SCHEDULE_VIEWING_COLLECTION_ID,
      [Query.equal('agentId', agentId)]
    )

    // Calculate stats
    const totalListings = properties.total
    const totalViews = properties.documents.reduce(
      (sum, prop) => sum + (prop.views || 0),
      0
    )
    const totalFavorites = properties.documents.reduce(
      (sum, prop) => sum + (prop.favorites || 0),
      0
    )
    const pendingViewings = viewings.documents.filter(
      (v) => v.status === 'pending'
    ).length

    const stats = {
      totalListings,
      totalViews,
      totalFavorites,
      pendingViewings,
      confirmedViewings: viewings.documents.filter(
        (v) => v.status === 'confirmed'
      ).length,
      messagesCount: 0, // You can implement this later
    }

    return NextResponse.json(stats)
  } catch {}
}
