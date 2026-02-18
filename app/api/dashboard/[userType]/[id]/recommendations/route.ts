// app/api/dashboard/[userType]/[id]/recommendations/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server'
import { Query } from 'appwrite'

import {
  DATABASE_ID,
  databases,
  PROPERTIES_COLLECTION_ID,
  USERS_COLLECTION_ID,
  validateAppwriteConfig,
} from '@/lib/appwrite-server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userType: string; id: string }> }
) {
  try {
    const { userType, id } = await params
    // Validate Appwrite configuration
    if (!validateAppwriteConfig()) {
      throw new Error('Server configuration error')
    }

    let recommendations = []

    switch (userType) {
      case 'admin':
        recommendations = await getAdminRecommendations()
        break
      case 'agent':
        recommendations = await getAgentRecommendations(id)
        break
      case 'seller':
        recommendations = await getSellerRecommendations(id)
        break
      case 'buyer':
        recommendations = await getBuyerRecommendations(id)
        break
      default:
        return NextResponse.json([], { status: 200 })
    }

    return NextResponse.json(recommendations)
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json([], { status: 200 })
  }
}

async function getAdminRecommendations() {
  try {
    // Get properties needing verification
    const pendingProperties = await databases.listDocuments(
      DATABASE_ID,
      PROPERTIES_COLLECTION_ID,
      [
        Query.equal('isVerified', false),
        Query.equal('isActive', true),
        Query.limit(3),
        Query.select(['$id', 'title', 'price', 'location']),
      ]
    )

    return pendingProperties.documents.map((property: any) => ({
      id: property.$id,
      title: property.title,
      description: `Needs verification - ${property.location}`,
      href: `/admin/properties/${property.$id}/review`,
    }))
  } catch (error) {
    console.error('Error in getAdminRecommendations:', error)
    return []
  }
}

async function getAgentRecommendations(agentId: string) {
  try {
    // Get properties with most views
    const popularProperties = await databases.listDocuments(
      DATABASE_ID,
      PROPERTIES_COLLECTION_ID,
      [
        Query.equal('agentId', agentId),
        Query.equal('isActive', true),
        Query.orderDesc('views'),
        Query.limit(3),
        Query.select(['$id', 'title', 'views', 'favorites']),
      ]
    )

    return popularProperties.documents.map((property: any) => ({
      id: property.$id,
      title: property.title,
      description: `${property.views} views, ${property.favorites} favorites`,
      href: `/properties/${property.$id}`,
    }))
  } catch (error) {
    console.error('Error in getAgentRecommendations:', error)
    return []
  }
}

async function getSellerRecommendations(sellerId: string) {
  try {
    // Get similar properties for price comparison
    const sellerProperties = await databases.listDocuments(
      DATABASE_ID,
      PROPERTIES_COLLECTION_ID,
      [
        Query.equal('userId', sellerId),
        Query.equal('isActive', true),
        Query.limit(1),
        Query.select(['price', 'location', 'propertyType']),
      ]
    )

    if (sellerProperties.documents.length === 0) {
      return []
    }

    const sellerProperty = sellerProperties.documents[0]

    // Get similar properties in same area
    const similarProperties = await databases.listDocuments(
      DATABASE_ID,
      PROPERTIES_COLLECTION_ID,
      [
        Query.search('location', sellerProperty.location?.split(',')[0] || ''),
        Query.equal('propertyType', sellerProperty.propertyType),
        Query.equal('isActive', true),
        Query.notEqual('userId', sellerId),
        Query.limit(3),
        Query.select(['$id', 'title', 'price', 'location']),
      ]
    )

    return similarProperties.documents.map((property: any) => ({
      id: property.$id,
      title: property.title,
      description: `Similar property in ${property.location} - $${property.price?.toLocaleString()}`,
      href: `/properties/${property.$id}`,
    }))
  } catch (error) {
    console.error('Error in getSellerRecommendations:', error)
    return []
  }
}

async function getBuyerRecommendations(buyerId: string) {
  try {
    // Get recently viewed properties to find similar ones
    const userData = await databases.getDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      buyerId
    )

    if (!userData.recentlyViewed || userData.recentlyViewed.length === 0) {
      // Get featured properties
      const featuredProperties = await databases.listDocuments(
        DATABASE_ID,
        PROPERTIES_COLLECTION_ID,
        [
          Query.equal('isFeatured', true),
          Query.equal('isActive', true),
          Query.equal('isVerified', true),
          Query.limit(3),
          Query.select([
            '$id',
            'title',
            'price',
            'location',
            'bedrooms',
            'bathrooms',
          ]),
        ]
      )

      return featuredProperties.documents.map((property: any) => ({
        id: property.$id,
        title: property.title,
        description: `${property.bedrooms} bed, ${property.bathrooms} bath in ${property.location} - $${property.price?.toLocaleString()}`,
        href: `/properties/${property.$id}`,
      }))
    }

    // Get properties similar to recently viewed
    const lastViewedId = userData.recentlyViewed[0]
    const lastViewedProperty = await databases.getDocument(
      DATABASE_ID,
      PROPERTIES_COLLECTION_ID,
      lastViewedId
    )

    const similarProperties = await databases.listDocuments(
      DATABASE_ID,
      PROPERTIES_COLLECTION_ID,
      [
        Query.equal('propertyType', lastViewedProperty.propertyType),
        Query.equal('isActive', true),
        Query.equal('isVerified', true),
        Query.notEqual('$id', lastViewedId),
        Query.limit(3),
        Query.select([
          '$id',
          'title',
          'price',
          'location',
          'bedrooms',
          'bathrooms',
        ]),
      ]
    )

    return similarProperties.documents.map((property: any) => ({
      id: property.$id,
      title: property.title,
      description: `${property.bedrooms} bed, ${property.bathrooms} bath in ${property.location} - $${property.price?.toLocaleString()}`,
      href: `/properties/${property.$id}`,
    }))
  } catch (error) {
    console.error('Error in getBuyerRecommendations:', error)
    return []
  }
}
