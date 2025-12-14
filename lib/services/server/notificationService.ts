// lib/services/server/notificationService.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

'use server'

import {
  DATABASE_ID,
  ID,
  NOTIFICATIONS_COLLECTION_ID,
  serverDatabases,
} from '@/lib/appwrite-server'

export interface CreateNotificationData {
  userId: string
  type:
    | 'propertyUpdate'
    | 'systemAlert'
    | 'userMessage'
    | 'appointmentReminder'
    | 'message'
    | 'favorite'
    | 'property_view'
    | 'viewing_request'
    | 'system'
  title: string
  message: string
  relatedId?: string
  actionUrl?: string
  metadata?: Record<string, any>
  agentId?: string
}

export async function createNotification(data: CreateNotificationData) {
  console.log('🔔 [NOTIFICATION SERVICE] Creating notification:', {
    userId: data.userId,
    type: data.type,
    title: data.title,
    relatedId: data.relatedId,
  })

  try {
    const notificationData = {
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      isRead: false,
      relatedId: data.relatedId || null,
      actionUrl: data.actionUrl || null,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      agentId: data.agentId || null,
      // createdAt: new Date().toISOString(),
      // updatedAt: new Date().toISOString(),
    }

    console.log(
      '📋 [NOTIFICATION SERVICE] Notification data:',
      notificationData
    )

    const notification = await serverDatabases.createDocument(
      DATABASE_ID,
      NOTIFICATIONS_COLLECTION_ID,
      ID.unique(),
      notificationData
    )

    console.log(
      '✅ [NOTIFICATION SERVICE] Notification created successfully:',
      notification.$id
    )

    return { success: true, notification }
  } catch (error: any) {
    console.error(
      '❌ [NOTIFICATION SERVICE] Error creating notification:',
      error.message
    )
    console.error('❌ [NOTIFICATION SERVICE] Error stack:', error.stack)
    return { success: false, error: 'Failed to create notification' }
  }
}
