// components/NotificationBell.tsx
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Bell, Check, Eye, EyeOff } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'

interface Notification {
  $id: string
  title: string
  message: string
  type: string
  isRead: boolean
  $createdAt: string
  actionUrl?: string
  metadata?: string
}

export default function NotificationBell() {
  const { user, isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications()
    }
  }, [isAuthenticated, user])

  const fetchNotifications = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      // ✅ CORRECT: Use the proper notifications endpoint
      const response = await fetch(`/api/notifications?userId=${user.$id}`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
        setUnreadCount(data.filter((n: Notification) => !n.isRead).length)
      } else {
        console.error('Failed to fetch notifications:', response.status)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      // ✅ CORRECT: Use the proper read endpoint
      const response = await fetch(
        `/api/notifications/${notificationId}/read`,
        {
          method: 'PUT',
        }
      )

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.$id === notificationId ? { ...n, isRead: true } : n
          )
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.isRead)

    try {
      await Promise.all(
        unreadNotifications.map((n) =>
          fetch(`/api/notifications/${n.$id}/read`, { method: 'PUT' })
        )
      )

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const toggleReadStatus = async (notificationId: string, isRead: boolean) => {
    if (isRead) {
      // If it's already read, we can't mark it as unread with current API
      return
    }
    await markAsRead(notificationId)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    }
  }

  // Parse metadata for additional context
  const parseMetadata = (metadata: string) => {
    try {
      return metadata ? JSON.parse(metadata) : {}
    } catch {
      return {}
    }
  }

  if (!isAuthenticated) return null

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => !isOpen && fetchNotifications()}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 max-h-[80vh]">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold">Notifications</div>
            <Badge variant="outline" className="text-xs">
              {user?.userType || 'User'}
            </Badge>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs h-auto p-1"
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-80">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No notifications</p>
              <p className="text-xs text-gray-400 mt-1">
                We&apos;ll notify you when there&apos;s activity
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.$id}
                className={`p-3 cursor-pointer border-b last:border-b-0 ${
                  !notification.isRead
                    ? 'bg-blue-50 border-l-2 border-l-blue-500'
                    : ''
                } hover:bg-gray-50 transition-colors`}
                onClick={() =>
                  toggleReadStatus(notification.$id, notification.isRead)
                }
              >
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`font-medium text-sm ${
                            !notification.isRead
                              ? 'text-blue-900'
                              : 'text-gray-900'
                          }`}
                        >
                          {notification.title}
                        </span>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />
                        )}
                      </div>
                      <p
                        className={`text-xs ${
                          !notification.isRead
                            ? 'text-blue-700'
                            : 'text-gray-600'
                        } leading-relaxed`}
                      >
                        {notification.message}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleReadStatus(notification.$id, notification.isRead)
                      }}
                    >
                      {notification.isRead ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">
                      {formatTime(notification.$createdAt)}
                    </span>
                    {notification.actionUrl && (
                      <Button
                        variant="link"
                        size="sm"
                        className="text-xs h-auto p-0 text-blue-600 hover:text-blue-700"
                        asChild
                      >
                        <a
                          href={notification.actionUrl}
                          onClick={(e) => e.stopPropagation()}
                        >
                          View
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="p-0">
              <a
                href="/notifications"
                className="cursor-pointer text-center text-sm text-blue-600 hover:text-blue-700 py-2 block"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </a>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
