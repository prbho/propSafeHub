// components/SidebarSearchFilters.tsx - Fixed shadcn Select errors
'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PropertyFilters } from '@/types'
import { Filter, Search } from 'lucide-react'

// shadcn components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function SidebarSearchFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [filters, setFilters] = useState<PropertyFilters>({
    status: 'for-sale',
    q: '',
    minPrice: undefined,
    maxPrice: undefined,
    bedrooms: undefined,
    propertyType: '',
  })

  // Keep your original initializeFilters logic exactly as is
  const initializeFilters = useCallback(() => {
    const type = searchParams.get('type')
    const q = searchParams.get('q') || ''

    let status: 'for-sale' | 'for-rent' | 'short-let'
    switch (type) {
      case 'rent':
        status = 'for-rent'
        break
      case 'short-let':
        status = 'short-let'
        break
      case 'buy':
      default:
        status = 'for-sale'
        break
    }

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

  // Keep your original useEffect logic
  useEffect(() => {
    const newFilters = initializeFilters()

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

  // Keep your original handleFilterChange logic
  const handleFilterChange = (
    key: keyof PropertyFilters,
    value: string | number | undefined
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  // Keep your original handleSearch logic
  const handleSearch = () => {
    const params = new URLSearchParams()

    switch (filters.status) {
      case 'for-rent':
        params.set('type', 'rent')
        break
      case 'short-let':
        params.set('type', 'short-let')
        break
      case 'for-sale':
      default:
        params.set('type', 'buy')
        break
    }

    if (filters.q) params.set('q', filters.q)
    if (filters.minPrice) params.set('minPrice', filters.minPrice.toString())
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString())
    if (filters.bedrooms) params.set('bedrooms', filters.bedrooms.toString())
    if (filters.propertyType) params.set('propertyType', filters.propertyType)

    console.log('🔍 SearchFilters - Navigating to:', params.toString())
    router.push(`/properties?${params.toString()}`, { scroll: false })

    const searchEvent = new CustomEvent('propertySearch', {
      detail: { ...filters, page: 1 },
    })
    window.dispatchEvent(searchEvent)
  }

  // Keep your original clearFilters logic
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
    <div className="space-y-6 p-5 bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}

      {/* Status Filter - Fixed: Remove empty value SelectItem */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-800">I want to</Label>
        <Select
          value={
            filters.status === 'for-sale'
              ? 'buy'
              : filters.status === 'for-rent'
                ? 'rent'
                : 'short-let'
          }
          onValueChange={(value) => {
            const newStatus =
              value === 'buy'
                ? 'for-sale'
                : value === 'rent'
                  ? 'for-rent'
                  : 'short-let'
            handleFilterChange('status', newStatus)
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="buy">Buy</SelectItem>
            <SelectItem value="rent">Rent</SelectItem>
            <SelectItem value="short-let">Short-let</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-800">Location</Label>
        <Input
          type="text"
          placeholder="City, neighborhood, or address"
          value={filters.q}
          onChange={(e) => handleFilterChange('q', e.target.value)}
          className="w-full"
        />
      </div>

      {/* Price Range - Fixed: Use "any" as value instead of empty string */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-800">Price Range</Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Select
              value={filters.minPrice?.toString() || 'any'}
              onValueChange={(value) =>
                handleFilterChange(
                  'minPrice',
                  value === 'any' ? undefined : Number(value)
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Min" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Min</SelectItem>
                {filters.status === 'short-let' ? (
                  <>
                    <SelectItem value="5000">₦5,000</SelectItem>
                    <SelectItem value="15000">₦15,000</SelectItem>
                    <SelectItem value="30000">₦30,000</SelectItem>
                  </>
                ) : filters.status === 'for-rent' ? (
                  <>
                    <SelectItem value="200000">₦200K</SelectItem>
                    <SelectItem value="500000">₦500K</SelectItem>
                    <SelectItem value="1000000">₦1M</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="10000000">₦10M</SelectItem>
                    <SelectItem value="25000000">₦25M</SelectItem>
                    <SelectItem value="50000000">₦50M</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Select
              value={filters.maxPrice?.toString() || 'any'}
              onValueChange={(value) =>
                handleFilterChange(
                  'maxPrice',
                  value === 'any' ? undefined : Number(value)
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Max" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Max</SelectItem>
                {filters.status === 'short-let' ? (
                  <>
                    <SelectItem value="30000">₦30,000</SelectItem>
                    <SelectItem value="50000">₦50,000</SelectItem>
                    <SelectItem value="100000">₦100K</SelectItem>
                  </>
                ) : filters.status === 'for-rent' ? (
                  <>
                    <SelectItem value="1000000">₦1M</SelectItem>
                    <SelectItem value="2000000">₦2M</SelectItem>
                    <SelectItem value="5000000">₦5M</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="50000000">₦50M</SelectItem>
                    <SelectItem value="100000000">₦100M</SelectItem>
                    <SelectItem value="200000000">₦200M</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Bedrooms - Fixed: Use "any" as value instead of empty string */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-800">Bedrooms</Label>
        <Select
          value={filters.bedrooms?.toString() || 'any'}
          onValueChange={(value) =>
            handleFilterChange(
              'bedrooms',
              value === 'any' ? undefined : Number(value)
            )
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Any bedrooms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any bedrooms</SelectItem>
            <SelectItem value="1">1+ bedrooms</SelectItem>
            <SelectItem value="2">2+ bedrooms</SelectItem>
            <SelectItem value="3">3+ bedrooms</SelectItem>
            <SelectItem value="4">4+ bedrooms</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Property Type - Fixed: Use "any" as value instead of empty string */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-800">
          Property Type
        </Label>
        <Select
          value={filters.propertyType || 'any'}
          onValueChange={(value) =>
            handleFilterChange('propertyType', value === 'any' ? '' : value)
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Any type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any type</SelectItem>
            <SelectItem value="house">House</SelectItem>
            <SelectItem value="apartment">Apartment</SelectItem>
            <SelectItem value="condo">Condo</SelectItem>
            <SelectItem value="townhouse">Townhouse</SelectItem>
            <SelectItem value="land">Land</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4">
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
