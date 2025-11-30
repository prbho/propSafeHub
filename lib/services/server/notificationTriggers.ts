import { createNotification } from './notificationService'

// lib/services/server/notificationTriggers.ts
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
  const title = `New message from ${fromUserName}`
  const notificationMessage = propertyTitle
    ? `${fromUserName} sent you a message about ${propertyTitle}`
    : `${fromUserName} sent you a message`

  // ✅ Use types that exist in both your code and Appwrite schema
  return await createNotification({
    userId: toUserId,
    type: 'userMessage',
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
  // ✅ Use types that exist in both your code and Appwrite schema
  return await createNotification({
    userId: propertyOwnerId,
    type: 'propertyUpdate',
    title: 'Your property was favorited ❤️',
    message: `${userName} added "${propertyTitle}" to their favorites`,
    relatedId: propertyId,
    actionUrl: `/properties/${propertyId}`,
    metadata: {
      userName,
      propertyTitle,
    },
  })
}

// Add other triggers with correct types
export async function triggerPropertyViewNotification({
  propertyOwnerId,
  propertyId,
  propertyTitle,
}: {
  propertyOwnerId: string
  propertyId: string
  propertyTitle: string
}) {
  return await createNotification({
    userId: propertyOwnerId,
    type: 'propertyUpdate',
    title: 'New Property View 👀',
    message: `Your property "${propertyTitle}" was viewed`,
    relatedId: propertyId,
    actionUrl: `/properties/${propertyId}`,
  })
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
  return await createNotification({
    userId: agentId,
    type: 'appointmentReminder',
    title: 'New Viewing Request 📅',
    message: `${customerName} requested a viewing for ${propertyTitle}`,
    relatedId: propertyId,
    actionUrl: `/agent/viewings`,
    metadata: {
      customerName,
      propertyTitle,
    },
  })
}
