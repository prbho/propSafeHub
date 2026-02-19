'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Bell, Check, Eye, EyeOff, Loader2 } from 'lucide-react'

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
  actionText?: string
  userId?: string
  agentId?: string
}

const NOTIFICATIONS_CACHE_TTL_MS = 10000
const notificationsCache = new Map<
  string,
  { data: Notification[]; expiresAt: number }
>()
const inFlightNotifications = new Map<string, Promise<Notification[]>>()

function readNotificationsCache(endpoint: string) {
  const cached = notificationsCache.get(endpoint)
  if (!cached) return null

  if (cached.expiresAt <= Date.now()) {
    notificationsCache.delete(endpoint)
    return null
  }

  return cached.data
}

async function fetchNotificationsData(endpoint: string) {
  const cached = readNotificationsCache(endpoint)
  if (cached) return cached

  const pending = inFlightNotifications.get(endpoint)
  if (pending) return pending

  const request = (async () => {
    const response = await fetch(endpoint)

    if (!response.ok) {
      if (response.status === 405) {
        throw new Error('API method not allowed. Please check the route configuration.')
      }
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
    }

    const data = (await response.json()) as Notification[]

    notificationsCache.set(endpoint, {
      data,
      expiresAt: Date.now() + NOTIFICATIONS_CACHE_TTL_MS,
    })

    return data
  })()

  inFlightNotifications.set(endpoint, request)

  try {
    return await request
  } finally {
    inFlightNotifications.delete(endpoint)
  }
}

export default function NotificationBell() {
  const { user, isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string>('')

  const getNotificationEndpoint = useCallback(() => {
    if (!user) return null

    if (user.userType === 'agent') {
      return `/api/agents/notifications?agentId=${user.$id}`
    }

    return `/api/notifications?userId=${user.$id}`
  }, [user])

  const getMarkAsReadEndpoint = (notificationId: string) => {
    if (!user) return null

    if (user.userType === 'agent') {
      return `/api/agents/notifications/${notificationId}/read`
    }

    return `/api/notifications/${notificationId}/read`
  }

  const fetchNotifications = useCallback(async () => {
    const endpoint = getNotificationEndpoint()
    if (!endpoint) return

    try {
      setIsLoading(true)
      setError('')

      const data = await fetchNotificationsData(endpoint)
      setNotifications(data)
      setUnreadCount(data.filter((n) => !n.isRead).length)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications')
    } finally {
      setIsLoading(false)
    }
  }, [getNotificationEndpoint])

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications()
    }
  }, [fetchNotifications, isAuthenticated, user])

  const markAsRead = async (notificationId: string) => {
    const endpoint = getMarkAsReadEndpoint(notificationId)
    if (!endpoint) return

    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
      })

      if (!response.ok) {
        throw new Error(`Failed to mark as read: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.$id === notificationId ? { ...n, isRead: true } : n
          )
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.isRead)
    if (unreadNotifications.length === 0) return

    try {
      await Promise.all(
        unreadNotifications.map((n) => {
          const endpoint = getMarkAsReadEndpoint(n.$id)
          return endpoint
            ? fetch(endpoint, { method: 'PUT' })
            : Promise.resolve()
        })
      )

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
    }
  }

  const toggleReadStatus = async (notificationId: string, isRead: boolean) => {
    if (isRead) return
    await markAsRead(notificationId)
  }

  const formatTime = (dateString: string | undefined | null) => {
    if (!dateString || dateString.trim() === '') {
      return 'Recently'
    }

    try {
      let date: Date

      if (dateString.includes('T')) {
        date = new Date(dateString)
      } else if (!isNaN(Number(dateString))) {
        date = new Date(Number(dateString))
      } else {
        date = new Date(dateString)
      }

      if (isNaN(date.getTime())) {
        return 'Recently'
      }

      const now = new Date()
      const diffInMs = now.getTime() - date.getTime()
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

      if (diffInMinutes < 1) {
        return 'Just now'
      }
      if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`
      }
      if (diffInHours < 24) {
        return `${diffInHours}h ago`
      }
      if (diffInDays === 1) {
        return 'Yesterday'
      }
      if (diffInDays < 7) {
        return `${diffInDays}d ago`
      }
      if (diffInDays < 30) {
        const weeks = Math.floor(diffInDays / 7)
        return `${weeks}w ago`
      }

      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: diffInDays > 365 ? 'numeric' : undefined,
      })
    } catch {
      return 'Recently'
    }
  }

  const getUserTypeLabel = () => {
    return user?.userType === 'agent' ? 'Agent' : 'User'
  }

  const handleDropdownOpen = (open: boolean) => {
    setIsOpen(open)
    if (open && !isLoading) {
      fetchNotifications()
    }
  }

  if (!isAuthenticated) return null

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
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
              {getUserTypeLabel()}
            </Badge>
            {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs h-auto p-1"
              disabled={isLoading}
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-80">
          {error ? (
            <div className="p-4 text-center">
              <div className="text-sm text-red-600 mb-2">{error}</div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchNotifications}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : null}
                Retry
              </Button>
            </div>
          ) : isLoading ? (
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
                className={`p-3 cursor-pointer border-b last:border-b-0 group ${
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
                          {notification.actionText || 'View'}
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
                href={
                  user?.userType === 'agent'
                    ? '/agent/notifications'
                    : '/notifications'
                }
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
