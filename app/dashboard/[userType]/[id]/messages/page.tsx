/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { Message } from '@/types'
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
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

// Helper function to format time ago
const formatTimeAgo = (dateString: string): string => {
  if (!dateString) return 'Just now'

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'Just now'
    }

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
  } catch {
    return 'Just now'
  }
}

// Helper function to format time
const formatTime = (dateString: string | undefined): string => {
  if (!dateString) return 'Now'

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'Now'
    }

    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return 'Now'
  }
}

// Conversation Group Component
const ConversationGroup = ({
  partnerId,
  conversations,
  isExpanded = false,
  onToggle,
  onSelect,
  selectedConversation,
  currentUserId,
}: {
  partnerId: string
  conversations: any[]
  isExpanded: boolean
  onToggle: (partnerId: string) => void
  onSelect: (conversation: any) => void
  selectedConversation: any | null
  currentUserId: string | undefined
}) => {
  const firstConversation = conversations[0]
  const totalUnread = conversations.reduce(
    (sum, conv) => sum + (conv.unreadCount || 0),
    0
  )
  const latestConversation = conversations[0] // Already sorted by lastMessageAt

  return (
    <div className="border border-gray-200 rounded-lg mb-3 overflow-hidden">
      {/* Partner header */}
      <div
        className="p-4 bg-white hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100"
        onClick={() => onToggle(partnerId)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserAvatar
              name={firstConversation.partnerName}
              avatar={firstConversation.partnerAvatar}
              userType={firstConversation.partnerType}
              size="md"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">
                  {firstConversation.partnerName}
                </h3>
                {firstConversation.partnerType === 'agent' && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Agent
                  </span>
                )}
                {firstConversation.partnerType === 'lead' && (
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                    Lead
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {conversations.length} conversation(s) • Latest:{' '}
                {formatTimeAgo(latestConversation.lastMessageAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {totalUnread > 0 && (
              <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                {totalUnread}
              </span>
            )}
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Property conversations */}
      {isExpanded && (
        <div className="bg-gray-50">
          {conversations.map((conversation, index) => {
            const isActive = selectedConversation?.id === conversation.id
            const isLastMessageFromMe =
              conversation.lastMessageFromUserId === currentUserId

            return (
              <div
                key={conversation.id}
                onClick={() => onSelect(conversation)}
                className={`p-4 border-t border-gray-200 cursor-pointer transition-colors ${
                  isActive ? 'bg-blue-50' : 'hover:bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {conversation.propertyTitle}
                      </span>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="pl-6">
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(conversation.lastMessageAt)}
                        </span>
                        {isLastMessageFromMe && (
                          <CheckCheck className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function MessagesPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [conversations, setConversations] = useState<any[]>([])
  const [groupedConversations, setGroupedConversations] = useState<
    Record<string, any[]>
  >({})
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [selectedConversation, setSelectedConversation] = useState<any | null>(
    null
  )
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [messagesLoading, setMessagesLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [fetchingMessages, setFetchingMessages] = useState(false)

  const fetchConversations = useCallback(async () => {
    if (!user?.$id) return

    try {
      setMessagesLoading(true)
      console.log('📨 Fetching conversations for user:', user.$id)

      const response = await fetch(
        `/api/messages/conversations?userId=${user.$id}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch conversations')
      }

      const data = await response.json()

      console.log('📨 Conversations data received:', {
        userId: user.$id,
        totalConversations: data.conversations?.length,
        totalPartners: Object.keys(data.groupedByPartner || {}).length,
        groupedData: Object.keys(data.groupedByPartner || {}).map((key) => ({
          partnerId: key,
          count: data.groupedByPartner[key].length,
        })),
      })

      if (data.conversations) {
        setConversations(data.conversations)
      }

      if (data.groupedByPartner) {
        setGroupedConversations(data.groupedByPartner)
        // Auto-expand the first group
        const firstPartnerId = Object.keys(data.groupedByPartner)[0]
        if (firstPartnerId) {
          setExpandedGroups(new Set([firstPartnerId]))
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setMessagesLoading(false)
    }
  }, [user?.$id])

  const toggleGroup = (partnerId: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(partnerId)) {
        newSet.delete(partnerId)
      } else {
        newSet.add(partnerId)
      }
      return newSet
    })
  }

  const markMessagesAsRead = async (
    conversation: any,
    messagesToMark?: Message[]
  ) => {
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
            message.fromUserId === conversation.partnerId &&
            message.toUserId === currentUser.$id
        )
        .map((message: any) => message.$id)

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

      // Update unread count in grouped conversations
      setGroupedConversations((prev) => {
        const updated = { ...prev }
        if (updated[conversation.partnerId]) {
          updated[conversation.partnerId] = updated[conversation.partnerId].map(
            (conv) =>
              conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
          )
        }
        return updated
      })
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  const fetchMessages = async (conversation: any) => {
    if (!user?.$id) return

    try {
      setFetchingMessages(true)

      const params = new URLSearchParams({
        userId: user.$id,
        otherUserId: conversation.partnerId,
      })

      // Always include propertyId if the conversation has one
      if (conversation.propertyId) {
        params.append('propertyId', conversation.propertyId)
      }

      console.log('📨 Fetching messages with params:', {
        userId: user.$id,
        otherUserId: conversation.partnerId,
        propertyId: conversation.propertyId,
        conversationTitle: conversation.propertyTitle,
      })

      const response = await fetch(`/api/messages?${params}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Failed to fetch messages:', errorText)
        throw new Error('Failed to fetch messages')
      }

      const messagesData = await response.json()

      console.log('📨 Raw messages data received:', {
        count: messagesData.length,
        data: messagesData.map((msg: any, index: number) => ({
          index,
          id: msg.$id,
          message: msg.message,
          from: msg.fromUserId,
          to: msg.toUserId,
          sentAt: msg.sentAt,
          isRead: msg.isRead,
          hasMessageField: 'message' in msg,
          hasTextField: 'text' in msg,
          hasContentField: 'content' in msg,
          allKeys: Object.keys(msg),
        })),
      })

      // Transform the data if needed
      const transformedMessages = messagesData.map((msg: any) => ({
        ...msg,
        // Ensure we have a message field
        message: msg.message || msg.text || msg.content || '',
      }))

      console.log('📨 Transformed messages:', {
        count: transformedMessages.length,
        firstMessage: transformedMessages[0]
          ? {
              id: transformedMessages[0].$id,
              message: transformedMessages[0].message,
              sentAt: transformedMessages[0].sentAt,
            }
          : null,
      })

      setMessages(transformedMessages)

      // Mark messages as read
      await markMessagesAsRead(conversation, transformedMessages)
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setFetchingMessages(false)
    }
  }

  const selectConversation = async (conversation: any) => {
    console.log('🔍 Selecting conversation:', {
      id: conversation.id,
      partnerId: conversation.partnerId,
      propertyTitle: conversation.propertyTitle,
    })

    setSelectedConversation(conversation)
    await fetchMessages(conversation)

    // Ensure the group is expanded
    if (!expandedGroups.has(conversation.partnerId)) {
      setExpandedGroups((prev) => new Set(prev).add(conversation.partnerId))
    }
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
          toUserId: selectedConversation.partnerId,
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
    } finally {
      setSending(false)
    }
  }

  // Filter conversations based on search term
  const filteredGroupedConversations = Object.keys(groupedConversations).reduce(
    (acc, partnerId) => {
      const conversations = groupedConversations[partnerId]
      const firstConversation = conversations[0]

      // Check if partner name matches search
      const matchesSearch = firstConversation?.partnerName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())

      // Check if any property title matches search
      const matchesProperty = conversations.some((conv) =>
        conv.propertyTitle?.toLowerCase().includes(searchTerm.toLowerCase())
      )

      if (matchesSearch || matchesProperty) {
        acc[partnerId] = conversations
      }

      return acc
    },
    {} as Record<string, any[]>
  )

  // Call this in your useEffect to see the actual data structure
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchConversations()
    }
  }, [isAuthenticated, user, fetchConversations])

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
            <div className="overflow-y-auto h-[calc(100vh-200px)] p-4">
              {Object.keys(filteredGroupedConversations).length === 0 ? (
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
                Object.keys(filteredGroupedConversations).map((partnerId) => (
                  <ConversationGroup
                    key={partnerId}
                    partnerId={partnerId}
                    conversations={filteredGroupedConversations[partnerId]}
                    isExpanded={expandedGroups.has(partnerId)}
                    onToggle={toggleGroup}
                    onSelect={selectConversation}
                    selectedConversation={selectedConversation}
                    currentUserId={user?.$id}
                  />
                ))
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
                          name={selectedConversation.partnerName}
                          avatar={selectedConversation.partnerAvatar}
                          userType={selectedConversation.partnerType}
                          size="md"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {selectedConversation.partnerName}
                            {selectedConversation.partnerType === 'agent' && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                Agent
                              </span>
                            )}
                            {selectedConversation.partnerType === 'lead' && (
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
                    {messages.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((message: any, index: number) => {
                        const key = message.$id
                          ? message.$id
                          : `msg-${message.fromUserId}-${message.toUserId}-${message.sentAt || index}-${Date.now()}`

                        return (
                          <div
                            key={key}
                            className={`flex ${message.fromUserId === user?.$id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                                message.fromUserId === user?.$id
                                  ? 'bg-blue-600 text-white rounded-br-none'
                                  : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                              }`}
                            >
                              <p className="text-sm">
                                {message.message || '(No message content)'}
                              </p>
                              <div
                                className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                                  message.fromUserId === user?.$id
                                    ? 'text-blue-100'
                                    : 'text-gray-500'
                                }`}
                              >
                                <span>
                                  {formatTime(
                                    message.sentAt ||
                                      message.$createdAt ||
                                      message.createdAt ||
                                      new Date().toISOString()
                                  )}
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
                        )
                      })
                    )}
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
