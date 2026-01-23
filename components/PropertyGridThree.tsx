// components/PropertyGrid.tsx - FIXED INFINITE SCROLL
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

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
  // State for ALL loaded properties (cumulative)
  const [allProperties, setAllProperties] = useState<Property[]>([])
  // State for current page properties (temporary)
  const [currentPageProperties, setCurrentPageProperties] = useState<
    Property[]
  >([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalProperties, setTotalProperties] = useState(0)
  const observer = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const [filters, setFilters] = useState<PropertyFilters>({
    status: initialStatus,
    page: 1,
    limit: 9,
  })

  // Convert searchParams to filters
  const convertSearchParamsToFilters = (
    searchParams: any
  ): Partial<PropertyFilters> => {
    const converted: Partial<PropertyFilters> = {}

    // Handle type (buy/rent) to status conversion
    if (searchParams.type === 'buy') {
      converted.status = 'for-sale'
    } else if (searchParams.type === 'rent') {
      converted.status = 'for-rent'
    } else if (searchParams.type === 'short-let') {
      converted.status = 'short-let'
    }

    // Handle location/city
    if (searchParams.location) {
      converted.q = searchParams.location
    } else if (searchParams.city) {
      converted.q = searchParams.city
    } else if (searchParams.q) {
      converted.q = searchParams.q
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

    return converted
  }

  // Reset everything when filters change (new search)
  const resetForNewSearch = useCallback(() => {
    setAllProperties([])
    setCurrentPageProperties([])
    setCurrentPage(1)
    setHasMore(true)
    setTotalProperties(0)
  }, [])

  const fetchProperties = useCallback(
    async (page: number, isLoadMore = false) => {
      try {
        if (isLoadMore) {
          setLoadingMore(true)
        } else {
          setLoading(true)
          resetForNewSearch()
        }

        const queryParams = new URLSearchParams()

        // Build query params without status conversion
        queryParams.append('page', page.toString())
        queryParams.append('limit', '9')

        // Add type parameter
        if (filters.status === 'for-sale') {
          queryParams.append('type', 'buy')
        } else if (filters.status === 'for-rent') {
          queryParams.append('type', 'rent')
        } else if (filters.status === 'short-let') {
          queryParams.append('type', 'short-let')
        }

        // Add other filters
        if (filters.q) queryParams.append('q', filters.q)
        if (filters.propertyType)
          queryParams.append('propertyType', filters.propertyType)
        if (filters.minPrice)
          queryParams.append('minPrice', filters.minPrice.toString())
        if (filters.maxPrice)
          queryParams.append('maxPrice', filters.maxPrice.toString())
        if (filters.bedrooms)
          queryParams.append('bedrooms', filters.bedrooms.toString())

        console.log(
          `📤 Fetching page ${page} with:`,
          Object.fromEntries(queryParams.entries())
        )

        const response = await fetch(`/api/properties?${queryParams}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch properties: ${response.status}`)
        }

        const data = await response.json()
        console.log(`📥 Page ${page} response:`, {
          total: data.total,
          received: data.documents?.length,
          hasMore: data.hasMore,
        })

        if (data.success) {
          const newProperties = data.documents || []

          if (isLoadMore) {
            // Append new properties to all properties
            setAllProperties((prev) => [...prev, ...newProperties])
            setCurrentPageProperties(newProperties)
          } else {
            // Initial load
            setAllProperties(newProperties)
            setCurrentPageProperties(newProperties)
          }

          setTotalProperties(data.total)
          setHasMore(
            data.hasMore !== undefined ? data.hasMore : page * 9 < data.total
          )

          // Update current page if successful
          setCurrentPage(page)
        } else {
          if (!isLoadMore) {
            setAllProperties([])
            setCurrentPageProperties([])
          }
          setHasMore(false)
        }
      } catch (error) {
        console.error('Error fetching properties:', error)
        if (!isLoadMore) {
          setAllProperties([])
          setCurrentPageProperties([])
        }
        setHasMore(false)
      } finally {
        if (isLoadMore) {
          setLoadingMore(false)
        } else {
          setLoading(false)
        }
      }
    },
    [filters, resetForNewSearch]
  )

  // Update filters when searchParams change
  useEffect(() => {
    if (Object.keys(searchParams).length > 0) {
      const convertedFilters = convertSearchParamsToFilters(searchParams)
      const newFilters = {
        ...filters,
        ...convertedFilters,
        page: 1,
      }
      setFilters(newFilters)
    }
  }, [searchParams])

  // Update filters when initialStatus changes
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      status: initialStatus,
      page: 1,
    }))
    resetForNewSearch()
  }, [initialStatus, resetForNewSearch])

  // Initial fetch when filters change
  useEffect(() => {
    fetchProperties(1)
  }, [fetchProperties])

  // Infinite scroll observer
  useEffect(() => {
    if (loading || loadingMore || !hasMore) return

    if (observer.current) observer.current.disconnect()

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          console.log('🎯 Load more triggered for page:', currentPage + 1)
          fetchProperties(currentPage + 1, true)
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0.1,
      }
    )

    if (loadMoreRef.current) {
      observer.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observer.current) observer.current.disconnect()
    }
  }, [loading, loadingMore, hasMore, currentPage, fetchProperties])

  // Listen for search events from SearchFilters
  useEffect(() => {
    const handleSearch = (event: Event) => {
      const customEvent = event as CustomEvent<PropertyFilters>
      const newFilters = {
        ...filters,
        ...customEvent.detail,
        page: 1,
      }
      setFilters(newFilters)
      resetForNewSearch()
    }

    window.addEventListener('propertySearch', handleSearch as EventListener)
    return () =>
      window.removeEventListener(
        'propertySearch',
        handleSearch as EventListener
      )
  }, [filters, resetForNewSearch])

  const handleClearFilters = () => {
    const resetFilters: PropertyFilters = {
      status: initialStatus,
      page: 1,
      limit: 9,
    }
    setFilters(resetFilters)
    resetForNewSearch()

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
    if (filters.status === 'short-let') {
      return 'No short-let properties match your criteria'
    }
    return 'No properties found'
  }

  // Calculate display text
  const getDisplayText = () => {
    if (loading && allProperties.length === 0) {
      return 'Loading properties...'
    }

    if (allProperties.length === 0) {
      return getEmptyStateMessage()
    }

    return `Found ${totalProperties} propert${totalProperties !== 1 ? 'ies' : 'y'}${
      filters.q ? ` for "${filters.q}"` : ''
    }${filters.propertyType ? ` • ${filters.propertyType}` : ''}${
      filters.status === 'for-sale'
        ? ' • For Sale'
        : filters.status === 'for-rent'
          ? ' • For Rent'
          : filters.status === 'short-let'
            ? ' • Short Let'
            : ''
    }`
  }

  if (loading && allProperties.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex gap-x-2">
          <div className="h-4 w-18 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-4 w-8 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        {showFilters && (
          <div className="bg-white p-6 rounded-2xl border animate-pulse">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg border p-4 animate-pulse"
            >
              <div className="h-48 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
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

      {/* Results Count - Always show total count */}
      {allProperties.length > 0 && (
        <div className="text-sm text-gray-600">{getDisplayText()}</div>
      )}

      {/* Properties Grid - Show ALL loaded properties */}
      {allProperties.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allProperties.map((property, index) => (
            <PropertyCard
              key={`${property.$id}-${index}-${
                property.$updatedAt || Date.now()
              }`}
              property={property}
              userId={''}
            />
          ))}
        </div>
      )}

      {/* Loading More Indicator */}
      {loadingMore && (
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
            <span className="text-gray-600">Loading more properties...</span>
          </div>
        </div>
      )}

      {/* Load More Trigger (invisible element for intersection observer) */}
      {hasMore && !loadingMore && allProperties.length > 0 && (
        <div ref={loadMoreRef} className="h-10" />
      )}

      {/* End of Results */}
      {!hasMore && allProperties.length > 0 && (
        <div className="text-center py-8 border-t">
          <p className="text-gray-500">
            {allProperties.length === totalProperties
              ? `Showing all ${totalProperties} properties`
              : `You've viewed ${allProperties.length} of ${totalProperties} properties`}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            No more properties to load
          </p>
        </div>
      )}

      {/* Empty State - Only show when there are NO properties at all */}
      {allProperties.length === 0 && !loading && !loadingMore && (
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
            className="bg-brand text-white px-6 py-2 rounded-lg hover:bg-brand/90 transition-colors font-medium"
          >
            Show All Properties
          </button>
        </div>
      )}
    </div>
  )
}
