// app/api/agents/notifications/[id]/read/route.ts
import { NextRequest, NextResponse } from 'next/server'

import {
  DATABASE_ID,
  NOTIFICATIONS_COLLECTION_ID,
  serverDatabases,
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

    console.log('📖 Marking agent notification as read:', notificationId)

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      )
    }

    // Check if we already marked this as read recently
    const cacheKey = `agent-read-${notificationId}`
    if (readStatusCache.has(cacheKey)) {
      console.log('Returning cached agent read status response')
      return NextResponse.json({
        success: true,
        cached: true,
        message: 'Notification already marked as read',
      })
    }

    // First, get the notification to verify it exists and belongs to an agent
    try {
      const notification = await serverDatabases.getDocument(
        DATABASE_ID,
        NOTIFICATIONS_COLLECTION_ID,
        notificationId
      )

      console.log('🔍 Found agent notification:', {
        id: notification.$id,
        agentId: notification.agentId,
        title: notification.title,
      })

      // Update only the isRead field
      const updatedNotification = await serverDatabases.updateDocument(
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
      console.log(
        `✅ Agent notification read update completed in ${duration}ms`
      )

      return NextResponse.json({
        success: true,
        notification: updatedNotification,
      })
    } catch {}
  } catch {
    const duration = Date.now() - startTime

    return NextResponse.json({ status: 500 })
  }
}

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
