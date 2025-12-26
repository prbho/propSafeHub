// app/dashboard/[userType]/[id]/properties/edit/[propertyId]/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Property } from '@/types'
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
  const [agentProfileId, setAgentProfileId] = useState<string>('')

  // First, get the agent profile ID for agents
  useEffect(() => {
    const getAgentProfile = async () => {
      if (user?.userType === 'agent') {
        try {
          const response = await fetch(
            `/api/agents/get-by-user?userId=${user.$id}`
          )
          if (response.ok) {
            const agentProfile = await response.json()
            setAgentProfileId(agentProfile.$id)
          }
        } catch (error) {
          console.error('Error fetching agent profile:', error)
        }
      }
    }

    if (user) {
      getAgentProfile()
    }
  }, [user])

  // Fetch property and check authorization
  useEffect(() => {
    const fetchProperty = async () => {
      if (authLoading) return
      if (!isAuthenticated || !user) {
        router.push('/login')
        return
      }

      try {
        setLoading(true)

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
          titles: propertyDoc.titles || [],
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

        console.log('Property data:', {
          agentId: fetchedProperty.agentId,
          userId: fetchedProperty.userId,
          ownerId: fetchedProperty.ownerId,
          currentUser: user.$id,
          agentProfileId: agentProfileId,
        })

        // SIMPLE AUTHORIZATION CHECK
        let canEdit = false

        // Always check userId first
        if (fetchedProperty.userId === user.$id) {
          canEdit = true
          console.log('✅ Can edit: userId matches')
        }

        // For agents: check if agentId matches agentProfileId
        if (
          user.userType === 'agent' &&
          fetchedProperty.agentId === agentProfileId
        ) {
          canEdit = true
          console.log('✅ Can edit: agentId matches agentProfileId')
        }

        // For sellers: check if ownerId matches
        if (
          user.userType === 'seller' &&
          fetchedProperty.ownerId === user.$id
        ) {
          canEdit = true
          console.log('✅ Can edit: ownerId matches')
        }

        // Allow admins
        if (user.userType === 'admin') {
          canEdit = true
          console.log('✅ Can edit: user is admin')
        }

        if (!canEdit) {
          toast.error('You cannot edit this property')
          router.push(`/dashboard/${user.userType}/${user.$id}`)
          return
        }

        setProperty(fetchedProperty)
      } catch (error: any) {
        console.error('Error:', error)
        toast.error('Failed to load property')
        router.push(`/dashboard/${user.userType}/${user.$id}`)
      } finally {
        setLoading(false)
      }
    }

    // Wait for agentProfileId to load for agents
    if (user?.userType === 'agent' && !agentProfileId) {
      // Still loading agent profile
      return
    }

    fetchProperty()
  }, [
    user,
    authLoading,
    isAuthenticated,
    userId,
    userType,
    propertyId,
    router,
    agentProfileId,
  ])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-gray-600">Loading property...</p>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Property Not Found
          </h2>
          <button
            onClick={() =>
              router.push(`/dashboard/${user?.userType}/${user?.$id}`)
            }
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 p-8 bg-white">
      <div className="p-6">
        <div>
          <div className="max-w-7xl mx-autoe">
            <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
            {/* <p className="text-gray-600 mt-2">
              Editing: <span className="font-medium">{property.title}</span>
            </p> */}
          </div>

          <div className="bg-white">
            <PropertyEditForm property={property} />
          </div>
        </div>
      </div>
    </div>
  )
}
