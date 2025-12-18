// app/api/favorites/remove/route.ts - NEW FILE
import { NextRequest, NextResponse } from 'next/server'

import {
  DATABASE_ID,
  databases,
  FAVORITES_COLLECTION_ID,
  PROPERTIES_COLLECTION_ID,
} from '@/lib/appwrite-server'

// DELETE /api/favorites/remove - Remove favorite by ID
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const favoriteId = searchParams.get('favoriteId')

    if (!favoriteId) {
      return NextResponse.json(
        { error: 'Favorite ID is required' },
        { status: 400 }
      )
    }

    // Get the favorite first to know which property to update
    const favorite = await databases.getDocument(
      DATABASE_ID,
      FAVORITES_COLLECTION_ID,
      favoriteId
    )

    // Delete the favorite
    await databases.deleteDocument(
      DATABASE_ID,
      FAVORITES_COLLECTION_ID,
      favoriteId
    )

    // Update the property's favorites count
    try {
      const property = await databases.getDocument(
        DATABASE_ID,
        PROPERTIES_COLLECTION_ID,
        favorite.propertyId
      )

      const currentFavorites = property.favorites || 0
      const newFavoritesCount = Math.max(0, currentFavorites - 1)

      await databases.updateDocument(
        DATABASE_ID,
        PROPERTIES_COLLECTION_ID,
        favorite.propertyId,
        {
          favorites: newFavoritesCount,
        }
      )
    } catch {}

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ status: 500 })
  }
}
