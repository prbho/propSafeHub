'use client'

import { ViewTypeButton } from './ViewTypeButton'

interface ViewTypeToggleProps {
  viewType: 'all' | 'buy' | 'rent' | 'short-let'
  isNavigating: boolean
  onViewTypeChange: (type: 'all' | 'buy' | 'rent' | 'short-let') => void
  variant?: 'desktop' | 'mobile'
}

export function ViewTypeToggle({
  viewType,
  isNavigating,
  onViewTypeChange,
  variant = 'desktop',
}: ViewTypeToggleProps) {
  const types: Array<'all' | 'buy' | 'rent' | 'short-let'> = [
    'all',
    'buy',
    'rent',
    'short-let',
  ]

  if (variant === 'mobile') {
    return (
      <div className="flex bg-gray-100/80 backdrop-blur-sm rounded-xl p-1 gap-1 border">
        {types.map((type) => (
          <ViewTypeButton
            key={type}
            type={type}
            isActive={viewType === type}
            isNavigating={isNavigating}
            onClick={onViewTypeChange}
            variant="mobile"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex border border-emerald-50 bg-emerald-100 rounded-lg p-1 gap-1">
      {types.map((type) => (
        <ViewTypeButton
          key={type}
          type={type}
          isActive={viewType === type}
          isNavigating={isNavigating}
          onClick={onViewTypeChange}
          variant="desktop"
        />
      ))}
    </div>
  )
}
