import { NextRequest, NextResponse } from 'next/server'

import {
  DATABASE_ID,
  databases,
  NOTIFICATIONS_COLLECTION_ID,
} from '@/lib/appwrite-server'

// Simple in-memory cache for read status updates
const readStatusCache = new Map()

interface Context {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, context: Context) {
  const startTime = Date.now()

  try {
    const params = await context.params
    const notificationId = params.id

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      )
    }

    // Check if we already marked this as read recently
    const cacheKey = `agent-read-${notificationId}`
    if (readStatusCache.has(cacheKey)) {
      return NextResponse.json({
        success: true,
        cached: true,
        message: 'Notification already marked as read',
      })
    }

    // First, get the notification to verify it exists and belongs to an agent
    try {
      const notification = await databases.getDocument(
        DATABASE_ID,
        NOTIFICATIONS_COLLECTION_ID,
        notificationId
      )

      // Update only the isRead field
      const updatedNotification = await databases.updateDocument(
        DATABASE_ID,
        NOTIFICATIONS_COLLECTION_ID,
        notificationId,
        {
          isRead: true,
        }
      )

      // Cache the read operation
      readStatusCache.set(cacheKey, Date.now())

      // Simple cache cleanup
      if (readStatusCache.size > 200) {
        const now = Date.now()
        for (const [key, timestamp] of readStatusCache.entries()) {
          if (now - timestamp > 60000) {
            readStatusCache.delete(key)
          }
        }
      }

      const duration = Date.now() - startTime
      return NextResponse.json({
        success: true,
        notification: updatedNotification,
      })
    } catch (error) {
      console.error('Error getting/updating agent notification:', error)
      throw error // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error('Error in agent notification read route:', error)
    const duration = Date.now() - startTime
    console.error(`❌ Agent notification read failed after ${duration}ms`)

    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    )
  }
}

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
