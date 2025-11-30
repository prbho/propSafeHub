// components/agents/SearchFilters.tsx - Updated to accept numbers

'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Award, Filter, MapPin, Star } from 'lucide-react'

interface Filters {
  city: string
  specialty: string
  minExperience: string // Keep as string for form state
  minRating: string // Keep as string for form state
}

interface SearchFiltersProps {
  initialFilters?: {
    city?: string
    specialty?: string
    minExperience?: number | string // Accept both number and string
    minRating?: number | string // Accept both number and string
  }
}

const cities: string[] = [
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

const specialties: string[] = [
  'Luxury Homes',
  'Commercial Real Estate',
  'Property Management',
  'Residential Sales',
  'New Developments',
  'Waterfront Properties',
  'Affordable Housing',
  'Land Sales',
  'Investment Properties',
  'Relocation Services',
]

export default function AgentSearchFilters({
  initialFilters,
}: SearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Move the filter initialization logic outside of useEffect
  const getInitialFilters = useCallback((): Filters => {
    return {
      city: initialFilters?.city || searchParams.get('city') || '',
      specialty:
        initialFilters?.specialty || searchParams.get('specialty') || '',
      minExperience:
        typeof initialFilters?.minExperience === 'number'
          ? initialFilters.minExperience.toString()
          : initialFilters?.minExperience ||
            searchParams.get('minExperience') ||
            '',
      minRating:
        typeof initialFilters?.minRating === 'number'
          ? initialFilters.minRating.toString()
          : initialFilters?.minRating || searchParams.get('minRating') || '',
    }
  }, [initialFilters, searchParams])

  // Initialize state directly with the computed value
  const [filters, setFilters] = useState<Filters>(getInitialFilters)

  // Only update filters when the dependencies change significantly
  useEffect(() => {
    const newFilters = getInitialFilters()

    // Only update if filters have actually changed to prevent infinite loops
    if (
      newFilters.city !== filters.city ||
      newFilters.specialty !== filters.specialty ||
      newFilters.minExperience !== filters.minExperience ||
      newFilters.minRating !== filters.minRating
    ) {
      // Use setTimeout to avoid synchronous state update
      const timer = setTimeout(() => {
        setFilters(newFilters)
      }, 0)

      return () => clearTimeout(timer)
    }
  }, [getInitialFilters, filters]) // Add filters to dependencies for comparison

  const applyFilters = (): void => {
    const params = new URLSearchParams()

    if (filters.city) params.set('city', filters.city)
    if (filters.specialty) params.set('specialty', filters.specialty)
    if (filters.minExperience)
      params.set('minExperience', filters.minExperience)
    if (filters.minRating) params.set('minRating', filters.minRating)

    router.push(`/agents?${params.toString()}`)
  }

  const clearFilters = (): void => {
    setFilters({
      city: '',
      specialty: '',
      minExperience: '',
      minRating: '',
    })
    router.push('/agents')
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Filter Agents</h3>
      </div>

      <div className="space-y-6">
        {/* City Filter */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <MapPin className="w-4 h-4" />
            City
          </label>
          <select
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Cities</option>
            {cities.map((city: string) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Specialty Filter */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <Award className="w-4 h-4" />
            Specialty
          </label>
          <select
            value={filters.specialty}
            onChange={(e) =>
              setFilters({ ...filters, specialty: e.target.value })
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Specialties</option>
            {specialties.map((specialty: string) => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
          </select>
        </div>

        {/* Minimum Experience */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <Award className="w-4 h-4" />
            Min. Experience (Years)
          </label>
          <select
            value={filters.minExperience}
            onChange={(e) =>
              setFilters({ ...filters, minExperience: e.target.value })
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Any Experience</option>
            <option value="1">1+ Years</option>
            <option value="3">3+ Years</option>
            <option value="5">5+ Years</option>
            <option value="10">10+ Years</option>
          </select>
        </div>

        {/* Minimum Rating */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <Star className="w-4 h-4" />
            Min. Rating
          </label>
          <select
            value={filters.minRating}
            onChange={(e) =>
              setFilters({ ...filters, minRating: e.target.value })
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Any Rating</option>
            <option value="4.0">4.0+ Stars</option>
            <option value="4.5">4.5+ Stars</option>
            <option value="4.8">4.8+ Stars</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={applyFilters}
            className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Apply Filters
          </button>
          <button
            onClick={clearFilters}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}
