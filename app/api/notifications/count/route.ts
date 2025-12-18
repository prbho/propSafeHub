/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'

import {
  DATABASE_ID,
  databases,
  NOTIFICATIONS_COLLECTION_ID,
  Query,
} from '@/lib/appwrite-server'

// app/api/notifications/count/route.ts
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

    const unreadNotifications = await databases.listDocuments(
      DATABASE_ID,
      NOTIFICATIONS_COLLECTION_ID,
      [Query.equal('userId', userId), Query.equal('isRead', false)]
    )

    const allNotifications = await databases.listDocuments(
      DATABASE_ID,
      NOTIFICATIONS_COLLECTION_ID,
      [Query.equal('userId', userId)]
    )

    // Debug: Log what types we're actually seeing
    console.log('🔍 Notification types found:', {
      allTypes: [
        ...new Set(unreadNotifications.documents.map((n: any) => n.type)),
      ],
      totalUnread: unreadNotifications.total,
    })

    return NextResponse.json({
      total: allNotifications.total,
      unread: unreadNotifications.total,
      byType: {
        // Count 'userMessage' as messages
        message: unreadNotifications.documents.filter(
          (n) => n.type === 'userMessage' && !n.isRead
        ).length,
        // Count 'propertyUpdate' that are favorites
        favorite: unreadNotifications.documents.filter(
          (n) =>
            n.type === 'propertyUpdate' &&
            n.title.includes('favorited') &&
            !n.isRead
        ).length,
        // Count 'propertyUpdate' that are property views
        property_view: unreadNotifications.documents.filter(
          (n) =>
            n.type === 'propertyUpdate' &&
            n.title.includes('viewed') &&
            !n.isRead
        ).length,
        // Count 'appointmentReminder' as viewing requests
        viewing_request: unreadNotifications.documents.filter(
          (n) => n.type === 'appointmentReminder' && !n.isRead
        ).length,
        // System notifications
        system: unreadNotifications.documents.filter(
          (n) => n.type === 'systemAlert' && !n.isRead
        ).length,
      },
    })
  } catch {}
}
