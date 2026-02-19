// app/api/favorites/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server'
import { ID, Query } from 'node-appwrite'

import {
  AGENTS_COLLECTION_ID, // ← ADD THIS
  DATABASE_ID,
  databases,
  FAVORITES_COLLECTION_ID,
  PROPERTIES_COLLECTION_ID,
  USERS_COLLECTION_ID,
} from '@/lib/appwrite-server'
import { triggerFavoriteNotification } from '@/lib/services/server/notificationTriggers'

// GET /api/favorites - Get user's favorites with property details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const propertyId = searchParams.get('propertyId')
    const category = searchParams.get('category')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const queries = [Query.equal('userId', userId)]

    if (propertyId) {
      queries.push(Query.equal('propertyId', propertyId))
      queries.push(Query.limit(1))
      queries.push(Query.select(['$id', 'userId', 'propertyId', 'category']))
    }

    if (category) {
      queries.push(Query.equal('category', category))
    }

    queries.push(Query.orderDesc('$createdAt'))

    const favoritesResponse = await databases.listDocuments(
      DATABASE_ID,
      FAVORITES_COLLECTION_ID,
      queries
    )

    // If we need property details, fetch them in batches.
    if (favoritesResponse.total > 0 && !propertyId) {
      const propertyIds = Array.from(
        new Set(
          favoritesResponse.documents
            .map((favorite) => favorite.propertyId)
            .filter(Boolean)
        )
      )

      const propertyMap = new Map<string, any>()
      const chunkSize = 100

      for (let i = 0; i < propertyIds.length; i += chunkSize) {
        const chunk = propertyIds.slice(i, i + chunkSize)
        try {
          const propertiesResponse = await databases.listDocuments(
            DATABASE_ID,
            PROPERTIES_COLLECTION_ID,
            [Query.equal('$id', chunk)]
          )
          propertiesResponse.documents.forEach((property) => {
            propertyMap.set(property.$id, property)
          })
        } catch (error) {
          console.error('[API /favorites] Error fetching properties batch')
        }
      }

      const favoritesWithDetails = favoritesResponse.documents.map(
        (favorite) => ({
          ...favorite,
          property: propertyMap.get(favorite.propertyId) || null,
        })
      )

      return NextResponse.json(
        {
          favorites: favoritesWithDetails,
          total: favoritesResponse.total,
        },
        {
          headers: {
            'Cache-Control': 'private, max-age=10',
          },
        }
      )
    }

    return NextResponse.json(
      {
        favorites: favoritesResponse.documents,
        total: favoritesResponse.total,
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=10',
        },
      }
    )
  } catch (error: any) {
    console.error('❌ [FAVORITES API] GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    )
  }
}

