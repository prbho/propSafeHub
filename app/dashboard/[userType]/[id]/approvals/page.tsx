// app/admin/approvals/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Property } from '@/types/index'
import { Query } from 'appwrite'
import {
  Bath,
  Bed,
  CheckCircle,
  Clock,
  DollarSign,
  ExternalLink,
  Home,
  Mail,
  MapPin,
  Phone,
  Search,
  Trash2,
  User,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'

import { databases } from '@/lib/appwrite'

interface AgentInfo {
  name: string
  email: string
  phone: string
}

interface ApprovalProperty extends Property {
  agent: AgentInfo
}

export default function AdminApprovalsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [properties, setProperties] = useState<ApprovalProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<
    'pending' | 'approved' | 'rejected'
  >('pending')
  const [deletingProperty, setDeletingProperty] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.userType !== 'admin') {
        router.push('/dashboard')
        return
      }
      fetchProperties()
    }
  }, [isAuthenticated, user, router])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const databaseId =
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'propertyDB'
      const propertiesCollectionId =
        process.env.NEXT_PUBLIC_APPWRITE_PROPERTIES_TABLE_ID || 'properties'

      // Fetch all properties for admin review
      const response = await databases.listDocuments(
        databaseId,
        propertiesCollectionId,
        [Query.orderDesc('$createdAt'), Query.limit(100)]
      )

      console.log('Fetched properties for approval:', response.documents.length)

      // Transform properties - without fetching agent details to avoid errors
      const transformedProperties: ApprovalProperty[] = response.documents.map(
        (doc: any): ApprovalProperty => {
          const agentInfo: AgentInfo = {
            name: doc.agentName || 'Unknown Agent',
            email: doc.agentEmail || '',
            phone: doc.agentPhone || '',
          }

          return {
            $id: doc.$id,
            $collectionId: doc.$collectionId,
            $databaseId: doc.$databaseId,
            $createdAt: doc.$createdAt,
            $updatedAt: doc.$updatedAt,
            userId: doc.userId || '',
            name: doc.name || '',
            $permissions: doc.$permissions || [],
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
            paymentOutright: doc.paymentOutright || doc.outright || false,
            outright: doc.outright || false,
            paymentPlan: doc.paymentPlan || false,
            mortgageEligible: doc.mortgageEligible || false,
            customPlanAvailable: doc.customPlanAvailable || false,
            customPlanDepositPercent: doc.customPlanDepositPercent || 0,
            customPlanMonths: doc.customPlanMonths || 0,
            agent: agentInfo,
          }
        }
      )

      setProperties(transformedProperties)
    } catch (error) {
      console.error('Error fetching properties for approval:', error)
      toast.error('Failed to fetch properties')
    } finally {
      setLoading(false)
    }
  }

  // Filter properties based on active tab and filters
  const filteredProperties = properties.filter((property) => {
    // Tab filtering
    const matchesTab =
      (activeTab === 'pending' && !property.isVerified && property.isActive) ||
      (activeTab === 'approved' && property.isVerified) ||
      (activeTab === 'rejected' && !property.isActive)

    // Search filtering
    const matchesSearch =
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.agentName.toLowerCase().includes(searchTerm.toLowerCase())

    // Type filtering
    const matchesType =
      typeFilter === 'all' || property.propertyType === typeFilter

    // Status filtering
    const matchesStatus =
      statusFilter === 'all' || property.status === statusFilter

    return matchesTab && matchesSearch && matchesType && matchesStatus
  })

  // Stats calculations
  const pendingApprovals = properties.filter(
    (p) => !p.isVerified && p.isActive
  ).length
  const approvedProperties = properties.filter((p) => p.isVerified).length
  const rejectedProperties = properties.filter((p) => !p.isActive).length
  const totalProperties = properties.length

  // Approval actions
  const approveProperty = async (propertyId: string) => {
    try {
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'propertyDB',
        process.env.NEXT_PUBLIC_APPWRITE_PROPERTIES_TABLE_ID || 'properties',
        propertyId,
        {
          isVerified: true,
          isActive: true,
        }
      )

      // Update local state
      setProperties(
        properties.map((property) =>
          property.$id === propertyId
            ? { ...property, isVerified: true, isActive: true }
            : property
        )
      )
      toast.success('Property approved successfully')
    } catch (error) {
      console.error('Error approving property:', error)
      toast.error('Failed to approve property')
    }
  }

  const rejectProperty = async (propertyId: string) => {
    try {
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'propertyDB',
        process.env.NEXT_PUBLIC_APPWRITE_PROPERTIES_TABLE_ID || 'properties',
        propertyId,
        {
          isActive: false,
        }
      )

      // Update local state
      setProperties(
        properties.map((property) =>
          property.$id === propertyId
            ? { ...property, isActive: false }
            : property
        )
      )
      toast.success('Property rejected successfully')
    } catch (error) {
      console.error('Error rejecting property:', error)
      toast.error('Failed to reject property')
    }
  }

  // Delete property permanently
  const deleteProperty = async (propertyId: string) => {
    const property = properties.find((p) => p.$id === propertyId)

    // Create a toast with confirmation action
    toast.custom(
      (t) => (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
              <Trash2 className="w-3 h-3 text-red-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">
                Delete Property
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Are you sure you want to delete &quot;{property?.title}&quot;?
                This action cannot be undone.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => toast.dismiss(t)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    toast.dismiss(t)
                    await performDelete(propertyId)
                  }}
                  className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        duration: 10000, // 10 seconds
      }
    )
  }

  // Actual delete operation
  const performDelete = async (propertyId: string) => {
    const property = properties.find((p) => p.$id === propertyId)

    try {
      setDeletingProperty(propertyId)

      const deleteToast = toast.loading(`Deleting "${property?.title}"...`)

      await databases.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'propertyDB',
        process.env.NEXT_PUBLIC_APPWRITE_PROPERTIES_TABLE_ID || 'properties',
        propertyId
      )

      // Remove from local state
      setProperties(
        properties.filter((property) => property.$id !== propertyId)
      )

      toast.success(`"${property?.title}" has been deleted successfully`, {
        id: deleteToast,
      })
    } catch (error) {
      console.error('Error deleting property:', error)
      toast.error(`Failed to delete "${property?.title}"`)
    } finally {
      setDeletingProperty(null)
    }
  }

  const getStatusBadge = (property: ApprovalProperty) => {
    if (!property.isActive) {
      return (
        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
          Rejected
        </span>
      )
    }
    if (property.isVerified) {
      return (
        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
          Approved
        </span>
      )
    }
    return (
      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
        Pending Review
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-gray-200 p-6"
              >
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
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
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Property Approval Queue
          </h1>
          <p className="text-gray-600 mt-2">
            Review, approve, and manage property listings
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Properties</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalProperties}
                </p>
              </div>
              <Home className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingApprovals}
                </p>
                <p className="text-sm text-yellow-600">Needs review</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {approvedProperties}
                </p>
                <p className="text-sm text-green-600">Live listings</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {rejectedProperties}
                </p>
                <p className="text-sm text-red-600">Not approved</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                {
                  key: 'pending',
                  label: 'Pending Approval',
                  count: pendingApprovals,
                },
                {
                  key: 'approved',
                  label: 'Approved',
                  count: approvedProperties,
                },
                {
                  key: 'rejected',
                  label: 'Rejected',
                  count: rejectedProperties,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-2 py-4 px-6 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span
                    className={`text-xs rounded-full px-2 py-1 min-w-5 h-5 flex items-center justify-center ${
                      activeTab === tab.key
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Filters and Search */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search properties by title, address, city, or agent..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="condo">Condo</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="land">Land</option>
                </select>
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="for-sale">For Sale</option>
                  <option value="for-rent">For Rent</option>
                  <option value="sold">Sold</option>
                  <option value="rented">Rented</option>
                </select>
              </div>
            </div>
          </div>

          {/* Properties List */}
          <div className="p-6">
            {filteredProperties.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {activeTab === 'pending'
                    ? 'No Pending Approvals'
                    : activeTab === 'approved'
                      ? 'No Approved Properties'
                      : 'No Rejected Properties'}
                </h3>
                <p className="text-gray-500">
                  {activeTab === 'pending'
                    ? 'All properties have been reviewed. Check back later for new submissions.'
                    : `No ${activeTab} properties found.`}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredProperties.map((property) => (
                  <div
                    key={property.$id}
                    className="bg-gray-50 rounded-lg border border-gray-200 p-6"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                      {/* Property Image */}
                      <div className="lg:w-64 lg:shrink-0">
                        {property.images && property.images.length > 0 ? (
                          <Image
                            src={property.images[0]}
                            alt={property.title}
                            className="w-full h-48 object-cover rounded-lg"
                            width={192}
                            height={192}
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Home className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Property Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            {/* Property Title with Link */}
                            <Link
                              href={`/properties/${property.$id}`}
                              className="group"
                              target="_blank" // Opens in new tab
                            >
                              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                                {property.title}
                                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                              </h3>
                            </Link>
                            <div className="flex items-center gap-4 mb-3">
                              {getStatusBadge(property)}
                              <span
                                className={`text-sm px-2 py-1 rounded-full ${
                                  property.status === 'for-sale'
                                    ? 'bg-blue-100 text-blue-800'
                                    : property.status === 'for-rent'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {property.status
                                  .replace('-', ' ')
                                  .toUpperCase()}
                              </span>
                              <span className="text-sm text-gray-500">
                                Submitted:{' '}
                                {new Date(
                                  property.$createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            {activeTab === 'pending' ? (
                              <>
                                <button
                                  onClick={() => approveProperty(property.$id)}
                                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => rejectProperty(property.$id)}
                                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Reject
                                </button>
                              </>
                            ) : (
                              // Delete button for approved/rejected properties
                              <button
                                onClick={() => deleteProperty(property.$id)}
                                disabled={deletingProperty === property.$id}
                                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {deletingProperty === property.$id ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Deleting...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Property Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-sm">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">Price:</span>
                            <span>₦{property.price?.toLocaleString()}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">Location:</span>
                            <span>
                              {property.city}, {property.state}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Bed className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">Bedrooms:</span>
                            <span>{property.bedrooms}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Bath className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">Bathrooms:</span>
                            <span>{property.bathrooms}</span>
                          </div>
                        </div>

                        {/* Agent Information */}
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <h4 className="font-medium text-gray-900 mb-2">
                            Submitted By
                          </h4>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span>{property.agent.name}</span>
                            </div>
                            {property.agent.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span>{property.agent.email}</span>
                              </div>
                            )}
                            {property.agent.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span>{property.agent.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Description Preview */}
                        {property.description && (
                          <div className="mt-4">
                            <h4 className="font-medium text-gray-900 mb-2">
                              Description
                            </h4>
                            <p className="text-sm text-gray-600 line-clamp-3">
                              {property.description}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
