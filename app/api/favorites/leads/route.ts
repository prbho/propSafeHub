// app/api/favorites/leads/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { ID, Query } from 'node-appwrite'

import {
  DATABASE_ID,
  LEADS_COLLECTION_ID,
  PROPERTIES_COLLECTION_ID,
  serverDatabases,
  USERS_COLLECTION_ID,
} from '@/lib/appwrite-server'

// POST /api/favorites/leads - Create lead from favorite
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, propertyId, notes } = body

    if (!userId || !propertyId) {
      return NextResponse.json(
        { error: 'User ID and Property ID are required' },
        { status: 400 }
      )
    }

    // Get user details
    let user
    try {
      user = await serverDatabases.getDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId
      )
    } catch {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get property details
    let property
    try {
      property = await serverDatabases.getDocument(
        DATABASE_ID,
        PROPERTIES_COLLECTION_ID,
        propertyId
      )
    } catch {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    // Check if property belongs to an agent and user is not the agent
    if (!property.agentId || property.agentId === userId) {
      return NextResponse.json({
        message: 'No lead created - property not owned by different agent',
        created: false,
      })
    }

    // Get agent details
    let agent
    try {
      agent = await serverDatabases.getDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        property.agentId
      )
    } catch {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Check if lead already exists for this user and property
    const existingLeads = await serverDatabases.listDocuments(
      DATABASE_ID,
      LEADS_COLLECTION_ID,
      [
        Query.equal('interestedUserId', userId),
        Query.equal('propertyId', propertyId),
        Query.equal('assignedAgentId', property.agentId),
      ]
    )

    if (existingLeads.total > 0) {
      return NextResponse.json({
        message: 'Lead already exists',
        created: false,
        leadId: existingLeads.documents[0].$id,
      })
    }

    // Create new lead
    const leadData = {
      name: user.name || 'Unknown User',
      email: user.email,
      phone: user.phone || user.mobilePhone || '',
      interestedUserId: userId,
      propertyId: propertyId,
      propertyInterest: property.title,
      location: `${property.address}, ${property.city}, ${property.state}`,
      budget: property.price || 0,
      timeline: 'flexible',
      source: 'property_favorite',
      status: 'new',
      message: notes || `User favorited the property "${property.title}"`,
      assignedAgentId: property.agentId,
    }

    const leadResponse = await serverDatabases.createDocument(
      DATABASE_ID,
      LEADS_COLLECTION_ID,
      ID.unique(),
      leadData
    )

    return NextResponse.json(
      {
        success: true,
        created: true,
        lead: leadResponse,
      },
      { status: 201 }
    )
  } catch {
    return NextResponse.json({ status: 500 })
  }
}

// GET /api/favorites/leads - Get leads created from favorites
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get('agentId')
    const userId = searchParams.get('userId')

    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      )
    }

    const queries = [
      Query.equal('assignedAgentId', agentId),
      Query.equal('source', 'property_favorite'),
      Query.orderDesc('$createdAt'),
    ]

    if (userId) {
      queries.push(Query.equal('interestedUserId', userId))
    }

    const leadsResponse = await serverDatabases.listDocuments(
      DATABASE_ID,
      LEADS_COLLECTION_ID,
      queries
    )

    return NextResponse.json({
      leads: leadsResponse.documents,
      total: leadsResponse.total,
    })
  } catch {
    return NextResponse.json({ status: 500 })
  }
}
