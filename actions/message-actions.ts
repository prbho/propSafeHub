//actions/message-action.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import {
  AGENTS_COLLECTION_ID,
  DATABASE_ID,
  MESSAGES_COLLECTION_ID,
  PROPERTIES_COLLECTION_ID,
  Query,
  serverDatabases,
  USERS_COLLECTION_ID,
  validateAppwriteConfig,
} from '@/lib/appwrite-server'

export async function getConversations(userId: string) {
  try {
    if (!validateAppwriteConfig()) {
      throw new Error('Appwrite configuration is invalid')
    }

    if (!userId) {
      throw new Error('User ID is required')
    }

    // Get all messages involving this user
    const response = await serverDatabases.listDocuments(
      DATABASE_ID,
      MESSAGES_COLLECTION_ID,
      [
        Query.or([
          Query.equal('fromUserId', userId),
          Query.equal('toUserId', userId),
        ]),
        Query.orderDesc('sentAt'),
        Query.limit(100),
      ]
    )

    // Group messages by conversation (other user + property)
    const conversationsMap = new Map()

    for (const doc of response.documents) {
      const isFromMe = doc.fromUserId === userId
      const otherUserId = isFromMe ? doc.toUserId : doc.fromUserId
      const conversationKey = `${otherUserId}-${doc.propertyId || 'general'}`

      if (!conversationsMap.has(conversationKey)) {
        let otherUserName = 'Unknown User'
        let otherUserAvatar = ''
        let otherUserType: 'buyer' | 'seller' | 'agent' | 'admin' = 'buyer'
        let propertyTitle = doc.propertyId
          ? `Property ${doc.propertyId}`
          : 'General Inquiry'
        let propertyImage = ''

        // Try to get user details
        try {
          // First, check if we have agentName in the message
          if (doc.agentName && doc.agentName !== 'Unknown User') {
            otherUserName = doc.agentName
            otherUserType = 'agent'
          }
          // Try to fetch from users collection
          else if (otherUserId) {
            try {
              const otherUser = await serverDatabases.getDocument(
                DATABASE_ID,
                USERS_COLLECTION_ID,
                otherUserId
              )
              if (otherUser) {
                otherUserName =
                  otherUser.name || `User ${otherUserId.slice(0, 8)}`
                otherUserAvatar = otherUser.avatar
                otherUserType = otherUser.userType || 'buyer'
              }
            } catch {
              otherUserName = doc.agentName || `User ${otherUserId.slice(0, 8)}`
            }
          }
        } catch {
          otherUserName =
            doc.agentName || `User ${otherUserId?.slice(0, 8) || 'Unknown'}`
        }

        // Try to get property details
        try {
          if (doc.propertyId) {
            try {
              const property = await serverDatabases.getDocument(
                DATABASE_ID,
                PROPERTIES_COLLECTION_ID,
                doc.propertyId
              )
              if (property) {
                propertyTitle =
                  property.title || `Property ${doc.propertyId.slice(0, 8)}`
                propertyImage = property.images?.[0] || property.image || ''
              }
            } catch (error) {
              console.warn(`Could not fetch property ${doc.propertyId}:`, error)
            }
          }
        } catch (error) {
          console.error('Error processing property details:', error)
        }

        conversationsMap.set(conversationKey, {
          id: conversationKey,
          otherUserId,
          otherUserName,
          otherUserAvatar,
          otherUserType,
          propertyId: doc.propertyId,
          propertyTitle,
          propertyImage,
          lastMessage: doc.message,
          lastMessageAt: doc.sentAt || doc.$createdAt,
          lastMessageFromUserId: doc.fromUserId,
          unreadCount: !doc.isRead && doc.fromUserId !== userId ? 1 : 0,
        })
      } else {
        const existing = conversationsMap.get(conversationKey)
        // Update if this message is newer
        const existingTime = new Date(existing.lastMessageAt).getTime()
        const currentTime = new Date(doc.sentAt || doc.$createdAt).getTime()

        if (currentTime > existingTime) {
          existing.lastMessage = doc.message
          existing.lastMessageAt = doc.sentAt || doc.$createdAt
          existing.lastMessageFromUserId = doc.fromUserId
        }

        // Accumulate unread count
        if (!doc.isRead && doc.fromUserId !== userId) {
          existing.unreadCount += 1
        }
      }
    }

    const conversationsList = Array.from(conversationsMap.values()).sort(
      (a, b) =>
        new Date(b.lastMessageAt).getTime() -
        new Date(a.lastMessageAt).getTime()
    )

    return { success: true, conversations: conversationsList }
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return {
      success: false,
      error: 'Failed to fetch conversations',
      conversations: [],
    }
  }
}

