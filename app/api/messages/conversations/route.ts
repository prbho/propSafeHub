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

type UserDetails = { name: string; avatar?: string; userType: string }

function chunkArray<T>(items: T[], chunkSize: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize))
  }
  return chunks
}

async function fetchUserDetailsMap(
  userIds: string[]
): Promise<Map<string, UserDetails>> {
  const result = new Map<string, UserDetails>()
  if (userIds.length === 0) return result

  const chunks = chunkArray(userIds, 100)

  for (const ids of chunks) {
    try {
      const usersBatch = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [
          Query.equal('$id', ids),
          Query.select(['$id', 'name', 'avatar', 'userType']),
        ]
      )

      usersBatch.documents.forEach((doc: any) => {
        result.set(doc.$id, {
          name: doc.name || `User ${doc.$id.slice(0, 8)}`,
          avatar: doc.avatar,
          userType: doc.userType || 'buyer',
        })
      })
    } catch {
      // Ignore collection misses for this batch.
    }

    const unresolvedAfterUsers = ids.filter((id) => !result.has(id))
    if (unresolvedAfterUsers.length === 0) continue

    try {
      const agentsBatch = await databases.listDocuments(
        DATABASE_ID,
        AGENTS_COLLECTION_ID,
        [
          Query.equal('$id', unresolvedAfterUsers),
          Query.select(['$id', 'name', 'avatar']),
        ]
      )

      agentsBatch.documents.forEach((doc: any) => {
        result.set(doc.$id, {
          name: doc.name || `Agent ${doc.$id.slice(0, 8)}`,
          avatar: doc.avatar,
          userType: 'agent',
        })
      })
    } catch {
      // Ignore collection misses for this batch.
    }

    const unresolvedAfterAgents = ids.filter((id) => !result.has(id))
    if (unresolvedAfterAgents.length === 0) continue

    try {
      const leadsBatch = await databases.listDocuments(
        DATABASE_ID,
        LEADS_COLLECTION_ID,
        [
          Query.equal('$id', unresolvedAfterAgents),
          Query.select(['$id', 'name', 'fullName', 'avatar']),
        ]
      )

      leadsBatch.documents.forEach((doc: any) => {
        result.set(doc.$id, {
          name: doc.name || doc.fullName || `Lead ${doc.$id.slice(0, 8)}`,
          avatar: doc.avatar,
          userType: 'lead',
        })
      })
    } catch {
      // Ignore collection misses for this batch.
    }
  }

  return result
}

async function fetchPropertyDetailsMap(
  propertyIds: string[]
): Promise<Map<string, { title: string; image?: string }>> {
  const result = new Map<string, { title: string; image?: string }>()
  if (propertyIds.length === 0) return result

  const chunks = chunkArray(propertyIds, 100)

  for (const ids of chunks) {
    try {
      const propertiesBatch = await databases.listDocuments(
        DATABASE_ID,
        PROPERTIES_COLLECTION_ID,
        [Query.equal('$id', ids), Query.select(['$id', 'title', 'images'])]
      )

      propertiesBatch.documents.forEach((doc: any) => {
        result.set(doc.$id, {
          title: doc.title || `Property ${doc.$id.slice(0, 8)}`,
          image: doc.images?.[0],
        })
      })
    } catch {
      // Ignore batch failure and keep fallback behavior.
    }
  }

  return result
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Get messages where user is sender OR recipient.
    const [sentMessages, receivedMessages] = await Promise.all([
      databases.listDocuments(DATABASE_ID, MESSAGES_COLLECTION_ID, [
        Query.equal('fromUserId', userId),
        Query.orderDesc('sentAt'),
        Query.limit(100),
        Query.select([
          '$id',
          'fromUserId',
          'toUserId',
          'propertyId',
          'sentAt',
          'message',
          'isRead',
          'fromUserName',
          'toUserName',
        ]),
      ]),
      databases.listDocuments(DATABASE_ID, MESSAGES_COLLECTION_ID, [
        Query.equal('toUserId', userId),
        Query.orderDesc('sentAt'),
        Query.limit(100),
        Query.select([
          '$id',
          'fromUserId',
          'toUserId',
          'propertyId',
          'sentAt',
          'message',
          'isRead',
          'fromUserName',
          'toUserName',
        ]),
      ]),
    ])

    const allMessages = [...sentMessages.documents, ...receivedMessages.documents]

    if (allMessages.length === 0) {
      return NextResponse.json({
        conversations: [],
        groupedByPartner: {},
        summary: { totalPartners: 0, totalConversations: 0 },
      })
    }

    const userIds = new Set<string>()
    const propertyIds = new Set<string>()

    allMessages.forEach((message: any) => {
      userIds.add(message.fromUserId)
      userIds.add(message.toUserId)
      if (message.propertyId) {
        propertyIds.add(message.propertyId)
      }
    })

    userIds.delete(userId)

    const usersMap = await fetchUserDetailsMap(Array.from(userIds))
    const propertiesMap = await fetchPropertyDetailsMap(Array.from(propertyIds))

    const conversations: any[] = []
    const conversationMap = new Map<string, any>()

    allMessages.forEach((message: any) => {
      const partnerId =
        message.fromUserId === userId ? message.toUserId : message.fromUserId
      const propertyId = message.propertyId || null
      const conversationKey = `${partnerId}-${propertyId || 'general'}`

      const partnerUser = usersMap.get(partnerId)
      const partnerName =
        message.fromUserId === userId
          ? message.toUserName ||
            partnerUser?.name ||
            `User ${partnerId.slice(0, 8)}`
          : message.fromUserName ||
            partnerUser?.name ||
            `User ${partnerId.slice(0, 8)}`

      const propertyInfo = propertyId
        ? propertiesMap.get(propertyId) || {
            title: `Property ${propertyId.slice(0, 8)}`,
          }
        : { title: 'General Inquiry' }

      if (!conversationMap.has(conversationKey)) {
        conversationMap.set(conversationKey, {
          id: conversationKey,
          partnerId,
          partnerName,
          partnerAvatar: partnerUser?.avatar,
          partnerType: partnerUser?.userType || 'user',
          propertyId,
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

      if (new Date(message.sentAt) > new Date(conversation.lastMessageAt)) {
        conversation.lastMessageAt = message.sentAt
        conversation.lastMessage = message.message
        conversation.lastMessageFromUserId = message.fromUserId
      }

      if (!message.isRead && message.toUserId === userId) {
        conversation.unreadCount++
      }
    })

    conversations.push(...conversationMap.values())
    conversations.sort(
      (a, b) =>
        new Date(b.lastMessageAt).getTime() -
        new Date(a.lastMessageAt).getTime()
    )

    const groupedByPartner: Record<string, any[]> = {}
    conversations.forEach((conversation) => {
      if (!groupedByPartner[conversation.partnerId]) {
        groupedByPartner[conversation.partnerId] = []
      }
      groupedByPartner[conversation.partnerId].push(conversation)
    })

    Object.keys(groupedByPartner).forEach((partnerId) => {
      groupedByPartner[partnerId].sort(
        (a, b) =>
          new Date(b.lastMessageAt).getTime() -
          new Date(a.lastMessageAt).getTime()
      )
    })

    return NextResponse.json({
      conversations,
      groupedByPartner,
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
