'use client'

import { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Filter, Grid3X3, Moon, X } from 'lucide-react'

import PropertyGridThree from '@/components/PropertyGridThree'
import SearchFilters from '@/components/SearchFilters'
import SidebarSearchFilters from '@/components/SidebarSearchFilters'
import { Button } from '@/components/ui/button'
import { ViewTypeToggle } from '@/components/ViewTypeToggle'

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
  const urlType = searchParams.get('type') as
    | 'all'
    | 'buy'
    | 'rent'
    | 'short-let'
  const viewType =
    urlType &&
    (urlType === 'all' ||
      urlType === 'buy' ||
      urlType === 'rent' ||
      urlType === 'short-let')
      ? urlType
      : 'all'

  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)

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
          'Browse all available properties for sale, rent, and short-lets across Nigeria.',
        status: undefined,
        heroTitle: 'Discover All Properties',
        heroDescription:
          'Browse thousands of properties for sale, rent, and short-lets across Nigeria.',
        badge: '🏠 All Properties',
        icon: Grid3X3,
        color: 'text-gray-600 hover:text-gray-900',
        bg: 'bg-gray-100',
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
        icon: Grid3X3,
        color: 'text-emerald-600 hover:text-emerald-700',
        bg: 'bg-emerald-50',
      },
      rent: {
        title: 'Properties for Rent',
        description: 'Find your perfect rental property.',
        status: 'for-rent',
        heroTitle: 'Find Your Perfect Rental',
        heroDescription:
          'Discover thousands of rental properties across Nigeria.',
        badge: '🔑 For Rent',
        icon: Grid3X3,
        color: 'text-blue-600 hover:text-blue-700',
        bg: 'bg-blue-50',
      },
      'short-let': {
        title: 'Short-Let Properties',
        description: 'Find perfect vacation rentals and short-term stays.',
        status: 'short-let',
        heroTitle: 'Find Your Perfect Short-Let',
        heroDescription:
          'Discover amazing vacation rentals and short-term stays across Nigeria.',
        badge: '🏨 Short-Let',
        icon: Moon,
        color: 'text-purple-600 hover:text-purple-700',
        bg: 'bg-purple-50',
      },
    }),
    []
  )

  const config = pageConfig[viewType]

  const handleViewTypeChange = useCallback(
    async (type: 'all' | 'buy' | 'rent' | 'short-let') => {
      setIsNavigating(true)
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

      try {
        await router.push(newUrl, { scroll: false })

        // Trigger search event
        const searchEvent = new CustomEvent('propertySearch', {
          detail: {
            status: type === 'all' ? undefined : pageConfig[type].status,
            page: 1,
          },
        })
        window.dispatchEvent(searchEvent)
      } finally {
        // Small delay for better UX
        setTimeout(() => setIsNavigating(false), 300)
      }
    },
    [searchParams, router, pageConfig]
  )

  const clearAllFilters = useCallback(async () => {
    setIsNavigating(true)
    const params = new URLSearchParams()
    if (viewType !== 'all') {
      params.set('type', viewType)
    }

    try {
      router.push(`/properties?${params.toString()}`, { scroll: false })
    } finally {
      setTimeout(() => setIsNavigating(false), 300)
    }
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
                  className="hover:text-emerald-600 flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back to Home
                </Link>
                <span>•</span>
                <span className="capitalize font-medium">{viewType}</span>
                {activeFiltersCount > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-600 font-medium">
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
            <div className="hidden lg:block shrink-0">
              <ViewTypeToggle
                viewType={viewType}
                isNavigating={isNavigating}
                onViewTypeChange={handleViewTypeChange}
                variant="desktop"
              />
            </div>

            {/* Mobile Filter Toggle */}
            <div className="flex gap-2 lg:hidden">
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs border-red-200 hover:bg-red-50 hover:text-red-600"
                  disabled={isNavigating}
                >
                  Clear All
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden px-4 py-2 rounded-lg border-2 border-emerald-200 bg-white hover:bg-emerald-50 transition-colors"
                disabled={isNavigating}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-2 bg-emerald-600 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center animate-pulse">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* View Type Toggle - Mobile */}
          <div className="lg:hidden mt-4">
            <ViewTypeToggle
              viewType={viewType}
              isNavigating={isNavigating}
              onViewTypeChange={handleViewTypeChange}
              variant="mobile"
            />
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {activeFilters.location && (
                <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-sm flex items-center gap-1 border border-emerald-100">
                  📍 Location: {activeFilters.location}
                </div>
              )}
              {activeFilters.city && (
                <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm flex items-center gap-1 border border-blue-100">
                  🏙️ City: {activeFilters.city}
                </div>
              )}
              {activeFilters.propertyType && (
                <div className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full text-sm flex items-center gap-1 border border-purple-100">
                  🏠 Type: {activeFilters.propertyType}
                </div>
              )}
              {activeFilters.bedrooms && (
                <div className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-sm flex items-center gap-1 border border-amber-100">
                  🛏️ {activeFilters.bedrooms} Bedrooms
                </div>
              )}
              {activeFilters.minPrice && (
                <div className="bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm flex items-center gap-1 border border-green-100">
                  💰 Min: ₦{parseInt(activeFilters.minPrice).toLocaleString()}
                </div>
              )}
              {activeFilters.maxPrice && (
                <div className="bg-red-50 text-red-700 px-3 py-1.5 rounded-full text-sm flex items-center gap-1 border border-red-100">
                  💰 Max: ₦{parseInt(activeFilters.maxPrice).toLocaleString()}
                </div>
              )}
              {activeFilters.q && (
                <div className="bg-gray-50 text-gray-700 px-3 py-1.5 rounded-full text-sm flex items-center gap-1 border border-gray-100">
                  🔍 Search: {activeFilters.q}
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
              <div className="">
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
                      disabled={isNavigating}
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
            {isNavigating ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600">Loading properties...</p>
              </div>
            ) : (
              <PropertyGridThree
                initialStatus={config.status}
                showFilters={false}
                searchParams={activeFilters}
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Overlay */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden animate-in slide-in-from-right-80 duration-300">
          <div
            className="absolute inset-0 bg-black/30 bg-opacity-50"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b bg-white sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Filters</h3>
                <div className="flex items-center gap-2">
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        clearAllFilters()
                        setShowMobileFilters(false)
                      }}
                      className="text-xs text-red-600 hover:bg-red-50"
                      disabled={isNavigating}
                    >
                      Clear All
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowMobileFilters(false)}
                    className="hover:bg-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-4">
              <SearchFilters />
            </div>
            <div className="p-4 border-t bg-white sticky bottom-0">
              <Button
                onClick={() => setShowMobileFilters(false)}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                size="lg"
              >
                Show Results
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
