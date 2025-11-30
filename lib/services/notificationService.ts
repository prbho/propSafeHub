// lib/services/notificationService.ts
import { Notification, NotificationCount } from '@/types'

// Client-side version
export async function getNotifications(
  userId: string
): Promise<Notification[]> {
  try {
    const response = await fetch(`/api/notifications?userId=${userId}`)
    if (!response.ok) throw new Error('Failed to fetch notifications')
    const data = (await response.json()) as Notification[]
    return data
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
}

export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const response = await fetch(`/api/notifications/count?userId=${userId}`)
    if (!response.ok) throw new Error('Failed to fetch notification count')
    const data = (await response.json()) as { unread: number }
    return data.unread
  } catch (error) {
    console.error('Error fetching notification count:', error)
    return 0
  }
}

export async function markAsRead(notificationId: string): Promise<void> {
  try {
    const response = await fetch(`/api/notifications/${notificationId}/read`, {
      method: 'PUT',
    })
    if (!response.ok) throw new Error('Failed to mark notification as read')
  } catch (error) {
    console.error('Error marking notification as read:', error)
  }
}

export async function markAllAsRead(userId: string): Promise<void> {
  try {
    const response = await fetch(
      `/api/notifications/read-all?userId=${userId}`,
      {
        method: 'PUT',
      }
    )
    if (!response.ok)
      throw new Error('Failed to mark all notifications as read')
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
  }
}

// Additional utility functions with proper typing
export async function getNotificationCount(
  userId: string
): Promise<NotificationCount> {
  try {
    const response = await fetch(`/api/notifications/count?userId=${userId}`)
    if (!response.ok) throw new Error('Failed to fetch notification count')
    const data = (await response.json()) as NotificationCount
    return data
  } catch (error) {
    console.error('Error fetching notification count:', error)
    return {
      total: 0,
      unread: 0,
      byType: {
        message: 0,
        favorite: 0,
        property_view: 0,
        viewing_request: 0,
        system: 0,
        property_update: 0,
      },
    }
  }
}

export async function deleteNotification(
  notificationId: string
): Promise<void> {
  try {
    const response = await fetch(`/api/notifications/${notificationId}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete notification')
  } catch (error) {
    console.error('Error deleting notification:', error)
  }
}

// Enhanced version with better error handling
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export async function getNotificationsWithStatus(
  userId: string
): Promise<ApiResponse<Notification[]>> {
  try {
    const response = await fetch(`/api/notifications?userId=${userId}`)
    if (!response.ok) {
      return {
        success: false,
        error: `HTTP error! status: ${response.status}`,
      }
    }
    const data = (await response.json()) as Notification[]
    return {
      success: true,
      data,
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('Error fetching notifications:', error)
    return {
      success: false,
      error: errorMessage,
    }
  }
}
