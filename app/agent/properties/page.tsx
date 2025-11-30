//app/agent/properties/page
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Query } from 'appwrite'
import { Eye, Heart, Home, List, Plus, Search } from 'lucide-react'

import PropertyCard from '@/components/PropertyCard' // Adjust path as needed
import { databases } from '@/lib/appwrite'

// Use the exact Property interface from your types
interface Property {
  $id: string
  $collectionId: string
  $databaseId: string
  $createdAt: string
  $updatedAt: string
  $permissions: string[]
  // Properties attributes
  paymentOutright: string
  agentId: string
  propertyId: string
  agentName: string
  title: string
  description: string
  propertyType: 'house' | 'apartment' | 'condo' | 'land' | 'townhouse'
  status: 'for-sale' | 'for-rent' | 'sold' | 'rented'
  price: number
  priceUnit: 'monthly' | 'yearly' | 'total'
  originalPrice?: number
  priceHistory?: any[]
  address: string
  phone: string
  city: string
  state: string
  zipCode: string
  country: string
  neighborhood?: string
  latitude: number
  longitude: number
  bedrooms: number
  bathrooms: number
  squareFeet: number
  lotSize?: number
  yearBuilt?: number
  features: string[]
  amenities: string[]
  images: string[]
  videos: string[]
  ownerId: string
  listedBy: 'owner' | 'agent'
  listDate: string
  lastUpdated: string
  isActive: boolean
  isFeatured: boolean
  isVerified: boolean
  tags: string[]
  views: number
  favorites: number

  // paymentOptions
  outright: boolean
  paymentPlan: boolean
  mortgageEligible: boolean
  customPlanAvailable: boolean
  customPlanDepositPercent: number
  customPlanMonths: number
}

export default function AgentPropertiesPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.userType !== 'agent') {
        router.push('/dashboard')
        return
      }
      fetchProperties()
    }
  }, [isAuthenticated, user, router])

  const fetchProperties = async () => {
    if (!user?.$id) return

    try {
      setLoading(true)
      const databaseId =
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'propertyDB'
      const propertiesCollectionId =
        process.env.NEXT_PUBLIC_APPWRITE_PROPERTIES_TABLE_ID || 'properties'

      const response = await databases.listDocuments(
        databaseId,
        propertiesCollectionId,
        [
          Query.equal('agentId', user.$id),
          Query.orderDesc('$createdAt'),
          Query.limit(100),
        ]
      )

      console.log('Fetched properties:', response.documents.length)

      // Transform the Appwrite documents to match our Property interface
      const transformedProperties: Property[] = response.documents.map(
        (doc: any) => ({
          // Appwrite system fields
          $id: doc.$id,
          $collectionId: doc.$collectionId,
          $databaseId: doc.$databaseId,
          $createdAt: doc.$createdAt,
          $updatedAt: doc.$updatedAt,
          $permissions: doc.$permissions || [],

          // Property fields - provide defaults for missing fields
          agentId: doc.agentId || '',
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

          // Payment options
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
  }

  // Filter properties based on search and filters
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

  if (loading) {
    return (
      <div className="p-6 mx-auto max-w-6xl">
        <div className="animate-pulse">
          <div className="flex">
            <div className="h-8 bg-gray-200 rounded w-1/8 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-40 mb-2 ml-auto"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-4 h-20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-36 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-6"></div>
                </div>
                <div className="flex items-center justify-center w-12 h-12 bg-white border rounded-xl ">
                  <div className="h-6 bg-gray-200 rounded w-6"></div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 h-20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-36 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-6"></div>
                </div>
                <div className="flex items-center justify-center w-12 h-12 bg-white border rounded-xl ">
                  <div className="h-6 bg-gray-200 rounded w-6"></div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 h-20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-36 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-6"></div>
                </div>
                <div className="flex items-center justify-center w-12 h-12 bg-white border rounded-xl ">
                  <div className="h-6 bg-gray-200 rounded w-6"></div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 h-20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-6"></div>
                </div>
                <div className="flex items-center justify-center w-12 h-12 bg-white border rounded-xl ">
                  <div className="h-6 bg-gray-200 rounded w-6"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 h-16 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center w-26 h-8 bg-white border rounded-lg "></div>
                <div className="flex items-center w-26 h-8 bg-white border rounded-lg "></div>
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

  return (
    <div className="p-6 mx-auto max-w-6xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
          <p className="text-gray-600 mt-2 text-sm">
            Manage your property listings and track their performance
          </p>
        </div>
        <Link
          href="/agent/properties/new"
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add New Property
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Properties</p>
              <p className="text-xl font-bold text-gray-900">
                {properties.length}
              </p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-emerald-50 rounded-xl ">
              <Home className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Listings</p>
              <p className="text-xl font-bold text-gray-900">
                {properties.filter((p) => p.isActive).length}
              </p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-emerald-50 rounded-xl ">
              <List className="w-6 h-6 text-emerald-600" />
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
            <div className="flex items-center justify-center w-12 h-12 bg-emerald-50 rounded-xl ">
              <Eye className="w-6 h-6 text-emerald-600" />
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
            <div className="flex items-center justify-center w-12 h-12 bg-emerald-50 rounded-xl ">
              <Heart className="w-6 h-6 text-emerald-600" />
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="for-sale">For Sale</option>
              <option value="for-rent">For Rent</option>
              <option value="sold">Sold</option>
              <option value="rented">Rented</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
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

      {/* Properties Grid using PropertyCard */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {properties.length === 0
              ? 'No Properties Listed'
              : 'No Properties Found'}
          </h3>
          <p className="text-gray-500 mb-6">
            {properties.length === 0
              ? 'Get started by adding your first property listing.'
              : "Try adjusting your search or filters to find what you're looking for."}
          </p>
          {properties.length === 0 && (
            <Link
              href="/agent/properties/new"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Your First Property
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
            />
          ))}
        </div>
      )}
    </div>
  )
}
