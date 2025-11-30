'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Navigation, Search, Star, X } from 'lucide-react'

import { Location } from '@/lib/locations/locationService'

import { clientLocationService } from './clientLocationService'

interface LocationSearchProps {
  onLocationSelect: (location: Location) => void
  onCoordinatesSelect?: (lat: number, lng: number) => void
  placeholder?: string
  className?: string
  value?: string
  showMapFeatures?: boolean
}

export default function LocationSearch({
  onLocationSelect,
  onCoordinatesSelect,
  placeholder = 'Search states, cities, or areas...',
  className = '',
  value = '',
  showMapFeatures = false,
}: LocationSearchProps) {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setQuery(value)
  }, [value])

  const searchLocations = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      const results = await clientLocationService.searchLocations(searchQuery)
      setSuggestions(results)
    } catch {
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    searchLocations(value)
  }

  const handleSelectLocation = (location: Location) => {
    setQuery(location.name)
    setShowSuggestions(false)
    onLocationSelect(location)

    // If coordinates are available and callback provided, pass them too
    if (location.latitude && location.longitude && onCoordinatesSelect) {
      onCoordinatesSelect(location.latitude, location.longitude)
    }
  }

  const clearSearch = () => {
    setQuery('')
    setSuggestions([])
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const getLocationIcon = (location: Location) => {
    if (location.isFavored)
      return <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
    if (location.type === 'state')
      return <MapPin className="w-4 h-4 text-blue-600" />
    if (location.type === 'lga')
      return <MapPin className="w-4 h-4 text-green-600" />
    return <MapPin className="w-4 h-4 text-purple-600" />
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {showSuggestions && (query.length >= 2 || suggestions.length > 0) && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Searching...</div>
          ) : suggestions.length > 0 ? (
            <div className="py-2">
              {suggestions.map((location) => (
                <button
                  key={location.$id}
                  onClick={() => handleSelectLocation(location)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors border-b border-gray-100 last:border-b-0 group"
                >
                  <div className="flex items-center gap-3">
                    {getLocationIcon(location)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 truncate">
                          {location.name}
                        </span>
                        {location.isFavored && (
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <span className="capitalize px-2 py-0.5 bg-gray-100 rounded text-xs">
                          {location.type}
                        </span>
                        {location.lga && (
                          <>
                            <span>{location.lga}</span>
                            <span>•</span>
                          </>
                        )}
                        <span>{location.state}</span>
                        {location.latitude &&
                          location.longitude &&
                          showMapFeatures && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Navigation className="w-3 h-3" />
                                {location.latitude.toFixed(4)},{' '}
                                {location.longitude.toFixed(4)}
                              </span>
                            </>
                          )}
                      </div>
                      {location.population && (
                        <div className="text-xs text-gray-400 mt-1">
                          Population: {location.population.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-gray-500">
              No locations found for &apos;{query}&apos;
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
