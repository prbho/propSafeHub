'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Property } from '@/types'
import { BarChart, Edit, Eye, MessageCircle, UserCheck } from 'lucide-react'
import { toast } from 'sonner'

import Portal from '../Portal'
import { Button } from '../ui/button'
import MessageModal from './MessageModal'

interface MessageButtonProps {
  propertyId: string
  propertyTitle?: string
  variant?: 'button' | 'icon' | 'text'
  property?: Property
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  showText?: boolean
  agentId?: string
  agentName?: string
}

interface OwnerInfo {
  ownerId: string
  ownerName: string
  ownerType: string
  ownerAvatar?: string
  propertyTitle?: string
  userId?: string
  agentId?: string
}

export default function MessageButton({
  property,
  propertyId,
  propertyTitle,
  variant = 'button',
  className = '',
  size = 'md',
  showIcon = true,
  showText = true,
}: MessageButtonProps) {
  const { user } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [ownerInfo, setOwnerInfo] = useState<OwnerInfo | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (propertyId) {
      fetchOwnerInfo()
    }
  }, [propertyId])

  const fetchOwnerInfo = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching owner info for property:', propertyId)

      const response = await fetch(`/api/properties/${propertyId}/owner`)

      if (!response.ok) {
        // If API fails, use property data as fallback
        console.warn('⚠️ Property owner API failed, using fallback data')
        if (property) {
          const fallbackInfo: OwnerInfo = {
            ownerId: property.agentId || property.userId || 'unknown',
            ownerName: property.agentName || property.name || 'Property Owner',
            ownerType: property.agentId ? 'agent' : 'user',
            propertyTitle: property.title,
            agentId: property.agentId,
            userId: property.userId,
          }
          setOwnerInfo(fallbackInfo)
          return
        }
        throw new Error('Failed to fetch owner info')
      }

      const data = await response.json()
      console.log('✅ Owner info fetched:', data)
      setOwnerInfo(data)
    } catch (error) {
      console.error('Error fetching owner info:', error)
      // Ultimate fallback
      const fallbackInfo: OwnerInfo = {
        ownerId: 'unknown',
        ownerName: 'Property Owner',
        ownerType: 'agent',
        propertyTitle: propertyTitle || 'Property',
      }
      setOwnerInfo(fallbackInfo)
      toast.error('Could not fetch property owner information')
    } finally {
      setLoading(false)
    }
  }

  // Check if current user is the owner
  const isOwnProfile = ownerInfo
    ? user?.$id === ownerInfo.ownerId ||
      (ownerInfo.userId && user?.$id === ownerInfo.userId) ||
      (ownerInfo.agentId && user?.$id === ownerInfo.agentId)
    : false

  // Size classes
  const sizeClasses = {
    sm: {
      button: 'px-3 py-2 text-sm',
      icon: 'p-2',
      text: 'text-sm',
    },
    md: {
      button: 'px-4 py-2 text-base',
      icon: 'p-2',
      text: 'text-base',
    },
    lg: {
      button: 'px-6 py-3 text-lg',
      icon: 'p-3',
      text: 'text-lg',
    },
  }

  const handleClick = () => {
    if (!ownerInfo || ownerInfo.ownerId === 'unknown') {
      toast.error('Property owner information not available')
      return
    }

    if (isOwnProfile) {
      return
    }

    if (!user) {
      toast.error('Please sign in to send messages')
      return
    }

    setShowModal(true)
  }

  // Loading state
  if (loading) {
    return (
      <Button disabled size="lg">
        Loading...
      </Button>
    )
  }

  // If this is the user's own property
  if (isOwnProfile) {
    if (variant === 'icon') {
      return (
        <div
          className={`flex items-center justify-center p-3 bg-blue-50 border border-blue-200 rounded-lg ${className}`}
        >
          <UserCheck className="w-4 h-4 text-blue-600 mr-2" />
          <span className="text-xs text-blue-700 font-medium">
            Your Listing
          </span>
        </div>
      )
    }

    return (
      <div className={`space-y-4 ${className}`}>
        {/* Owner badge */}
        <div className="p-4 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <UserCheck className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-blue-800">
              You posted this property
            </span>
          </div>

          {/* Property stats */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-1 text-gray-600">
              <Eye className="w-3 h-3" />
              <span>{(property?.views || 0).toLocaleString()} views</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <BarChart className="w-3 h-3" />
              <span>{property?.favorites || 0} favorites</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => {
              if (propertyId) {
                window.location.href = `/agent/dashboard?edit=${propertyId}`
              } else {
                window.location.href = '/agent/dashboard'
              }
            }}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Listing
          </Button>

          <Button
            variant="outline"
            className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
            onClick={() => {
              window.location.href = '/agent/dashboard'
            }}
          >
            View Dashboard
          </Button>
        </div>
      </div>
    )
  }

  // Determine button content
  const renderButtonContent = () => {
    if (variant === 'icon') {
      return showIcon ? <MessageCircle className="w-4 h-4" /> : null
    }

    if (variant === 'text') {
      return showText ? `Message ${ownerInfo?.ownerName || 'Owner'}` : null
    }

    // Default button variant
    return (
      <>
        {showIcon && <MessageCircle className="w-4 h-4 mr-2" />}
        {showText && `Message ${ownerInfo?.ownerName || 'Owner'}`}
      </>
    )
  }

  // Determine button classes
  const getButtonClasses = () => {
    const baseClasses =
      'text-white cursor-pointer capitalize transition-colors w-full py-6 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg transform transition-all duration-200 border-0'

    if (variant === 'icon') {
      return `${baseClasses} ${sizeClasses[size].icon} aspect-square w-fit bg-transparent text-gray-400 flex items-center justify-center ${className}`
    }

    if (variant === 'text') {
      return `${baseClasses} ${sizeClasses[size].text} px-3 py-2 rounded-md ${className}`
    }

    // Default button
    return `${baseClasses} ${sizeClasses[size].button} rounded-lg flex items-center justify-center ${className}`
  }

  return (
    <>
      <Button
        onClick={handleClick}
        className={getButtonClasses()}
        title={`Message ${ownerInfo?.ownerName || 'Owner'}`}
        size="lg"
      >
        {renderButtonContent()}
      </Button>

      {showModal && ownerInfo && (
        <Portal>
          <MessageModal
            toUserId={ownerInfo.ownerId}
            toUserName={ownerInfo.ownerName}
            toUserType={ownerInfo.ownerType}
            propertyId={propertyId}
            propertyTitle={ownerInfo.propertyTitle || propertyTitle}
            onClose={() => setShowModal(false)}
          />
        </Portal>
      )}
    </>
  )
}
