import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Property } from '@/types'
import {
  BathIcon,
  BedIcon,
  CalculatorIcon,
  CrownIcon,
  Edit,
  Heart,
  Ruler,
} from 'lucide-react'

import { useFavorites } from '@/hooks/useFavorites'

import MortgageCalculator from './MortgageCalculator'
import Portal from './Portal'

interface PropertyCardProps {
  property: Property
  userId: string
  featured?: boolean
  priority?: boolean
  className?: string
  agentProfileId?: string
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

export default function PropertyCard({
  property,
  agentProfileId,
}: PropertyCardProps) {
  const [showMortgageCalc, setShowMortgageCalc] = useState(false)
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false)
  const { isFavorited, toggleFavorite } = useFavorites()
  const { user, isAuthenticated } = useAuth()

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

  const mainImage =
    property.images && property.images.length > 0
      ? property.images[0]
      : '/placeholder-property.jpg'

  const handleMortgageClick = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation to property details
    e.stopPropagation() // Prevent event bubbling
    setShowMortgageCalc(true)
  }

  const handleEditClick = (e: React.MouseEvent) => {}

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated || !user) {
      // You can redirect to login or show a login modal here
      console.log('Please log in to add favorites')
      return
    }

    setIsFavoriteLoading(true)
    try {
      await toggleFavorite(property)
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setIsFavoriteLoading(false)
    }
  }

  // Check if the current user owns this property
  const isOwner =
    user &&
    (property.agentId === user.$id || // Posted as seller
      (agentProfileId && property.agentId === agentProfileId)) // Posted as agent
  const isFavoritedByUser = isFavorited(property)

  return (
    <div className="relative">
      {/* EDIT BUTTON - Only show if user owns the property */}
      {isOwner && (
        <Link
          href={`/dashboard/${user?.userType}/${user?.$id}/properties/edit/${property.$id}`}
          onClick={handleEditClick}
          className="
            absolute top-2 left-2 z-20
            bg-blue-600 hover:bg-blue-700 
            text-white p-2 rounded-md 
            shadow-lg transition-all duration-200
            flex items-center justify-center
            hover:scale-105
          "
        >
          <Edit className="w-4 h-4" />
        </Link>
      )}

      {/* FAVORITE BUTTON - Show for all authenticated users */}
      {isAuthenticated && user && (
        <button
          onClick={handleFavoriteClick}
          disabled={isFavoriteLoading}
          className={`
            absolute top-2 right-2 z-20
            bg-white hover:bg-red-50 
            p-2 rounded-md 
            shadow-lg transition-all duration-200
            flex items-center justify-center
            hover:scale-105 disabled:opacity-50
            ${isFavoritedByUser ? 'text-red-600' : 'text-gray-600 hover:text-red-600'}
          `}
          title={
            isFavoritedByUser ? 'Remove from favorites' : 'Add to favorites'
          }
        >
          {isFavoriteLoading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : isFavoritedByUser ? (
            <Heart className="w-4 h-4 fill-current" />
          ) : (
            <Heart className="w-4 h-4" />
          )}
        </button>
      )}

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
              alt={property.title}
              fill
              className="object-cover"
            />

            {/* FEATURED BADGE */}
            {property.isFeatured && (
              <span
                className="
                  absolute top-2 left-2 z-10
                  bg-linear-to-r from-amber-400 to-amber-500 
                  text-white px-2 py-1 rounded-md 
                  text-xs font-semibold shadow-md
                  flex items-center gap-1
                "
              >
                <CrownIcon className="w-3 h-3" />
              </span>
            )}

            {/* STATUS BADGE */}
            <span
              className={`
                absolute bottom-2 left-2 px-3 py-1 rounded-md text-xs font-bold shadow z-10
                ${
                  property.status === 'for-sale'
                    ? 'bg-linear-to-r from-red-800 to-red-500 text-white'
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
          </div>

          {/* CONTENT */}
          <div className="p-4 bg-linear-to-b from-white/90 to-slate-50/70">
            {/* TITLE */}
            <h3 className="text-lg font-semibold text-slate-800 mb-1 line-clamp-1">
              {property.title}
            </h3>

            {/* LOCATION */}
            <p className="text-gray-600 text-sm mb-3 line-clamp-1">
              {property.address}, {property.city}, {property.state}
            </p>

            {/* PRICE */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl font-bold text-black">
                {formatPrice(property.price, property.priceUnit)}
              </span>

              {property.originalPrice &&
                property.originalPrice > property.price && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice(property.originalPrice, property.priceUnit)}
                  </span>
                )}
            </div>

            {/* META */}
            <div className="flex items-center justify-between text-sm text-gray-700 border-t pt-3">
              <span className="flex items-center gap-x-1">
                <BedIcon className="w-4 h-4" />
                {property.bedrooms} beds
              </span>
              <span className="flex items-center gap-x-1">
                <BathIcon className="w-4 h-4" />
                {property.bathrooms} baths
              </span>
              <span className="flex items-center gap-x-1">
                <Ruler className="w-4 h-4" />
                {property.squareFeet?.toLocaleString() || '0'} sq ft
              </span>
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
                    transition relative
                  "
                >
                  <CalculatorIcon className="text-black w-5 h-5" />
                </button>
              )}
            </div>

            {/* FOOTER */}
            <div className="flex items-center justify-between mt-3 text-xs text-gray-500 border-t pt-3">
              <span className="capitalize">{property.propertyType}</span>
              <div>
                {/* OWNER BADGE - Only show if user owns the property */}
                {isOwner && (
                  <div className="flex items-center justify-between py-1 px-3 text-xs bg-blue-100 rounded-2xl">
                    <span className="text-blue-800 rounded-full">
                      Your Listing
                    </span>
                    <span className="text-gray-500">
                      {property.views || 0} views
                    </span>
                  </div>
                )}
              </div>
              <span>{getTimeAgo(property.listDate)}</span>
            </div>
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
            userId={user?.$id}
          />
        </Portal>
      )}
    </div>
  )
}
