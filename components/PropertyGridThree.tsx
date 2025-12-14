// components/PropertyGrid.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useEffect, useState } from 'react'

import { Property, PropertyFilters } from '../types'
import PropertyCard from './PropertyCard'
import SearchFilters from './SearchFilters'

interface PropertyGridThreeProps {
  initialStatus?: string
  showFilters?: boolean
  searchParams?: {
    type?: string
    location?: string
    city?: string
    propertyType?: string
    minPrice?: string
    maxPrice?: string
    bedrooms?: string
    q?: string
  }
}

declare global {
  interface Window {
    addEventListener(
      type: 'propertySearch',
      listener: (event: CustomEvent<PropertyFilters>) => void
    ): void
    removeEventListener(
      type: 'propertySearch',
      listener: (event: CustomEvent<PropertyFilters>) => void
    ): void
  }
}

export default function PropertyGridThree({
  initialStatus = 'for-sale',
  showFilters = false,
  searchParams = {},
}: PropertyGridThreeProps) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<PropertyFilters>({
    status: initialStatus,
    page: 1,
    limit: 12,
  })

  // Convert searchParams to filters - FIXED VERSION
  const convertSearchParamsToFilters = (
    searchParams: any
  ): Partial<PropertyFilters> => {
    const converted: Partial<PropertyFilters> = {}

    console.log('🔄 Converting searchParams:', searchParams)

    // Handle type (buy/rent) to status conversion
    if (searchParams.type === 'buy') {
      converted.status = 'for-sale'
    } else if (searchParams.type === 'rent') {
      converted.status = 'for-rent'
    }

    // Handle location/city - FIXED: Use 'q' parameter for general search
    if (searchParams.location) {
      converted.q = searchParams.location // Use 'q' for general search
    } else if (searchParams.city) {
      converted.q = searchParams.city // Use 'q' for general search
    } else if (searchParams.q) {
      converted.q = searchParams.q // Use 'q' for general search
    }

    // Handle other filters
    if (searchParams.propertyType) {
      converted.propertyType = searchParams.propertyType
    }
    if (searchParams.minPrice) {
      converted.minPrice = parseInt(searchParams.minPrice)
    }
    if (searchParams.maxPrice) {
      converted.maxPrice = parseInt(searchParams.maxPrice)
    }
    if (searchParams.bedrooms) {
      converted.bedrooms = parseInt(searchParams.bedrooms)
    }

    console.log('✅ Converted filters:', converted)
    return converted
  }

  const fetchProperties = async (currentFilters: PropertyFilters) => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()

      // Add all filters to query params - FIXED: Handle type parameter
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // Convert 'status' back to 'type' for the URL if needed
          if (key === 'status') {
            if (value === 'for-sale') {
              queryParams.append('type', 'buy')
            } else if (value === 'for-rent') {
              queryParams.append('type', 'rent')
            }
          } else {
            queryParams.append(key, value.toString())
          }
        }
      })

      console.log('🔍 Fetching properties with filters:', currentFilters)
      console.log('📤 Final API query params:', queryParams.toString())

      const apiUrl = `/api/properties?${queryParams}`
      console.log('🌐 API URL:', apiUrl)

      const response = await fetch(apiUrl)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        })
        throw new Error(
          `Failed to fetch properties: ${response.status} ${response.statusText}`
        )
      }

      const data = await response.json()
      console.log('✅ API Response:', {
        success: data.success,
        total: data.total,
        documentsCount: data.documents?.length || 0,
      })

      if (data.success) {
        console.log('✅ Properties fetched:', data.documents?.length || 0)
        setProperties(data.documents || [])
      } else {
        console.error('❌ API returned error:', data.error)
        setProperties([])
      }
    } catch (error) {
      console.error('💥 Error fetching properties:', error)
      setProperties([])
    } finally {
      setLoading(false)
    }
  }

  // Update filters when searchParams change
  useEffect(() => {
    if (Object.keys(searchParams).length > 0) {
      console.log('🔄 Updating filters from searchParams:', searchParams)
      const convertedFilters = convertSearchParamsToFilters(searchParams)

      setFilters((prev) => ({
        ...prev,
        ...convertedFilters,
        page: 1, // Reset to first page when search params change
      }))
    }
  }, [searchParams])

  // Update filters when initialStatus changes
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      status: initialStatus,
      page: 1,
    }))
  }, [initialStatus])

  // Fetch properties when filters change
  useEffect(() => {
    fetchProperties(filters)
  }, [filters])

  // Listen for search events from SearchFilters
  useEffect(() => {
    const handleSearch = (event: Event) => {
      const customEvent = event as CustomEvent<PropertyFilters>
      console.log('🎯 Received search event:', customEvent.detail)
      setFilters((prev) => ({
        ...prev,
        ...customEvent.detail,
        page: 1, // Reset to first page on new search
      }))
    }

    window.addEventListener('propertySearch', handleSearch as EventListener)
    return () =>
      window.removeEventListener(
        'propertySearch',
        handleSearch as EventListener
      )
  }, [])

  const handleClearFilters = () => {
    const resetFilters: PropertyFilters = {
      status: initialStatus,
      page: 1,
      limit: 12,
    }
    setFilters(resetFilters)

    // Dispatch clear event
    const searchEvent = new CustomEvent('propertySearch', {
      detail: resetFilters,
    })
    window.dispatchEvent(searchEvent)
  }

  const getEmptyStateMessage = () => {
    if (filters.city) {
      return `No properties found in ${filters.city}`
    }
    if (filters.propertyType) {
      return `No ${filters.propertyType} properties found`
    }
    if (filters.q) {
      return `No properties found for "${filters.q}"`
    }
    if (filters.status === 'for-sale') {
      return 'No properties for sale match your criteria'
    }
    if (filters.status === 'for-rent') {
      return 'No rental properties match your criteria'
    }
    return 'No properties found'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {showFilters && (
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-md p-4 animate-pulse"
            >
              <div className="h-48 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Filters */}
      {showFilters && <SearchFilters />}

      {/* Results Count */}
      {properties.length > 0 && (
        <div className="text-sm text-gray-600">
          Showing {properties.length} propert
          {properties.length !== 1 ? 'ies' : 'y'}
          {filters.q && ` for "${filters.q}"`}
          {filters.propertyType && ` • ${filters.propertyType}`}
          {filters.status === 'for-sale' && ' • For Sale'}
          {filters.status === 'for-rent' && ' • For Rent'}
        </div>
      )}

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard key={property.$id} property={property} userId={''} />
        ))}
      </div>

      {/* Empty State */}
      {properties.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {getEmptyStateMessage()}
          </h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your search criteria or browse all properties
          </p>
          <button
            onClick={handleClearFilters}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            Show All Properties
          </button>
        </div>
      )}

      {/* Load More Button */}
      {properties.length > 0 && properties.length >= filters.limit! && (
        <div className="text-center">
          <button
            onClick={() => {
              setFilters((prev) => ({
                ...prev,
                page: prev.page! + 1,
              }))
            }}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            Load More Properties
          </button>
        </div>
      )}
    </div>
  )
}
