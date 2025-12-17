// app/api/properties/create/route.ts - UPDATED VERSION
import { NextRequest, NextResponse } from 'next/server'

import {
  AGENTS_COLLECTION_ID,
  DATABASE_ID,
  ID,
  PROPERTIES_COLLECTION_ID,
  Query,
  serverDatabases,
} from '@/lib/appwrite-server'

export async function POST(request: NextRequest) {
  try {
    const propertyData = await request.json()

    // Remove sensitive or unnecessary fields
    const { $permissions, ...cleanPropertyData } = propertyData

    console.log('🔍 Received property data:', {
      agentId: cleanPropertyData.agentId,
      agentName: cleanPropertyData.agentName,
      listedBy: cleanPropertyData.listedBy,
    })

    // FIRST: VALIDATE AND FIND THE CORRECT AGENT
    let correctAgentId = cleanPropertyData.agentId
    let correctAgentName = cleanPropertyData.agentName

    // Try to get the agent by the provided ID
    try {
      const agent = await serverDatabases.getDocument(
        DATABASE_ID,
        AGENTS_COLLECTION_ID,
        cleanPropertyData.agentId
      )

      console.log('✅ Agent found by provided ID:', {
        providedId: cleanPropertyData.agentId,
        foundId: agent.$id,
        name: agent.name,
        matches: agent.$id === cleanPropertyData.agentId,
      })

      // Verify the agent name matches
      if (agent.name !== cleanPropertyData.agentName) {
        console.warn('⚠️ Agent name mismatch:', {
          providedName: cleanPropertyData.agentName,
          actualName: agent.name,
        })
        correctAgentName = agent.name
      }
    } catch {
      // Try to find agent by name
      try {
        const agents = await serverDatabases.listDocuments(
          DATABASE_ID,
          AGENTS_COLLECTION_ID,
          [Query.equal('name', cleanPropertyData.agentName), Query.limit(1)]
        )

        if (agents.documents.length > 0) {
          const foundAgent = agents.documents[0]
          correctAgentId = foundAgent.$id
        } else {
          console.error(
            '❌ No agent found with name:',
            cleanPropertyData.agentName
          )
          return NextResponse.json(
            {
              error: 'Agent not found',
              details: 'No agent found with the provided name',
            },
            { status: 404 }
          )
        }
      } catch (searchError) {
        console.error('❌ Error searching for agent:', searchError)
        return NextResponse.json(
          {
            error: 'Agent validation failed',
            details: 'Could not verify agent information',
          },
          { status: 400 }
        )
      }
    }

    // Validate required fields (update with correct agent info)
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

    // Prepare the document data with CORRECT agent information
    const documentData = {
      ...cleanPropertyData,
      // OVERRIDE with correct agent information
      agentId: correctAgentId,
      agentName: correctAgentName,
      listedBy: cleanPropertyData.listedBy || correctAgentName,

      // Ensure proper data types
      price: Number(cleanPropertyData.price),
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

      // Ensure latitude and longitude are numbers
      latitude: cleanPropertyData.latitude
        ? Number(cleanPropertyData.latitude)
        : undefined,
      longitude: cleanPropertyData.longitude
        ? Number(cleanPropertyData.longitude)
        : undefined,

      // System fields
      propertyId,
      isActive: true,
      isVerified: false,
      listDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      views: 0,
      favorites: 0,

      // Ensure arrays are properly formatted
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

      // Payment options - use the values from the form
      outright: cleanPropertyData.paymentOutright || true,
      paymentPlan: cleanPropertyData.paymentPlan || false,
      mortgageEligible: cleanPropertyData.mortgageEligible || false,
      customPlanAvailable: cleanPropertyData.customPlanAvailable || false,
      customPlanDepositPercent:
        cleanPropertyData.customPlanDepositPercent || 30,
      customPlanMonths: cleanPropertyData.customPlanMonths || 12,
    }

    // Create the property in Appwrite
    const property = await serverDatabases.createDocument(
      DATABASE_ID,
      PROPERTIES_COLLECTION_ID,
      propertyId,
      documentData
    )

    // Increment totalListings count for the CORRECT agent
    try {
      const agent = await serverDatabases.getDocument(
        DATABASE_ID,
        AGENTS_COLLECTION_ID,
        correctAgentId
      )

      await serverDatabases.updateDocument(
        DATABASE_ID,
        AGENTS_COLLECTION_ID,
        correctAgentId,
        {
          totalListings: (agent.totalListings || 0) + 1,
          lastUpdated: new Date().toISOString(),
        }
      )
      console.log('✅ Updated agent properties count for:', correctAgentId)
    } catch (agentUpdateError) {
      console.error(
        '❌ Failed to update agent properties count:',
        agentUpdateError
      )
      // Continue even if agent update fails
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
        agentId: correctAgentId, // Return the correct agent ID
        agentName: correctAgentName,
        listedBy: correctAgentName,
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
