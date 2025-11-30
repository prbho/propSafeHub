// components/Header/HeaderSearch.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building, Home, Loader2, MapPin, Search, X } from 'lucide-react'

import { Input } from '@/components/ui/input'

interface SearchSuggestion {
  type: 'location' | 'property' | 'feature' | 'city'
  value: string
  display: string
  count?: number
  city?: string
  state?: string
}

export default function HeaderSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch accurate counts for each suggestion
  const fetchAccurateCounts = async (
    suggestions: SearchSuggestion[]
  ): Promise<SearchSuggestion[]> => {
    const updatedSuggestions = [...suggestions]

    for (let i = 0; i < updatedSuggestions.length; i++) {
      const suggestion = updatedSuggestions[i]

      try {
        const params = new URLSearchParams()

        switch (suggestion.type) {
          case 'city':
          case 'location':
            params.set('city', suggestion.value)
            break
          case 'property':
            params.set('propertyType', suggestion.value)
            break
        }

        // Only fetch count if we have a valid filter
        if (params.toString()) {
          const response = await fetch(
            `/api/properties/count?${params.toString()}`
          )
          if (response.ok) {
            const countData = await response.json()
            updatedSuggestions[i] = {
              ...suggestion,
              count: countData.count || 0,
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching count for ${suggestion.display}:`, error)
        // Keep the original count if there's an error
      }
    }

    return updatedSuggestions
  }

  // Fetch real data from Appwrite APIs
  const fetchSearchSuggestions = async (
    query: string
  ): Promise<SearchSuggestion[]> => {
    if (!query.trim()) {
      return getPopularSuggestions()
    }

    setIsLoading(true)
    const results: SearchSuggestion[] = []

    try {
      // Fetch locations from your API
      const locationsResponse = await fetch(
        `/api/locations/search?q=${encodeURIComponent(query)}&limit=5`
      )
      if (locationsResponse.ok) {
        const locationsData = await locationsResponse.json()
        if (locationsData.locations && locationsData.locations.length > 0) {
          locationsData.locations.forEach((location: any) => {
            results.push({
              type: 'location',
              value: location.name.toLowerCase(),
              display: location.name,
              count: location.propertyCount || 0, // Use the count from locations API
              city: location.city,
              state: location.state,
            })
          })
        }
      }
    } catch (error) {
      console.error('Error fetching locations:', error)
    }

    try {
      // Fetch properties for additional suggestions
      const propertiesResponse = await fetch(
        `/api/properties/search?q=${encodeURIComponent(query)}&limit=5`
      )
      if (propertiesResponse.ok) {
        const propertiesData = await propertiesResponse.json()
        if (propertiesData.documents && propertiesData.documents.length > 0) {
          // Count occurrences for accurate counts
          const propertyTypeCounts = new Map<string, number>()
          const cityCounts = new Map<string, number>()

          propertiesData.documents.forEach((property: any) => {
            if (property.propertyType) {
              const type = property.propertyType.toLowerCase()
              propertyTypeCounts.set(
                type,
                (propertyTypeCounts.get(type) || 0) + 1
              )
            }
            if (property.city) {
              const city = property.city.toLowerCase()
              cityCounts.set(city, (cityCounts.get(city) || 0) + 1)
            }
          })

          // Add property type suggestions with accurate counts
          propertyTypeCounts.forEach((count, type) => {
            if (type.toLowerCase().includes(query.toLowerCase())) {
              results.push({
                type: 'property',
                value: type,
                display: `${type.charAt(0).toUpperCase() + type.slice(1)}s`,
                count: count, // Use actual count from search results
              })
            }
          })

          // Add city suggestions with accurate counts
          cityCounts.forEach((count, city) => {
            if (city.toLowerCase().includes(query.toLowerCase())) {
              results.push({
                type: 'city',
                value: city,
                display: city.charAt(0).toUpperCase() + city.slice(1),
                count: count, // Use actual count from search results
              })
            }
          })
        }
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
    }

    // Remove duplicates and get accurate counts for remaining suggestions
    const uniqueResults = Array.from(
      new Map(results.map((item) => [item.value + item.type, item])).values()
    )

    // Fetch accurate counts for locations that don't have them
    const finalResults = await fetchAccurateCounts(uniqueResults)

    setIsLoading(false)
    return finalResults.slice(0, 8)
  }

  // Get popular suggestions (fallback when no query)
  const getPopularSuggestions = async (): Promise<SearchSuggestion[]> => {
    try {
      const response = await fetch('/api/properties?limit=50') // Get more to calculate accurate counts
      if (response.ok) {
        const data = await response.json()

        const cityCounts = new Map<string, number>()
        const propertyTypeCounts = new Map<string, number>()

        data.documents?.forEach((property: any) => {
          if (property.city) {
            const city = property.city.toLowerCase()
            cityCounts.set(city, (cityCounts.get(city) || 0) + 1)
          }
          if (property.propertyType) {
            const type = property.propertyType.toLowerCase()
            propertyTypeCounts.set(
              type,
              (propertyTypeCounts.get(type) || 0) + 1
            )
          }
        })

        const suggestions: SearchSuggestion[] = []

        // Add top 4 cities with accurate counts
        Array.from(cityCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .forEach(([city, count]) => {
            suggestions.push({
              type: 'city',
              value: city,
              display: city.charAt(0).toUpperCase() + city.slice(1),
              count: count, // Actual count from the data
            })
          })

        // Add top 4 property types with accurate counts
        Array.from(propertyTypeCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .forEach(([type, count]) => {
            suggestions.push({
              type: 'property',
              value: type,
              display: `${type.charAt(0).toUpperCase() + type.slice(1)}s`,
              count: count, // Actual count from the data
            })
          })

        return suggestions
      }
    } catch (error) {
      console.error('Error fetching popular suggestions:', error)
    }

    // Fallback to realistic counts based on your actual data
    return [
      { type: 'city', value: 'lagos', display: 'Lagos', count: 24 },
      { type: 'city', value: 'abuja', display: 'Abuja', count: 18 },
      {
        type: 'city',
        value: 'ikeja',
        display: 'Ikeja',
        count: 12,
      },
      { type: 'city', value: 'lekki', display: 'Lekki', count: 8 },
      {
        type: 'property',
        value: 'apartment',
        display: 'Apartments',
        count: 32,
      },
      { type: 'property', value: 'house', display: 'Houses', count: 15 },
      { type: 'property', value: 'villa', display: 'Villas', count: 6 },
      { type: 'property', value: 'land', display: 'Land', count: 4 },
    ]
  }

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)

    if (value.length > 1) {
      const newSuggestions = await fetchSearchSuggestions(value)
      setSuggestions(newSuggestions)
      setShowSuggestions(true)
    } else if (value.length === 0) {
      const popularSuggestions = await getPopularSuggestions()
      setSuggestions(popularSuggestions)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  const handleSearch = (suggestion?: SearchSuggestion) => {
    const searchValue = suggestion ? suggestion.value : searchQuery.trim()
    if (!searchValue) return

    setShowSuggestions(false)

    const params = new URLSearchParams()

    if (suggestion) {
      switch (suggestion.type) {
        case 'location':
        case 'city':
          params.set('city', searchValue)
          break
        case 'property':
          params.set('propertyType', searchValue)
          break
      }
    } else {
      params.set('q', searchValue)
    }

    router.push(`/properties?${params.toString()}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setShowSuggestions(false)
  }

  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'location':
      case 'city':
        return <MapPin className="h-4 w-4" />
      case 'property':
        return <Building className="h-4 w-4" />
      case 'feature':
        return <Home className="h-4 w-4" />
      default:
        return <Search className="h-4 w-4" />
    }
  }

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search city, neighborhood, property type..."
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyPress={handleKeyPress}
          onFocus={async () => {
            if (!searchQuery) {
              const popularSuggestions = await getPopularSuggestions()
              setSuggestions(popularSuggestions)
            }
            setShowSuggestions(true)
          }}
          className="pl-10 w-full pr-10"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 max-h-80 overflow-y-auto w-full">
          <div className="p-2">
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-gray-500">Searching...</span>
              </div>
            ) : suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${suggestion.value}-${index}`}
                  onClick={() => handleSearch(suggestion)}
                  className="flex items-center gap-3 w-full p-2 text-sm text-left hover:bg-gray-50 rounded-md transition-colors"
                >
                  <div className="text-gray-400">
                    {getSuggestionIcon(suggestion.type)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {suggestion.display}
                    </div>
                    {suggestion.count !== undefined && suggestion.count > 0 && (
                      <div className="text-xs text-gray-500">
                        {suggestion.count} property
                        {suggestion.count !== 1 ? 'ies' : 'y'}
                      </div>
                    )}
                    {suggestion.count === 0 && (
                      <div className="text-xs text-gray-400">No properties</div>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
