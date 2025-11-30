// components/agents/LocationSearch.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Loader2, Search, X } from 'lucide-react'

import { Location } from '@/lib/locations/locationService'

interface LocationSearchProps {
  onLocationSelect: (location: Location) => void
  placeholder?: string
  showMapFeatures?: boolean
  selectedLocation?: Location | null
}

export default function LocationSearch({
  onLocationSelect,
  placeholder = 'Search for area, city, or state...',
  showMapFeatures = false,
  selectedLocation = null,
}: LocationSearchProps) {
  const [query, setQuery] = useState(selectedLocation?.name || '')
  const [suggestions, setSuggestions] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isSearching, setIsSearching] = useState(!selectedLocation)
  const inputRef = useRef<HTMLInputElement>(null)

  // Update query when selectedLocation changes
  useEffect(() => {
    if (selectedLocation) {
      setQuery(selectedLocation.name)
      setIsSearching(false)
    }
  }, [selectedLocation])

  // Debounce search queries
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Fetch locations from API route when debounced query changes
  useEffect(() => {
    const fetchLocations = async () => {
      if (!debouncedQuery.trim() || !isSearching) {
        setSuggestions([])
        return
      }

      setIsLoading(true)
      try {
        console.log('🔍 Fetching locations from API for query:', debouncedQuery)

        const response = await fetch(
          `/api/locations/search?q=${encodeURIComponent(debouncedQuery)}&limit=5`
        )

        if (!response.ok) {
          throw new Error(
            `API returned ${response.status}: ${response.statusText}`
          )
        }

        const data = await response.json()

        if (data.locations) {
          console.log('✅ Received locations from API:', data.locations.length)
          setSuggestions(data.locations)
        } else {
          console.warn('⚠️ No locations in API response')
          setSuggestions([])
        }
      } catch (error) {
        console.error('❌ Error fetching locations from API:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchLocations()
  }, [debouncedQuery, isSearching])

  const handleSelectLocation = (location: Location) => {
    setQuery(location.name)
    setSuggestions([])
    setIsSearching(false)
    onLocationSelect(location)
    inputRef.current?.blur()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setIsSearching(true)
    setSuggestions([])
  }

  const clearSearch = () => {
    setQuery('')
    setSuggestions([])
    setIsSearching(true)
    onLocationSelect(null as any) // Clear the selected location
  }

  const editLocation = () => {
    setIsSearching(true)
    setSuggestions([])
    inputRef.current?.focus()
  }

  const getLocationTypeIcon = (type: string) => {
    switch (type) {
      case 'state':
        return '🏛️'
      case 'lga':
        return '🏢'
      case 'area':
        return '📍'
      default:
        return '📍'
    }
  }

  const getLocationTypeLabel = (type: string) => {
    switch (type) {
      case 'state':
        return 'State'
      case 'lga':
        return 'LGA'
      case 'area':
        return 'Area'
      default:
        return type
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsSearching(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          </div>
        )}

        {/* Clear/Edit button */}
        {query && (
          <button
            type="button"
            onClick={isSearching ? clearSearch : editLocation}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            title={isSearching ? 'Clear search' : 'Change location'}
          >
            {isSearching ? '×' : <X className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Selected location display (when not searching) */}
      {selectedLocation && !isSearching && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-800">
              <Check className="w-4 h-4" />
              <span className="font-medium">
                Selected: {selectedLocation.name}
              </span>
              <span className="text-green-600">
                ({selectedLocation.type} • {selectedLocation.state})
              </span>
            </div>
            <button
              type="button"
              onClick={editLocation}
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              Change
            </button>
          </div>
        </div>
      )}

      {/* Search suggestions dropdown */}
      {isSearching && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((location) => (
            <button
              key={location.$id}
              type="button"
              onClick={() => handleSelectLocation(location)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="shrink-0">
                  <span className="text-lg">
                    {getLocationTypeIcon(location.type)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-gray-900 truncate">
                      {location.name}
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getLocationTypeLabel(location.type)}
                    </span>
                    {location.isPopular && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Popular
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                    {location.type === 'area' && location.lga && (
                      <>
                        <span>{location.lga}</span>
                        <span>•</span>
                      </>
                    )}
                    <span>{location.state}</span>
                    {location.population && (
                      <>
                        <span>•</span>
                        <span>
                          {location.population.toLocaleString()} people
                        </span>
                      </>
                    )}
                  </div>
                  {location.description && (
                    <div className="text-xs text-gray-400 mt-1 truncate">
                      {location.description}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results found */}
      {isSearching &&
        debouncedQuery &&
        suggestions.length === 0 &&
        !isLoading && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
            <div className="text-center text-gray-500">
              No locations found for &quot;{debouncedQuery}&quot;
            </div>
          </div>
        )}

      {/* Map features (if enabled) */}
      {showMapFeatures && (
        <div className="mt-2 text-sm text-gray-500">
          <p>Search by city, state, or local government area</p>
        </div>
      )}
    </div>
  )
}
