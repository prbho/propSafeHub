// app/[userType]/[id]/properties/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Property } from '@/types'
import { Query } from 'appwrite'
import { Eye, Heart, Home, List, Plus, Search } from 'lucide-react'

import PropertyCard from '@/components/PropertyCard'
import { databases } from '@/lib/appwrite'

export default function DynamicPropertiesPage({}: {
  params: Promise<{ userType: string; id: string }>
}) {
  const router = useRouter()
  const params = useParams()
  const userType = params.userType as string
  const id = params.id as string
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [agentProfileId, setAgentProfileId] = useState<string>('') // Add agent profile ID state
  const [fetchingAgentProfile, setFetchingAgentProfile] = useState(false)

  // Validate user access
  useEffect(() => {
    if (!authLoading && user) {
      if (user.$id !== id) {
        router.push('/')
        return
      }

      // Only agents and sellers can access properties pages
      if (!['agent', 'seller'].includes(user.userType)) {
        router.push(`/dashboard/${user.userType}/${user.$id}`)
        return
      }

      // Verify user type matches route
      if (user.userType !== userType) {
        router.push(`/dashboard/${user.userType}/${user.$id}`)
      }
    }
  }, [authLoading, user, id, userType, router])

  // Fetch agent profile for agents (to get agents collection ID)
  useEffect(() => {
    const fetchAgentProfile = async () => {
      if (user && user.userType === 'agent') {
        setFetchingAgentProfile(true)
        try {
          console.log('🔍 Fetching agent profile for properties page:', {
            userAccountId: user.$id,
            userType: user.userType,
          })

          const response = await fetch(
            `/api/agents/get-by-user?userId=${user.$id}`
          )

          if (response.ok) {
            const agentProfile = await response.json()
            console.log('✅ Agent profile found for properties query:', {
              userAccountId: user.$id,
              agentProfileId: agentProfile.$id,
              agentName: agentProfile.name,
              areIdsDifferent: user.$id !== agentProfile.$id,
            })
            setAgentProfileId(agentProfile.$id)
          } else {
            console.error('❌ No agent profile found')
            // Show error but don't redirect - let user see empty state
          }
        } catch (error) {
          console.error('❌ Error fetching agent profile:', error)
        } finally {
          setFetchingAgentProfile(false)
        }
      }
    }

    if (isAuthenticated && user && user.userType === 'agent') {
      fetchAgentProfile()
    }
  }, [isAuthenticated, user])

  const fetchProperties = useCallback(async () => {
    if (!user?.$id) return

    // For agents, we need the agentProfileId from agents collection
    if (userType === 'agent' && !agentProfileId && fetchingAgentProfile) {
      console.log(
        '⚠️ Waiting for agent profile ID before fetching properties...'
      )
      return
    }

    try {
      setLoading(true)
      const databaseId =
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'propertyDB'
      const propertiesCollectionId =
        process.env.NEXT_PUBLIC_APPWRITE_PROPERTIES_TABLE_ID || 'properties'

      const queries = []
      let possibleAgentIds: string[] = [] // Declare it here so it's available for logging

      // DIFFERENT LOGIC BASED ON USER TYPE:
      if (userType === 'agent') {
        // Build an array of all possible IDs this user could have used
        possibleAgentIds = []

        // Add agentProfileId if available (for properties posted as agent)
        if (agentProfileId) {
          possibleAgentIds.push(agentProfileId)
        }

        // Add user.$id (for when they posted as seller/normal user)
        possibleAgentIds.push(user.$id)

        // Remove duplicates
        const uniqueIds = [...new Set(possibleAgentIds.filter(Boolean))]

        console.log('🔍 Possible agent IDs for query:', {
          userAccountId: user.$id,
          agentProfileId: agentProfileId,
          uniqueIds: uniqueIds,
        })

        if (uniqueIds.length === 1) {
          // If only one ID, use simple equal query
          queries.push(Query.equal('agentId', uniqueIds[0]))
          console.log('✅ Using simple query with agentId:', uniqueIds[0])
        } else if (uniqueIds.length > 1) {
          // If multiple IDs, use OR query
          const orQueries = uniqueIds.map((id) => Query.equal('agentId', id))
          queries.push(Query.or(orQueries))
          console.log('✅ Using OR query with agentIds:', uniqueIds)
        } else {
          // No IDs available, can't query
          console.error('❌ No valid agent IDs available for query')
          setProperties([])
          setLoading(false)
          return
        }
      } else if (userType === 'seller') {
        // For sellers, just query by ownerId
        queries.push(Query.equal('ownerId', user.$id))
        console.log('🔍 Querying properties for seller with ownerId:', user.$id)
      }

      queries.push(Query.orderDesc('$createdAt'))
      queries.push(Query.limit(100))

      const response = await databases.listDocuments(
        databaseId,
        propertiesCollectionId,
        queries
      )

      console.log(
        `✅ Fetched ${response.documents.length} properties for ${userType}`,
        {
          userType,
          agentIdsUsed:
            userType === 'agent' ? possibleAgentIds : 'N/A (seller)',
          documents: response.documents.map((d) => ({
            id: d.$id,
            agentId: d.agentId,
            ownerId: d.ownerId,
            title: d.title,
            createdAt: d.$createdAt,
          })),
        }
      )

      const transformedProperties: Property[] = response.documents.map(
        (doc: any) => ({
          $id: doc.$id || '',
          $collectionId: doc.$collectionId || '',
          $databaseId: doc.$databaseId || '',
          $createdAt: doc.$createdAt || new Date().toISOString(),
          $updatedAt: doc.$updatedAt || new Date().toISOString(),
          $permissions: doc.$permissions || [],
          agentId: doc.agentId || '',
          userId: doc.userId || '',
          name: doc.name || '',
          propertyId: doc.propertyId || doc.$id,
          agentName: doc.agentName || '',
          title: doc.title || 'Untitled Property',
          description: doc.description || '',
          propertyType: doc.propertyType || 'house',
          status: doc.status || 'for-sale',
          price: doc.price || 0,
          priceUnit: doc.priceUnit || 'total',
          originalPrice: doc.originalPrice,
          priceHistory: doc.priceHistory || [],
          address: doc.address || '',
          phone: doc.phone || '',
          city: doc.city || '',
          state: doc.state || '',
          zipCode: doc.zipCode || '',
          country: doc.country || '',
          neighborhood: doc.neighborhood,
          latitude: doc.latitude || 0,
          longitude: doc.longitude || 0,
          bedrooms: doc.bedrooms || 0,
          bathrooms: doc.bathrooms || 0,
          squareFeet: doc.squareFeet || 0,
          lotSize: doc.lotSize,
          yearBuilt: doc.yearBuilt,
          features: doc.features || [],
          amenities: doc.amenities || [],
          images: doc.images || [],
          videos: doc.videos || [],
          ownerId: doc.ownerId || '',
          listedBy: doc.listedBy || 'agent',
          listDate: doc.listDate || doc.$createdAt,
          lastUpdated: doc.lastUpdated || doc.$updatedAt,
          isActive: doc.isActive !== undefined ? doc.isActive : true,
          isFeatured: doc.isFeatured || false,
          isVerified: doc.isVerified || false,
          tags: doc.tags || [],
          views: doc.views || 0,
          favorites: doc.favorites || 0,
          paymentOutright: doc.outright || true,
          outright: doc.outright || false,
          paymentPlan: doc.paymentPlan || false,
          mortgageEligible: doc.mortgageEligible || false,
          customPlanAvailable: doc.customPlanAvailable || false,
          customPlanDepositPercent: doc.customPlanDepositPercent || 0,
          customPlanMonths: doc.customPlanMonths || 0,
        })
      )

      setProperties(transformedProperties)
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.$id, userType, agentProfileId, fetchingAgentProfile]) // Add fetchingAgentProfile to dependencies

  useEffect(() => {
    if (
      isAuthenticated &&
      user &&
      user.$id === id &&
      user.userType === userType
    ) {
      // For agents, wait until we have agentProfileId
      if (userType === 'agent' && !agentProfileId && !fetchingAgentProfile) {
        console.log(
          '⏳ Cannot fetch properties yet - waiting for agent profile...'
        )
        return
      }

      fetchProperties()
    }
  }, [
    isAuthenticated,
    user,
    id,
    userType,
    agentProfileId,
    fetchingAgentProfile,
    fetchProperties,
  ])

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' || property.status === statusFilter
    const matchesType =
      typeFilter === 'all' || property.propertyType === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  // Show loading states
  if (
    authLoading ||
    loading ||
    (userType === 'agent' && !agentProfileId && fetchingAgentProfile)
  ) {
    return (
      <div className="p-6 mx-auto max-w-7xl">
        <div className="animate-pulse">
          <div className="flex">
            <div className="h-8 bg-gray-200 rounded w-1/8 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-40 mb-2 ml-auto"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-gray-200 p-4 h-20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-36 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-6"></div>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 bg-white border rounded-xl">
                    <div className="h-6 bg-gray-200 rounded w-6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 h-16 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center w-26 h-8 bg-white border rounded-lg"></div>
                <div className="flex items-center w-26 h-8 bg-white border rounded-lg"></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
              >
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Agent profile not found warning
  if (userType === 'agent' && !agentProfileId && !fetchingAgentProfile) {
    return (
      <div className="p-6 mx-auto max-w-7xl">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Agent Profile Required
          </h3>
          <p className="text-yellow-700 mb-4">
            You need an agent profile to view and manage properties. Please
            create an agent profile first.
          </p>
          <Link
            href="/agent/profile"
            className="inline-flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Create Agent Profile
          </Link>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user || user.$id !== id) {
    return null
  }

  const getPageTitle = () => {
    return userType === 'agent' ? 'My Properties' : 'My Listings'
  }

  const getAddButtonText = () => {
    return userType === 'agent' ? 'Add New Property' : 'Add New Listing'
  }

  const getEmptyStateMessage = () => {
    return userType === 'agent' ? 'No Properties Listed' : 'No Listings Yet'
  }

  return (
    <div className="p-4 md:p-6 mx-auto max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {getPageTitle()}
          </h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base">
            {userType === 'agent'
              ? 'Manage your property listings and track their performance'
              : 'Manage your property listings and track inquiries'}
          </p>
        </div>
        <Link
          //   href={`/${userType}/${id}/properties/new`}
          href={`/properties/post`}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {getAddButtonText()}
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Total {userType === 'agent' ? 'Properties' : 'Listings'}
              </p>
              <p className="text-xl font-bold text-gray-900">
                {properties.length}
              </p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-emerald-50 rounded-xl">
              <Home className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-xl font-bold text-gray-900">
                {properties.filter((p) => p.isActive).length}
              </p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-emerald-50 rounded-xl">
              <List className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Views</p>
              <p className="text-xl font-bold text-gray-900">
                {properties
                  .reduce((sum, prop) => sum + (prop.views || 0), 0)
                  .toLocaleString()}
              </p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-emerald-50 rounded-xl">
              <Eye className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Favorites</p>
              <p className="text-xl font-bold text-gray-900">
                {properties
                  .reduce((sum, prop) => sum + (prop.favorites || 0), 0)
                  .toLocaleString()}
              </p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-emerald-50 rounded-xl">
              <Heart className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search properties by title, address, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
            >
              <option value="all">All Status</option>
              <option value="for-sale">For Sale</option>
              <option value="for-rent">For Rent</option>
              <option value="sold">Sold</option>
              <option value="rented">Rented</option>
              <option value="active">Active</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
            >
              <option value="all">All Types</option>
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="condo">Condo</option>
              <option value="townhouse">Townhouse</option>
              <option value="land">Land</option>
            </select>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 md:p-12 text-center">
          <Home className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
            {properties.length === 0
              ? getEmptyStateMessage()
              : 'No Properties Found'}
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {properties.length === 0
              ? userType === 'agent'
                ? 'Get started by adding your first property listing.'
                : 'Start by listing your first property for sale or rent.'
              : "Try adjusting your search or filters to find what you're looking for."}
          </p>
          {properties.length === 0 && (
            <Link
              href={`/${userType}/${id}/properties/new`}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              {getAddButtonText()}
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.$id}
              property={property}
              userId={user?.$id}
              agentProfileId={agentProfileId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
