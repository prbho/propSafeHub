// app/api/favorites/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { ID, Query } from 'node-appwrite'

import {
  DATABASE_ID,
  FAVORITES_COLLECTION_ID,
  PROPERTIES_COLLECTION_ID,
  serverDatabases,
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
    }

    if (category) {
      queries.push(Query.equal('category', category))
    }

    queries.push(Query.orderDesc('$createdAt'))

    const favoritesResponse = await serverDatabases.listDocuments(
      DATABASE_ID,
      FAVORITES_COLLECTION_ID,
      queries
    )

    // If we need property details, fetch them
    if (favoritesResponse.total > 0 && !propertyId) {
      const favoritesWithDetails = await Promise.all(
        favoritesResponse.documents.map(async (favorite) => {
          try {
            // Fetch property details
            const property = await serverDatabases.getDocument(
              DATABASE_ID,
              PROPERTIES_COLLECTION_ID,
              favorite.propertyId
            )

            return {
              ...favorite,
              property, // Include full property details
            }
          } catch (error) {
            console.error(
              '❌ [API /favorites] Error fetching property:',
              favorite.propertyId,
              error
            )
            return {
              ...favorite,
              property: null, // Property might be deleted
            }
          }
        })
      )

      return NextResponse.json({
        favorites: favoritesWithDetails,
        total: favoritesResponse.total,
      })
    }

    return NextResponse.json({
      favorites: favoritesResponse.documents,
      total: favoritesResponse.total,
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch favorites: ' },
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

    // Validate that user exists
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

    // Validate that property exists
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

    // Check if already favorited
    const existingFavorites = await serverDatabases.listDocuments(
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

    const response = await serverDatabases.createDocument(
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
      }
    } catch {
      // Silently fail if notification fails
    }

    // After the favorite is successfully created, optionally create a lead
    try {
      // Only create lead if property belongs to an agent and user is not the agent
      if (property.agentId && property.agentId !== userId) {
        await fetch(`${request.nextUrl.origin}/api/favorites/leads`, {
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
      }
    } catch {
      // Don't fail the favorite request if lead creation fails
    }

    // Update the property's favorites count atomically
    try {
      const currentFavorites = property.favorites || 0
      await serverDatabases.updateDocument(
        DATABASE_ID,
        PROPERTIES_COLLECTION_ID,
        propertyId,
        {
          favorites: currentFavorites + 1,
        }
      )
    } catch {
      // Silently fail if favorites count update fails
    }

    return NextResponse.json(response, { status: 201 })
  } catch {
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
      const property = await serverDatabases.getDocument(
        DATABASE_ID,
        PROPERTIES_COLLECTION_ID,
        propertyId
      )
      currentFavorites = property.favorites || 0
    } catch {
      // Use default value if property fetch fails
    }

    // Delete the favorite
    await serverDatabases.deleteDocument(
      DATABASE_ID,
      FAVORITES_COLLECTION_ID,
      favoriteId
    )

    // Update the property's favorites count atomically
    try {
      const newFavoritesCount = Math.max(0, currentFavorites - 1)

      await serverDatabases.updateDocument(
        DATABASE_ID,
        PROPERTIES_COLLECTION_ID,
        propertyId,
        {
          favorites: newFavoritesCount,
        }
      )
    } catch {
      // Silently fail if favorites count update fails
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    )
  }
}
