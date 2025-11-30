// lib/services/client-message-service.ts
'use client'

import { CreateMessageData, Message } from '@/types'
import { Account, Client, Databases, ID, Query } from 'appwrite'

class ClientMessageService {
  private client: Client
  private databases: Databases
  private account: Account

  constructor() {
    this.client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

    this.databases = new Databases(this.client)
    this.account = new Account(this.client)
  }

  async getCurrentUser() {
    try {
      return await this.account.get()
    } catch {}
  }

  async sendMessage(messageData: CreateMessageData): Promise<Message> {
    const user = await this.getCurrentUser()
    if (!user) {
      throw new Error('Please sign in to send messages')
    }

    try {
      const message = await this.databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_TABLE_ID!,
        ID.unique(),
        {
          fromUserId: user.$id,
          toUserId: messageData.toUserId,
          propertyId: messageData.propertyId || null,
          message: messageData.message,
          messageType: messageData.messageType || 'general',
          sentAt: new Date().toISOString(),
          isRead: false,
        }
      )

      return message as unknown as Message
    } catch (error) {
      console.error('Error sending message:', error)
      throw new Error('Failed to send message')
    }
  }

  async getConversation(
    otherUserId: string,
    propertyId?: string
  ): Promise<Message[]> {
    const user = await this.getCurrentUser()
    if (!user) {
      throw new Error('Please sign in to view messages')
    }

    try {
      const [sentMessages, receivedMessages] = await Promise.all([
        this.databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_TABLE_ID!,
          [
            Query.equal('fromUserId', user.$id),
            Query.equal('toUserId', otherUserId),
            ...(propertyId ? [Query.equal('propertyId', propertyId)] : []),
            Query.orderAsc('sentAt'),
          ]
        ),
        this.databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_TABLE_ID!,
          [
            Query.equal('fromUserId', otherUserId),
            Query.equal('toUserId', user.$id),
            ...(propertyId ? [Query.equal('propertyId', propertyId)] : []),
            Query.orderAsc('sentAt'),
          ]
        ),
      ])

      const allMessages = [
        ...sentMessages.documents,
        ...receivedMessages.documents,
      ]
      allMessages.sort(
        (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
      )

      return allMessages as unknown as Message[]
    } catch (error) {
      console.error('Error fetching conversation:', error)
      throw new Error('Failed to fetch conversation')
    }
  }
}

export const clientMessageService = new ClientMessageService()
