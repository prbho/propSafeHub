// app/api/users/notifications/route.ts
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
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Fetch notifications for the specific user
    const notifications = await databases.listDocuments(
      DATABASE_ID,
      NOTIFICATIONS_COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.orderDesc('$createdAt'),
        Query.limit(limit),
      ]
    )

    return NextResponse.json(notifications.documents)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      title,
      message,
      type,
      relatedEntityId,
      relatedEntityType,
      actionUrl,
      actionText,
    } = await request.json()

    if (!userId || !title || !message) {
      return NextResponse.json(
        { error: 'User ID, title, and message are required' },
        { status: 400 }
      )
    }

    const notificationData: any = {
      userId,
      title,
      message,
      type: type || 'general',
      isRead: false,
      priority: 'medium',
    }

    // Add optional fields if provided
    if (relatedEntityId) notificationData.relatedEntityId = relatedEntityId
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
  } catch {
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}

