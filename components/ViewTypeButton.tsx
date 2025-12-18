'use client'

import { useState } from 'react'
import { Grid3X3, Home, Key, Moon } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface ViewTypeButtonProps {
  type: 'all' | 'buy' | 'rent' | 'short-let'
  isActive: boolean
  isNavigating: boolean
  onClick: (type: 'all' | 'buy' | 'rent' | 'short-let') => void
  variant?: 'desktop' | 'mobile'
}

export function ViewTypeButton({
  type,
  isActive,
  isNavigating,
  onClick,
  variant = 'desktop',
}: ViewTypeButtonProps) {
  const [isPressed, setIsPressed] = useState(false)

  // Get color scheme based on type
  const getColorScheme = () => {
    switch (type) {
      case 'all':
        return {
          active: 'bg-gray-900 text-white border-gray-900',
          inactive: 'text-gray-700 hover:bg-gray-100 border-gray-200',
          icon: 'text-gray-600',
        }
      case 'buy':
        return {
          active: 'bg-emerald-600 text-white border-emerald-600',
          inactive: 'text-emerald-700 hover:bg-emerald-50 border-emerald-200',
          icon: 'text-emerald-500',
        }
      case 'rent':
        return {
          active: 'bg-blue-600 text-white border-blue-600',
          inactive: 'text-blue-700 hover:bg-blue-50 border-blue-200',
          icon: 'text-blue-500',
        }
      case 'short-let':
        return {
          active: 'bg-purple-600 text-white border-purple-600',
          inactive: 'text-purple-700 hover:bg-purple-50 border-purple-200',
          icon: 'text-purple-500',
        }
      default:
        return {
          active: 'bg-gray-900 text-white border-gray-900',
          inactive: 'text-gray-700 hover:bg-gray-100 border-gray-200',
          icon: 'text-gray-600',
        }
    }
  }

  const colors = getColorScheme()

  // Get appropriate icon
  const getIcon = () => {
    const iconClass = `h-4 w-4 mr-2 transition-transform duration-200 ${
      isActive ? 'text-white' : colors.icon
    } ${isPressed ? 'scale-90' : ''}`

    switch (type) {
      case 'all':
        return <Grid3X3 className={iconClass} />
      case 'buy':
        return <Home className={iconClass} />
      case 'rent':
        return <Key className={iconClass} />
      case 'short-let':
        return <Moon className={iconClass} />
    }
  }

  // Get button text based on variant
  const getButtonText = () => {
    if (variant === 'mobile') {
      switch (type) {
        case 'all':
          return 'All'
        case 'buy':
          return 'Sale'
        case 'rent':
          return 'Rent'
        case 'short-let':
          return 'Short-Let'
      }
    }

    switch (type) {
      case 'all':
        return 'All'
      case 'buy':
        return 'For Sale'
      case 'rent':
        return 'For Rent'
      case 'short-let':
        return 'Short-Let'
    }
  }

  const handleClick = () => {
    if (!isNavigating) {
      setIsPressed(true)
      setTimeout(() => setIsPressed(false), 150)
      onClick(type)
    }
  }

  if (variant === 'mobile') {
    return (
      <button
        onClick={handleClick}
        disabled={isNavigating}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        className={`
          flex-1
          py-3.5
          rounded-lg
          font-medium
          text-sm
          transition-all
          duration-200
          active:scale-[0.98]
          ${isActive ? colors.active : 'bg-white text-gray-700'}
          ${isActive ? 'shadow-md' : 'shadow-sm'}
          ${isPressed ? 'scale-[0.97] brightness-95' : ''}
          ${isNavigating ? 'opacity-70 cursor-not-allowed' : ''}
          relative
          overflow-hidden
        `}
      >
        {/* Content */}
        <div className="flex items-center justify-center">
          {type === 'all' && <Grid3X3 className="h-4 w-4 mr-2" />}
          {type === 'buy' && <Home className="h-4 w-4 mr-2" />}
          {type === 'rent' && <Key className="h-4 w-4 mr-2" />}
          {type === 'short-let' && <Moon className="h-4 w-4 mr-2" />}
          <span className={isActive ? 'font-semibold' : 'font-medium'}>
            {getButtonText()}
          </span>
        </div>
      </button>
    )
  }

  // Desktop variant
  return (
    <Button
      variant="outline"
      onClick={handleClick}
      disabled={isNavigating}
      className={`
        relative
        px-4 py-2.5
        border
        rounded-lg
        font-medium
        transition-all
        duration-200
        ${isActive ? 'bg-emerald-600 text-white hover:text-emerald-100' : 'border-emerald-200'}
        ${isNavigating && !isActive ? 'opacity-50 cursor-not-allowed' : ''}
        ${isPressed ? 'scale-[0.98]' : ''}
        group
        overflow-hidden
      `}
      size="sm"
    >
      {/* Active indicator pulse effect */}
      {isActive && (
        <span className="absolute inset-0">
          <span className="absolute inset-0 bg-emerald-600 animate-pulse"></span>
        </span>
      )}

      {/* Hover effect */}
      <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent translate-x-full group-hover:translate-x-full transition-transform duration-500"></span>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center">
        {getIcon()}
        <span className={isActive ? 'font-semibold' : 'font-medium'}>
          {getButtonText()}
        </span>

        {/* Loading indicator */}
        {isNavigating && isActive && (
          <span className="ml-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </span>
        )}
      </div>
    </Button>
  )
}
