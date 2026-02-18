// components/Hero/HeroSearch.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building, Home, Loader2, MapPin, Search, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SearchSuggestion {
  type: 'location' | 'property' | 'city'
  value: string
  display: string
  count?: number
  city?: string
}

interface HeroSearchProps {
  searchType: 'buy' | 'rent'
  onSearch: (query: string, type: 'buy' | 'rent') => void
}

export default function HeroSearch({ searchType, onSearch }: HeroSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const requestIdRef = useRef(0)
  const countCacheRef = useRef<Map<string, number>>(new Map())
  const router = useRouter()

  // Function to get accurate count for a specific suggestion
  const getSuggestionCount = async (
    type: string,
    value: string
  ): Promise<number> => {
    const cacheKey = `${searchType}:${type}:${value.toLowerCase()}`
    const cached = countCacheRef.current.get(cacheKey)
    if (cached !== undefined) {
      return cached
    }

    try {
      const params = new URLSearchParams()

      if (searchType === 'buy') {
        params.set('type', 'buy')
      } else if (searchType === 'rent') {
        params.set('type', 'rent')
      }

      // Set the appropriate filter based on suggestion type
      if (type === 'city' || type === 'location') {
        params.set('q', value) // Use general search for cities/locations
      } else if (type === 'property') {
        params.set('propertyType', value)
      }

      params.set('limit', '1') // We only need the total count

      const response = await fetch(`/api/properties?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        const count = data.total || 0
        countCacheRef.current.set(cacheKey, count)
        return count
      }
    } catch (error) {
      console.error('Error fetching count:', error)
    }
    return 0
  }

  // Optimized search with accurate counts
  const fetchSuggestions = async (
    query: string
  ): Promise<SearchSuggestion[]> => {
    if (!query.trim()) {
      return []
    }

    setIsLoading(true)
    const results: SearchSuggestion[] = []

    try {
      // Get properties for analysis
      const propertiesResponse = await fetch(
        `/api/properties?q=${encodeURIComponent(query)}&limit=10`
      )

      if (propertiesResponse.ok) {
        const propertiesData = await propertiesResponse.json()

        if (propertiesData.documents?.length > 0) {
          const propertyTypes = new Map<string, number>()
          const cities = new Map<string, number>()

          // Count occurrences
          propertiesData.documents.forEach((property: any) => {
            // Count property types
            if (
              property.propertyType &&
              property.propertyType.toLowerCase().includes(query.toLowerCase())
            ) {
              const count = propertyTypes.get(property.propertyType) || 0
              propertyTypes.set(property.propertyType, count + 1)
            }

            // Count cities
            if (
              property.city &&
              property.city.toLowerCase().includes(query.toLowerCase())
            ) {
              const count = cities.get(property.city) || 0
              cities.set(property.city, count + 1)
            }
          })

          // Create suggestions with accurate counts
          const propertyTypeSuggestions = await Promise.all(
            Array.from(propertyTypes.keys()).map(async (type) => {
              const accurateCount = await getSuggestionCount('property', type)
              return {
                type: 'property' as const,
                value: type,
                display: `${type.charAt(0).toUpperCase() + type.slice(1)}s`,
                count: accurateCount,
              }
            })
          )

          const citySuggestions = await Promise.all(
            Array.from(cities.keys()).map(async (city) => {
              const accurateCount = await getSuggestionCount('city', city)
              return {
                type: 'city' as const,
                value: city,
                display: city,
                count: accurateCount,
              }
            })
          )

          results.push(...propertyTypeSuggestions, ...citySuggestions)
        }
      }

      // Also try locations API if you have one
      try {
        const locationsResponse = await fetch(
          `/api/locations/search?q=${encodeURIComponent(query)}&limit=3`
        )
        if (locationsResponse.ok) {
          const locationsData = await locationsResponse.json()
          if (locationsData.locations?.length > 0) {
            const locationSuggestions = await Promise.all(
              locationsData.locations.map(async (location: any) => {
                const accurateCount = await getSuggestionCount(
                  'location',
                  location.name
                )
                return {
                  type: 'location' as const,
                  value: location.name,
                  display: location.name,
                  count: accurateCount,
                  city: location.city,
                }
              })
            )

            results.push(...locationSuggestions)
          }
        }
      } catch (locationError) {
        console.error('Error fetching locations:', locationError)
        // Continue without locations
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    } finally {
      setIsLoading(false)
    }

    // Remove duplicates and prioritize by type
    const uniqueResults = Array.from(
      new Map(results.map((item) => [item.value + item.type, item])).values()
    )

    // Sort by count (highest first) and limit to 5
    return uniqueResults
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .slice(0, 5)
  }

  // Debounced input handler
  const handleInputChange = (value: string) => {
    setSearchQuery(value)

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    const requestId = ++requestIdRef.current

    if (value.length > 1) {
      debounceTimeoutRef.current = setTimeout(async () => {
        const newSuggestions = await fetchSuggestions(value)
        if (requestId !== requestIdRef.current) return
        setSuggestions(newSuggestions)
        setOpen(true)
      }, 300)
    } else if (value.length === 0) {
      setSuggestions([])
      setOpen(false)
    } else {
      setOpen(false)
    }
  }

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.display)
    setOpen(false)
    performSearch(suggestion.display)
  }

  const performSearch = (query: string) => {
    if (query.trim()) {
      onSearch(query, searchType)

      const params = new URLSearchParams()
      params.set('q', query)

      if (searchType === 'buy') {
        params.set('type', 'buy')
      } else if (searchType === 'rent') {
        params.set('type', 'rent')
      }

      router.push(`/properties?${params.toString()}`)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch(searchQuery)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setOpen(false)
    inputRef.current?.focus()
  }

  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'location':
      case 'city':
        return <MapPin className="h-4 w-4" />
      case 'property':
        return <Building className="h-4 w-4" />
      default:
        return <Home className="h-4 w-4" />
    }
  }

  const getSuggestionColor = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'city':
        return 'text-blue-600 bg-blue-50'
      case 'location':
        return 'text-emerald-600 bg-emerald-50'
      case 'property':
        return 'text-purple-600 bg-purple-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input Container */}
          <div className="flex-1 relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Enter city, neighborhood, or property type..."
                value={searchQuery}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => {
                  if (searchQuery.length > 1) {
                    setOpen(true)
                  }
                }}
                className="pl-12 pr-12 py-4 h-12 text-base border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl transition-all duration-200 bg-white/95 text-gray-900 placeholder-gray-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Custom Dropdown */}
            {open && (
              <div
                ref={dropdownRef}
                className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-64 overflow-y-auto"
              >
                <div className="p-2">
                  {isLoading && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2 text-emerald-600" />
                      <span className="text-sm text-gray-600">
                        Finding matches...
                      </span>
                    </div>
                  )}

                  {!isLoading && suggestions.length === 0 && searchQuery && (
                    <div className="py-4 text-center">
                      <div className="text-gray-500 mb-1">No results found</div>
                      <div className="text-xs text-gray-400">
                        Try different keywords
                      </div>
                    </div>
                  )}

                  {!isLoading && suggestions.length > 0 && (
                    <div className="space-y-1">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={`${suggestion.type}-${suggestion.value}-${index}`}
                          onClick={() => handleSuggestionSelect(suggestion)}
                          className="w-full text-left px-2 py-2 rounded-lg transition-colors duration-150 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                        >
                          <div className="flex items-center gap-2 w-full">
                            <div
                              className={`p-1.5 rounded-lg ${getSuggestionColor(suggestion.type)}`}
                            >
                              {getSuggestionIcon(suggestion.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 text-sm truncate">
                                {suggestion.display}
                              </div>
                              {suggestion.count !== undefined &&
                                suggestion.count > 0 && (
                                  <div className="text-xs text-gray-500">
                                    {suggestion.count.toLocaleString()}{' '}
                                    properties
                                  </div>
                                )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="bg-linear-to-r from-emerald-900 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-4 h-12 text-base font-semibold rounded-xl transition-all duration-200 min-w-[140px]"
          >
            <Search className="h-5 w-5 mr-2" />
            Search
          </Button>
        </div>
      </form>
    </div>
  )
}
