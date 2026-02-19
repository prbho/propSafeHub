import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Property } from '@/types'

import { favoritesAPI } from '@/lib/favorites'

export function usePropertyFavorite(property: Property) {
  const { user } = useAuth()
  const [isFavorited, setIsFavorited] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkFavoriteStatus = useCallback(async () => {
    if (!user?.$id || !property?.$id) {
      setIsFavorited(false)
      return
    }

    try {
      const favorited = await favoritesAPI.isPropertyFavorited(
        user.$id,
        property.$id
      )
      setIsFavorited(favorited)
    } catch {
      setIsFavorited(false)
    }
  }, [property?.$id, user?.$id])

  useEffect(() => {
    checkFavoriteStatus()
  }, [checkFavoriteStatus])

  const toggleFavorite = async () => {
    if (!user?.$id) {
      const errorMsg = 'Please log in to add favorites'
      setError(errorMsg)
      throw new Error(errorMsg)
    }

    if (!property?.$id) {
      const errorMsg = 'Invalid property'
      setError(errorMsg)
      throw new Error(errorMsg)
    }

    setLoading(true)
    setError(null)

    try {
      let result: boolean

      if (isFavorited) {
        await favoritesAPI.removeFavoriteByProperty(user.$id, property.$id)
        setIsFavorited(false)
        result = false
      } else {
        await favoritesAPI.addToFavorite({
          userId: user.$id,
          propertyId: property.$id,
          category: 'wishlist',
        })
        setIsFavorited(true)
        result = true
      }

      return result
    } catch {
      await checkFavoriteStatus()
    } finally {
      setLoading(false)
    }
  }

  return {
    isFavorited,
    loading,
    error,
    toggleFavorite,
    refetch: checkFavoriteStatus,
  }
}
