// app/api/agents/notifications/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server'
import { Query } from 'node-appwrite'

import {
  DATABASE_ID,
  databases,
  NOTIFICATIONS_COLLECTION_ID,
} from '@/lib/appwrite-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get('agentId')
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('limit') || '50', 10))
    )

    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      )
    }

    try {
      // Try to fetch notifications with error handling
      const notifications = await databases.listDocuments(
        DATABASE_ID,
        NOTIFICATIONS_COLLECTION_ID,
        [
          Query.equal('userId', agentId),
          Query.orderDesc('$createdAt'),
          Query.limit(limit),
        ]
      )

      // Filter to only show agent-specific notifications
      const agentNotifications = notifications.documents.filter(
        (notification) =>
          notification.type === 'userMessage' ||
          notification.type?.includes('agent') ||
          notification.title?.includes('Viewing Request') ||
          notification.actionUrl?.includes('/agent/')
      )

      return NextResponse.json(agentNotifications, {
        headers: {
          'Cache-Control': 'private, max-age=8, stale-while-revalidate=20',
        },
      })
    } catch (dbError: any) {
      // Check if it's a 404 error (collection or document not found)
      if (dbError?.code === 404) {
        console.log(
          'Notifications collection or document not found, returning empty array'
        )
        return NextResponse.json([], {
          headers: {
            'Cache-Control': 'private, max-age=8',
          },
        })
      }
      throw dbError // Re-throw other errors
    }
  } catch (error) {
    console.error('Error fetching notifications:', error)
    // Return empty array instead of error to prevent UI breaking
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      agentId,
      title,
      message,
      type,
      relatedEntityId,
      relatedEntityType,
      actionUrl,
      actionText,
    } = body

    if (!agentId || !title || !message) {
      return NextResponse.json(
        { error: 'Agent ID, title, and message are required' },
        { status: 400 }
      )
    }

    try {
      const notificationData: any = {
        userId: agentId,
        title,
        message,
        type: type || 'agent_general',
        isRead: false,
        priority: 'medium',
      }

      if (relatedEntityId) notificationData.relatedId = relatedEntityId
      if (relatedEntityType)
        notificationData.relatedEntityType = relatedEntityType
      if (actionUrl) notificationData.actionUrl = actionUrl
      if (actionText) notificationData.actionText = actionText

      const notification = await databases.createDocument(
        DATABASE_ID,
        NOTIFICATIONS_COLLECTION_ID,
        'unique()',
        notificationData
      )

      return NextResponse.json(notification)
    } catch (dbError: any) {
      if (dbError?.code === 404) {
        return NextResponse.json(
          {
            error:
              'Notifications collection not found. Please create it in your Appwrite database.',
          },
          { status: 404 }
        )
      }
      throw dbError
    }
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}
