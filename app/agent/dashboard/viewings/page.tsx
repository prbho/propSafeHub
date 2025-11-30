// app/agent/dashboard/viewings/page.tsx
'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ScheduleViewing } from '@/types'

import ViewingDetails from './components/ViewingDetails'
import ViewingsHeader from './components/ViewingsHeader'
import ViewingsSidebar from './components/ViewingsSidebar'
import {
  AccessDenied,
  LoadingState,
  ViewingsSkeleton,
} from './components/ViewingsUI'

export default function ViewingsManagementPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [viewings, setViewings] = useState<ScheduleViewing[]>([])
  const [selectedViewing, setSelectedViewing] =
    useState<ScheduleViewing | null>(null)
  const [loading, setLoading] = useState(true)
  const [accessChecked, setAccessChecked] = useState(false)

  const viewingId = searchParams.get('viewing')

  // Memoize the fetch function
  const fetchViewings = useCallback(async () => {
    if (!user?.$id) return

    try {
      console.log('📡 Fetching viewings for agent:', user.$id)
      const response = await fetch(`/api/agents/${user.$id}/viewings`)

      if (!response.ok) {
        throw new Error(`Failed to fetch viewings: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Viewings fetched:', data.length)
      setViewings(data)
    } catch (error) {
      console.error('❌ Error fetching viewings:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.$id])

  // Memoize status update function
  const handleStatusUpdate = useCallback(
    async (viewingId: string, status: 'confirmed' | 'cancelled') => {
      try {
        console.log('🔄 Updating viewing status:', viewingId, status)
        const response = await fetch(`/api/viewings/${viewingId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        })

        if (response.ok) {
          console.log('✅ Viewing status updated successfully')
          await fetchViewings()
          if (selectedViewing?.$id === viewingId) {
            setSelectedViewing((prev) =>
              prev
                ? { ...prev, status, isConfirmed: status === 'confirmed' }
                : null
            )
          }
        } else {
          const errorData = await response.json()
          console.error(
            '❌ Failed to update viewing status:',
            response.status,
            errorData
          )
        }
      } catch (error) {
        console.error('❌ Error updating viewing status:', error)
      }
    },
    [fetchViewings, selectedViewing?.$id]
  )

  // Auth check effect
  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (user?.userType !== 'agent') {
      setAccessChecked(true)
      setLoading(false)
      return
    }

    setAccessChecked(true)
    fetchViewings()
  }, [user, isAuthenticated, isLoading, router, fetchViewings])

  // Selected viewing effect
  useEffect(() => {
    if (viewingId && viewings.length > 0) {
      const viewing = viewings.find((v) => v.$id === viewingId)
      setSelectedViewing(viewing || null)
    }
  }, [viewingId, viewings])

  // Loading states
  if (isLoading || (!accessChecked && isAuthenticated)) {
    return <LoadingState />
  }

  if (!isAuthenticated) {
    return <AccessDenied message="Please log in to access this page." />
  }

  if (user?.userType !== 'agent') {
    return (
      <AccessDenied
        message={`You need to be an agent to access this page. Current user type: ${user?.userType || 'unknown'}`}
        showHomeButton
      />
    )
  }

  if (loading) {
    return (
      <>
        <ViewingsSkeleton />
      </>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Viewing Requests</h1>
          <p className="text-gray-600 mt-1">
            Manage property viewing appointments
          </p>
        </div>
      </div>
      <ViewingsHeader viewings={viewings} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Viewings Sidebar */}

        <ViewingsSidebar
          viewings={viewings}
          selectedViewing={selectedViewing}
          onSelectViewing={setSelectedViewing}
        />

        {/* Viewing Details */}
        <ViewingDetails
          selectedViewing={selectedViewing}
          onStatusUpdate={handleStatusUpdate}
          viewingsCount={viewings.length}
          onSelectFirst={() => setSelectedViewing(viewings[0])}
        />
      </div>
    </div>
  )
}
