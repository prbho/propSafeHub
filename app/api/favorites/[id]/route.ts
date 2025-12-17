import '@/lib/appwrite-build-fix'
// app/api/favorites/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'

import {
  DATABASE_ID,
  FAVORITES_COLLECTION_ID,
  PROPERTIES_COLLECTION_ID,
  serverDatabases,
} from '@/lib/appwrite-server'

// Define types based on your interfaces
interface FavoriteDocument {
  $id: string
  userId: string
  propertyId: string
  addedAt: string
  notes?: string
  category?: 'wishlist' | 'tour' | 'buy' | 'rent' | 'investment'
  $createdAt: string
  $updatedAt: string
  $sequence: number
  $collectionId: string
  $databaseId: string
  $permissions: string[]
}

interface PropertyDocument {
  $id: string
  favorites: number
  [key: string]: unknown
  $createdAt: string
  $updatedAt: string
  $sequence: number
  $collectionId: string
  $databaseId: string
  $permissions: string[]
}

interface UpdateFavoriteData {
  notes?: string
  category?: 'wishlist' | 'tour' | 'buy' | 'rent' | 'investment'
}

// GET /api/favorites/[id] - Get specific favorite
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Favorite ID is required' },
        { status: 400 }
      )
    }

    const favorite = await serverDatabases.getDocument<FavoriteDocument>(
      DATABASE_ID,
      FAVORITES_COLLECTION_ID,
      id
    )

    return NextResponse.json(favorite)
  } catch (error: unknown) {
    console.error('Error fetching favorite:', error)
    return NextResponse.json(
      { error: 'Failed to fetch favorite' },
      { status: 500 }
    )
  }
}

// PATCH /api/favorites/[id] - Update favorite
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Favorite ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { notes, category } = body

    const updateData: UpdateFavoriteData = {}
    if (notes !== undefined) updateData.notes = notes
    if (category !== undefined) updateData.category = category

    const response = await serverDatabases.updateDocument(
      DATABASE_ID,
      FAVORITES_COLLECTION_ID,
      id,
      updateData
    )

    return NextResponse.json(response)
  } catch (error: unknown) {
    console.error('Error updating favorite:', error)
    return NextResponse.json(
      { error: 'Failed to update favorite' },
      { status: 500 }
    )
  }
}

// DELETE /api/favorites/[id] - Remove from favorites
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Favorite ID is required' },
        { status: 400 }
      )
    }

    // Get the favorite first to know which property to update
    const favorite = await serverDatabases.getDocument<FavoriteDocument>(
      DATABASE_ID,
      FAVORITES_COLLECTION_ID,
      id
    )

    // Delete the favorite
    await serverDatabases.deleteDocument(
      DATABASE_ID,
      FAVORITES_COLLECTION_ID,
      id
    )

    // Update the property's favorites count
    try {
      const property = await serverDatabases.getDocument<PropertyDocument>(
        DATABASE_ID,
        PROPERTIES_COLLECTION_ID,
        favorite.propertyId
      )

      const currentFavorites = property.favorites || 0
      const newFavoritesCount = Math.max(0, currentFavorites - 1)

      await serverDatabases.updateDocument(
        DATABASE_ID,
        PROPERTIES_COLLECTION_ID,
        favorite.propertyId,
        {
          favorites: newFavoritesCount,
        }
      )
    } catch (updateError: unknown) {
      console.error('Failed to update property favorites count:', updateError)
      // Don't fail the whole request if this fails
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Error deleting favorite:', error)
    return NextResponse.json(
      { error: 'Failed to remove from favorites' },
      { status: 500 }
    )
  }
}
