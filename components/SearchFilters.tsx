// components/SearchFilters.tsx - Fixed with short-let support
'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PropertyFilters } from '@/types'
import { Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function SearchFilters() {
  const router = useRouter()
  const urlSearchParams = useSearchParams()
  const [filters, setFilters] = useState<PropertyFilters>({
    status: 'for-sale',
    city: '',
    minPrice: undefined,
    maxPrice: undefined,
    bedrooms: undefined,
    propertyType: '',
  })

  // Memoize the filter initialization to prevent unnecessary updates
  const initializeFilters = useCallback(() => {
    const params: Partial<PropertyFilters> = {}

    const status = urlSearchParams.get('type')
    if (status === 'buy') params.status = 'for-sale'
    if (status === 'rent') params.status = 'for-rent'
    if (status === 'short-let') params.status = 'short-let' // Added short-let

    const city = urlSearchParams.get('city') || urlSearchParams.get('location')
    if (city) params.city = city

    const propertyType = urlSearchParams.get('propertyType')
    if (propertyType) params.propertyType = propertyType

    const minPrice = urlSearchParams.get('minPrice')
    if (minPrice) params.minPrice = parseInt(minPrice)

    const maxPrice = urlSearchParams.get('maxPrice')
    if (maxPrice) params.maxPrice = parseInt(maxPrice)

    const bedrooms = urlSearchParams.get('bedrooms')
    if (bedrooms) params.bedrooms = parseInt(bedrooms)

    return params
  }, [urlSearchParams])

  // Initialize filters from URL parameters with change detection
  useEffect(() => {
    const newParams = initializeFilters()

    // Defer the state update to avoid synchronous cascade
    const timer = setTimeout(() => {
      setFilters((prev) => {
        // Check if any values have actually changed
        const hasChanged =
          prev.status !== newParams.status ||
          prev.city !== newParams.city ||
          prev.propertyType !== newParams.propertyType ||
          prev.minPrice !== newParams.minPrice ||
          prev.maxPrice !== newParams.maxPrice ||
          prev.bedrooms !== newParams.bedrooms

        return hasChanged ? { ...prev, ...newParams } : prev
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
    // Update URL with filters
    const params = new URLSearchParams()

    // Map status to URL parameter with short-let support
    switch (filters.status) {
      case 'for-sale':
        params.set('type', 'buy')
        break
      case 'for-rent':
        params.set('type', 'rent')
        break
      case 'short-let':
        params.set('type', 'short-let')
        break
    }

    if (filters.city) params.set('city', filters.city)
    if (filters.propertyType) params.set('propertyType', filters.propertyType)
    if (filters.minPrice) params.set('minPrice', filters.minPrice.toString())
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString())
    if (filters.bedrooms) params.set('bedrooms', filters.bedrooms.toString())

    router.push(`/properties?${params.toString()}`)

    // Dispatch event for other components
    const searchEvent = new CustomEvent('propertySearch', {
      detail: { ...filters, page: 1 },
    })
    window.dispatchEvent(searchEvent)
  }

  const clearFilters = () => {
    const resetFilters: PropertyFilters = {
      status: 'for-sale',
      city: '',
      minPrice: undefined,
      maxPrice: undefined,
      bedrooms: undefined,
      propertyType: '',
    }
    setFilters(resetFilters)

    // Clear URL parameters
    router.push('/properties?type=buy')

    // Dispatch clear event
    const searchEvent = new CustomEvent('propertySearch', {
      detail: { ...resetFilters, page: 1 },
    })
    window.dispatchEvent(searchEvent)
  }

  // Listen for searches from other components
  useEffect(() => {
    const handleExternalSearch = (event: Event) => {
      const customEvent = event as CustomEvent<PropertyFilters>
      setFilters(customEvent.detail)
    }

    window.addEventListener(
      'propertySearch',
      handleExternalSearch as EventListener
    )
    return () =>
      window.removeEventListener(
        'propertySearch',
        handleExternalSearch as EventListener
      )
  }, [])

  // Price options - different for buy/rent/short-let
  const getPriceOptions = (status: PropertyFilters['status']) => {
    if (status === 'short-let') {
      return [
        { value: '5000', label: '₦5,000' },
        { value: '15000', label: '₦15,000' },
        { value: '30000', label: '₦30,000' },
        { value: '50000', label: '₦50,000' },
        { value: '100000', label: '₦100K' },
        { value: '200000', label: '₦200K' },
      ]
    } else if (status === 'for-rent') {
      return [
        { value: '200000', label: '₦200K' },
        { value: '500000', label: '₦500K' },
        { value: '1000000', label: '₦1M' },
        { value: '2000000', label: '₦2M' },
        { value: '5000000', label: '₦5M' },
        { value: '10000000', label: '₦10M' },
      ]
    } else {
      return [
        { value: '10000000', label: '₦10M' },
        { value: '25000000', label: '₦25M' },
        { value: '50000000', label: '₦50M' },
        { value: '100000000', label: '₦100M' },
        { value: '200000000', label: '₦200M' },
        { value: '500000000', label: '₦500M' },
      ]
    }
  }

  const priceOptions = getPriceOptions(filters.status)
  const minPriceOptions = [{ value: 'any', label: 'Any Min' }, ...priceOptions]
  const maxPriceOptions = [{ value: 'any', label: 'Any Max' }, ...priceOptions]

  const bedroomOptions = [
    { value: 'any', label: 'Any' }, // Changed from empty string to 'any'
    { value: '1', label: '1+' },
    { value: '2', label: '2+' },
    { value: '3', label: '3+' },
    { value: '4', label: '4+' },
    { value: '5', label: '5+' },
  ]

  const propertyTypeOptions = [
    { value: 'any', label: 'Any' }, // Changed from empty string to 'any'
    { value: 'house', label: 'House' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'condo', label: 'Condo' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'villa', label: 'Villa' },
    { value: 'land', label: 'Land' },
  ]

  return (
    <Card className="border border-gray-200">
      <CardContent className="p-6">
        {/* Main Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Status with short-let */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium">
              I want to
            </Label>
            <Select
              value={filters.status === 'for-sale' ? 'buy' : filters.status}
              onValueChange={(value) => {
                let newStatus: PropertyFilters['status'] = 'for-sale'
                if (value === 'rent') newStatus = 'for-rent'
                if (value === 'short-let') newStatus = 'short-let'
                handleFilterChange('status', newStatus)
              }}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buy">Buy</SelectItem>
                <SelectItem value="rent">Rent</SelectItem>
                <SelectItem value="short-let">Short-let</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city" className="text-sm font-medium">
              Location
            </Label>
            <Input
              id="city"
              type="text"
              placeholder="City or neighborhood"
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
            />
          </div>

          {/* Min Price - Fixed: no empty string values */}
          <div className="space-y-2">
            <Label htmlFor="minPrice" className="text-sm font-medium">
              Min Price
            </Label>
            <Select
              value={filters.minPrice?.toString() || 'any'}
              onValueChange={(value) =>
                handleFilterChange(
                  'minPrice',
                  value === 'any' ? undefined : Number(value)
                )
              }
            >
              <SelectTrigger id="minPrice">
                <SelectValue placeholder="Any Min" />
              </SelectTrigger>
              <SelectContent>
                {minPriceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Max Price - Fixed: no empty string values */}
          <div className="space-y-2">
            <Label htmlFor="maxPrice" className="text-sm font-medium">
              Max Price
            </Label>
            <Select
              value={filters.maxPrice?.toString() || 'any'}
              onValueChange={(value) =>
                handleFilterChange(
                  'maxPrice',
                  value === 'any' ? undefined : Number(value)
                )
              }
            >
              <SelectTrigger id="maxPrice">
                <SelectValue placeholder="Any Max" />
              </SelectTrigger>
              <SelectContent>
                {maxPriceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <Button onClick={handleSearch} className="w-full h-10 gap-2">
              <Search className="h-4 w-4" />
              Apply Filters
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
          {/* Bedrooms - Fixed: no empty string values */}
          <div className="space-y-2">
            <Label htmlFor="bedrooms" className="text-sm font-medium">
              Bedrooms
            </Label>
            <Select
              value={filters.bedrooms?.toString() || 'any'}
              onValueChange={(value) =>
                handleFilterChange(
                  'bedrooms',
                  value === 'any' ? undefined : Number(value)
                )
              }
            >
              <SelectTrigger id="bedrooms">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                {bedroomOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Property Type - Fixed: no empty string values */}
          <div className="space-y-2">
            <Label htmlFor="propertyType" className="text-sm font-medium">
              Property Type
            </Label>
            <Select
              value={filters.propertyType || 'any'}
              onValueChange={(value) =>
                handleFilterChange('propertyType', value === 'any' ? '' : value)
              }
            >
              <SelectTrigger id="propertyType">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                {propertyTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full h-10"
            >
              Clear All
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
