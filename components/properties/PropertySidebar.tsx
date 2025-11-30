// components/properties/PropertySidebar.tsx - WITH MORTGAGE CALCULATOR
'use client'

import { useState } from 'react'
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
}

export default function PropertySidebar({ property }: PropertySidebarProps) {
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showMortgageCalculator, setShowMortgageCalculator] = useState(false)
  const { user } = useAuth()
  const isPropertyOwner = user?.$id === property.agentId

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

          {/* Mortgage Calculator Button - HARD TO MISS */}
          <div className="mb-4">
            <Button
              onClick={() => setShowMortgageCalculator(true)}
              className="w-full py-6 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg ransform transition-all duration-200 border-0"
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

            {/* Call-to-action text */}
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-600">
                💡 See your monthly payments and loan options
              </p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <MessageButton
              property={property}
              agentId={property.agentId}
              agentName={property.agentName || 'Property Agent'}
              propertyId={property.$id}
              propertyTitle={property.title}
              className="w-full py-6 capitalize"
              variant="button"
            />

            <Button
              variant="outline"
              className="w-full py-6 border-gray-300 hover:bg-gray-50"
              onClick={() => setShowScheduleModal(true)}
              disabled={isPropertyOwner}
              title={
                isPropertyOwner
                  ? "You can't schedule a viewing for your own property"
                  : 'Schedule a property viewing'
              }
            >
              <Calendar className="h-5 w-5 mr-2" />
              {isPropertyOwner ? 'Manage Viewings' : 'Schedule Viewing'}
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
