// app/api/messages/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server'

import {
  AGENTS_COLLECTION_ID,
  DATABASE_ID,
  ID,
  LEADS_COLLECTION_ID,
  MESSAGES_COLLECTION_ID,
  Query,
  serverDatabases,
  USERS_COLLECTION_ID,
} from '@/lib/appwrite-server'
import { triggerMessageNotification } from '@/lib/services/server/notificationTriggers'

// Helper function to get user name from appropriate collection
async function getUserName(
  userId: string
): Promise<{ name: string; avatar?: string; userType: string }> {
  try {
    // Try users collection first
    try {
      const userDoc = await serverDatabases.getDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId
      )
      if (userDoc) {
        return {
          name: userDoc.name || `User ${userId.slice(0, 8)}`,
          avatar: userDoc.avatar,
          userType: userDoc.userType || 'buyer',
        }
      }
    } catch {}

    // Try leads collection
    try {
      const leadDoc = await serverDatabases.getDocument(
        DATABASE_ID,
        LEADS_COLLECTION_ID,
        userId
      )
      if (leadDoc) {
        return {
          name:
            leadDoc.name || leadDoc.fullName || `Lead ${userId.slice(0, 8)}`,
          userType: 'lead',
        }
      }
    } catch {}

    // Try agents collection
    try {
      const agentDoc = await serverDatabases.getDocument(
        DATABASE_ID,
        AGENTS_COLLECTION_ID,
        userId
      )
      if (agentDoc) {
        return {
          name: agentDoc.name || `Agent ${userId.slice(0, 8)}`,
          avatar: agentDoc.avatar,
          userType: 'agent',
        }
      }
    } catch {}
  } catch {}

  return {
    name: `User ${userId.slice(0, 8)}`,
    userType: 'buyer',
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => {
      throw new Error('Invalid JSON in request body')
    })

    const { toUserId, propertyId, message, messageType, userId, messageTitle } =
      body

    // Validate required fields
    if (!toUserId || !message || !userId) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: toUserId, message, and userId are required',
        },
        { status: 400 }
      )
    }

    // 🚫 Prevent users from messaging themselves
    if (userId === toUserId) {
      return NextResponse.json(
        { error: 'Cannot send message to yourself' },
        { status: 400 }
      )
    }

    // Validate message length
    if (message.length > 500) {
      return NextResponse.json({ status: 400 })
    }

    // Get both user names
    const [fromUserDetails, toUserDetails] = await Promise.all([
      getUserName(userId),
      getUserName(toUserId),
    ])

    // Create message document with both user names
    const messageDoc = await serverDatabases.createDocument(
      DATABASE_ID,
      MESSAGES_COLLECTION_ID,
      ID.unique(),
      {
        fromUserId: userId,
        fromUserName: fromUserDetails.name,
        toUserId,
        toUserName: toUserDetails.name,
        propertyId: propertyId || null,
        message: message.trim(),
        messageTitle: messageTitle || null,
        messageType: messageType || 'text',
        sentAt: new Date().toISOString(),
        isRead: false,
        agentName:
          fromUserDetails.userType === 'agent'
            ? fromUserDetails.name
            : undefined,
        agentId: fromUserDetails.userType === 'agent' ? userId : undefined,
      }
    )

    // ✅ FIXED: Trigger notification AFTER message is successfully created
    try {
      await triggerMessageNotification({
        toUserId: toUserId,
        fromUserName: fromUserDetails.name,
        message: message.trim(),
        propertyId: propertyId || undefined,
        propertyTitle: messageTitle || undefined,
      })
    } catch (notificationError) {}

    return NextResponse.json(messageDoc)
  } catch {
    return NextResponse.json({ status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const otherUserId = searchParams.get('otherUserId')
    const propertyId = searchParams.get('propertyId')
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    if (otherUserId) {
      let query

      // ✅ FIXED: Handle the case where propertyId might be null
      if (propertyId) {
        // If propertyId is provided, get messages with that propertyId OR without propertyId
        query = [
          Query.or([
            // Messages with the exact propertyId
            Query.and([
              Query.or([
                Query.and([
                  Query.equal('fromUserId', userId),
                  Query.equal('toUserId', otherUserId),
                ]),
                Query.and([
                  Query.equal('fromUserId', otherUserId),
                  Query.equal('toUserId', userId),
                ]),
              ]),
              Query.equal('propertyId', propertyId),
            ]),
            // ALSO include messages without propertyId (agent replies)
            Query.and([
              Query.or([
                Query.and([
                  Query.equal('fromUserId', userId),
                  Query.equal('toUserId', otherUserId),
                ]),
                Query.and([
                  Query.equal('fromUserId', otherUserId),
                  Query.equal('toUserId', userId),
                ]),
              ]),
              Query.isNull('propertyId'),
            ]),
          ]),
          Query.orderAsc('sentAt'),
        ]
      } else {
        // If no propertyId is provided, get ALL messages between users
        query = [
          Query.or([
            Query.and([
              Query.equal('fromUserId', userId),
              Query.equal('toUserId', otherUserId),
            ]),
            Query.and([
              Query.equal('fromUserId', otherUserId),
              Query.equal('toUserId', userId),
            ]),
          ]),
          Query.orderAsc('sentAt'),
        ]
      }

      const messages = await serverDatabases.listDocuments(
        DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        query
      )

      const sentCount = messages.documents.filter(
        (m) => m.fromUserId === userId
      ).length
      const receivedCount = messages.documents.filter(
        (m) => m.fromUserId === otherUserId
      ).length
      const withPropertyId = messages.documents.filter(
        (m) => m.propertyId === propertyId
      ).length
      const withoutPropertyId = messages.documents.filter(
        (m) => !m.propertyId
      ).length

      console.log('✅ FINAL API - Found ALL messages:', {
        total: messages.documents.length,
        sent: sentCount,
        received: receivedCount,
        withPropertyId: withPropertyId,
        withoutPropertyId: withoutPropertyId,
        sampleMessages: messages.documents.slice(0, 10).map((m) => ({
          id: m.$id,
          from: m.fromUserId,
          to: m.toUserId,
          propertyId: m.propertyId,
          message: m.message?.substring(0, 20),
          sentAt: m.sentAt,
        })),
      })

      return NextResponse.json(messages.documents)
    } else {
      // Get all conversations for the user (existing logic)
      const [sentMessages, receivedMessages] = await Promise.all([
        serverDatabases.listDocuments(DATABASE_ID, MESSAGES_COLLECTION_ID, [
          Query.equal('fromUserId', userId),
          Query.orderDesc('sentAt'),
        ]),
        serverDatabases.listDocuments(DATABASE_ID, MESSAGES_COLLECTION_ID, [
          Query.equal('toUserId', userId),
          Query.orderDesc('sentAt'),
        ]),
      ])

      const allMessages = [
        ...sentMessages.documents,
        ...receivedMessages.documents,
      ]

      // Group by conversation partner
      const conversations: Record<string, any[]> = {}
      allMessages.forEach((message) => {
        const partnerId =
          message.fromUserId === userId ? message.toUserId : message.fromUserId
        if (!conversations[partnerId]) {
          conversations[partnerId] = []
        }
        conversations[partnerId].push(message)
      })

      return NextResponse.json(conversations)
    }
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
