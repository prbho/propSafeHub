// app/dashboard/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Property } from '@/types/index'
import { Query } from 'appwrite'
import {
  Bell,
  Home,
  Mail,
  MessageCircle,
  Plus,
  Settings,
  User,
  Users,
} from 'lucide-react'

import PropertyCard from '@/components/PropertyCard'
import { databases } from '@/lib/appwrite'

interface DashboardProperty extends Property {
  inquiries?: number
  lastInquiry?: string
}

interface Message {
  id: string
  from: {
    id: string
    name: string
    type: 'buyer' | 'seller' | 'agent'
  }
  to: string
  subject: string
  content: string
  timestamp: string
  read: boolean
  propertyId?: string
}

interface Notification {
  id: string
  type: 'message' | 'inquiry' | 'view' | 'favorite' | 'system'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<
    'properties' | 'messages' | 'notifications'
  >('properties')
  const [properties, setProperties] = useState<DashboardProperty[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect agents to agent dashboard
      if (user.userType === 'agent') {
        router.push('/agent/dashboard')
        return
      }
      fetchDashboardData()
    }
  }, [isAuthenticated, user, router])

  const fetchDashboardData = async () => {
    if (!user?.$id) return

    try {
      setLoading(true)
      await Promise.all([
        fetchProperties(),
        fetchMessages(),
        fetchNotifications(),
        fetchDashboardData(),
      ])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProperties = async () => {
    const databaseId =
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'propertyDB'
    const propertiesCollectionId =
      process.env.NEXT_PUBLIC_APPWRITE_PROPERTIES_TABLE_ID || 'properties'

    const queries = []

    if (user?.userType === 'seller') {
      // Sellers see their own properties
      queries.push(Query.equal('ownerId', user.$id))
    } else if (user?.userType === 'agent') {
      // Agents see properties they listed
      queries.push(Query.equal('agentId', user.$id))
    } else {
      // Buyers see their favorite/saved properties
      queries.push(Query.equal('isActive', true))
      // We'll filter favorites on the frontend since Appwrite doesn't support array contains
    }

    queries.push(Query.orderDesc('$createdAt'))
    queries.push(Query.limit(20))

    const response = await databases.listDocuments(
      databaseId,
      propertiesCollectionId,
      queries
    )

    const transformedProperties: DashboardProperty[] = response.documents.map(
      (doc: any) => ({
        $id: doc.$id,
        $collectionId: doc.$collectionId,
        $databaseId: doc.$databaseId,
        $createdAt: doc.$createdAt,
        $updatedAt: doc.$updatedAt,
        userId: doc.userId || '',
        name: doc.name || '',
        $permissions: doc.$permissions || '',
        agentId: doc.agentId || '',
        propertyId: doc.propertyId || doc.$id,
        agentName: doc.agentName || '',
        title: doc.title || 'Untitled Property',
        description: doc.description || '',
        propertyType: doc.propertyType || 'house',
        status: doc.status || 'for-sale',
        price: doc.price || 0,
        priceUnit: doc.priceUnit || 'total',
        originalPrice: doc.originalPrice,
        priceHistory: doc.priceHistory || [],
        address: doc.address || '',
        phone: doc.phone || '',
        city: doc.city || '',
        state: doc.state || '',
        zipCode: doc.zipCode || '',
        country: doc.country || '',
        neighborhood: doc.neighborhood,
        latitude: doc.latitude || 0,
        longitude: doc.longitude || 0,
        bedrooms: doc.bedrooms || 0,
        bathrooms: doc.bathrooms || 0,
        squareFeet: doc.squareFeet || 0,
        lotSize: doc.lotSize,
        yearBuilt: doc.yearBuilt,
        features: doc.features || [],
        amenities: doc.amenities || [],
        images: doc.images || [],
        videos: doc.videos || [],
        ownerId: doc.ownerId || '',
        listedBy: doc.listedBy || 'agent',
        listDate: doc.listDate || doc.$createdAt,
        lastUpdated: doc.lastUpdated || doc.$updatedAt,
        isActive: doc.isActive !== undefined ? doc.isActive : true,
        isFeatured: doc.isFeatured || false,
        isVerified: doc.isVerified || false,
        tags: doc.tags || [],
        views: doc.views || 0,
        favorites: doc.favorites || 0,
        paymentOutright: doc.paymentOutright || doc.outright || false,
        outright: doc.outright || false,
        paymentPlan: doc.paymentPlan || false,
        mortgageEligible: doc.mortgageEligible || false,
        customPlanAvailable: doc.customPlanAvailable || false,
        customPlanDepositPercent: doc.customPlanDepositPercent || 0,
        customPlanMonths: doc.customPlanMonths || 0,
        inquiries: doc.inquiries || 0,
        lastInquiry: doc.lastInquiry,
      })
    )

    setProperties(transformedProperties)
  }

  const fetchMessages = async () => {
    // Mock messages data - replace with actual API call
    const mockMessages: Message[] = [
      {
        id: '1',
        from: { id: 'user2', name: 'John Buyer', type: 'buyer' },
        to: user?.$id || '',
        subject: 'Interested in your property',
        content:
          'Hello, I am very interested in your property. Can we schedule a viewing?',
        timestamp: new Date().toISOString(),
        read: false,
        propertyId: 'prop1',
      },
      {
        id: '2',
        from: { id: 'agent1', name: 'Sarah Wilson', type: 'agent' },
        to: user?.$id || '',
        subject: 'Partnership Opportunity',
        content: 'I would like to discuss representing your properties.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: true,
      },
      {
        id: '3',
        from: { id: 'user3', name: 'Mike Seller', type: 'seller' },
        to: user?.$id || '',
        subject: 'Property Inquiry',
        content:
          'I saw your profile and would like to learn more about your services.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        read: true,
      },
    ]
    setMessages(mockMessages)
  }

  const fetchNotifications = async () => {
    // Mock notifications data - replace with actual API call
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'view',
        title: 'Property Viewed',
        message:
          'Your property "Beautiful 3-Bedroom Apartment" was viewed 15 times today',
        timestamp: new Date().toISOString(),
        read: false,
        actionUrl: '/properties/prop1',
      },
      {
        id: '2',
        type: 'inquiry',
        title: 'New Inquiry',
        message: 'You have a new inquiry for "Luxury Villa in Lekki"',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false,
        actionUrl: '/messages',
      },
      {
        id: '3',
        type: 'favorite',
        title: 'Property Favorited',
        message: 'Someone added your property to their favorites',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        read: true,
      },
      {
        id: '4',
        type: 'system',
        title: 'Welcome to PropSafe Hub!',
        message:
          'Your account has been successfully created and is ready to use.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        read: true,
      },
    ]
    setNotifications(mockNotifications)
  }

  // Stats calculations
  const unreadMessages = messages.filter((msg) => !msg.read).length
  const unreadNotifications = notifications.filter(
    (notif) => !notif.read
  ).length
  const userProperties = properties.length

  // Show loading state while checking authentication and user role
  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="animate-pulse mx-auto max-w-7xl">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
              >
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Don't render anything if user is agent (they'll be redirected)
  if (user?.userType === 'agent') {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to agent dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {user?.name}! Here&apos;s your activity overview.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3">
            {user?.userType === 'seller' && (
              <Link
                href="/list-property"
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                List Property
              </Link>
            )}
            <Link
              href="/profile"
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Settings className="w-5 h-5" />
              Settings
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('properties')}
                className={`flex items-center gap-2 py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'properties'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Home className="w-4 h-4" />
                My Properties
                {userProperties > 0 && (
                  <span className="bg-emerald-100 text-emerald-600 text-xs px-2 py-1 rounded-full">
                    {userProperties}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('messages')}
                className={`flex items-center gap-2 py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'messages'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                Messages
                {unreadMessages > 0 && (
                  <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                    {unreadMessages}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center gap-2 py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'notifications'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Bell className="w-4 h-4" />
                Notifications
                {unreadNotifications > 0 && (
                  <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                    {unreadNotifications}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Properties Tab */}
            {activeTab === 'properties' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {user?.userType === 'seller'
                      ? 'My Property Listings'
                      : 'Saved Properties'}
                  </h3>
                  {user?.userType === 'seller' && properties.length > 0 && (
                    <Link
                      href="/list-property"
                      className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add New Property
                    </Link>
                  )}
                </div>

                {properties.length === 0 ? (
                  <div className="text-center py-12">
                    <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {user?.userType === 'seller'
                        ? 'No Properties Listed'
                        : 'No Saved Properties'}
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {user?.userType === 'seller'
                        ? 'Get started by listing your first property.'
                        : 'Save properties you like to find them easily here.'}
                    </p>
                    {user?.userType === 'seller' && (
                      <Link
                        href="/list-property"
                        className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                        List Your First Property
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((property) => (
                      <div key={property.$id} className="relative">
                        <PropertyCard
                          property={property}
                          userId={user?.$id || ''}
                        />
                        {user?.userType === 'seller' &&
                          property.inquiries &&
                          property.inquiries > 0 && (
                            <div className="absolute top-3 left-3">
                              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {property.inquiries}
                              </span>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Recent Messages
                </h3>

                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Messages
                    </h3>
                    <p className="text-gray-500">
                      You don&apos;t have any messages yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                          message.read
                            ? 'bg-white border-gray-200'
                            : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2 rounded-full ${
                                message.from.type === 'buyer'
                                  ? 'bg-green-100 text-green-600'
                                  : message.from.type === 'seller'
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'bg-purple-100 text-purple-600'
                              }`}
                            >
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-900">
                                  {message.from.name}
                                </h4>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    message.from.type === 'buyer'
                                      ? 'bg-green-100 text-green-800'
                                      : message.from.type === 'seller'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-purple-100 text-purple-800'
                                  }`}
                                >
                                  {message.from.type}
                                </span>
                                {!message.read && (
                                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                    New
                                  </span>
                                )}
                              </div>
                              <p className="font-medium text-gray-900 mt-1">
                                {message.subject}
                              </p>
                              <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                                {message.content}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500 whitespace-nowrap">
                            {new Date(message.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Recent Notifications
                </h3>

                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Notifications
                    </h3>
                    <p className="text-gray-500">
                      You&apos;re all caught up! Check back later for updates.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                          notification.read
                            ? 'bg-white border-gray-200'
                            : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2 rounded-full ${
                                notification.type === 'message'
                                  ? 'bg-green-100 text-green-600'
                                  : notification.type === 'inquiry'
                                    ? 'bg-blue-100 text-blue-600'
                                    : notification.type === 'view'
                                      ? 'bg-orange-100 text-orange-600'
                                      : notification.type === 'favorite'
                                        ? 'bg-red-100 text-red-600'
                                        : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              <Bell className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-900">
                                  {notification.title}
                                </h4>
                                {!notification.read && (
                                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                    New
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600 mt-1">
                                {notification.message}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500 whitespace-nowrap">
                            {new Date(
                              notification.timestamp
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
