// components/messages/MessageButton.tsx - UPDATED WITH CLASSNAME PROP
'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Property } from '@/types'
import { BarChart, Edit, Eye, MessageCircle, UserCheck } from 'lucide-react'
import { toast } from 'sonner'

import Portal from '../Portal'
import { Button } from '../ui/button'
import MessageModal from './MessageModal'

interface MessageButtonProps {
  agentId: string
  agentName: string
  propertyId?: string
  propertyTitle?: string
  variant?: 'button' | 'icon' | 'text'
  property?: Property
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  showText?: boolean
}

export default function MessageButton({
  property,
  agentId,
  agentName,
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

  const isOwnProfile = user?.$id === agentId

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
    if (isOwnProfile) {
      return
    }

    if (!user) {
      toast.error('Please sign in to send messages')
      return
    }
    setShowModal(true)
  }

  // If this is the agent's own property
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

          {/* Property stats - with safe property access */}
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

  // Determine button content based on props
  const renderButtonContent = () => {
    if (variant === 'icon') {
      return showIcon ? <MessageCircle className="w-4 h-4" /> : null
    }

    if (variant === 'text') {
      return showText ? `Message ${agentName}` : null
    }

    // Default button variant
    return (
      <>
        {showIcon && <MessageCircle className="w-4 h-4 mr-2" />}
        {showText && `Message ${agentName}`}
      </>
    )
  }

  // Determine button classes based on variant and size
  const getButtonClasses = () => {
    const baseClasses =
      'text-white cursor-pointer capitalize transition-colors w-full py-6 bg-linear-to-r from-emerald-600 to-emerald-800 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg ransform transition-all duration-200 border-0'

    if (variant === 'icon') {
      return `${baseClasses} ${sizeClasses[size].icon} rounded-full aspect-square flex items-center justify-center ${className}`
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
        title={`Message ${agentName}`}
        size="lg"
      >
        {renderButtonContent()}
      </Button>

      {showModal && (
        <Portal>
          <MessageModal
            toUserId={agentId}
            toUserName={agentName}
            propertyId={propertyId}
            propertyTitle={propertyTitle}
            onClose={() => setShowModal(false)}
          />
        </Portal>
      )}
    </>
  )
}
