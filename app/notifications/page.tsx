// app/notifications/page.tsx
 

'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Bell, Check } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Notification {
  $id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
  actionUrl?: string
  actionText?: string
}

export default function UserNotificationsPage() {
  const { user, isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications()
    }
  }, [isAuthenticated, user])

  const fetchNotifications = async () => {
    if (!user?.$id) return

    try {
      const response = await fetch(
        `/api/notifications?userId=${user.$id}&limit=100`
      )
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
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
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.isRead)
      await Promise.all(
        unreadNotifications.map((n) =>
          fetch(`/api/notifications/${n.$id}/read`, { method: 'PUT' })
        )
      )
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const filteredNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications

  const unreadCount = notifications.filter((n) => !n.isRead).length

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p>Please log in to view your notifications.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-gray-600 mt-1">
            Stay updated with your property activities
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            <Check className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      <Tabs
        value={filter}
        onValueChange={(value) => setFilter(value as 'all' | 'unread')}
      >
        <TabsList>
          <TabsTrigger value="all" className="flex gap-2">
            All
            <Badge variant="secondary" className="text-xs">
              {notifications.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="unread" className="flex gap-2">
            Unread
            <Badge variant="destructive" className="text-xs">
              {unreadCount}
            </Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">
              {filter === 'unread'
                ? 'No unread notifications'
                : 'No notifications'}
            </h3>
            <p className="text-gray-600 mt-2">
              {filter === 'unread'
                ? "You're all caught up!"
                : "You don't have any notifications yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.$id}
              className={`cursor-pointer transition-colors ${
                !notification.isRead ? 'border-blue-200 bg-blue-50' : ''
              }`}
              onClick={() => markAsRead(notification.$id)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{notification.title}</h3>
                      {!notification.isRead && (
                        <Badge variant="default" className="bg-blue-500">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2">{notification.message}</p>
                    <p className="text-sm text-gray-400">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                  {notification.actionUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={notification.actionUrl}>
                        {notification.actionText || 'View'}
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
