/* eslint-disable @typescript-eslint/no-explicit-any */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Property } from '@/types'

import PropertyEditForm from '@/components/agents/PropertyEditForm'
import {
  DATABASE_ID,
  PROPERTIES_COLLECTION_ID,
  serverDatabases,
} from '@/lib/appwrite-server'

interface EditPropertyPageProps {
  params: Promise<{
    id: string
  }>
}

// Type-safe transformation function
function transformToProperty(document: any): Property {
  return {
    // AppWrite system fields
    $id: document.$id,
    $createdAt: document.$createdAt,
    $updatedAt: document.$updatedAt,
    $collectionId: document.$collectionId,
    $databaseId: document.$databaseId,
    $permissions: document.$permissions,

    // Property fields with proper fallbacks
    agentId: document.agentId || '',
    propertyId: document.propertyId || document.$id,
    agentName: document.agentName || '',
    title: document.title || '',
    description: document.description || '',
    propertyType: document.propertyType || 'house',
    status: document.status || 'for-sale',
    price: document.price || 0,
    priceUnit: document.priceUnit || 'total',
    address: document.address || '',
    city: document.city || '',
    state: document.state || '',
    zipCode: document.zipCode || '',
    country: document.country || 'Nigeria',
    neighborhood: document.neighborhood || '',
    bedrooms: document.bedrooms || 0,
    bathrooms: document.bathrooms || 0,
    squareFeet: document.squareFeet || 0,
    lotSize: document.lotSize,
    yearBuilt: document.yearBuilt,
    features: document.features || [],
    amenities: document.amenities || [],
    images: document.images || [],
    videos: document.videos || [],
    listedBy: document.listedBy || 'agent',
    isFeatured: document.isFeatured || false,
    tags: document.tags || [],
    originalPrice: document.originalPrice,
    paymentOutright: document.paymentOutright ?? true,
    paymentPlan: document.paymentPlan ?? false,
    mortgageEligible: document.mortgageEligible ?? false,
    customPlanAvailable: document.customPlanAvailable ?? false,
    customPlanDepositPercent: document.customPlanDepositPercent || 30,
    customPlanMonths: document.customPlanMonths || 12,
    latitude: document.latitude,
    longitude: document.longitude,
    phone: document.phone,
    ownerId: document.ownerId,
    listDate: document.listDate,
    lastUpdated: document.lastUpdated,
    isActive: document.isActive,
    isVerified: document.isVerified,
    views: document.views,
    favorites: document.favorites,
    outright: document.outright,
  }
}

async function getProperty(propertyId: string): Promise<Property | null> {
  try {
    const document = await serverDatabases.getDocument(
      DATABASE_ID,
      PROPERTIES_COLLECTION_ID,
      propertyId
    )
    return transformToProperty(document)
  } catch (error) {
    console.error('Error fetching property:', error)
    return null
  }
}

export async function generateMetadata({}: EditPropertyPageProps): Promise<Metadata> {
  return {
    title: 'Edit Property - PropSafeHub',
    description: 'Edit your property listing',
  }
}

export default async function EditPropertyPage({
  params,
}: EditPropertyPageProps) {
  const { id } = await params

  if (!id || id.trim().length === 0) {
    console.error('❌ No property ID provided')
    notFound()
  }

  const property = await getProperty(id)

  if (!property) {
    console.error('❌ Property not found')
    notFound()
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <PropertyEditForm property={property} />
        </div>
      </div>
    </div>
  )
}
