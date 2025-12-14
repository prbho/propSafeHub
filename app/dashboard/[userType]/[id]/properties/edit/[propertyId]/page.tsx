// app/dashboard/[userType]/[id]/properties/edit/[propertyId]/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Property } from '@/types'
import { Query } from 'appwrite'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import PropertyEditForm from '@/components/agents/PropertyEditForm'
import { databases } from '@/lib/appwrite'

export default function DashboardPropertyEditPage() {
  const params = useParams()
  const userType = params.userType as string
  const userId = params.id as string
  const propertyId = params.propertyId as string
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()

  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  // Validate authorization and fetch property
  useEffect(() => {
    const validateAndFetch = async () => {
      if (authLoading) return

      // Check if user is authenticated
      if (!isAuthenticated || !user) {
        toast.error('Please log in to edit properties')
        router.push('/login')
        return
      }

      // Check if user is viewing their own dashboard
      if (user.$id !== userId) {
        toast.error('You can only edit your own properties')
        router.push(`/dashboard/${user.userType}/${user.$id}`)
        return
      }

      // Check if user type matches
      if (user.userType !== userType) {
        toast.error('Invalid user type')
        router.push(`/dashboard/${user.userType}/${user.$id}`)
        return
      }

      try {
        setLoading(true)

        // Fetch the property
        const databaseId =
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'propertyDB'
        const propertiesCollectionId =
          process.env.NEXT_PUBLIC_APPWRITE_PROPERTIES_TABLE_ID || 'properties'

        const propertyDoc = await databases.getDocument(
          databaseId,
          propertiesCollectionId,
          propertyId
        )

        // Transform to Property type
        const fetchedProperty: Property = {
          $id: propertyDoc.$id,
          $createdAt: propertyDoc.$createdAt,
          $updatedAt: propertyDoc.$updatedAt,
          userId: propertyDoc.userId,
          name: propertyDoc.name,
          $collectionId: propertyDoc.$collectionId,
          $databaseId: propertyDoc.$databaseId,
          $permissions: propertyDoc.$permissions,
          agentId: propertyDoc.agentId || '',
          propertyId: propertyDoc.propertyId || propertyDoc.$id,
          agentName: propertyDoc.agentName || '',
          title: propertyDoc.title || '',
          description: propertyDoc.description || '',
          propertyType: propertyDoc.propertyType || 'house',
          status: propertyDoc.status || 'for-sale',
          price: propertyDoc.price || 0,
          priceUnit: propertyDoc.priceUnit || 'total',
          address: propertyDoc.address || '',
          city: propertyDoc.city || '',
          state: propertyDoc.state || '',
          zipCode: propertyDoc.zipCode || '',
          country: propertyDoc.country || 'Nigeria',
          neighborhood: propertyDoc.neighborhood || '',
          bedrooms: propertyDoc.bedrooms || 0,
          bathrooms: propertyDoc.bathrooms || 0,
          squareFeet: propertyDoc.squareFeet || 0,
          lotSize: propertyDoc.lotSize,
          yearBuilt: propertyDoc.yearBuilt,
          features: propertyDoc.features || [],
          amenities: propertyDoc.amenities || [],
          images: propertyDoc.images || [],
          videos: propertyDoc.videos || [],
          listedBy: propertyDoc.listedBy || 'agent',
          isFeatured: propertyDoc.isFeatured || false,
          tags: propertyDoc.tags || [],
          originalPrice: propertyDoc.originalPrice,
          paymentOutright: propertyDoc.paymentOutright ?? true,
          paymentPlan: propertyDoc.paymentPlan ?? false,
          mortgageEligible: propertyDoc.mortgageEligible ?? false,
          customPlanAvailable: propertyDoc.customPlanAvailable ?? false,
          customPlanDepositPercent: propertyDoc.customPlanDepositPercent || 30,
          customPlanMonths: propertyDoc.customPlanMonths || 12,
          latitude: propertyDoc.latitude,
          longitude: propertyDoc.longitude,
          phone: propertyDoc.phone,
          ownerId: propertyDoc.ownerId,
          listDate: propertyDoc.listDate,
          lastUpdated: propertyDoc.lastUpdated,
          isActive: propertyDoc.isActive,
          isVerified: propertyDoc.isVerified,
          views: propertyDoc.views,
          favorites: propertyDoc.favorites,
          outright: propertyDoc.outright,
        }

        setProperty(fetchedProperty)

        // Check if user owns this property
        const isOwner =
          fetchedProperty.agentId === user.$id ||
          fetchedProperty.ownerId === user.$id

        if (!isOwner && user.userType !== 'admin') {
          toast.error('You are not authorized to edit this property')
          router.push(`/dashboard/${user.userType}/${user.$id}`)
          return
        }

        setIsAuthorized(true)
      } catch (error: any) {
        console.error('Error fetching property:', error)

        if (error.code === 404) {
          toast.error('Property not found')
          router.push(`/dashboard/${user.userType}/${user.$id}`)
        } else {
          toast.error('Failed to load property')
          router.push(`/dashboard/${user.userType}/${user.$id}`)
        }
      } finally {
        setLoading(false)
      }
    }

    validateAndFetch()
  }, [user, authLoading, isAuthenticated, userId, userType, propertyId, router])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-gray-600">Loading property...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user || !isAuthorized) {
    return null // Will redirect in useEffect
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Property Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The property you&apos;re trying to edit doesn&apos;t exist.
          </p>
          <button
            onClick={() =>
              router.push(`/dashboard/${user.userType}/${user.$id}`)
            }
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Edit Property
                </h1>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div>
            <PropertyEditForm property={property} />
          </div>
        </div>
      </div>
    </div>
  )
}
