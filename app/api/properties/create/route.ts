// app/api/properties/create/route.ts - UPDATED FOR YOUR SCHEMA
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server'

import {
  AGENTS_COLLECTION_ID,
  DATABASE_ID,
  databases,
  ID,
  PROPERTIES_COLLECTION_ID,
  Query,
} from '@/lib/appwrite-server'

export async function POST(request: NextRequest) {
  try {
    const propertyData = await request.json()

    // Remove sensitive or unnecessary fields
    const { $permissions, ...cleanPropertyData } = propertyData

    // VALIDATE USER TYPE
    if (!['agent', 'seller'].includes(cleanPropertyData.userType)) {
      return NextResponse.json(
        {
          error: 'Invalid user type',
          details: 'Only agents and sellers can post properties',
        },
        { status: 400 }
      )
    }

    // HANDLE AGENT PROPERTIES
    let correctAgentId = cleanPropertyData.agentId
    let correctAgentName = cleanPropertyData.agentName

    if (cleanPropertyData.userType === 'agent') {
      // Validate agent data is provided
      if (!cleanPropertyData.agentId && !cleanPropertyData.agentName) {
        return NextResponse.json(
          {
            error: 'Agent information required',
            details: 'Agent ID or Agent Name is required for agent listings',
          },
          { status: 400 }
        )
      }

      // Try to find the agent
      try {
        // Try by agentId first
        if (cleanPropertyData.agentId) {
          const agent = await databases.getDocument(
            DATABASE_ID,
            AGENTS_COLLECTION_ID,
            cleanPropertyData.agentId
          )
          correctAgentId = agent.$id
          correctAgentName = agent.name || cleanPropertyData.agentName
        }
        // Try by agentName if agentId not found
        else if (cleanPropertyData.agentName) {
          const agents = await databases.listDocuments(
            DATABASE_ID,
            AGENTS_COLLECTION_ID,
            [Query.equal('name', cleanPropertyData.agentName), Query.limit(1)]
          )

          if (agents.documents.length > 0) {
            const foundAgent = agents.documents[0]
            correctAgentId = foundAgent.$id
            correctAgentName = foundAgent.name
          } else {
            console.warn(
              '⚠️ No agent found with name:',
              cleanPropertyData.agentName
            )
            // Create a placeholder agent for now
            correctAgentName = cleanPropertyData.agentName
          }
        }
      } catch (agentError) {
        console.error('❌ Error finding agent:', agentError)
        return NextResponse.json(
          {
            error: 'Agent not found',
            details: 'Could not verify agent information',
          },
          { status: 404 }
        )
      }
    }

    // HANDLE SELLER/OWNER PROPERTIES
    let ownerId = cleanPropertyData.sellerId
    let ownerName = cleanPropertyData.sellerName

    if (cleanPropertyData.userType === 'seller') {
      // Validate seller data
      if (!cleanPropertyData.sellerId && !cleanPropertyData.userId) {
        return NextResponse.json(
          {
            error: 'Seller information required',
            details: 'Seller ID or User ID is required for seller listings',
          },
          { status: 400 }
        )
      }

      // Use userId as ownerId if sellerId not provided
      ownerId = cleanPropertyData.sellerId || cleanPropertyData.userId
      ownerName =
        cleanPropertyData.sellerName ||
        cleanPropertyData.listedBy ||
        'Property Owner'

      // Force listedBy to 'owner' for sellers
      cleanPropertyData.listedBy = 'owner'

    }

    // Validate required fields
    const requiredFields = [
      'title',
      'description',
      'propertyType',
      'status',
      'price',
      'city',
      'state',
    ]

    const missingFields = requiredFields.filter((field) => {
      const value = cleanPropertyData[field]
      return value === undefined || value === null || value === ''
    })

    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields)
      return NextResponse.json(
        {
          error: 'Missing required fields',
          missingFields,
        },
        { status: 400 }
      )
    }

    // Generate propertyId if not provided
    const propertyId = cleanPropertyData.propertyId || ID.unique()

    // Prepare the document data based on user type
    const documentData: any = {
      // Common fields
      title: cleanPropertyData.title,
      description: cleanPropertyData.description,
      propertyType: cleanPropertyData.propertyType,
      status: cleanPropertyData.status,
      price: Number(cleanPropertyData.price),
      priceUnit: cleanPropertyData.priceUnit || 'total',

      // Location
      address: cleanPropertyData.address,
      city: cleanPropertyData.city,
      state: cleanPropertyData.state,
      zipCode: cleanPropertyData.zipCode,
      country: cleanPropertyData.country || 'Nigeria',
      neighborhood: cleanPropertyData.neighborhood,
      latitude: cleanPropertyData.latitude
        ? Number(cleanPropertyData.latitude)
        : undefined,
      longitude: cleanPropertyData.longitude
        ? Number(cleanPropertyData.longitude)
        : undefined,

      // Property details
      bedrooms: Number(cleanPropertyData.bedrooms || 0),
      bathrooms: Number(cleanPropertyData.bathrooms || 0),
      squareFeet: Number(cleanPropertyData.squareFeet || 0),
      lotSize: cleanPropertyData.lotSize
        ? Number(cleanPropertyData.lotSize)
        : undefined,
      yearBuilt: cleanPropertyData.yearBuilt
        ? Number(cleanPropertyData.yearBuilt)
        : undefined,
      originalPrice: cleanPropertyData.originalPrice
        ? Number(cleanPropertyData.originalPrice)
        : undefined,

      // Features and amenities
      features: Array.isArray(cleanPropertyData.features)
        ? cleanPropertyData.features
        : [],
      amenities: Array.isArray(cleanPropertyData.amenities)
        ? cleanPropertyData.amenities
        : [],
      tags: Array.isArray(cleanPropertyData.tags) ? cleanPropertyData.tags : [],
      images: Array.isArray(cleanPropertyData.images)
        ? cleanPropertyData.images
        : [],
      videos: Array.isArray(cleanPropertyData.videos)
        ? cleanPropertyData.videos
        : [],

      // ADD THIS LINE: Include titles field
      titles: Array.isArray(cleanPropertyData.titles)
        ? cleanPropertyData.titles
        : [],

      // Payment options
      paymentOutright:
        cleanPropertyData.paymentOutright !== undefined
          ? cleanPropertyData.paymentOutright
          : true,
      paymentPlan: cleanPropertyData.paymentPlan || false,
      mortgageEligible: cleanPropertyData.mortgageEligible || false,
      customPlanAvailable: cleanPropertyData.customPlanAvailable || false,
      customPlanDepositPercent:
        cleanPropertyData.customPlanDepositPercent || 30,
      customPlanMonths: cleanPropertyData.customPlanMonths || 12,

      // Short-let fields (if applicable)
      ...(cleanPropertyData.status === 'short-let' && {
        minimumStay: cleanPropertyData.minimumStay || 1,
        maximumStay: cleanPropertyData.maximumStay || 30,
        instantBooking: cleanPropertyData.instantBooking || false,
        checkInTime: cleanPropertyData.checkInTime || '14:00',
        checkOutTime: cleanPropertyData.checkOutTime || '11:00',
        cancellationPolicy: cleanPropertyData.cancellationPolicy || 'moderate',
        houseRules: Array.isArray(cleanPropertyData.houseRules)
          ? cleanPropertyData.houseRules
          : [],
        availabilityStart: cleanPropertyData.availabilityStart,
        availabilityEnd: cleanPropertyData.availabilityEnd,
      }),

      // Listing info
      listedBy:
        cleanPropertyData.listedBy ||
        (cleanPropertyData.userType === 'seller' ? 'owner' : 'agent'),
      isFeatured: cleanPropertyData.isFeatured || false,

      // System fields
      propertyId,
      isActive: true,
      isVerified: false,
      listDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      views: 0,
      favorites: 0,
    }

    // Add user-type specific fields - USE YOUR ACTUAL SCHEMA FIELDS
    if (cleanPropertyData.userType === 'agent') {
      // For agents: use agentId (your actual schema field)
      if (correctAgentId) {
        documentData.agentId = correctAgentId
      }
      if (correctAgentName) {
        documentData.agentName = correctAgentName
      }
      documentData.listedBy =
        cleanPropertyData.listedBy || correctAgentName || 'Agent'
    } else if (cleanPropertyData.userType === 'seller') {
      // For sellers: use ownerId (your actual schema field)
      if (ownerId) {
        documentData.ownerId = ownerId
      }
      if (ownerName) {
        documentData.ownerName = ownerName
      }
      documentData.listedBy = 'owner' // Always 'owner' for sellers
    }

    // Create the property in Appwrite
    const property = await databases.createDocument(
      DATABASE_ID,
      PROPERTIES_COLLECTION_ID,
      propertyId,
      documentData
    )

    // Update agent statistics only for agents
    if (cleanPropertyData.userType === 'agent' && correctAgentId) {
      try {
        const agent = await databases.getDocument(
          DATABASE_ID,
          AGENTS_COLLECTION_ID,
          correctAgentId
        )

        await databases.updateDocument(
          DATABASE_ID,
          AGENTS_COLLECTION_ID,
          correctAgentId,
          {
            totalListings: (agent.totalListings || 0) + 1,
            lastUpdated: new Date().toISOString(),
          }
        )
      } catch (agentUpdateError) {
        console.error(
          '❌ Failed to update agent properties count:',
          agentUpdateError
        )
        // Continue even if agent update fails
      }
    }

    return NextResponse.json({
      success: true,
      propertyId: property.$id,
      property: {
        $id: property.$id,
        title: property.title,
        propertyType: property.propertyType,
        status: property.status,
        price: property.price,
        city: property.city,
        state: property.state,
        titles: property.titles,
        userType: cleanPropertyData.userType,
        ...(cleanPropertyData.userType === 'agent' && {
          agentId: documentData.agentId,
          agentName: documentData.agentName,
        }),
        ...(cleanPropertyData.userType === 'seller' && {
          ownerId: documentData.ownerId,
          ownerName: documentData.ownerName,
        }),
        listedBy: documentData.listedBy,
        listDate: property.listDate,
      },
    })
  } catch (error) {
    console.error('❌ Error creating property:', error)
    return NextResponse.json(
      {
        error: 'Failed to create property',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

