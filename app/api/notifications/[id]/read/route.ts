// app/api/notifications/[id]/read/route.ts
import { NextRequest, NextResponse } from 'next/server'

import {
  DATABASE_ID,
  databases,
  NOTIFICATIONS_COLLECTION_ID,
} from '@/lib/appwrite-server'

interface Context {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, context: Context) {
  try {
    const params = await context.params
    const notificationId = params.id

    console.log('📖 Marking notification as read:', notificationId)

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      )
    }

    // Update the notification
    await databases.updateDocument(
      DATABASE_ID,
      NOTIFICATIONS_COLLECTION_ID,
      notificationId,
      {
        isRead: true,
      }
    )

    console.log('✅ Notification marked as read:', notificationId)
    return NextResponse.json({ success: true })
  } catch {}

  return NextResponse.json(
    { error: 'Failed to mark notification as read' },
    { status: 500 }
  )
}
