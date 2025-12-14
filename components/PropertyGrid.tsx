// components/PropertyGrid.tsx
'use client'

import { useEffect, useState } from 'react'

import { Property, PropertyFilters } from '../types'
import PropertyCard from './PropertyCard'
import SearchFilters from './SearchFilters' // Your existing component

interface PropertyGridProps {
  initialStatus?: string
  showFilters?: boolean
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

export default function PropertyGrid({
  initialStatus = 'for-sale',
  showFilters = false,
}: PropertyGridProps) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<PropertyFilters>({
    status: initialStatus,
    page: 1,
    limit: 12,
  })

  const fetchProperties = async (currentFilters: PropertyFilters) => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()

      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString())
        }
      })

      const response = await fetch(`/api/properties?${queryParams}`)
      if (!response.ok) {
        throw new Error('Failed to fetch properties')
      }
      const data = await response.json()
      setProperties(data.documents || [])
    } catch (error) {
      console.error('Error fetching properties:', error)
      setProperties([])
    } finally {
      setLoading(false)
    }
  }

  // In your PropertyGrid component, update to handle undefined status
  useEffect(() => {
    // Reset filters when initialStatus changes
    setFilters((prev) => ({
      ...prev,
      status: initialStatus, // This can be undefined now
      page: 1, // Reset to first page
    }))
  }, [initialStatus])

  useEffect(() => {
    // Reset filters when initialStatus changes
    setFilters((prev) => ({
      ...prev,
      status: initialStatus,
      page: 1, // Reset to first page
    }))
  }, [initialStatus])

  useEffect(() => {
    fetchProperties(filters)
  }, [filters])

  // Listen for search events from SearchFilters
  useEffect(() => {
    const handleSearch = (event: Event) => {
      const customEvent = event as CustomEvent<PropertyFilters>
      setFilters(customEvent.detail)
    }

    window.addEventListener('propertySearch', handleSearch as EventListener)
    return () =>
      window.removeEventListener(
        'propertySearch',
        handleSearch as EventListener
      )
  }, [])

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {properties.map((property) => (
          <PropertyCard key={property.$id} property={property} userId={''} />
        ))}
      </div>

      {properties.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No properties found
          </h3>
          <p className="text-gray-500">
            {filters.status === 'for-sale'
              ? 'No properties for sale match your criteria'
              : 'No rental properties match your criteria'}
          </p>
          <button
            onClick={() => {
              // Clear filters and reset
              const searchEvent = new CustomEvent('propertySearch', {
                detail: {
                  status: filters.status,
                  page: 1,
                  limit: 12,
                },
              })
              window.dispatchEvent(searchEvent)
            }}
            className="mt-4 text-emerald-600 hover:text-blue-700 font-medium"
          >
            Clear filters and show all properties
          </button>
        </div>
      )}

      {/* Load More Button (if you want pagination) */}
      {properties.length > 0 && properties.length >= filters.limit! && (
        <div className="text-center">
          <button
            onClick={() => {
              setFilters((prev) => ({
                ...prev,
                page: prev.page! + 1,
              }))
            }}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Load More Properties
          </button>
        </div>
      )}
    </div>
  )
}
