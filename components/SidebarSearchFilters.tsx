// components/SidebarSearchFilters.tsx - Updated for consistency
'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PropertyFilters } from '@/types'
import { Search } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function SidebarSearchFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [filters, setFilters] = useState<PropertyFilters>({
    status: 'for-sale',
    q: '', // Use 'q' instead of 'city' for consistency
    minPrice: undefined,
    maxPrice: undefined,
    bedrooms: undefined,
    propertyType: '',
  })

  // Memoize the filter initialization logic
  const initializeFilters = useCallback(() => {
    const type = searchParams.get('type')
    const q = searchParams.get('q') || ''
    const status =
      type === 'rent' ? 'for-rent' : type === 'buy' ? 'for-sale' : 'for-sale'

    const newFilters: PropertyFilters = {
      status,
      q,
      minPrice: searchParams.get('minPrice')
        ? Number(searchParams.get('minPrice'))
        : undefined,
      maxPrice: searchParams.get('maxPrice')
        ? Number(searchParams.get('maxPrice'))
        : undefined,
      bedrooms: searchParams.get('bedrooms')
        ? Number(searchParams.get('bedrooms'))
        : undefined,
      propertyType: searchParams.get('propertyType') || '',
    }

    return newFilters
  }, [searchParams])

  // Initialize filters from URL parameters with deferred state update
  useEffect(() => {
    const newFilters = initializeFilters()

    // Defer the state update to avoid synchronous cascade
    const timer = setTimeout(() => {
      setFilters((prev) => {
        const hasChanged =
          prev.status !== newFilters.status ||
          prev.q !== newFilters.q ||
          prev.minPrice !== newFilters.minPrice ||
          prev.maxPrice !== newFilters.maxPrice ||
          prev.bedrooms !== newFilters.bedrooms ||
          prev.propertyType !== newFilters.propertyType

        return hasChanged ? newFilters : prev
      })
    }, 0)

    return () => clearTimeout(timer)
  }, [initializeFilters])

  const handleFilterChange = (
    key: keyof PropertyFilters,
    value: string | number | undefined
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    const params = new URLSearchParams()

    // Add type parameter based on status
    if (filters.status === 'for-rent') {
      params.set('type', 'rent')
    } else if (filters.status === 'for-sale') {
      params.set('type', 'buy')
    }

    // Use 'q' parameter for location search (consistent with HeroSearch)
    if (filters.q) params.set('q', filters.q)

    // Add other filters
    if (filters.minPrice) params.set('minPrice', filters.minPrice.toString())
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString())
    if (filters.bedrooms) params.set('bedrooms', filters.bedrooms.toString())
    if (filters.propertyType) params.set('propertyType', filters.propertyType)

    console.log('🔍 SearchFilters - Navigating to:', params.toString())
    router.push(`/properties?${params.toString()}`, { scroll: false })

    // Dispatch event with consistent parameters
    const searchEvent = new CustomEvent('propertySearch', {
      detail: { ...filters, page: 1 },
    })
    window.dispatchEvent(searchEvent)
  }

  const clearFilters = () => {
    const defaultFilters: PropertyFilters = {
      status: 'for-sale',
      q: '',
      minPrice: undefined,
      maxPrice: undefined,
      bedrooms: undefined,
      propertyType: '',
    }
    setFilters(defaultFilters)

    // Clear URL parameters but keep type if present
    const type = searchParams.get('type')
    const newParams = new URLSearchParams()
    if (type) newParams.set('type', type)

    console.log('🗑️ SearchFilters - Clearing filters')
    router.push(`/properties?${newParams.toString()}`, { scroll: false })

    const searchEvent = new CustomEvent('propertySearch', {
      detail: { ...defaultFilters, page: 1 },
    })
    window.dispatchEvent(searchEvent)
  }

  return (
    <div className="space-y-6">
      {/* Status Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          I want to
        </label>
        <select
          value={filters.status === 'for-sale' ? 'buy' : 'rent'}
          onChange={(e) =>
            handleFilterChange(
              'status',
              e.target.value === 'buy' ? 'for-sale' : 'for-rent'
            )
          }
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="buy">Buy</option>
          <option value="rent">Rent</option>
        </select>
      </div>

      {/* Location - Updated to use 'q' parameter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location
        </label>
        <input
          type="text"
          placeholder="City, neighborhood, or address"
          value={filters.q}
          onChange={(e) => handleFilterChange('q', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Price Range
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <select
              value={filters.minPrice || ''}
              onChange={(e) =>
                handleFilterChange(
                  'minPrice',
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Min Price</option>
              <option value="10000000">₦10M</option>
              <option value="25000000">₦25M</option>
              <option value="50000000">₦50M</option>
              <option value="100000000">₦100M</option>
            </select>
          </div>
          <div>
            <select
              value={filters.maxPrice || ''}
              onChange={(e) =>
                handleFilterChange(
                  'maxPrice',
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Max Price</option>
              <option value="25000000">₦25M</option>
              <option value="50000000">₦50M</option>
              <option value="100000000">₦100M</option>
              <option value="200000000">₦200M</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bedrooms */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bedrooms
        </label>
        <select
          value={filters.bedrooms || ''}
          onChange={(e) =>
            handleFilterChange(
              'bedrooms',
              e.target.value ? Number(e.target.value) : undefined
            )
          }
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Any bedrooms</option>
          <option value="1">1+ bedrooms</option>
          <option value="2">2+ bedrooms</option>
          <option value="3">3+ bedrooms</option>
          <option value="4">4+ bedrooms</option>
        </select>
      </div>

      {/* Property Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Property Type
        </label>
        <select
          value={filters.propertyType || ''}
          onChange={(e) =>
            handleFilterChange('propertyType', e.target.value || undefined)
          }
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Any type</option>
          <option value="house">House</option>
          <option value="apartment">Apartment</option>
          <option value="condo">Condo</option>
          <option value="townhouse">Townhouse</option>
          <option value="land">Land</option>
        </select>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4 border-t">
        <Button
          onClick={handleSearch}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          <Search className="h-4 w-4 mr-2" />
          Apply Filters
        </Button>
        <Button onClick={clearFilters} variant="outline" className="w-full">
          Clear All
        </Button>
      </div>
    </div>
  )
}
