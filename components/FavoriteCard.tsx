// components/FavoriteCard.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Favorite, Property } from '@/types'
import { CalculatorIcon, StarsIcon } from 'lucide-react'

import MortgageCalculator from './MortgageCalculator'
import Portal from './Portal'

interface FavoriteCardProps {
  favorite: Favorite
  onRemove: (property: Property) => Promise<void>
}

// Enhanced time ago function with more precise formatting
const getTimeAgo = (date: string | Date): string => {
  const now = new Date()
  const past = new Date(date)
  const diffInMs = now.getTime() - past.getTime()
  const diffInSeconds = Math.floor(diffInMs / 1000)
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)
  const diffInWeeks = Math.floor(diffInDays / 7)
  const diffInMonths = Math.floor(diffInDays / 30)
  const diffInYears = Math.floor(diffInDays / 365)

  if (diffInSeconds < 60) {
    return 'Just now'
  } else if (diffInMinutes === 1) {
    return '1 minute ago'
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`
  } else if (diffInHours === 1) {
    return '1 hour ago'
  } else if (diffInHours < 24) {
    return `${diffInHours} hours ago`
  } else if (diffInDays === 1) {
    return 'Yesterday'
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`
  } else if (diffInWeeks === 1) {
    return '1 week ago'
  } else if (diffInWeeks < 4) {
    return `${diffInWeeks} weeks ago`
  } else if (diffInMonths === 1) {
    return '1 month ago'
  } else if (diffInMonths < 12) {
    return `${diffInMonths} months ago`
  } else if (diffInYears === 1) {
    return '1 year ago'
  } else {
    return `${diffInYears} years ago`
  }
}

// Helper function to check if favorite has property data
function hasProperty(
  favorite: Favorite
): favorite is Favorite & { property: Property } {
  return !!(favorite.property && favorite.property.$id)
}

const formatPrice = (price: number, unit: string) => {
  const formatter = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  })

  const formatted = formatter.format(price)

  if (unit === 'monthly') return `${formatted}/mo`
  if (unit === 'yearly') return `${formatted}/yr`
  return formatted
}

