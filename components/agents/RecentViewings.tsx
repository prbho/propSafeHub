/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Query } from 'appwrite'
import {
  Calendar,
  Check,
  Clock,
  Mail,
  MapPin,
  Phone,
  User,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { databases } from '@/lib/appwrite'

interface Viewing {
  $id: string
  propertyId: string
  propertyTitle: string
  propertyAddress?: string
  customerName: string
  customerEmail: string
  customerPhone: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  customerMessage?: string
  preferredContact: 'email' | 'phone'
  $createdAt: string
  agentId: string
  isConfirmed: boolean
  scheduledAt: string
}

interface RecentViewingsProps {
  limit?: number
}

export default function RecentViewings({ limit = 10 }: RecentViewingsProps) {
  const { user, isAuthenticated } = useAuth()
  const [viewings, setViewings] = useState<Viewing[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingViewingId, setUpdatingViewingId] = useState<string | null>(
    null
  )

  const parseViewings = useCallback((documents: any[]): Viewing[] => {
    return documents.map((doc) => ({
      $id: doc.$id,
      propertyId: doc.propertyId,
      propertyTitle: doc.propertyTitle,
      customerName: doc.customerName,
      customerEmail: doc.customerEmail,
      customerPhone: doc.customerPhone,
      date: doc.date,
      time: doc.time,
      preferredContact: doc.preferredContact,
      status: doc.status,
      isConfirmed: doc.isConfirmed,
      scheduledAt: doc.scheduledAt,
      customerMessage: doc.customerMessage,
      confirmedAt: doc.confirmedAt,
      agentNotes: doc.agentNotes,
      reminderSent: doc.reminderSent,
      $createdAt: doc.$createdAt,
      agentId: doc.agentId,
    }))
  }, [])

  const fetchViewings = useCallback(async () => {
    if (!user?.$id) return

    try {
      setLoading(true)
      const databaseId =
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'propertyDB'
      const viewingsCollectionId =
        process.env.NEXT_PUBLIC_SCHEDULE_VIEWING_COLLECTION_ID ||
        'scheduleViewings'

      // Fetch viewings for this agent, sorted by most recent first
      const response = await databases.listDocuments(
        databaseId,
        viewingsCollectionId,
        [
          Query.equal('agentId', user.$id),
          Query.orderDesc('$createdAt'),
          Query.limit(limit),
        ]
      )

      console.log('Fetched viewings:', response.documents.length)

      const parsedViewings = parseViewings(response.documents)
      setViewings(parsedViewings)
    } catch (error) {
      console.error('Error fetching viewings:', error)
      toast.error('Failed to load viewing requests')
    } finally {
      setLoading(false)
    }
  }, [user?.$id, limit, parseViewings])

  useEffect(() => {
    if (isAuthenticated && user?.$id) {
      fetchViewings()
    }
  }, [isAuthenticated, user?.$id, fetchViewings])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (timeString: string) => {
    try {
      if (timeString.includes('T')) {
        const date = new Date(timeString)
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      }
      return timeString
    } catch {
      return timeString
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Check className="w-3 h-3" />
      case 'cancelled':
        return <X className="w-3 h-3" />
      case 'completed':
        return <Check className="w-3 h-3" />
      case 'pending':
      default:
        return <Clock className="w-3 h-3" />
    }
  }

  const handleStatusUpdate = async (
    viewingId: string,
    status: 'confirmed' | 'cancelled' | 'completed'
  ) => {
    setUpdatingViewingId(viewingId)
    try {
      const databaseId =
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'propertyDB'
      const viewingsCollectionId =
        process.env.NEXT_PUBLIC_SCHEDULE_VIEWING_COLLECTION_ID ||
        'scheduleViewings'

      // Update viewing status in Appwrite
      await databases.updateDocument(
        databaseId,
        viewingsCollectionId,
        viewingId,
        {
          status: status,
          isConfirmed: status === 'confirmed',
          confirmedAt:
            status === 'confirmed' ? new Date().toISOString() : undefined,
        }
      )

      // Refresh the viewings after update
      await fetchViewings()

      toast.success(`Viewing ${status} successfully`)
    } catch {
      toast.error('Failed to update viewing status. Please try again.')
    } finally {
      setUpdatingViewingId(null)
    }
  }

  const isUpcomingViewing = (viewing: Viewing) => {
    const viewingDateTime = new Date(`${viewing.date}T${viewing.time}`)
    return viewingDateTime > new Date() && viewing.status === 'confirmed'
  }

  const isPastViewing = (viewing: Viewing) => {
    const viewingDateTime = new Date(`${viewing.date}T${viewing.time}`)
    return viewingDateTime < new Date()
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Viewing Requests
          </h3>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 animate-pulse">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (viewings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Viewing Requests
          </h3>
        </div>
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No viewing requests yet.</p>
          <p className="text-sm text-gray-400 mt-1">
            Viewing requests from customers will appear here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Viewing Requests
          </h3>
        </div>
        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {viewings.length} {viewings.length === 1 ? 'request' : 'requests'}
        </span>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {viewings.map((viewing) => {
          const upcoming = isUpcomingViewing(viewing)
          const past = isPastViewing(viewing)

          return (
            <div
              key={viewing.$id}
              className={`border rounded-lg p-4 transition-all ${
                upcoming
                  ? 'border-blue-200 bg-blue-50'
                  : past && viewing.status === 'confirmed'
                    ? 'border-gray-200 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Property and Customer Info */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
                    {viewing.propertyTitle}
                  </h4>
                  {viewing.propertyAddress && (
                    <div className="flex items-center text-xs text-gray-600 mb-2">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span className="line-clamp-1">
                        {viewing.propertyAddress}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center text-xs text-gray-600">
                    <User className="w-3 h-3 mr-1" />
                    <span>{viewing.customerName}</span>
                  </div>
                </div>

                {/* Status Badge */}
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(viewing.status)}`}
                >
                  {getStatusIcon(viewing.status)}
                  <span className="capitalize">{viewing.status}</span>
                </div>
              </div>

              {/* Viewing Details */}
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(viewing.date)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(viewing.time)}</span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                <div className="flex items-center gap-3">
                  <a
                    href={`tel:${viewing.customerPhone}`}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                    title="Call customer"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{viewing.customerPhone}</span>
                  </a>
                  <a
                    href={`mailto:${viewing.customerEmail}`}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                    title="Email customer"
                  >
                    <Mail className="w-3 h-3" />
                    <span>Email</span>
                  </a>
                </div>
                <span className="text-gray-500 capitalize">
                  Prefers: {viewing.preferredContact}
                </span>
              </div>

              {/* Customer Message */}
              {viewing.customerMessage && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">
                    Customer Message:
                  </p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded line-clamp-2">
                    {viewing.customerMessage}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-gray-200">
                {viewing.status === 'pending' && (
                  <>
                    <button
                      onClick={() =>
                        handleStatusUpdate(viewing.$id, 'confirmed')
                      }
                      disabled={updatingViewingId === viewing.$id}
                      className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                    >
                      {updatingViewingId === viewing.$id ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Confirming...
                        </>
                      ) : (
                        <>
                          <Check className="w-3 h-3" />
                          Confirm
                        </>
                      )}
                    </button>
                    <button
                      onClick={() =>
                        handleStatusUpdate(viewing.$id, 'cancelled')
                      }
                      disabled={updatingViewingId === viewing.$id}
                      className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                    >
                      {updatingViewingId === viewing.$id ? (
                        'Cancelling...'
                      ) : (
                        <>
                          <X className="w-3 h-3" />
                          Decline
                        </>
                      )}
                    </button>
                  </>
                )}

                {viewing.status === 'confirmed' && past && (
                  <button
                    onClick={() => handleStatusUpdate(viewing.$id, 'completed')}
                    disabled={updatingViewingId === viewing.$id}
                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                  >
                    {updatingViewingId === viewing.$id ? (
                      'Marking...'
                    ) : (
                      <>
                        <Check className="w-3 h-3" />
                        Mark as Completed
                      </>
                    )}
                  </button>
                )}

                {viewing.status === 'confirmed' && upcoming && (
                  <div className="flex-1 text-center">
                    <span className="text-xs text-green-600 font-medium">
                      ⏰ Upcoming
                    </span>
                  </div>
                )}

                {viewing.status === 'completed' && (
                  <div className="flex-1 text-center">
                    <span className="text-xs text-blue-600 font-medium">
                      ✅ Completed
                    </span>
                  </div>
                )}

                {viewing.status === 'cancelled' && (
                  <div className="flex-1 text-center">
                    <span className="text-xs text-red-600 font-medium">
                      ❌ Cancelled
                    </span>
                  </div>
                )}
              </div>

              {/* View Details Link */}
              <div className="pt-2 border-t border-gray-200 mt-2">
                <a
                  href={`/agent/viewings?viewing=${viewing.$id}`}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  View full details →
                </a>
              </div>
            </div>
          )
        })}
      </div>

      {/* View All Link */}
      {viewings.length > 0 && (
        <div className="pt-4 border-t border-gray-200 mt-4">
          <a
            href="agent/dashboard/viewings"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center"
          >
            View all viewing requests
            <Calendar className="w-4 h-4 ml-1" />
          </a>
        </div>
      )}
    </div>
  )
}
