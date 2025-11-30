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
  try {
    const notification = await serverDatabases.createDocument(
      DATABASE_ID,
      NOTIFICATIONS_COLLECTION_ID,
      ID.unique(),
      {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        isRead: false,
        relatedId: data.relatedId || null,
        actionUrl: data.actionUrl || null,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        agentId: data.agentId || null,
      }
    )

    return { success: true, notification }
  } catch (error) {
    console.error('Error creating notification:', error)
    return { success: false, error: 'Failed to create notification' }
  }
}
