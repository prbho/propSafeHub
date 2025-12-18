/* eslint-disable @typescript-eslint/no-explicit-any */

export interface MessageDocument {
  avatar: string
  $id: string
  fromUserId: string
  toUserId: string
  propertyId?: string
  message: string
  sentAt: string
  isRead: boolean
  messageType: string
  messageTitle: string
  fromUserName?: string
  toUserName?: string
  $sequence: number
  $collectionId: string
  $databaseId: string
  $createdAt: string
  $updatedAt: string
  $permissions: string[]
}

export interface Conversation {
  userId: string
  userName: string
  userAvatar?: string
  userType: string
  unreadCount: number
  messages: MessageDocument[]
  lastMessageAt: string
  lastMessage: string
  propertyTitle: string
  $sequence: number
  $collectionId: string
  $databaseId: string
  $createdAt: string
  $updatedAt: string
  $permissions: string[]
}

export interface LeadDocument {
  $id: string
  name?: string
  fullName?: string
  avatar?: string
  $sequence: number
  $collectionId: string
  $databaseId: string
  $createdAt: string
  $updatedAt: string
  $permissions: string[]
}

export interface PropertyDocument {
  $id: string
  title: string
  $sequence: number
  $collectionId: string
  $databaseId: string
  $createdAt: string
  $updatedAt: string
  $permissions: string[]
  favorites: number
  description?: string
  price?: number

  // Appwrite DefaultDocument fields:
  [key: string]: any // Add index signature
}
