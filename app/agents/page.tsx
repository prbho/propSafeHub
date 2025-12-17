// app/agents/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Agent } from '@/types'
import { Query } from 'node-appwrite'

import AgentCard from '@/components/AgentCard'
import SortSelect from '@/components/agents/SortSelect'
import AgentsSearchFilters from '@/components/AgentsSearchFilters'
import {
  AGENTS_COLLECTION_ID,
  DATABASE_ID,
  serverDatabases,
} from '@/lib/appwrite-server'

// New function to fetch unique values from the database
async function getUniqueValues(field: string): Promise<string[]> {
  try {
    const response = await serverDatabases.listDocuments(
      DATABASE_ID,
      AGENTS_COLLECTION_ID,
      [Query.select([field]), Query.limit(1000)]
    )

    // Extract values and handle both strings and arrays
    const allValues: string[] = []

    response.documents.forEach((doc: any) => {
      const value = doc[field]

      if (value === undefined || value === null) return

      if (Array.isArray(value)) {
        // Handle array values
        value.forEach((item) => {
          if (typeof item === 'string' && item.trim() !== '') {
            allValues.push(item.trim())
          }
        })
      } else if (typeof value === 'string' && value.trim() !== '') {
        // Handle string values
        allValues.push(value.trim())
      }
    })

    // Remove duplicates and sort
    const uniqueValues = [...new Set(allValues)].sort()

    console.log(`✅ Found ${uniqueValues.length} unique values for ${field}`)
    return uniqueValues
  } catch (error) {
    console.error(`Error fetching unique ${field}:`, error)
    return []
  }
}

async function getAgents(filters?: {
  city?: string
  specialties?: string[]
  minExperience?: number
  minRating?: number
  sortBy?: string
}): Promise<{ agents: Agent[]; error?: string }> {
  try {
    console.log('🔍 Fetching agents with filters:', filters)

    const queries: any[] = [Query.limit(100)]

    if (filters?.city && filters.city.trim()) {
      queries.push(Query.equal('city', filters.city.trim()))
    }

    if (filters?.specialties && filters.specialties.length > 0) {
      filters.specialties.forEach((specialty) => {
        if (specialty.trim()) {
          queries.push(Query.contains('specialties', specialty.trim()))
        }
      })
    }

    if (filters?.minExperience && filters.minExperience > 0) {
      queries.push(
        Query.greaterThanEqual('yearsExperience', filters.minExperience)
      )
    }

    if (filters?.minRating && filters.minRating > 0) {
      queries.push(Query.greaterThanEqual('rating', filters.minRating))
    }

    // Handle sorting based on sortBy parameter
    switch (filters?.sortBy) {
      case 'experience':
        queries.push(Query.orderDesc('yearsExperience'))
        queries.push(Query.orderDesc('rating')) // Secondary sort
        break
      case 'listings':
        queries.push(Query.orderDesc('totalListings'))
        queries.push(Query.orderDesc('rating')) // Secondary sort
        break
      case 'name':
        queries.push(Query.orderAsc('name'))
        queries.push(Query.orderDesc('rating')) // Secondary sort
        break
      case 'rating':
      default:
        queries.push(Query.orderDesc('rating'))
        queries.push(Query.orderDesc('yearsExperience')) // Secondary sort
        break
    }

    const response = await serverDatabases.listDocuments(
      DATABASE_ID,
      AGENTS_COLLECTION_ID,
      queries
    )

    console.log(`✅ Found ${response.total} agents`)

    const agents: Agent[] = response.documents.map((doc: any) => ({
      $id: doc.$id,
      $createdAt: doc.$createdAt,
      $updatedAt: doc.$updatedAt,
      name: doc.name || 'Unknown Agent',
      email: doc.email || '',
      phone: doc.phone || '',
      avatar: doc.avatar || '',
      agency: doc.agency || 'Independent Agent',
      city: doc.city || '',
      state: doc.state || '',
      yearsExperience: doc.yearsExperience || 0,
      specialties: doc.specialties || [],
      languages: doc.languages || ['English'],
      rating: doc.rating || 0,
      reviewCount: doc.reviewCount || 0,
      totalListings: doc.totalListings || 0,
      licenseNumber: doc.licenseNumber || '',
      isVerified: doc.isVerified || false,
      bio: doc.bio || '',
      officePhone: doc.officePhone || '',
      mobilePhone: doc.mobilePhone || '',
      website: doc.website || '',
      verificationDocuments: doc.verificationDocuments || [],
    }))

    return { agents }
  } catch (error: any) {
    console.error('❌ Error fetching agents:', error)
    return {
      agents: [],
      error: error.message || 'Failed to fetch agents',
    }
  }
}

interface AgentsPageProps {
  searchParams: Promise<{
    city?: string
    specialties?: string
    minExperience?: string
    minRating?: string
    sortBy?: string
  }>
}

export default async function AgentsPage({ searchParams }: AgentsPageProps) {
  const params = await searchParams

  console.log('📋 Search params received:', params)

  const filters = {
    city: params.city,
    specialties: params.specialties ? params.specialties.split(',') : undefined,
    minExperience: params.minExperience
      ? parseInt(params.minExperience)
      : undefined,
    minRating: params.minRating ? parseFloat(params.minRating) : undefined,
    sortBy: params.sortBy || 'rating',
  }

  // Fetch agents data and unique values in parallel
  const [agentsResult, uniqueCities, uniqueSpecialties] = await Promise.all([
    getAgents(filters),
    getUniqueValues('city'),
    getUniqueValues('specialties'),
  ])

  const { agents, error } = agentsResult

  console.log('📊 Unique values:', {
    cities: uniqueCities.length,
    specialties: uniqueSpecialties.length,
  })

  // If there's a database error, show it
  if (error) {
    console.error('🚨 Page rendering error:', error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Database Error
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">{error}</p>
          <p className="text-sm text-gray-500 mt-4">
            Check your Appwrite console and database configuration.
          </p>
        </div>
      </div>
    )
  }

  // Function to build URL with sort parameter
  // const buildSortUrl = (sortValue: string) => {
  //   const params = new URLSearchParams()

  //   if (filters.city) params.set('city', filters.city)
  //   if (filters.specialties?.length)
  //     params.set('specialties', filters.specialties.join(','))
  //   if (filters.minExperience)
  //     params.set('minExperience', filters.minExperience.toString())
  //   if (filters.minRating) params.set('minRating', filters.minRating.toString())
  //   params.set('sortBy', sortValue)

  //   return `/agents?${params.toString()}`
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">
              Find Your Perfect Agent
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Connect with verified real estate professionals who understand
              your local market
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80 shrink-0">
            <AgentsSearchFilters
              initialFilters={{
                city: filters.city,
                specialty: filters.specialties?.[0],
                minExperience: filters.minExperience,
                minRating: filters.minRating,
              }}
              availableCities={uniqueCities}
            />
          </div>

          {/* Agents Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Verified Agents ({agents.length})
                </h2>
                {filters.city && (
                  <p className="text-gray-600 mt-1">in {filters.city}</p>
                )}
              </div>

              {/* Sort Options */}
              <SortSelect currentSort={filters.sortBy} />
            </div>

            <>
              {agents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {agents.map((agent) => (
                    <AgentCard key={agent.$id} agent={agent} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-gray-400 text-6xl mb-4">👨‍💼</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    No agents found
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    {filters.city || filters.specialties
                      ? 'No agents match your current filters. Try adjusting your search criteria.'
                      : 'No agents found in the database. Please check your Appwrite configuration.'}
                  </p>
                </div>
              )}
            </>
          </div>
        </div>
      </div>
    </div>
  )
}
