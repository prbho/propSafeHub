// app/agent/messages/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { Conversation, Message } from '@/types'
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCheck,
  Filter,
  Home,
  Info,
  MessageCircle,
  Paperclip,
  Phone,
  Search,
  Send,
  Smile,
  Video,
} from 'lucide-react'

// Helper function to format time ago
const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInSeconds = Math.floor(diffInMs / 1000)
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInSeconds < 60) {
    return 'Just now'
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`
  } else if (diffInDays === 1) {
    return 'Yesterday'
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7)
    return `${weeks}w ago`
  } else {
    return date.toLocaleDateString()
  }
}

// Helper function to format time
const formatTime = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// User Avatar Component
const UserAvatar = ({
  name,
  avatar,
  userType,
  size = 'md',
}: {
  name: string
  avatar?: string
  userType?: string
  size?: 'sm' | 'md' | 'lg'
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  }

  const getInitials = (name: string) => {
    if (!name || name === 'Unknown User') return 'UU'

    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Check if avatar is a valid URL
  const isValidAvatar =
    avatar &&
    (avatar.startsWith('http') || avatar.startsWith('/')) &&
    !avatar.includes('undefined')

  if (isValidAvatar) {
    return (
      <Image
        src={avatar}
        alt={name}
        width={48}
        height={48}
        className={`${sizeClasses[size]} rounded-full object-cover`}
        onError={(e) => {
          // If image fails to load, fall back to initials
          e.currentTarget.style.display = 'none'
        }}
      />
    )
  }

  // Color based on user type
  const getColorClass = () => {
    switch (userType) {
      case 'agent':
        return 'bg-blue-500 text-white'
      case 'seller':
        return 'bg-green-500 text-white'
      case 'buyer':
        return 'bg-purple-500 text-white'
      case 'lead':
        return 'bg-orange-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  return (
    <div
      className={`${sizeClasses[size]} ${getColorClass()} rounded-full flex items-center justify-center font-semibold`}
    >
      {getInitials(name)}
    </div>
  )
}

export default function MessagesPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [messagesLoading, setMessagesLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [fetchingMessages, setFetchingMessages] = useState(false)

  // Temporary debug function
  const debugConversationsAPI = useCallback(async () => {
    if (!user?.$id) return

    const response = await fetch(
      `/api/messages/conversations?userId=${user.$id}`
    )
    const data = await response.json()
    console.log('🔍 DEBUG - Raw API response:', data)

    // Check the structure of the first conversation
    if (data.length > 0) {
      console.log('🔍 First conversation structure:', data[0])
      console.log('🔍 Conversation keys:', Object.keys(data[0]))
    }
  }, [user?.$id])

  const fetchConversations = useCallback(async () => {
    if (!user?.$id) return

    try {
      setMessagesLoading(true)
      const response = await fetch(
        `/api/messages/conversations?userId=${user.$id}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch conversations')
      }

      const conversationsData = await response.json()

      console.log('📨 Conversations data:', conversationsData)

      // Use the API data directly - it should already be in the correct format
      // If not, let's see what the actual structure is
      const transformedConversations: Conversation[] = conversationsData.map(
        (conv: any, index: number) => {
          // Create a unique ID using the other user's ID and property ID
          const conversationId = `${conv.userId}-${conv.propertyId || 'general'}-${index}`

          return {
            id: conversationId,
            otherUserId: conv.userId,
            otherUserName: conv.userName,
            otherUserAvatar: conv.userAvatar,
            otherUserType: conv.userType,
            propertyId: conv.propertyId,
            propertyTitle: conv.propertyTitle || 'General Inquiry',
            propertyImage: conv.propertyImage || '',
            lastMessage: conv.lastMessage,
            lastMessageAt: conv.lastMessageAt,
            lastMessageFromUserId: conv.lastMessageFromUserId,
            unreadCount: conv.unreadCount || 0,
          }
        }
      )

      // Check for duplicate keys
      const uniqueIds = new Set(transformedConversations.map((c) => c.id))
      if (uniqueIds.size !== transformedConversations.length) {
        console.warn('⚠️ Duplicate conversation IDs detected!')
        console.log(
          'All IDs:',
          transformedConversations.map((c) => c.id)
        )
      }

      setConversations(transformedConversations)
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setMessagesLoading(false)
    }
  }, [user?.$id])

  // In your MessagesPage component - fix the markMessagesAsRead function

  const markMessagesAsRead = async (
    conversation: Conversation,
    messagesToMark?: Message[]
  ) => {
    // Double-check user object stability
    const currentUser = user
    if (!currentUser?.$id) {
      console.log('⏳ Waiting for user object to stabilize...')
      return
    }

    try {
      const messagesToProcess = messagesToMark || messages

      const unreadMessageIds = messagesToProcess
        .filter(
          (message: any) =>
            !message.isRead &&
            message.fromUserId === conversation.otherUserId &&
            message.toUserId === currentUser.$id
        )
        .map((message: any) => message.$id)

      console.log('🆔 Using user ID:', currentUser.$id)

      if (unreadMessageIds.length === 0) return

      const response = await fetch('/api/messages/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageIds: unreadMessageIds,
          userId: currentUser.$id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to mark messages as read')
      }

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
        )
      )
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  // Then update the fetchMessages function to pass the fresh messages:
  const fetchMessages = async (conversation: Conversation) => {
    if (!user?.$id) return

    try {
      setFetchingMessages(true)

      const params = new URLSearchParams({
        userId: user.$id,
        otherUserId: conversation.otherUserId,
      })

      if (conversation.propertyId) {
        params.append('propertyId', conversation.propertyId)
      }

      const response = await fetch(`/api/messages?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }

      const messagesData = await response.json()
      setMessages(messagesData)

      // Mark messages as read - FIXED: pass the fresh messagesData
      await markMessagesAsRead(conversation, messagesData)
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setFetchingMessages(false)
    }
  }

  const selectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation)
    await fetchMessages(conversation)
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return

    try {
      setSending(true)

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.$id,
          toUserId: selectedConversation.otherUserId,
          propertyId: selectedConversation.propertyId,
          message: newMessage.trim(),
          messageType: 'text',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }

      setNewMessage('')
      // Refresh messages and conversations
      await fetchMessages(selectedConversation)
      await fetchConversations()
    } catch (error) {
      console.error('Error sending message:', error)
      // You might want to show a toast notification here
    } finally {
      setSending(false)
    }
  }

  const filteredConversations = conversations.filter(
    (conversation) =>
      conversation.otherUserName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      conversation.propertyTitle
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  )

  // Call this in your useEffect to see the actual data structure
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchConversations()
      debugConversationsAPI() // Add this line
    }
  }, [isAuthenticated, user, fetchConversations, debugConversationsAPI])

  if (isLoading || messagesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-600">Chat with agents and buyers</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Calendar className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(80vh-100px)] border-b">
          {/* Conversations Sidebar */}
          <div
            className={`${selectedConversation ? 'hidden md:block' : 'block'} w-full md:w-96 bg-white border-r border-gray-200`}
          >
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="overflow-y-auto h-[calc(100vh-200px)]">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {conversations.length === 0
                      ? 'No conversations yet'
                      : 'No conversations found'}
                  </h3>
                  <p className="text-gray-500">
                    {conversations.length === 0
                      ? 'Start a conversation by messaging an agent or buyer.'
                      : 'Try adjusting your search terms.'}
                  </p>
                </div>
              ) : (
                filteredConversations.map((conversation) => {
                  const isActive = selectedConversation?.id === conversation.id

                  return (
                    <div
                      key={conversation.id}
                      onClick={() => selectConversation(conversation)}
                      className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-blue-50 border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="shrink-0">
                          <UserAvatar
                            name={conversation.otherUserName}
                            avatar={conversation.otherUserAvatar}
                            userType={conversation.otherUserType}
                            size="md"
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {conversation.otherUserName}
                              {conversation.otherUserType === 'agent' && (
                                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                  Agent
                                </span>
                              )}
                              {conversation.otherUserType === 'lead' && (
                                <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                                  Lead
                                </span>
                              )}
                            </h3>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {formatTimeAgo(conversation.lastMessageAt)}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 truncate mb-1">
                            {conversation.lastMessage}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {conversation.unreadCount > 0 && (
                                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                                  {conversation.unreadCount}
                                </span>
                              )}
                              {conversation.propertyTitle &&
                                conversation.propertyTitle !==
                                  'General Inquiry' && (
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Home className="w-3 h-3" />
                                    {conversation.propertyTitle}
                                  </span>
                                )}
                            </div>
                            {conversation.lastMessageFromUserId ===
                              user?.$id && (
                              <CheckCheck className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div
            className={`${selectedConversation ? 'block' : 'hidden md:block'} flex-1 flex flex-col`}
          >
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedConversation(null)}
                        className="md:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>

                      {/* Participant Info */}
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          name={selectedConversation.otherUserName}
                          avatar={selectedConversation.otherUserAvatar}
                          userType={selectedConversation.otherUserType}
                          size="md"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {selectedConversation.otherUserName}
                            {selectedConversation.otherUserType === 'agent' && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                Agent
                              </span>
                            )}
                            {selectedConversation.otherUserType === 'lead' && (
                              <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                                Lead
                              </span>
                            )}
                          </h3>
                          {selectedConversation.propertyTitle &&
                            selectedConversation.propertyTitle !==
                              'General Inquiry' && (
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Home className="w-3 h-3" />
                                {selectedConversation.propertyTitle}
                              </p>
                            )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Phone className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Video className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Info className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                  {fetchingMessages && (
                    <div className="flex justify-center mb-4">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  <div className="space-y-4">
                    {messages.map((message: any) => (
                      <div
                        key={message.$id}
                        className={`flex ${message.fromUserId === user?.$id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                            message.fromUserId === user?.$id
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          <div
                            className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                              message.fromUserId === user?.$id
                                ? 'text-blue-100'
                                : 'text-gray-500'
                            }`}
                          >
                            <span>
                              {formatTime(message.sentAt || message.$createdAt)}
                            </span>
                            {message.fromUserId === user?.$id &&
                              (message.isRead ? (
                                <CheckCheck className="w-3 h-3" />
                              ) : (
                                <Check className="w-3 h-3" />
                              ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Message Input */}
                <div className="bg-white border-t border-gray-200 p-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        disabled={sending}
                      />
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <Smile className="w-5 h-5" />
                    </button>
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {sending ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              // Empty state when no conversation is selected
              <div className="flex-1 flex h-12/12 items-center justify-center bg-gray-50">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-500">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
