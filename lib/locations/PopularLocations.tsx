'use client'

import { useEffect, useState } from 'react'
import { MapPin, Navigation, Star, TrendingUp } from 'lucide-react'

import { Location } from '@/lib/locations/locationService'

import { clientLocationService } from './clientLocationService'

interface PopularLocationsProps {
  onLocationSelect: (location: Location) => void
  onCoordinatesSelect?: (lat: number, lng: number) => void
  title?: string
  limit?: number
  showMapFeatures?: boolean
}

export default function PopularLocations({
  onLocationSelect,
  onCoordinatesSelect,
  title = 'Popular Locations',
  limit = 8,
  showMapFeatures = false,
}: PopularLocationsProps) {
  const [popularLocations, setPopularLocations] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPopularLocations()
  }, [])

  const loadPopularLocations = async () => {
    try {
      const locations = await clientLocationService.getPopularLocations(limit)
      setPopularLocations(locations)
    } catch (error) {
      console.error('Error loading popular locations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLocationClick = (location: Location) => {
    onLocationSelect(location)
    if (location.latitude && location.longitude && onCoordinatesSelect) {
      onCoordinatesSelect(location.latitude, location.longitude)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          {title}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-12 bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  if (popularLocations.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {popularLocations.map((location) => (
          <button
            key={location.$id}
            onClick={() => handleLocationClick(location)}
            className="flex flex-col p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group text-left"
          >
            <div className="flex items-center gap-2 mb-2">
              {location.isFavored ? (
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              ) : (
                <MapPin className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
              )}
              <span className="font-medium text-gray-700 group-hover:text-blue-900 truncate flex-1">
                {location.name}
              </span>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <div className="capitalize">
                {location.type} • {location.state}
              </div>

              {showMapFeatures && location.latitude && location.longitude && (
                <div className="flex items-center gap-1 text-gray-400">
                  <Navigation className="w-3 h-3" />
                  {location.latitude.toFixed(2)},{' '}
                  {location.longitude.toFixed(2)}
                </div>
              )}

              {location.population && (
                <div>Pop: {(location.population / 1000).toFixed(0)}k</div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
