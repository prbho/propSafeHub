// app/api/messages/conversations/route.ts - UPDATED
import { NextRequest, NextResponse } from 'next/server'

import {
  AGENTS_COLLECTION_ID,
  DATABASE_ID,
  LEADS_COLLECTION_ID,
  MESSAGES_COLLECTION_ID,
  PROPERTIES_COLLECTION_ID,
  Query,
  serverDatabases,
  USERS_COLLECTION_ID,
} from '@/lib/appwrite-server'

// Helper function to get user details from appropriate collection
async function getUserDetails(
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
    } catch {
      // Silently continue to next collection
    }

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
    } catch {
      // Silently continue to next collection
    }

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
          avatar: leadDoc.avatar,
          userType: 'lead',
        }
      }
    } catch {
      // Silently continue
    }
  } catch {
    // Fall through to default return
  }

  // Fallback
  return {
    name: `User ${userId.slice(0, 8)}`,
    userType: 'buyer',
  }
}

// Helper function to get property title and image
async function getPropertyDetails(
  propertyId: string
): Promise<{ title: string; image?: string }> {
  if (!propertyId) return { title: 'General Inquiry' }

  try {
    const propertyDoc = await serverDatabases.getDocument(
      DATABASE_ID,
      PROPERTIES_COLLECTION_ID,
      propertyId
    )
    return {
      title: propertyDoc?.title || `Property ${propertyId.slice(0, 8)}`,
      image: propertyDoc?.images?.[0], // Get first image if available
    }
  } catch {
    return { title: `Property ${propertyId.slice(0, 8)}` }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Get all messages for the user
    const [sentMessages, receivedMessages] = await Promise.all([
      serverDatabases.listDocuments(DATABASE_ID, MESSAGES_COLLECTION_ID, [
        Query.equal('fromUserId', userId),
        Query.orderDesc('sentAt'),
        Query.limit(100),
      ]),
      serverDatabases.listDocuments(DATABASE_ID, MESSAGES_COLLECTION_ID, [
        Query.equal('toUserId', userId),
        Query.orderDesc('sentAt'),
        Query.limit(100),
      ]),
    ])

    const allMessages = [
      ...sentMessages.documents,
      ...receivedMessages.documents,
    ]

    // Get unique user IDs from conversations
    const userIds = new Set<string>()
    // Get unique property IDs for title lookup
    const propertyIds = new Set<string>()

    allMessages.forEach((message: Record<string, unknown>) => {
      userIds.add(message.fromUserId as string)
      userIds.add(message.toUserId as string)
      if (message.propertyId) {
        propertyIds.add(message.propertyId as string)
      }
    })
    userIds.delete(userId)

    // Fetch user details from appropriate collections
    const usersPromises = Array.from(userIds).map((id) => getUserDetails(id))
    const users = await Promise.all(usersPromises)
    const usersMap = new Map(
      Array.from(userIds).map((id, index) => [id, users[index]])
    )

    // Fetch property details
    const propertyPromises = Array.from(propertyIds).map((propertyId) =>
      getPropertyDetails(propertyId)
    )
    const propertyDetails = await Promise.all(propertyPromises)
    const propertiesMap = new Map(
      Array.from(propertyIds).map((id, index) => [id, propertyDetails[index]])
    )

    // Group by conversation partner and format response
    const conversations: unknown[] = []
    const conversationMap = new Map<string, unknown>()

    allMessages.forEach((message: Record<string, unknown>) => {
      const partnerId =
        message.fromUserId === userId ? message.toUserId : message.fromUserId
      const partnerUser = usersMap.get(partnerId as string)

      // Use stored names from message if available, otherwise use fetched user details
      const partnerName =
        message.fromUserId === userId
          ? (message.toUserName as string) ||
            (partnerUser as { name: string })?.name ||
            'Unknown User'
          : (message.fromUserName as string) ||
            (partnerUser as { name: string })?.name ||
            'Unknown User'

      // Get property details
      const propertyDetails = message.propertyId
        ? propertiesMap.get(message.propertyId as string) || {
            title: `Property ${(message.propertyId as string).slice(0, 8)}`,
          }
        : { title: 'General Inquiry' }

      if (!conversationMap.has(partnerId as string)) {
        conversationMap.set(partnerId as string, {
          userId: partnerId,
          userName: partnerName,
          userAvatar: (partnerUser as { avatar?: string })?.avatar,
          userType: (partnerUser as { userType: string })?.userType,
          unreadCount: 0,
          messages: [],
          lastMessageAt: message.sentAt,
          lastMessage: message.message,
          propertyTitle: propertyDetails.title,
          propertyImage: propertyDetails.image || '',
          lastMessageFromUserId: message.fromUserId,
        })
      }

      const conversation = conversationMap.get(partnerId as string) as {
        messages: unknown[]
        lastMessageAt: string
        lastMessage: string
        lastMessageFromUserId: string
        unreadCount: number
      }
      conversation.messages.push(message)

      if (
        new Date(message.sentAt as string) >
        new Date(conversation.lastMessageAt)
      ) {
        conversation.lastMessageAt = message.sentAt as string
        conversation.lastMessage = message.message as string
        conversation.lastMessageFromUserId = message.fromUserId as string
      }

      if (!message.isRead && message.toUserId === userId) {
        conversation.unreadCount++
      }
    })

    // Convert to array and sort by last message date
    conversations.push(...conversationMap.values())
    conversations.sort(
      (a: unknown, b: unknown) =>
        new Date((b as { lastMessageAt: string }).lastMessageAt).getTime() -
        new Date((a as { lastMessageAt: string }).lastMessageAt).getTime()
    )

    return NextResponse.json(conversations)
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
