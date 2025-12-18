/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server'

import {
  AGENTS_COLLECTION_ID,
  DATABASE_ID,
  databases,
  LEADS_COLLECTION_ID,
  MESSAGES_COLLECTION_ID,
  PROPERTIES_COLLECTION_ID,
  Query,
  USERS_COLLECTION_ID,
} from '@/lib/appwrite-server'

// Helper function to get user details from appropriate collection
async function getUserDetails(
  userId: string
): Promise<{ name: string; avatar?: string; userType: string }> {
  try {
    // Try users collection first
    try {
      const userDoc = await databases.getDocument(
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
      const agentDoc = await databases.getDocument(
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
      const leadDoc = await databases.getDocument(
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
    const propertyDoc = await databases.getDocument(
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

    console.log('📨 Conversations API called for user:', userId)

    // Get all messages where this user is either sender OR recipient
    const [sentMessages, receivedMessages] = await Promise.all([
      databases.listDocuments(DATABASE_ID, MESSAGES_COLLECTION_ID, [
        Query.equal('fromUserId', userId),
        Query.orderDesc('sentAt'),
        Query.limit(100),
      ]),
      databases.listDocuments(DATABASE_ID, MESSAGES_COLLECTION_ID, [
        Query.equal('toUserId', userId),
        Query.orderDesc('sentAt'),
        Query.limit(100),
      ]),
    ])

    const allMessages = [
      ...sentMessages.documents,
      ...receivedMessages.documents,
    ]

    console.log('📨 Messages found:', {
      userId,
      sentCount: sentMessages.total,
      receivedCount: receivedMessages.total,
      totalMessages: allMessages.length,
    })

    if (allMessages.length === 0) {
      console.log('⚠️ No messages found for user')
      return NextResponse.json({
        conversations: [],
        groupedByPartner: {},
        summary: { totalPartners: 0, totalConversations: 0 },
      })
    }

    // Get unique user IDs from conversations
    const userIds = new Set<string>()
    // Get unique property IDs for title lookup
    const propertyIds = new Set<string>()

    allMessages.forEach((message: any) => {
      userIds.add(message.fromUserId)
      userIds.add(message.toUserId)
      if (message.propertyId) {
        propertyIds.add(message.propertyId)
      }
    })

    // Remove the current user ID
    userIds.delete(userId)

    console.log('👥 Unique partners & properties:', {
      partners: Array.from(userIds),
      properties: Array.from(propertyIds),
    })

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

    // Group by conversation partner AND property
    const conversations: any[] = []
    const conversationMap = new Map<string, any>()

    allMessages.forEach((message: any) => {
      const partnerId =
        message.fromUserId === userId ? message.toUserId : message.fromUserId
      const propertyId = message.propertyId || null

      // Create unique key: partnerId + propertyId
      const conversationKey = `${partnerId}-${propertyId || 'general'}`

      const partnerUser = usersMap.get(partnerId)

      // Use stored names from message if available
      const partnerName =
        message.fromUserId === userId
          ? message.toUserName ||
            partnerUser?.name ||
            `User ${partnerId.slice(0, 8)}`
          : message.fromUserName ||
            partnerUser?.name ||
            `User ${partnerId.slice(0, 8)}`

      // Get property details
      const propertyInfo = propertyId
        ? propertiesMap.get(propertyId) || {
            title: `Property ${propertyId.slice(0, 8)}`,
          }
        : { title: 'General Inquiry' }

      if (!conversationMap.has(conversationKey)) {
        conversationMap.set(conversationKey, {
          id: conversationKey,
          partnerId: partnerId,
          partnerName: partnerName,
          partnerAvatar: partnerUser?.avatar,
          partnerType: partnerUser?.userType || 'user',
          propertyId: propertyId,
          propertyTitle: propertyInfo.title,
          propertyImage: propertyInfo.image || '',
          unreadCount: 0,
          messages: [],
          lastMessageAt: message.sentAt,
          lastMessage: message.message,
          lastMessageFromUserId: message.fromUserId,
        })
      }

      const conversation = conversationMap.get(conversationKey)
      conversation.messages.push(message)

      // Update last message if this one is newer
      if (new Date(message.sentAt) > new Date(conversation.lastMessageAt)) {
        conversation.lastMessageAt = message.sentAt
        conversation.lastMessage = message.message
        conversation.lastMessageFromUserId = message.fromUserId
      }

      // Count unread messages
      if (!message.isRead && message.toUserId === userId) {
        conversation.unreadCount++
      }
    })

    // Convert to array and sort by last message date
    conversations.push(...conversationMap.values())
    conversations.sort(
      (a, b) =>
        new Date(b.lastMessageAt).getTime() -
        new Date(a.lastMessageAt).getTime()
    )

    // Group conversations by partner for the frontend
    const groupedByPartner: Record<string, any[]> = {}
    conversations.forEach((conversation) => {
      const partnerId = conversation.partnerId
      if (!groupedByPartner[partnerId]) {
        groupedByPartner[partnerId] = []
      }
      groupedByPartner[partnerId].push(conversation)
    })

    // Sort each partner's conversations by last message date
    Object.keys(groupedByPartner).forEach((partnerId) => {
      groupedByPartner[partnerId].sort(
        (a, b) =>
          new Date(b.lastMessageAt).getTime() -
          new Date(a.lastMessageAt).getTime()
      )
    })

    console.log('✅ Returning conversations:', {
      totalConversations: conversations.length,
      totalPartners: Object.keys(groupedByPartner).length,
      groupedByPartner: Object.keys(groupedByPartner).map((partnerId) => ({
        partnerId,
        partnerName: groupedByPartner[partnerId][0]?.partnerName,
        conversationCount: groupedByPartner[partnerId].length,
      })),
    })

    return NextResponse.json({
      conversations: conversations,
      groupedByPartner: groupedByPartner,
      summary: {
        totalPartners: Object.keys(groupedByPartner).length,
        totalConversations: conversations.length,
      },
    })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
