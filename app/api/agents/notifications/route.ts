import '@/lib/appwrite-build-fix'
// app/api/agents/notifications/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

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
    const agentId = searchParams.get('agentId')
    const limit = parseInt(searchParams.get('limit') || '50')

    console.log('🔍 Fetching agent notifications for:', agentId)

    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      )
    }

    // Since your notifications use userId for both users and agents,
    // we need to filter by userId AND check if it's an agent notification
    const notifications = await serverDatabases.listDocuments(
      DATABASE_ID,
      NOTIFICATIONS_COLLECTION_ID,
      [
        Query.equal('userId', agentId), // Use userId since that's what's stored
        Query.orderDesc('$createdAt'),
        Query.limit(limit),
      ]
    )

    console.log(
      `✅ Fetched ${notifications.total} notifications for agent ${agentId}`
    )

    // Filter to only show agent-specific notifications
    const agentNotifications = notifications.documents.filter(
      (notification) =>
        notification.type === 'userMessage' || // This seems to be your agent notification type
        notification.type?.includes('agent') ||
        notification.title?.includes('Viewing Request') ||
        notification.actionUrl?.includes('/agent/')
    )

    console.log(
      `📊 Filtered to ${agentNotifications.length} agent-specific notifications`
    )
    return NextResponse.json(agentNotifications)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
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

    console.log('📝 Creating agent notification with data:', body)

    if (!agentId || !title || !message) {
      return NextResponse.json(
        { error: 'Agent ID, title, and message are required' },
        { status: 400 }
      )
    }

    // Use userId field since that's what your schema uses
    const notificationData: any = {
      userId: agentId, // Store agent ID in userId field
      title,
      message,
      type: type || 'agent_general',
      isRead: false,
      priority: 'medium',
    }

    // Add optional fields if provided
    if (relatedEntityId) notificationData.relatedId = relatedEntityId
    if (relatedEntityType)
      notificationData.relatedEntityType = relatedEntityType
    if (actionUrl) notificationData.actionUrl = actionUrl
    if (actionText) notificationData.actionText = actionText

    const notification = await serverDatabases.createDocument(
      DATABASE_ID,
      NOTIFICATIONS_COLLECTION_ID,
      'unique()',
      notificationData
    )

    console.log(`✅ Created agent notification: ${notification.$id}`)
    return NextResponse.json(notification)
  } catch {
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}
