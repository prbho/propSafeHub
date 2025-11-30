// hooks/useFavorites.ts
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { CreateFavoriteDto, Favorite, Property } from '@/types'

import { favoritesAPI } from '@/lib/favorites'

export function useFavorites() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load user's favorites
  const loadFavorites = useCallback(
    async (category?: string) => {
      if (!user?.$id) {
        setFavorites([])
        return
      }

      setLoading(true)
      setError(null)

      try {
        const data = await favoritesAPI.getFavorites(user.$id, category)
        setFavorites(data.favorites || [])
      } catch {
      } finally {
        setLoading(false)
      }
    },
    [user?.$id]
  )

  // Add to favorites
  // In hooks/useFavorites.ts, update the addFavorite method:
  const addFavorite = async (
    property: Property,
    data?: Partial<CreateFavoriteDto>
  ) => {
    if (!user?.$id) throw new Error('User must be logged in')

    try {
      const favoriteData: CreateFavoriteDto = {
        userId: user.$id,
        propertyId: property.$id,
        ...data,
      }

      const response = await favoritesAPI.addToFavorite(favoriteData)

      // Try to create lead if property belongs to an agent
      if (property.agentId && property.agentId !== user.$id) {
        try {
          await favoritesAPI.createLeadFromFavorite(
            user.$id,
            property.$id,
            data?.notes
          )
        } catch (leadError) {
          console.error(
            'Failed to create lead, but favorite was saved:',
            leadError
          )
          // Don't throw error - favorite was still saved successfully
        }
      }

      // Refresh favorites to get updated counts
      await loadFavorites()
      return response
    } catch {}
  }

  // Remove from favorites
  const removeFavorite = async (property: Property) => {
    if (!user?.$id) throw new Error('User must be logged in')

    try {
      await favoritesAPI.removeFavoriteByProperty(user.$id, property.$id)
      setFavorites((prev) =>
        prev.filter((fav) => fav.propertyId !== property.$id)
      )
    } catch {}
  }

  // Check if property is favorited
  const isFavorited = useCallback(
    (property: Property) => {
      return favorites.some((fav) => fav.propertyId === property.$id)
    },
    [favorites]
  )

  // Toggle favorite
  const toggleFavorite = async (
    property: Property,
    data?: Partial<CreateFavoriteDto>
  ) => {
    if (!user?.$id) throw new Error('User must be logged in')

    try {
      if (isFavorited(property)) {
        await removeFavorite(property)
        return false
      } else {
        await addFavorite(property, data)
        return true
      }
    } catch {}
  }

  // Load favorites on mount and when user changes
  useEffect(() => {
    loadFavorites()
  }, [loadFavorites])

  return {
    favorites,
    loading,
    error,
    isFavorited,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    loadFavorites,
    refetch: () => loadFavorites(),
  }
}
