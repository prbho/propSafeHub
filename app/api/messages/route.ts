/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server'

import {
  DATABASE_ID,
  databases,
  ID,
  MESSAGES_COLLECTION_ID,
  Query,
} from '@/lib/appwrite-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.userId || !body.toUserId || !body.message) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, toUserId, message' },
        { status: 400 }
      )
    }

    // Create message document
    const messageData = {
      fromUserId: body.userId,
      toUserId: body.toUserId,
      propertyId: body.propertyId || null,
      message: body.message.trim(),
      messageType: body.messageType || 'text',
      sentAt: new Date().toISOString(),
      isRead: false,
      fromUserName: body.fromUserName,
      toUserName: body.toUserName,
      fromUserType: body.fromUserType,
      toUserType: body.toUserType,
      agentName: body.agentName,
      agentId: body.agentId,
      messageTitle: body.messageTitle || body.message.substring(0, 50),
    }

    const message = await databases.createDocument(
      DATABASE_ID,
      MESSAGES_COLLECTION_ID,
      ID.unique(),
      messageData
    )

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      data: message,
    })
  } catch (error: any) {
    console.error('❌ Error sending message:', error)

    // Return proper error response
    return NextResponse.json(
      {
        error: error.message || 'Failed to send message',
        details: error.toString(),
      },
      { status: 500 }
    )
  }
}

// Keep your existing GET function here...

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const otherUserId = searchParams.get('otherUserId')
    const propertyId = searchParams.get('propertyId')

    if (!userId || !otherUserId) {
      return NextResponse.json(
        { error: 'User ID and Other User ID are required' },
        { status: 400 }
      )
    }

    // Build the query
    const queries = [
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
      Query.limit(100),
    ]

    // Add property filter if provided
    if (propertyId) {
      queries.push(Query.equal('propertyId', propertyId))
    }

    // Fetch messages in a single query
    const messagesResponse = await databases.listDocuments(
      DATABASE_ID,
      MESSAGES_COLLECTION_ID,
      queries
    )

    const messages = messagesResponse.documents

    // Transform to ensure consistent field names
    const transformedMessages = messages.map((msg: any) => ({
      $id: msg.$id,
      id: msg.$id,
      fromUserId: msg.fromUserId,
      toUserId: msg.toUserId,
      propertyId: msg.propertyId || null,
      message: msg.message || '',
      messageType: msg.messageType || 'text',
      sentAt: msg.sentAt || msg.$createdAt,
      isRead: Boolean(msg.isRead),
      fromUserName: msg.fromUserName,
      toUserName: msg.toUserName,
      fromUserType: msg.fromUserType,
      toUserType: msg.toUserType,
      agentName: msg.agentName,
      agentId: msg.agentId,
      messageTitle: msg.messageTitle,
      $createdAt: msg.$createdAt,
      $updatedAt: msg.$updatedAt,
    }))

    return NextResponse.json(transformedMessages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

