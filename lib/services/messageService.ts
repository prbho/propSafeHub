// lib/services/messageService.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { CreateMessageData, Message } from '@/types'

class MessageService {
  private baseUrl = '/api/messages'

  async sendMessage(
    messageData: CreateMessageData & { userId: string }
  ): Promise<Message> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...messageData,
        userId: messageData.userId,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to send message')
    }

    return response.json()
  }

  async getConversation(
    userId: string,
    otherUserId: string,
    propertyId?: string
  ): Promise<Message[]> {
    const url = new URL(this.baseUrl, window.location.origin)
    url.searchParams.set('otherUserId', otherUserId)
    url.searchParams.set('userId', userId)
    if (propertyId) {
      url.searchParams.set('propertyId', propertyId)
    }

    const response = await fetch(url.toString())

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch conversation')
    }

    return response.json()
  }

  async getUserConversations(
    userId: string
  ): Promise<Record<string, Message[]>> {
    const url = new URL(this.baseUrl, window.location.origin)
    url.searchParams.set('userId', userId)

    const response = await fetch(url.toString())

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch conversations')
    }

    return response.json()
  }

  async getFormattedConversations(userId: string): Promise<any[]> {
    const url = new URL(`${this.baseUrl}/conversations`, window.location.origin)
    url.searchParams.set('userId', userId) // Add userId parameter

    const response = await fetch(url.toString())

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch formatted conversations')
    }

    return response.json()
  }

  async markAsRead(messageIds: string[]): Promise<void> {
    const response = await fetch(`${this.baseUrl}/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messageIds }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to mark messages as read')
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const conversations = await this.getFormattedConversations(userId)

      let unreadCount = 0
      conversations.forEach((conversation) => {
        unreadCount += conversation.unreadCount || 0
      })

      return unreadCount
    } catch (error) {
      console.error('Error getting unread count:', error)
      return 0
    }
  }
}

export const messageService = new MessageService()
