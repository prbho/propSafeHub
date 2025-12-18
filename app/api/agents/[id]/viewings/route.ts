// app/api/agents/[id]/viewings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Query } from 'node-appwrite'

import {
  DATABASE_ID,
  databases,
  SCHEDULE_VIEWING_COLLECTION_ID,
} from '@/lib/appwrite-server'

interface Context {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: Context) {
  try {
    const params = await context.params
    const agentId = params.id
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      )
    }

    const viewings = await databases.listDocuments(
      DATABASE_ID,
      SCHEDULE_VIEWING_COLLECTION_ID,
      [
        Query.equal('agentId', agentId),
        Query.orderDesc('$createdAt'),
        Query.limit(limit),
      ]
    )

    return NextResponse.json(viewings.documents)
  } catch {
    return NextResponse.json({ status: 500 })
  }
}
