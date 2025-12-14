// lib/services/server/notificationTriggers.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createNotification } from './notificationService'

export async function triggerMessageNotification({
  toUserId,
  fromUserName,
  message,
  propertyId,
  propertyTitle,
}: {
  toUserId: string
  fromUserName: string
  message: string
  propertyId?: string
  propertyTitle?: string
}) {
  console.log('🔔 [NOTIFICATION TRIGGER] triggerMessageNotification called')
  const title = `New message from ${fromUserName}`
  const notificationMessage = propertyTitle
    ? `${fromUserName} sent you a message about ${propertyTitle}`
    : `${fromUserName} sent you a message`

  try {
    const result = await createNotification({
      userId: toUserId,
      type: 'userMessage', // Changed from 'message' to 'userMessage'
      title,
      message: notificationMessage,
      relatedId: propertyId,
      actionUrl: '/messages',
      metadata: {
        fromUserName,
        messagePreview: message.substring(0, 100),
        propertyTitle,
      },
    })

    console.log(
      '✅ [NOTIFICATION TRIGGER] Message notification result:',
      result.success ? 'Success' : 'Failed'
    )
    return result
  } catch (error: any) {
    console.error(
      '❌ [NOTIFICATION TRIGGER] Error in triggerMessageNotification:',
      error
    )
    return { success: false, error: error.message }
  }
}

export async function triggerFavoriteNotification({
  propertyOwnerId,
  userName,
  propertyId,
  propertyTitle,
}: {
  propertyOwnerId: string
  userName: string
  propertyId: string
  propertyTitle: string
}) {
  console.log('🔔 [NOTIFICATION TRIGGER] triggerFavoriteNotification called', {
    propertyOwnerId,
    userName,
    propertyId,
    propertyTitle,
  })

  try {
    const result = await createNotification({
      userId: propertyOwnerId,
      type: 'favorite', // Changed from 'propertyUpdate' to 'favorite'
      title: 'Your property was favorited ❤️',
      message: `${userName} added "${propertyTitle}" to their favorites`,
      relatedId: propertyId,
      actionUrl: `/properties/${propertyId}`,
      metadata: {
        userName,
        propertyTitle,
      },
    })

    console.log(
      '✅ [NOTIFICATION TRIGGER] Favorite notification result:',
      result.success ? 'Success' : 'Failed'
    )
    return result
  } catch (error: any) {
    console.error(
      '❌ [NOTIFICATION TRIGGER] Error in triggerFavoriteNotification:',
      error
    )
    return { success: false, error: error.message }
  }
}

export async function triggerPropertyViewNotification({
  propertyOwnerId,
  propertyId,
  propertyTitle,
}: {
  propertyOwnerId: string
  propertyId: string
  propertyTitle: string
}) {
  console.log(
    '🔔 [NOTIFICATION TRIGGER] triggerPropertyViewNotification called'
  )

  try {
    const result = await createNotification({
      userId: propertyOwnerId,
      type: 'property_view', // Use 'property_view' type
      title: 'New Property View 👀',
      message: `Your property "${propertyTitle}" was viewed`,
      relatedId: propertyId,
      actionUrl: `/properties/${propertyId}`,
    })

    console.log(
      '✅ [NOTIFICATION TRIGGER] Property view notification result:',
      result.success ? 'Success' : 'Failed'
    )
    return result
  } catch (error: any) {
    console.error(
      '❌ [NOTIFICATION TRIGGER] Error in triggerPropertyViewNotification:',
      error
    )
    return { success: false, error: error.message }
  }
}

export async function triggerViewingRequestNotification({
  agentId,
  customerName,
  propertyId,
  propertyTitle,
}: {
  agentId: string
  customerName: string
  propertyId: string
  propertyTitle: string
}) {
  console.log(
    '🔔 [NOTIFICATION TRIGGER] triggerViewingRequestNotification called'
  )

  try {
    const result = await createNotification({
      userId: agentId,
      type: 'viewing_request', // Use 'viewing_request' type
      title: 'New Viewing Request 📅',
      message: `${customerName} requested a viewing for ${propertyTitle}`,
      relatedId: propertyId,
      actionUrl: `/agent/viewings`,
      metadata: {
        customerName,
        propertyTitle,
      },
    })

    console.log(
      '✅ [NOTIFICATION TRIGGER] Viewing request notification result:',
      result.success ? 'Success' : 'Failed'
    )
    return result
  } catch (error: any) {
    console.error(
      '❌ [NOTIFICATION TRIGGER] Error in triggerViewingRequestNotification:',
      error
    )
    return { success: false, error: error.message }
  }
}
