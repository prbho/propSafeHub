import { NextRequest, NextResponse } from 'next/server'

import {
  DATABASE_ID,
  databases,
  NOTIFICATIONS_COLLECTION_ID,
  Query,
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

    const unreadNotifications = await databases.listDocuments(
      DATABASE_ID,
      NOTIFICATIONS_COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.equal('isRead', false),
        Query.select(['$id', 'type', 'title', 'isRead']),
      ]
    )

    const allNotifications = await databases.listDocuments(
      DATABASE_ID,
      NOTIFICATIONS_COLLECTION_ID,
      [Query.equal('userId', userId), Query.limit(1)]
    )

    return NextResponse.json(
      {
        total: allNotifications.total,
        unread: unreadNotifications.total,
        byType: {
          message: unreadNotifications.documents.filter(
            (n) => n.type === 'userMessage' && !n.isRead
          ).length,
          favorite: unreadNotifications.documents.filter(
            (n) =>
              n.type === 'propertyUpdate' &&
              n.title.includes('favorited') &&
              !n.isRead
          ).length,
          property_view: unreadNotifications.documents.filter(
            (n) =>
              n.type === 'propertyUpdate' &&
              n.title.includes('viewed') &&
              !n.isRead
          ).length,
          viewing_request: unreadNotifications.documents.filter(
            (n) => n.type === 'appointmentReminder' && !n.isRead
          ).length,
          system: unreadNotifications.documents.filter(
            (n) => n.type === 'systemAlert' && !n.isRead
          ).length,
        },
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=10, stale-while-revalidate=20',
        },
      }
    )
  } catch (error) {
    console.error('Error fetching notification counts:', error)
    return NextResponse.json(
      {
        total: 0,
        unread: 0,
        byType: {
          message: 0,
          favorite: 0,
          property_view: 0,
          viewing_request: 0,
          system: 0,
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'private, max-age=3, stale-while-revalidate=5',
        },
      }
    )
  }
}

