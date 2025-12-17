// components/properties/PropertySidebar.tsx
'use client'

import { useEffect, useMemo, useState } from 'react' // Add useMemo
import { useAuth } from '@/contexts/AuthContext'
import { Property } from '@/types'
import { Calculator, Calendar } from 'lucide-react'
import { toast } from 'sonner'

import MessageButton from '@/components/messages/MessageButton'
import MortgageCalculator from '@/components/MortgageCalculator'
import { Button } from '@/components/ui/button'

import Portal from '../Portal'
import AgentDetails from './AgentDetails'
import ScheduleViewingModal, { ScheduleData } from './ScheduleViewingModal'

interface PropertySidebarProps {
  property: Property
  agentProfileId?: string
}

export default function PropertySidebar({
  property,
  agentProfileId,
}: PropertySidebarProps) {
  const [agentData, setAgentData] = useState<{
    name?: string
    avatar?: string
    rating?: number
    reviewCount?: number
    agency?: string
  } | null>(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showMortgageCalculator, setShowMortgageCalculator] = useState(false)
  const { user } = useAuth()

  // Use useMemo to prevent re-calculating on every render
  const isOwner = useMemo(() => {
    if (!user || !property.agentId) {
      return false
    }

    // Check all possible ownership scenarios
    const checks = [
      // 1. Direct user ID match (property was posted with user's account ID)
      property.agentId === user.$id,

      // 2. User's agent document ID match (user has agent profile)
      user.agentDocumentId && property.agentId === user.agentDocumentId,

      // 3. Agent profile context (viewing own agent profile)
      agentProfileId && property.agentId === agentProfileId,
    ]

    const result = checks.some((check) => check === true)

    console.log('🎯 Ownership result:', {
      result,
      reason: result
        ? 'User owns this property (matched account ID or agent document ID)'
        : 'User does NOT own this property',
    })

    return result
  }, [user, property.agentId, agentProfileId]) // Add dependencies

  const handleScheduleViewing = async (scheduleData: ScheduleData) => {
    try {
      const response = await fetch('/api/properties/schedule-viewing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId: property.$id,
          propertyTitle: property.title,
          agentId: property.agentId,
          ...scheduleData,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(
          'Viewing scheduled successfully! The agent will contact you soon.'
        )
        setShowScheduleModal(false)
      } else {
        toast.error('Failed to schedule viewing. Please try again.')
      }
    } catch {
      toast.error('An error occurred. Please try again.')
    }
  }

  const formatPrice = (price: number, unit: string) => {
    const formatter = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    })

    const formattedPrice = formatter.format(price)

    switch (unit) {
      case 'monthly':
        return `${formattedPrice}/mo`
      case 'yearly':
        return `${formattedPrice}/yr`
      default:
        return formattedPrice
    }
  }

  useEffect(() => {
    async function fetchAgent() {
      if (!property.agentId) return

      try {
        console.log('🔍 Fetching agent data for:', property.agentId)
        const response = await fetch(`/api/agents/${property.agentId}`)

        if (!response.ok) {
          throw new Error('Failed to fetch agent')
        }

        const data = await response.json()
        console.log('✅ Agent data fetched:', {
          name: data.name,
          avatar: data.avatar,
          agency: data.agency,
          rating: data.rating,
        })

        setAgentData({
          name: data.name,
          avatar: data.avatar,
          rating: data.rating,
          reviewCount: data.reviewCount,
          agency: data.agency,
        })
      } catch (error) {
        console.error('❌ Failed to fetch agent:', error)
      }
    }

    fetchAgent()
  }, [property.agentId])

  return (
    <>
      <div
        className="lg:sticky lg:top-24 space-y-6"
        style={{ height: 'fit-content' }}
      >
        {/* Price Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="mb-6">
            <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              {formatPrice(property.price, property.priceUnit)}
            </div>
            {property.originalPrice &&
              property.originalPrice > property.price && (
                <div className="inline-block">
                  <div className="text-lg text-gray-500 line-through">
                    {formatPrice(property.originalPrice, property.priceUnit)}
                  </div>
                  <span className="ml-2 text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                    Save{' '}
                    {Math.round(
                      ((property.originalPrice - property.price) /
                        property.originalPrice) *
                        100
                    )}
                    %
                  </span>
                </div>
              )}
          </div>

          {/* Mortgage Calculator Button */}
          <div className="mb-4">
            <Button
              onClick={() => setShowMortgageCalculator(true)}
              className="w-full py-6 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg transform transition-all duration-200 border-0 shadow-md hover:shadow-lg"
              size="lg"
            >
              <div className="flex items-center justify-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Calculator className="h-6 w-6" />
                </div>
                <span className="text-base font-bold tracking-wide">
                  CALCULATE MORTGAGE
                </span>
              </div>
            </Button>

            <div className="mt-2 text-center">
              <p className="text-xs text-gray-600">
                💡 See your monthly payments and loan options
              </p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {/* CONDITIONAL MESSAGE BUTTON - Hide if user is owner */}
            {!isOwner ? (
              <MessageButton
                property={property}
                agentId={property.agentId}
                agentName={property.agentName || 'Property Agent'}
                propertyId={property.$id}
                propertyTitle={property.title}
                className="w-full py-6 capitalize bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                variant="button"
              />
            ) : (
              <div>
                <div className="p-2 mb-2 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                  <p className="text-xs text-emerald-600">
                    This is your listing: Check your message to see if
                    interested buyers have contacted you
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full py-6 border-gray-300 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    window.location.href = `/dashboard/agent/${user?.$id}/messages?propertyId=${property.$id}`
                  }}
                >
                  View Messages
                </Button>
              </div>
            )}

            {/* Schedule Viewing Button */}
            <Button
              variant="outline"
              className="w-full py-6 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setShowScheduleModal(true)}
              disabled={isOwner}
              title={
                isOwner
                  ? "You can't schedule a viewing for your own property"
                  : 'Schedule a property viewing'
              }
            >
              <Calendar className="h-5 w-5 mr-2" />
              {isOwner ? 'Manage Viewings' : 'Schedule Viewing'}
            </Button>

            <Portal>
              <ScheduleViewingModal
                property={property}
                isOpen={showScheduleModal}
                onClose={() => setShowScheduleModal(false)}
                onSchedule={handleScheduleViewing}
              />
            </Portal>
          </div>

          <div className="border-t border-gray-200 pt-5 space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Listed Date</span>
              <span className="font-semibold text-gray-900">
                {new Date(property.listDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <span className="text-gray-600">Views</span>
              <span className="font-semibold text-gray-900">
                {property.views.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Favorites</span>
              <span className="font-semibold text-gray-900">
                {property.favorites}
              </span>
            </div>
          </div>
        </div>

        <AgentDetails property={property} />
      </div>

      {/* Mortgage Calculator Modal */}
      <Portal>
        <MortgageCalculator
          property={property}
          isOpen={showMortgageCalculator}
          onClose={() => setShowMortgageCalculator(false)}
          userId={user?.$id}
        />
      </Portal>
    </>
  )
}
