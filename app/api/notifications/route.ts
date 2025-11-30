// app/api/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Query } from 'node-appwrite'

import {
  DATABASE_ID,
  NOTIFICATIONS_COLLECTION_ID,
  serverDatabases,
} from '@/lib/appwrite-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const notifications = await serverDatabases.listDocuments(
      DATABASE_ID,
      NOTIFICATIONS_COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.orderDesc('$createdAt'),
        Query.limit(50),
      ]
    )

    return NextResponse.json(notifications.documents)
  } catch {}
}
