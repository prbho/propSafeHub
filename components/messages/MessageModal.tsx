// components/messages/MessageModal.tsx - FIXED VERSION
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Message } from '@/types'
import { Check, CheckCheck, Send, X } from 'lucide-react'

interface MessageModalProps {
  toUserId: string
  toUserName: string
  propertyId?: string | null // ✅ Allow null values
  propertyTitle?: string
  onClose: () => void
}

// Helper function to format time
const formatTime = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function MessageModal({
  toUserId,
  toUserName,
  propertyId, // This might be null/undefined
  propertyTitle,
  onClose,
}: MessageModalProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [fetchingMessages, setFetchingMessages] = useState(false)

  useEffect(() => {
    if (user && toUserId) {
      fetchMessages()

      // Set up polling for real-time updates
      // const interval = setInterval(() => {
      //   fetchMessages()
      // }, 3000)

      // return () => clearInterval(interval)
    }
  }, [user, toUserId, propertyId])

  const fetchMessages = async () => {
    if (!user?.$id || !toUserId) return

    try {
      setFetchingMessages(true)

      const params = new URLSearchParams({
        userId: user.$id,
        otherUserId: toUserId,
      })

      if (propertyId) {
        params.append('propertyId', propertyId)
      }

      // console.log('🔍 MODAL - Fetching messages:', {
      //   propertyId: propertyId || 'NULL/undefined',
      //   url: `/api/messages?${params}`,
      // })

      const response = await fetch(`/api/messages?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }

      const messagesData = await response.json()

      // console.log('🔍 MODAL - Messages loaded:', {
      //   total: messagesData.length,
      //   fromCurrentUser: messagesData.filter(
      //     (m: any) => m.fromUserId === user.$id
      //   ).length,
      //   fromOtherUser: messagesData.filter(
      //     (m: any) => m.fromUserId === toUserId
      //   ).length,
      // })

      setMessages(messagesData)
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setFetchingMessages(false)
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !toUserId) return

    try {
      setSending(true)

      // ✅ FIXED: Only include propertyId if it has a value
      const messageData: any = {
        userId: user.$id,
        toUserId: toUserId,
        message: newMessage.trim(),
        messageType: 'text',
      }

      // Only add propertyId if it exists and is not null/empty
      if (propertyId) {
        messageData.propertyId = propertyId
      }

      // console.log('🔍 MODAL - Sending message:', {
      //   propertyId: propertyId || 'NULL/undefined',
      // })

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }

      setNewMessage('')
      // Refresh messages after a short delay
      setTimeout(() => {
        fetchMessages()
      }, 1000)
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl w-full max-w-md p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sign In Required
            </h3>
            <p className="text-gray-600 mb-4">
              Please sign in to send messages
            </p>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                Message {toUserName}
              </h3>
              {propertyTitle ? (
                <p className="text-sm text-gray-600 mt-1 truncate">
                  About: {propertyTitle}
                </p>
              ) : (
                <p className="text-sm text-gray-500 mt-1 truncate">
                  General Inquiry
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors shrink-0 ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-gray-600">Loading messages...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Send className="w-6 h-6 text-gray-400" />
              </div>
              <p className="font-medium">No messages yet</p>
              <p className="text-sm mt-1">Start the conversation!</p>
            </div>
          ) : (
            <>
              {fetchingMessages && (
                <div className="flex justify-center mb-4">
                  {/* <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div> */}
                </div>
              )}
              <div className="space-y-3">
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
            </>
          )}
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 p-4 bg-white rounded-b-2xl">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={sending}
              />
            </div>
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
      </div>
    </div>
  )
}
