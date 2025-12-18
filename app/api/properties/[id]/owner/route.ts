import { NextRequest, NextResponse } from 'next/server'

import {
  DATABASE_ID,
  databases,
  PROPERTIES_COLLECTION_ID,
} from '@/lib/appwrite-server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params

    console.log('🔍 Getting owner for property:', propertyId)

    // Get the property with timeout handling
    let property
    try {
      property = await databases.getDocument(
        DATABASE_ID,
        PROPERTIES_COLLECTION_ID,
        propertyId
      )
    } catch (error) {
      console.error('Error fetching property:', error)
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    // Determine owner info from property data
    let ownerId = null
    let ownerName = 'Unknown Owner'
    let ownerType = 'user'
    let userId = null
    let agentId = null

    // Check agentId first
    if (property.agentId) {
      agentId = property.agentId
      ownerId = agentId
      ownerName = property.agentName || `Agent ${agentId.slice(0, 8)}`
      ownerType = 'agent'

      // Try to get userId from agent if available in property
      if (property.agentUserId) {
        userId = property.agentUserId
      }
    }
    // Check userId
    else if (property.userId) {
      userId = property.userId
      ownerId = userId
      ownerName = property.userName || `User ${userId.slice(0, 8)}`
      ownerType = property.userType || 'user'
    }
    // Check createdBy as fallback
    else if (property.createdBy) {
      ownerId = property.createdBy
      ownerName = `User ${property.createdBy.slice(0, 8)}`
      ownerType = 'user'
    }

    if (!ownerId) {
      return NextResponse.json(
        { error: 'Property owner not found' },
        { status: 404 }
      )
    }

    console.log('✅ Found property owner:', {
      propertyId,
      ownerId,
      ownerName,
      ownerType,
      userId,
      agentId,
    })

    return NextResponse.json({
      ownerId,
      ownerName,
      ownerType,
      userId,
      agentId,
      propertyId,
      propertyTitle: property.title,
    })
  } catch (error) {
    console.error('Error getting property owner:', error)
    return NextResponse.json(
      { error: 'Failed to get property owner' },
      { status: 500 }
    )
  }
}
