// components/agents/SearchFilters.tsx - WITH UX IMPROVEMENTS
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Award, Filter, Loader2, MapPin, Star } from 'lucide-react'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './ui/select'

interface Filters {
  city: string
  specialty: string
  minExperience: string
  minRating: string
}

interface SearchFiltersProps {
  initialFilters?: {
    city?: string
    specialty?: string
    minExperience?: number | string
    minRating?: number | string
  }
  availableCities?: string[]
}

const defaultCities: string[] = [
  'Lagos',
  'Abuja',
  'Port Harcourt',
  'Kano',
  'Ibadan',
  'Kaduna',
  'Enugu',
  'Benin City',
  'Uyo',
  'Calabar',
]

// Special constant for "all/any" selections
const ALL_OPTIONS = {
  CITY: 'all-cities',
  SPECIALTY: 'all-specialties',
  EXPERIENCE: 'any-experience',
  RATING: 'any-rating',
}

export default function AgentSearchFilters({
  initialFilters,
  availableCities = [],
}: SearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Use provided cities or defaults
  const cities = availableCities.length > 0 ? availableCities : defaultCities

  // Add loading state for buttons
  const [isApplying, setIsApplying] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  // Initialize state - convert empty strings to our special values
  const [filters, setFilters] = useState<Filters>(() => {
    // Get initial values from URL params first, then fall back to initialFilters
    const urlCity = searchParams.get('city') || ''
    const urlSpecialty = searchParams.get('specialty') || ''
    const urlMinExp = searchParams.get('minExperience') || ''
    const urlMinRating = searchParams.get('minRating') || ''

    return {
      city: urlCity || initialFilters?.city || ALL_OPTIONS.CITY,
      specialty:
        urlSpecialty || initialFilters?.specialty || ALL_OPTIONS.SPECIALTY,
      minExperience:
        urlMinExp ||
        (typeof initialFilters?.minExperience === 'number'
          ? initialFilters.minExperience.toString()
          : initialFilters?.minExperience || ALL_OPTIONS.EXPERIENCE),
      minRating:
        urlMinRating ||
        (typeof initialFilters?.minRating === 'number'
          ? initialFilters.minRating.toString()
          : initialFilters?.minRating || ALL_OPTIONS.RATING),
    }
  })

  // Sync with URL params when they change
  useEffect(() => {
    const urlCity = searchParams.get('city') || ALL_OPTIONS.CITY
    const urlSpecialty = searchParams.get('specialty') || ALL_OPTIONS.SPECIALTY
    const urlMinExp =
      searchParams.get('minExperience') || ALL_OPTIONS.EXPERIENCE
    const urlMinRating = searchParams.get('minRating') || ALL_OPTIONS.RATING

    setFilters((prev) => {
      if (
        urlCity !== prev.city ||
        urlSpecialty !== prev.specialty ||
        urlMinExp !== prev.minExperience ||
        urlMinRating !== prev.minRating
      ) {
        return {
          city: urlCity,
          specialty: urlSpecialty,
          minExperience: urlMinExp,
          minRating: urlMinRating,
        }
      }
      return prev
    })
  }, [searchParams])

  const applyFilters = async (): Promise<void> => {
    if (isApplying) return // Prevent double-click

    setIsApplying(true)

    const params = new URLSearchParams()

    // Only add to URL if not "all/any" option
    if (filters.city && filters.city !== ALL_OPTIONS.CITY) {
      params.set('city', filters.city)
    }
    if (filters.specialty && filters.specialty !== ALL_OPTIONS.SPECIALTY) {
      params.set('specialty', filters.specialty)
    }
    if (
      filters.minExperience &&
      filters.minExperience !== ALL_OPTIONS.EXPERIENCE
    ) {
      params.set('minExperience', filters.minExperience)
    }
    if (filters.minRating && filters.minRating !== ALL_OPTIONS.RATING) {
      params.set('minRating', filters.minRating)
    }

    try {
      // Add a small delay for better UX (optional)
      await new Promise((resolve) => setTimeout(resolve, 300))

      router.push(`/agents?${params.toString()}`)
    } catch (error) {
      console.error('Error applying filters:', error)
    } finally {
      setIsApplying(false)
    }
  }

  const clearFilters = async (): Promise<void> => {
    if (isClearing) return // Prevent double-click

    setIsClearing(true)

    setFilters({
      city: ALL_OPTIONS.CITY,
      specialty: ALL_OPTIONS.SPECIALTY,
      minExperience: ALL_OPTIONS.EXPERIENCE,
      minRating: ALL_OPTIONS.RATING,
    })

    try {
      // Add a small delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 300))

      router.push('/agents')
    } catch (error) {
      console.error('Error clearing filters:', error)
    } finally {
      setIsClearing(false)
    }
  }

  // Helper to get display text
  const getDisplayText = (
    value: string,
    type: 'city' | 'specialty' | 'experience' | 'rating'
  ): string => {
    switch (type) {
      case 'city':
        if (value === ALL_OPTIONS.CITY) return 'All Cities'
        return value
      case 'specialty':
        if (value === ALL_OPTIONS.SPECIALTY) return 'All Specialties'
        return value
      case 'experience':
        if (value === ALL_OPTIONS.EXPERIENCE) return 'Any Experience'
        if (value === '1') return '1+ Years'
        if (value === '3') return '3+ Years'
        if (value === '5') return '5+ Years'
        if (value === '10') return '10+ Years'
        return 'Any Experience'
      case 'rating':
        if (value === ALL_OPTIONS.RATING) return 'Any Rating'
        if (value === '4.0') return '4.0+ Stars'
        if (value === '4.5') return '4.5+ Stars'
        if (value === '4.8') return '4.8+ Stars'
        return 'Any Rating'
      default:
        return value
    }
  }

  const isLoading = cities.length === 0 && availableCities.length > 0

  // Check if any filter is active (not the default "all/any" option)
  const hasActiveFilters =
    filters.city !== ALL_OPTIONS.CITY ||
    filters.specialty !== ALL_OPTIONS.SPECIALTY ||
    filters.minExperience !== ALL_OPTIONS.EXPERIENCE ||
    filters.minRating !== ALL_OPTIONS.RATING

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Filter Agents</h3>
        {hasActiveFilters && (
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
            Active Filters
          </span>
        )}
      </div>

      <div className="space-y-6">
        {/* City Filter */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            City
            {isLoading && (
              <span className="text-xs text-gray-500">(loading...)</span>
            )}
          </label>
          <Select
            value={filters.city}
            onValueChange={(value) => setFilters({ ...filters, city: value })}
            disabled={isLoading || isApplying || isClearing}
          >
            <SelectTrigger className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
              <SelectValue>{getDisplayText(filters.city, 'city')}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Cities</SelectLabel>
                <SelectItem value={ALL_OPTIONS.CITY}>All Cities</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Specialty Filter */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            Specialty
          </label>
          <Select
            value={filters.specialty}
            onValueChange={(value) =>
              setFilters({ ...filters, specialty: value })
            }
            disabled={isApplying || isClearing}
          >
            <SelectTrigger className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
              <SelectValue>
                {getDisplayText(filters.specialty, 'specialty')}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Areas of Expertise</SelectLabel>
                <SelectItem value={ALL_OPTIONS.SPECIALTY}>
                  All Specialties
                </SelectItem>
                <SelectItem value="Residential">Residential</SelectItem>
                <SelectItem value="Commercial">Commercial</SelectItem>
                <SelectItem value="Industrial">Industrial</SelectItem>
                <SelectItem value="Land/Raw Land">Land/Raw Land</SelectItem>
                <SelectItem value="Luxury Homes">Luxury Homes</SelectItem>
                <SelectItem value="Green/Eco-Friendly">
                  Green/Eco-Friendly
                </SelectItem>
                <SelectItem value="Foreclosures and Short Sales">
                  Foreclosures and Short Sales
                </SelectItem>
                <SelectItem value="Buyer Representation">
                  Buyer Representation
                </SelectItem>
                <SelectItem value="Seller Representation">
                  Seller Representation
                </SelectItem>
                <SelectItem value="Property Management">
                  Property Management
                </SelectItem>
                <SelectItem value="Real Estate Investment">
                  Real Estate Investment
                </SelectItem>
                <SelectItem value="Land Acquisition">
                  Land Acquisition
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Minimum Experience */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            Min. Experience (Years)
          </label>
          <Select
            value={filters.minExperience}
            onValueChange={(value) =>
              setFilters({ ...filters, minExperience: value })
            }
            disabled={isApplying || isClearing}
          >
            <SelectTrigger className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
              <SelectValue>
                {getDisplayText(filters.minExperience, 'experience')}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Experience Level</SelectLabel>
                <SelectItem value={ALL_OPTIONS.EXPERIENCE}>
                  Any Experience
                </SelectItem>
                <SelectItem value="1">1+ Years</SelectItem>
                <SelectItem value="3">3+ Years</SelectItem>
                <SelectItem value="5">5+ Years</SelectItem>
                <SelectItem value="10">10+ Years</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Minimum Rating */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            Min. Rating
          </label>
          <Select
            value={filters.minRating}
            onValueChange={(value) =>
              setFilters({ ...filters, minRating: value })
            }
            disabled={isApplying || isClearing}
          >
            <SelectTrigger className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
              <SelectValue>
                {getDisplayText(filters.minRating, 'rating')}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Minimum Rating</SelectLabel>
                <SelectItem value={ALL_OPTIONS.RATING}>Any Rating</SelectItem>
                <SelectItem value="4.0">4.0+ Stars</SelectItem>
                <SelectItem value="4.5">4.5+ Stars</SelectItem>
                <SelectItem value="4.8">4.8+ Stars</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={applyFilters}
            disabled={isApplying || isClearing}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors font-medium ${
              isApplying
                ? 'bg-emerald-700 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700'
            } text-white`}
          >
            {isApplying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Applying...
              </>
            ) : (
              'Apply Filters'
            )}
          </button>

          <button
            onClick={clearFilters}
            disabled={isApplying || isClearing || !hasActiveFilters}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isClearing || !hasActiveFilters
                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            } border`}
          >
            {isClearing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Clearing...
              </>
            ) : (
              'Clear'
            )}
          </button>
        </div>

        {/* Active filters summary (optional) */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-sm text-gray-600 mb-2">Active filters:</p>
            <div className="flex flex-wrap gap-2">
              {filters.city !== ALL_OPTIONS.CITY && (
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                  City: {getDisplayText(filters.city, 'city')}
                </span>
              )}
              {filters.specialty !== ALL_OPTIONS.SPECIALTY && (
                <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700">
                  Specialty: {getDisplayText(filters.specialty, 'specialty')}
                </span>
              )}
              {filters.minExperience !== ALL_OPTIONS.EXPERIENCE && (
                <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                  Exp: {getDisplayText(filters.minExperience, 'experience')}
                </span>
              )}
              {filters.minRating !== ALL_OPTIONS.RATING && (
                <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700">
                  Rating: {getDisplayText(filters.minRating, 'rating')}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