export async function getMessages(userId: string, conversation: any) {
  try {
    if (!validateAppwriteConfig()) {
      throw new Error('Appwrite configuration is invalid')
    }

    const queries = [
      Query.or([
        Query.and([
          Query.equal('fromUserId', userId),
          Query.equal('toUserId', conversation.otherUserId),
        ]),
        Query.and([
          Query.equal('fromUserId', conversation.otherUserId),
          Query.equal('toUserId', userId),
        ]),
      ]),
    ]

    if (conversation.propertyId) {
      queries.push(Query.equal('propertyId', conversation.propertyId))
    }

    queries.push(Query.orderAsc('sentAt'))
    queries.push(Query.limit(100))

    const response = await serverDatabases.listDocuments(
      DATABASE_ID,
      MESSAGES_COLLECTION_ID,
      queries
    )

    // Mark messages as read
    await markMessagesAsRead(userId, conversation)

    return { success: true, messages: response.documents }
  } catch (error) {
    console.error('Error fetching messages:', error)
    return { success: false, error: 'Failed to fetch messages', messages: [] }
  }
}

async function markMessagesAsRead(userId: string, conversation: any) {
  try {
    // Find unread messages from the other user
    const unreadMessages = await serverDatabases.listDocuments(
      DATABASE_ID,
      MESSAGES_COLLECTION_ID,
      [
        Query.equal('fromUserId', conversation.otherUserId),
        Query.equal('toUserId', userId),
        Query.equal('isRead', false),
      ]
    )

    // Mark them as read
    for (const message of unreadMessages.documents) {
      await serverDatabases.updateDocument(
        DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        message.$id,
        { isRead: true }
      )
    }
  } catch (error) {
    console.error('Error marking messages as read:', error)
  }
}

export async function sendMessage(
  userId: string,
  conversation: any,
  messageText: string,
  messageTitle: string,
  user: any
) {
  try {
    if (!validateAppwriteConfig()) {
      throw new Error('Appwrite configuration is invalid')
    }

    let agentName = user.name || 'User'
    let agentId = undefined

    if (user.userType === 'agent') {
      agentId = user.$id
      // Try to get agent name from agents collection
      try {
        const agentDoc = await serverDatabases.getDocument(
          DATABASE_ID,
          AGENTS_COLLECTION_ID,
          user.$id
        )
        if (agentDoc) {
          agentName = agentDoc.name || user.name || 'Agent'
        }
      } catch (error) {
        console.warn('Could not fetch agent details, using fallback:', error)
      }
    }

    const messageData = {
      fromUserId: userId,
      toUserId: conversation.otherUserId,
      propertyId: conversation.propertyId,
      message: messageText.trim(),
      messageTitle: messageTitle || null,
      messageType: 'text',
      isRead: false,
      sentAt: new Date().toISOString(),
      agentName: agentName,
      agentId: agentId,
    }

    await serverDatabases.createDocument(
      DATABASE_ID,
      MESSAGES_COLLECTION_ID,
      'unique()',
      messageData
    )

    return { success: true }
  } catch (error) {
    console.error('Error sending message:', error)
    return { success: false, error: 'Failed to send message' }
  }
}
