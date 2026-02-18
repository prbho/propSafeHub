import { NextRequest, NextResponse } from 'next/server'

import {
  DATABASE_ID,
  databases,
  PROPERTIES_COLLECTION_ID,
  Query,
} from '@/lib/appwrite-server'

type OwnerPayload = {
  ownerId: string
  ownerName: string
  ownerType: string
  userId: string | null
  agentId: string | null
  propertyId: string
  propertyTitle: string
}

const ownerCache = new Map<string, { expiresAt: number; data: OwnerPayload }>()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params

    if (!propertyId?.trim()) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 })
    }

    const now = Date.now()
    const cached = ownerCache.get(propertyId)
    if (cached && cached.expiresAt > now) {
      return NextResponse.json(cached.data, {
        headers: {
          'Cache-Control': 'private, max-age=20, stale-while-revalidate=40',
        },
      })
    }

    const propertyResponse = await databases.listDocuments(
      DATABASE_ID,
      PROPERTIES_COLLECTION_ID,
      [
        Query.equal('$id', propertyId),
        Query.limit(1),
        Query.select([
          '$id',
          'title',
          'agentId',
          'agentName',
          'agentUserId',
          'userId',
          'userName',
          'userType',
          'createdBy',
        ]),
      ]
    )

    const property = propertyResponse.documents[0]
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    let ownerId: string | null = null
    let ownerName = 'Unknown Owner'
    let ownerType = 'user'
    let userId: string | null = null
    let agentId: string | null = null

    if (property.agentId) {
      const resolvedAgentId = String(property.agentId)
      agentId = resolvedAgentId
      ownerId = resolvedAgentId
      ownerName = property.agentName || `Agent ${resolvedAgentId.slice(0, 8)}`
      ownerType = 'agent'
      if (property.agentUserId) {
        userId = property.agentUserId
      }
    } else if (property.userId) {
      const resolvedUserId = String(property.userId)
      userId = resolvedUserId
      ownerId = resolvedUserId
      ownerName = property.userName || `User ${resolvedUserId.slice(0, 8)}`
      ownerType = property.userType || 'user'
    } else if (property.createdBy) {
      ownerId = property.createdBy
      ownerName = `User ${property.createdBy.slice(0, 8)}`
      ownerType = 'user'
    }

    if (!ownerId) {
      return NextResponse.json({ error: 'Property owner not found' }, { status: 404 })
    }

    const payload: OwnerPayload = {
      ownerId,
      ownerName,
      ownerType,
      userId,
      agentId,
      propertyId,
      propertyTitle: property.title,
    }

    ownerCache.set(propertyId, {
      expiresAt: now + 30_000,
      data: payload,
    })

    if (ownerCache.size > 1000) {
      for (const [key, value] of ownerCache.entries()) {
        if (value.expiresAt <= now) {
          ownerCache.delete(key)
        }
      }
    }

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'private, max-age=20, stale-while-revalidate=40',
      },
    })
  } catch (error) {
    console.error('Error getting property owner:', error)
    return NextResponse.json(
      { error: 'Failed to get property owner' },
      { status: 500 }
    )
  }
}
