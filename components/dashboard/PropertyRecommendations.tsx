// components/dashboard/PropertyRecommendations.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Bath, Bed, Heart, MapPin, Square } from 'lucide-react'

interface Property {
  $id: string
  title: string
  price: number
  location: string
  image: string
  bedrooms: number
  bathrooms: number
  area: number
  isFavorite?: boolean
}

interface PropertyRecommendationsProps {
  properties: Property[]
  userId: string
}

export default function PropertyRecommendations({
  properties,
  userId,
}: PropertyRecommendationsProps) {
  const [localProperties, setLocalProperties] = useState<Property[]>(properties)

  const toggleFavorite = async (propertyId: string) => {
    try {
      const response = await fetch('/api/users/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          propertyId,
          action: 'toggle',
        }),
      })

      if (response.ok) {
        setLocalProperties((prev) =>
          prev.map((property) =>
            property.$id === propertyId
              ? { ...property, isFavorite: !property.isFavorite }
              : property
          )
        )
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(price)
  }

  if (properties.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recommended Properties
        </h3>
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">🏠</div>
          <p className="text-gray-500">No recommendations available yet.</p>
          <p className="text-sm text-gray-400 mt-1">
            Start browsing properties to get personalized recommendations.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Recommended For You
        </h3>
        <Link
          href="/properties"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {localProperties.map((property) => (
          <div
            key={property.$id}
            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Property Image */}
            <div className="relative h-48 bg-gray-200">
              {property.image ? (
                <Image
                  src={property.image}
                  alt={property.title}
                  className="w-full h-full object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">No Image</span>
                </div>
              )}

              {/* Favorite Button */}
              <button
                onClick={() => toggleFavorite(property.$id)}
                className={`absolute top-3 right-3 p-2 rounded-full ${
                  property.isFavorite
                    ? 'bg-red-500 text-white'
                    : 'bg-white text-gray-400 hover:text-red-500'
                } transition-colors`}
              >
                <Heart
                  className={`w-4 h-4 ${
                    property.isFavorite ? 'fill-current' : ''
                  }`}
                />
              </button>
            </div>

            {/* Property Details */}
            <div className="p-4">
              <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
                {property.title}
              </h4>

              <div className="flex items-center text-sm text-gray-600 mb-2">
                <MapPin className="w-3 h-3 mr-1" />
                <span className="line-clamp-1">{property.location}</span>
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-gray-900 text-lg">
                  {formatPrice(property.price)}
                </span>
              </div>

              {/* Property Features */}
              <div className="flex items-center justify-between text-sm text-gray-600 border-t pt-3">
                <div className="flex items-center gap-1">
                  <Bed className="w-4 h-4" />
                  <span>{property.bedrooms} bed</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bath className="w-4 h-4" />
                  <span>{property.bathrooms} bath</span>
                </div>
                <div className="flex items-center gap-1">
                  <Square className="w-4 h-4" />
                  <span>{property.area} sq ft</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <a
                  href={`/properties/${property.$id}`}
                  className="flex-1 bg-blue-600 text-white text-center py-2 px-3 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  View Details
                </a>
                <a
                  href={`/viewings/schedule?propertyId=${property.$id}`}
                  className="flex-1 border border-gray-300 text-gray-700 text-center py-2 px-3 rounded text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Schedule Tour
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
