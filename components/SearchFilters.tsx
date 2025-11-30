// components/SearchFilters.tsx
'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PropertyFilters } from '@/types'

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

    if (filters.status === 'for-sale') {
      params.set('type', 'buy')
    } else if (filters.status === 'for-rent') {
      params.set('type', 'rent')
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

  const priceOptions = [
    { value: '', label: 'Any' },
    { value: '10000000', label: '₦10M' },
    { value: '25000000', label: '₦25M' },
    { value: '50000000', label: '₦50M' },
    { value: '100000000', label: '₦100M' },
    { value: '200000000', label: '₦200M' },
    { value: '500000000', label: '₦500M' },
  ]

  const bedroomOptions = [
    { value: '', label: 'Any' },
    { value: '1', label: '1+' },
    { value: '2', label: '2+' },
    { value: '3', label: '3+' },
    { value: '4', label: '4+' },
    { value: '5', label: '5+' },
  ]

  const propertyTypeOptions = [
    { value: '', label: 'Any' },
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
          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium">
              I want to
            </Label>
            <Select
              value={filters.status === 'for-sale' ? 'buy' : 'rent'}
              onValueChange={(value) =>
                handleFilterChange(
                  'status',
                  value === 'buy' ? 'for-sale' : 'for-rent'
                )
              }
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buy">Buy</SelectItem>
                <SelectItem value="rent">Rent</SelectItem>
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

          {/* Min Price */}
          <div className="space-y-2">
            <Label htmlFor="minPrice" className="text-sm font-medium">
              Min Price
            </Label>
            <Select
              value={filters.minPrice?.toString() || ''}
              onValueChange={(value) =>
                handleFilterChange(
                  'minPrice',
                  value ? Number(value) : undefined
                )
              }
            >
              <SelectTrigger id="minPrice">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                {priceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Max Price */}
          <div className="space-y-2">
            <Label htmlFor="maxPrice" className="text-sm font-medium">
              Max Price
            </Label>
            <Select
              value={filters.maxPrice?.toString() || ''}
              onValueChange={(value) =>
                handleFilterChange(
                  'maxPrice',
                  value ? Number(value) : undefined
                )
              }
            >
              <SelectTrigger id="maxPrice">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                {priceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <Button onClick={handleSearch} className="w-full h-10">
              Apply Filters
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
          {/* Bedrooms */}
          <div className="space-y-2">
            <Label htmlFor="bedrooms" className="text-sm font-medium">
              Bedrooms
            </Label>
            <Select
              value={filters.bedrooms?.toString() || ''}
              onValueChange={(value) =>
                handleFilterChange(
                  'bedrooms',
                  value ? Number(value) : undefined
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

          {/* Property Type */}
          <div className="space-y-2">
            <Label htmlFor="propertyType" className="text-sm font-medium">
              Property Type
            </Label>
            <Select
              value={filters.propertyType || ''}
              onValueChange={(value) =>
                handleFilterChange('propertyType', value || undefined)
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
