// app/properties/page.tsx
'use client'

import { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Filter, Grid3X3, X } from 'lucide-react'

import PropertyGridThree from '@/components/PropertyGridThree'
import SearchFilters from '@/components/SearchFilters'
import SidebarSearchFilters from '@/components/SidebarSearchFilters'
import { Button } from '@/components/ui/button'

interface SearchParams {
  type?: string
  location?: string
  city?: string
  propertyType?: string
  minPrice?: string
  maxPrice?: string
  bedrooms?: string
  q?: string
}

export default function PropertiesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Derive state directly from URL parameters to avoid cascading renders
  const urlType = searchParams.get('type') as 'all' | 'buy' | 'rent'
  const viewType =
    urlType && (urlType === 'all' || urlType === 'buy' || urlType === 'rent')
      ? urlType
      : 'all'

  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Memoize activeFilters to prevent unnecessary re-renders
  const activeFilters: SearchParams = useMemo(() => {
    const filters: SearchParams = {}
    const location = searchParams.get('location')
    const city = searchParams.get('city')
    const propertyType = searchParams.get('propertyType')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const bedrooms = searchParams.get('bedrooms')
    const q = searchParams.get('q')

    if (location) filters.location = location
    if (city) filters.city = city
    if (propertyType) filters.propertyType = propertyType
    if (minPrice) filters.minPrice = minPrice
    if (maxPrice) filters.maxPrice = maxPrice
    if (bedrooms) filters.bedrooms = bedrooms
    if (q) filters.q = q

    return filters
  }, [searchParams])

  // Memoize pageConfig to prevent unnecessary re-renders
  const pageConfig = useMemo(
    () => ({
      all: {
        title: 'All Properties',
        description:
          'Browse all available properties for sale and rent across Nigeria.',
        status: undefined,
        heroTitle: 'Discover All Properties',
        heroDescription:
          'Browse thousands of properties for sale and rent across Nigeria.',
        badge: '🏠 All Properties',
      },
      buy: {
        title: 'Properties for Sale',
        description:
          'Discover thousands of properties for sale across Nigeria.',
        status: 'for-sale',
        heroTitle: 'Find Your Dream Home',
        heroDescription:
          'Discover thousands of properties for sale across Nigeria.',
        badge: '🏠 For Sale',
      },
      rent: {
        title: 'Properties for Rent',
        description: 'Find your perfect rental property.',
        status: 'for-rent',
        heroTitle: 'Find Your Perfect Rental',
        heroDescription:
          'Discover thousands of rental properties across Nigeria.',
        badge: '🔑 For Rent',
      },
    }),
    []
  )

  const config = pageConfig[viewType]

  const handleViewTypeChange = useCallback(
    (type: 'all' | 'buy' | 'rent') => {
      const params = new URLSearchParams(searchParams.toString())

      if (type === 'all') {
        params.delete('type')
      } else {
        params.set('type', type)
      }

      // Update URL
      const newUrl = params.toString()
        ? `/properties?${params.toString()}`
        : '/properties'
      router.push(newUrl)

      // Trigger search event
      const searchEvent = new CustomEvent('propertySearch', {
        detail: {
          status: type === 'all' ? undefined : pageConfig[type].status,
          page: 1,
        },
      })
      window.dispatchEvent(searchEvent)
    },
    [searchParams, router, pageConfig]
  )

  const clearAllFilters = useCallback(() => {
    const params = new URLSearchParams()
    if (viewType !== 'all') {
      params.set('type', viewType)
    }
    router.push(`/properties?${params.toString()}`)
  }, [viewType, router])

  const getActiveFiltersCount = useCallback(() => {
    let count = 0
    if (activeFilters.location) count++
    if (activeFilters.city) count++
    if (activeFilters.propertyType) count++
    if (activeFilters.minPrice) count++
    if (activeFilters.maxPrice) count++
    if (activeFilters.bedrooms) count++
    if (activeFilters.q) count++
    return count
  }, [activeFilters])

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Link
                  href="/"
                  className="hover:text-emerald-600 flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back to Home
                </Link>
                <span>•</span>
                <span className="capitalize">{viewType}</span>
                {activeFiltersCount > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-600">
                      {activeFiltersCount} filter
                      {activeFiltersCount !== 1 ? 's' : ''} active
                    </span>
                  </>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900">
                {config.title}
              </h1>
              <p className="text-gray-600 mt-1">{config.description}</p>
            </div>

            {/* View Type Toggle - Desktop */}
            <div className="hidden lg:flex bg-gray-100 rounded-lg p-1 shrink-0">
              <Button
                variant={viewType === 'all' ? 'default' : 'ghost'}
                onClick={() => handleViewTypeChange('all')}
                className={`rounded-md ${
                  viewType === 'all'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                size="sm"
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                All
              </Button>
              <Button
                variant={viewType === 'buy' ? 'default' : 'ghost'}
                onClick={() => handleViewTypeChange('buy')}
                className={`rounded-md ${
                  viewType === 'buy'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                size="sm"
              >
                For Sale
              </Button>
              <Button
                variant={viewType === 'rent' ? 'default' : 'ghost'}
                onClick={() => handleViewTypeChange('rent')}
                className={`rounded-md ${
                  viewType === 'rent'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                size="sm"
              >
                For Rent
              </Button>
            </div>

            {/* Mobile Filter Toggle */}
            <div className="flex gap-2 lg:hidden">
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs"
                >
                  Clear All
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setShowMobileFilters(true)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-1 bg-emerald-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* View Type Toggle - Mobile */}
          <div className="flex lg:hidden bg-gray-100 rounded-lg p-1 mt-4">
            <Button
              variant={viewType === 'all' ? 'default' : 'ghost'}
              onClick={() => handleViewTypeChange('all')}
              className={`flex-1 rounded-md ${
                viewType === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={viewType === 'buy' ? 'default' : 'ghost'}
              onClick={() => handleViewTypeChange('buy')}
              className={`flex-1 rounded-md ${
                viewType === 'buy'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              size="sm"
            >
              Sale
            </Button>
            <Button
              variant={viewType === 'rent' ? 'default' : 'ghost'}
              onClick={() => handleViewTypeChange('rent')}
              className={`flex-1 rounded-md ${
                viewType === 'rent'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              size="sm"
            >
              Rent
            </Button>
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {activeFilters.location && (
                <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  Location: {activeFilters.location}
                </div>
              )}
              {activeFilters.city && (
                <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  City: {activeFilters.city}
                </div>
              )}
              {activeFilters.propertyType && (
                <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  Type: {activeFilters.propertyType}
                </div>
              )}
              {activeFilters.bedrooms && (
                <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  {activeFilters.bedrooms} Bedrooms
                </div>
              )}
              {activeFilters.minPrice && (
                <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  Min: ₦{parseInt(activeFilters.minPrice).toLocaleString()}
                </div>
              )}
              {activeFilters.maxPrice && (
                <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  Max: ₦{parseInt(activeFilters.maxPrice).toLocaleString()}
                </div>
              )}
              {activeFilters.q && (
                <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  Search: {activeFilters.q}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content with Sidebar Layout */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sticky Sidebar - Desktop */}
          <div className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-24">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Refine Search
                  </h3>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Clear All
                    </Button>
                  )}
                </div>
                <SidebarSearchFilters />
              </div>
            </div>
          </div>

          {/* Property Grid - Main Content */}
          <div className="flex-1 min-w-0">
            <PropertyGridThree
              initialStatus={config.status}
              showFilters={false}
              searchParams={activeFilters}
            />
          </div>
        </div>
      </div>

      {/* Mobile Filters Overlay */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Filters</h3>
                <div className="flex items-center gap-2">
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-xs"
                    >
                      Clear All
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowMobileFilters(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-4">
              <SearchFilters />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