// POST /api/favorites - Add to favorites with validation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, propertyId, notes, category } = body

    if (!userId || !propertyId) {
      return NextResponse.json(
        { error: 'User ID and Property ID are required' },
        { status: 400 }
      )
    }

    // 🔧 FIXED: Validate that user exists in either agents or users collection
    let user = null
    let userCollection = ''

    // Try agents collection first, then users collection
    const userCollections = [AGENTS_COLLECTION_ID, USERS_COLLECTION_ID] // ← USE CONSTANTS

    for (const collection of userCollections) {
      try {
        user = await databases.getDocument(DATABASE_ID, collection, userId)
        userCollection = collection
        break // Exit loop once user is found
      } catch {
        continue
      }
    }

    // If user is still not found after checking both collections
    if (!user) {
      console.error('❌ User not found in agents or users collection:', userId)
      return NextResponse.json(
        {
          error: 'User not found',
        },
        { status: 404 }
      )
    }

    // Validate that property exists
    let property
    try {
      property = await databases.getDocument(
        DATABASE_ID,
        PROPERTIES_COLLECTION_ID,
        propertyId
      )
    } catch (error: any) {
      console.error('❌ Property not found:', propertyId, error.message)
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    // Check if already favorited
    const existingFavorites = await databases.listDocuments(
      DATABASE_ID,
      FAVORITES_COLLECTION_ID,
      [Query.equal('userId', userId), Query.equal('propertyId', propertyId)]
    )

    if (existingFavorites.total > 0) {
      return NextResponse.json(
        { error: 'Property is already in favorites' },
        { status: 409 }
      )
    }

    const favoriteData = {
      userId,
      propertyId,
      addedAt: new Date().toISOString(),
      notes: notes || '',
      category: category || 'wishlist',
    }

    const response = await databases.createDocument(
      DATABASE_ID,
      FAVORITES_COLLECTION_ID,
      ID.unique(),
      favoriteData
    )

    // 🔔 TRIGGER FAVORITE NOTIFICATION
    try {
      // Determine who should get the notification (property owner or agent)
      const notificationRecipientId = property.agentId || property.ownerId
      if (notificationRecipientId && notificationRecipientId !== userId) {
        await triggerFavoriteNotification({
          propertyOwnerId: notificationRecipientId,
          userName: user.name || 'A user',
          propertyId: propertyId,
          propertyTitle: property.title,
        })
      } else {
      }
    } catch (error: any) {
      console.error('❌ Notification failed:', error.message)
      // Silently fail if notification fails
    }

    // After the favorite is successfully created, optionally create a lead
    try {
      // Only create lead if property belongs to an agent and user is not the agent
      if (property.agentId && property.agentId !== userId) {
        const leadUrl = `${request.nextUrl.origin}/api/favorites/leads`
        const leadResponse = await fetch(leadUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            propertyId,
            notes: notes || '',
            favoriteId: response.$id,
          }),
        })

        if (!leadResponse.ok) {
          const errorText = await leadResponse.text()
          console.error(
            '❌ Lead creation failed with status:',
            leadResponse.status
          )
          console.error('❌ Lead creation error:', errorText)
          // Don't throw, just log
        } else {
          const leadResult = await leadResponse.json()
        }
      } else {
      }
    } catch (error: any) {
      console.error('❌ Lead creation exception:', error.message)
      // Don't fail the favorite request if lead creation fails
    }

    // Update the property's favorites count atomically
    try {
      const currentFavorites = property.favorites || 0
      await databases.updateDocument(
        DATABASE_ID,
        PROPERTIES_COLLECTION_ID,
        propertyId,
        {
          favorites: currentFavorites + 1,
        }
      )
    } catch (error: any) {
      console.error('❌ Failed to update favorites count:', error.message)
      // Silently fail if favorites count update fails
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error: any) {
    console.error('❌ [FAVORITES API] POST error:', error)
    console.error('❌ Error stack:', error.stack)
    return NextResponse.json(
      { error: 'Failed to add to favorites' },
      { status: 500 }
    )
  }
}

// DELETE /api/favorites - Remove from favorites
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const favoriteId = searchParams.get('favoriteId')
    const propertyId = searchParams.get('propertyId')

    if (!favoriteId || !propertyId) {
      return NextResponse.json(
        { error: 'Favorite ID and Property ID are required' },
        { status: 400 }
      )
    }

    // Get the property first to get current favorites count
    let currentFavorites = 0
    try {
      const property = await databases.getDocument(
        DATABASE_ID,
        PROPERTIES_COLLECTION_ID,
        propertyId
      )
      currentFavorites = property.favorites || 0
    } catch (error: any) {
      console.error('❌ Failed to get property:', error.message)
      // Use default value if property fetch fails
    }

    // Delete the favorite
    await databases.deleteDocument(
      DATABASE_ID,
      FAVORITES_COLLECTION_ID,
      favoriteId
    )
    // Update the property's favorites count atomically
    try {
      const newFavoritesCount = Math.max(0, currentFavorites - 1)
      await databases.updateDocument(
        DATABASE_ID,
        PROPERTIES_COLLECTION_ID,
        propertyId,
        {
          favorites: newFavoritesCount,
        }
      )
    } catch (error: any) {
      console.error('❌ Failed to update favorites count:', error.message)
      // Silently fail if favorites count update fails
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('❌ [FAVORITES API] DELETE error:', error)
    console.error('❌ Error stack:', error.stack)
    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    )
  }
}


