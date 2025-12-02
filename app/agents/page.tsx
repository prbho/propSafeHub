// app/agents/page.tsx
import { Suspense } from 'react'
import { Agent } from '@/types'
import { Query } from 'node-appwrite'

import AgentCard from '@/components/AgentCard'
import AgentsSearchFilters from '@/components/AgentsSearchFilters'
import {
  AGENTS_COLLECTION_ID,
  DATABASE_ID,
  serverDatabases,
} from '@/lib/appwrite-server'

async function getAgents(filters?: {
  city?: string
  specialties?: string[]
  minExperience?: number
  minRating?: number
}): Promise<{ agents: Agent[]; error?: string }> {
  try {
    console.log('🔍 Fetching agents with filters:', filters)

    // First, let's verify the database connection and collection
    try {
      const collection = await serverDatabases.getCollection(
        DATABASE_ID,
        AGENTS_COLLECTION_ID
      )
      console.log('✅ Collection found:', collection.name)
    } catch (collectionError) {
      console.error('❌ Collection error:', collectionError)
      return {
        agents: [],
        error: `Collection not found: ${AGENTS_COLLECTION_ID}`,
      }
    }

    const queries = []

    // Add filters to queries with proper error handling
    if (filters?.city) {
      console.log('📍 Filtering by city:', filters.city)
      queries.push(Query.equal('city', filters.city))
    }

    if (filters?.specialties && filters.specialties.length > 0) {
      console.log('🎯 Filtering by specialties:', filters.specialties)
      queries.push(Query.contains('specialties', filters.specialties))
    }

    if (filters?.minExperience) {
      console.log('📅 Filtering by min experience:', filters.minExperience)
      queries.push(
        Query.greaterThanEqual('yearsExperience', filters.minExperience)
      )
    }

    if (filters?.minRating) {
      console.log('⭐ Filtering by min rating:', filters.minRating)
      queries.push(Query.greaterThanEqual('rating', filters.minRating))
    }

    // If no filters, just get all agents
    const finalQueries = queries.length > 0 ? queries : [Query.limit(50)]

    const response = await serverDatabases.listDocuments(
      DATABASE_ID,
      AGENTS_COLLECTION_ID,
      finalQueries
    )

    console.log(`✅ Found ${response.total} agents`)
    return { agents: response.documents as unknown as Agent[] }
  } catch {
    return {
      agents: [],
    }
  }
}

interface AgentsPageProps {
  searchParams: Promise<{
    // searchParams is now a Promise
    city?: string
    specialties?: string
    minExperience?: string
    minRating?: string
  }>
}

export default async function AgentsPage({ searchParams }: AgentsPageProps) {
  // Await the searchParams Promise
  const params = await searchParams

  const filters = {
    city: params.city,
    specialties: params.specialties ? [params.specialties] : undefined,
    minExperience: params.minExperience
      ? parseInt(params.minExperience)
      : undefined,
    minRating: params.minRating ? parseFloat(params.minRating) : undefined,
  }

  const { agents, error } = await getAgents(filters)

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
              <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white">
                <option value="rating">Highest Rated</option>
                <option value="experience">Most Experienced</option>
                <option value="listings">Most Listings</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>

            <Suspense fallback={<AgentsSkeleton />}>
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
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

function AgentsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
          <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
          <div className="bg-gray-200 h-4 rounded w-1/2 mb-2"></div>
          <div className="bg-gray-200 h-4 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  )
}