export default function FavoriteCard({
  favorite,
  onRemove,
}: FavoriteCardProps) {
  const [isRemoving, setIsRemoving] = useState(false)
  const [showMortgageCalc, setShowMortgageCalc] = useState(false)
  const [removeError, setRemoveError] = useState<string | null>(null)

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!hasProperty(favorite)) {
      setRemoveError('Cannot remove - property data missing')
      return
    }

    setIsRemoving(true)
    setRemoveError(null)
    try {
      await onRemove(favorite.property)
    } catch (err: any) {
      setRemoveError(err.message || 'Failed to remove favorite')
    } finally {
      setIsRemoving(false)
    }
  }

  const handleMortgageClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowMortgageCalc(true)
  }

  // Check if we have property data
  if (!hasProperty(favorite)) {
    return (
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-gray-200">
        <div className="text-center text-gray-500">
          <p>Property information not available</p>
          <button
            onClick={handleRemove}
            disabled={isRemoving}
            className="mt-2 text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
          >
            {isRemoving ? 'Removing...' : 'Remove from favorites'}
          </button>
          {removeError && (
            <p className="text-red-600 text-sm mt-2">{removeError}</p>
          )}
        </div>
      </div>
    )
  }

  const { property } = favorite

  const mainImage =
    property.images && property.images.length > 0
      ? property.images[0]
      : '/placeholder-property.jpg'

  return (
    <div className="relative">
      <Link href={`/properties/${property.$id}`} className="block">
        <div
          className="
            bg-white/90 backdrop-blur-md 
            rounded-2xl overflow-hidden 
            shadow-lg 
            hover:border-purple-300/60 
            hover:shadow-xl hover:shadow-purple-100/30 
            transition-all duration-300 mb-6
            relative
          "
        >
          {/* IMAGE */}
          <div className="relative h-48 w-full bg-linear-to-br from-slate-200 to-slate-300">
            <Image
              src={mainImage}
              alt={property.title || 'Property image'}
              fill
              className="object-cover"
            />

            {/* REMOVE FAVORITE BUTTON */}
            <button
              onClick={handleRemove}
              disabled={isRemoving}
              className="
                absolute top-2 right-2 z-10
                bg-white hover:bg-red-50 
                text-red-600 p-2 rounded-md 
                shadow-lg transition-all duration-200
                flex items-center justify-center
                hover:scale-105 disabled:opacity-50
              "
              title="Remove from favorites"
            >
              {isRemoving ? (
                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            {/* FEATURED BADGE */}
            {property.isFeatured && (
              <span
                className="
                  absolute top-2 left-2 z-10
                  bg-linear-to-r from-amber-500 to-yellow-400 
                  text-white px-2 py-1 rounded-md 
                  text-xs font-semibold shadow-md
                  flex items-center gap-1
                "
              >
                <StarsIcon className="w-3 h-3" />
                Featured
              </span>
            )}

            {/* STATUS BADGE */}
            <span
              className={`
                absolute bottom-2 left-2 px-3 py-1 rounded-md text-xs font-bold shadow z-10
                ${
                  property.status === 'for-sale'
                    ? 'bg-linear-to-r from-amber-700 to-orange-600 text-white'
                    : property.status === 'for-rent'
                      ? 'bg-linear-to-r from-emerald-600 to-teal-500 text-white'
                      : property.status === 'sold'
                        ? 'bg-linear-to-r from-gray-700 to-gray-600 text-white'
                        : 'bg-linear-to-r from-purple-600 to-purple-500 text-white'
                }
              `}
            >
              {property.status === 'for-sale'
                ? 'For Sale'
                : property.status === 'for-rent'
                  ? 'For Rent'
                  : property.status === 'sold'
                    ? 'Sold'
                    : 'Rented'}
            </span>

            {/* FAVORITES COUNT */}
            <span
              className="
                absolute bottom-2 right-2 px-2 py-1 rounded-md text-xs font-semibold shadow z-10
                bg-black/70 text-white
              "
            >
              {property.favorites || 0} favorites
            </span>
          </div>

          {/* CONTENT */}
          <div className="p-4 bg-linear-to-b from-white/90 to-slate-50/70">
            {/* TITLE */}
            <h3 className="text-lg font-semibold text-slate-800 mb-1 line-clamp-1">
              {property.title || 'Untitled Property'}
            </h3>

            {/* LOCATION */}
            <p className="text-gray-600 text-sm mb-3 line-clamp-1">
              {property.address || 'Address not specified'},{' '}
              {property.city || ''}, {property.state || ''}
            </p>

            {/* PRICE */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl font-bold text-black">
                {formatPrice(property.price || 0, property.priceUnit || '')}
              </span>

              {property.originalPrice &&
                property.originalPrice > property.price && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice(
                      property.originalPrice,
                      property.priceUnit || ''
                    )}
                  </span>
                )}
            </div>

            {/* META */}
            <div className="flex items-center justify-between text-sm text-gray-700 border-t pt-3">
              <span>{property.bedrooms || 0} beds</span>
              <span>{property.bathrooms || 0} baths</span>
              <span>{(property.squareFeet || 0).toLocaleString()} m²</span>
            </div>

            <div className="flex items-center">
              {/* PAYMENT OPTIONS */}
              <div className="flex flex-wrap gap-2 my-3">
                {property.outright && (
                  <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-md">
                    Outright
                  </span>
                )}
                {property.paymentPlan && (
                  <span className="px-2 py-1 bg-violet-50 text-violet-700 text-xs rounded-md">
                    Payment Plan
                  </span>
                )}
                {property.mortgageEligible && (
                  <span className="px-2 py-1 bg-purple-100 text-black text-xs rounded-md">
                    Mortgage
                  </span>
                )}
              </div>

              {/* CALCULATOR BUTTON */}
              {property.mortgageEligible && (
                <button
                  onClick={handleMortgageClick}
                  className="
                    ml-auto hover:opacity-80 cursor-pointer 
                    transition
                  "
                >
                  <CalculatorIcon className="text-black w-5 h-5" />
                </button>
              )}
            </div>

            {/* FAVORITE NOTES */}
            {favorite.notes && (
              <div className="border-t pt-3">
                <div className="flex items-center text-sm text-gray-600">
                  <svg
                    className="w-4 h-4 mr-1 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="line-clamp-2">{favorite.notes}</span>
                </div>
              </div>
            )}

            {/* FOOTER */}
            <div className="flex items-center justify-between mt-3 text-xs text-gray-500 border-t pt-3">
              <span className="capitalize">
                {property.propertyType || 'Property'}
              </span>
              <span>Added {getTimeAgo(favorite.addedAt)}</span>
            </div>

            {/* FAVORITE CATEGORY */}
            {favorite.category && favorite.category !== 'wishlist' && (
              <div className="flex items-center justify-between mt-2 text-xs">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {favorite.category}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Modal rendered in portal at body level */}
      {showMortgageCalc && (
        <Portal>
          <MortgageCalculator
            property={property}
            isOpen={showMortgageCalc}
            onClose={() => setShowMortgageCalc(false)}
          />
        </Portal>
      )}
    </div>
  )
}
