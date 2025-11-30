// app/api/properties/create/route.ts
import { NextRequest, NextResponse } from 'next/server'

import {
  AGENTS_COLLECTION_ID,
  DATABASE_ID,
  ID,
  PROPERTIES_COLLECTION_ID,
  serverDatabases,
} from '@/lib/appwrite-server'

export async function POST(request: NextRequest) {
  try {
    const propertyData = await request.json()

    // Remove sensitive or unnecessary fields
    const { $permissions, ...cleanPropertyData } = propertyData

    // Validate required fields
    const requiredFields = [
      'title',
      'description',
      'propertyType',
      'status',
      'price',
      'city',
      'state',
      'agentId',
      'agentName',
      'listedBy',
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

    // Validate numeric fields
    const numericFields = ['price', 'bedrooms', 'bathrooms', 'squareFeet']
    const invalidNumericFields = numericFields.filter((field) => {
      const value = cleanPropertyData[field]
      return (
        value !== undefined &&
        value !== null &&
        (isNaN(Number(value)) || Number(value) < 0)
      )
    })

    if (invalidNumericFields.length > 0) {
      console.error('❌ Invalid numeric fields:', invalidNumericFields)
      return NextResponse.json(
        {
          error: 'Invalid numeric values',
          invalidFields: invalidNumericFields,
        },
        { status: 400 }
      )
    }

    // AUTO-SYNC AGENT: Check if agent exists, create if not
    console.log('🔄 Checking if agent exists:', cleanPropertyData.agentId)
    try {
      // Try to get the agent to see if they exist
      await serverDatabases.getDocument(
        DATABASE_ID,
        AGENTS_COLLECTION_ID,
        cleanPropertyData.agentId
      )
    } catch {}

    // Generate propertyId if not provided
    const propertyId = cleanPropertyData.propertyId || ID.unique()

    // Prepare the document data for Appwrite
    const documentData = {
      ...cleanPropertyData,
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

      // Ensure listedBy is properly set
      listedBy: cleanPropertyData.listedBy || cleanPropertyData.agentName,
    }

    console.log('📄 Prepared document data:', documentData)

    // Create the property in Appwrite
    const property = await serverDatabases.createDocument(
      DATABASE_ID,
      PROPERTIES_COLLECTION_ID,
      propertyId,
      documentData
    )

    console.log('✅ Property created successfully:', property.$id)

    // Increment propertiesListed count for the agent
    try {
      const agent = await serverDatabases.getDocument(
        DATABASE_ID,
        AGENTS_COLLECTION_ID,
        cleanPropertyData.agentId
      )

      await serverDatabases.updateDocument(
        DATABASE_ID,
        AGENTS_COLLECTION_ID,
        cleanPropertyData.agentId,
        {
          propertiesListed: (agent.propertiesListed || 0) + 1,
        }
      )
      console.log('✅ Updated agent properties count')
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
        agentId: property.agentId,
        agentName: property.agentName,
        listedBy: property.listedBy,
        listDate: property.listDate,
      },
    })
  } catch {
    return NextResponse.json(
      {
        error: 'Failed to create property',
      },
      { status: 500 }
    )
  }
}

// Only allow POST method for this route
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
