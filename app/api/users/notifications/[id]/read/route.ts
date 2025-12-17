import '@/lib/appwrite-build-fix'
// app/api/users/notifications/[id]/read/route.ts
import { NextRequest, NextResponse } from 'next/server'

import {
  DATABASE_ID,
  NOTIFICATIONS_COLLECTION_ID,
  serverDatabases,
} from '@/lib/appwrite-server'

interface Context {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, context: Context) {
  const startTime = Date.now()

  try {
    const params = await context.params
    const notificationId = params.id

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      )
    }

    // Update only the isRead field
    const updatedNotification = await serverDatabases.updateDocument(
      DATABASE_ID,
      NOTIFICATIONS_COLLECTION_ID,
      notificationId,
      {
        isRead: true,
      }
    )

    const duration = Date.now() - startTime
    console.log(`User notification read update completed in ${duration}ms`)

    return NextResponse.json({
      success: true,
      notification: updatedNotification,
    })
  } catch {
    const duration = Date.now() - startTime
    console.error(`User notification read update failed after ${duration}ms`)

    return NextResponse.json({ status: 500 })
  }
}

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
