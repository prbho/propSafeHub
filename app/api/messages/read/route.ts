//app/api/messages/read/route.ts
import { NextRequest, NextResponse } from 'next/server'

import {
  DATABASE_ID,
  databases,
  MESSAGES_COLLECTION_ID,
  Query,
} from '@/lib/appwrite-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messageIds, userId } = body

    // Validate request body
    if (!messageIds || !Array.isArray(messageIds)) {
      console.error('❌ Invalid messageIds:', messageIds)
      return NextResponse.json(
        { error: 'Message IDs array is required', received: messageIds },
        { status: 400 }
      )
    }

    if (!userId || typeof userId !== 'string') {
      console.error('❌ Invalid userId:', userId)
      return NextResponse.json(
        { error: 'Valid user ID is required', received: userId },
        { status: 400 }
      )
    }

    // Filter out any invalid message IDs
    const validMessageIds = messageIds.filter(
      (id: unknown) => typeof id === 'string' && id.length > 0
    )

    if (validMessageIds.length === 0) {
      console.error('❌ No valid message IDs')
      return NextResponse.json(
        { error: 'No valid message IDs provided' },
        { status: 400 }
      )
    }

    // Verify that the user has permission to mark these messages as read
    // Only mark messages where the user is the recipient
    const messagesToUpdate = await databases.listDocuments(
      DATABASE_ID,
      MESSAGES_COLLECTION_ID,
      [Query.equal('$id', validMessageIds), Query.equal('toUserId', userId)]
    )

    if (messagesToUpdate.total === 0) {
      return NextResponse.json(
        {
          error: 'No messages found or no permission to update',
          details: {
            requestedIds: validMessageIds,
            userId: userId,
          },
        },
        { status: 403 }
      )
    }

    // Mark messages as read in small batches to avoid write spikes.
    const batchSize = 10
    for (let i = 0; i < messagesToUpdate.documents.length; i += batchSize) {
      const batch = messagesToUpdate.documents.slice(i, i + batchSize)
      await Promise.all(
        batch.map((message) =>
          databases.updateDocument(
            DATABASE_ID,
            MESSAGES_COLLECTION_ID,
            message.$id,
            {
              isRead: true,
            }
          )
        )
      )
    }

    return NextResponse.json({
      success: true,
      updatedCount: messagesToUpdate.total,
      updatedIds: messagesToUpdate.documents.map((d) => d.$id),
    })
  } catch (error) {
    console.error('❌ Error marking messages as read:', error)
    return NextResponse.json(
      {
        error: 'Failed to mark messages as read',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

