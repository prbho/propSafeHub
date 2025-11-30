// components/PropertyFavoriteButton.tsx
'use client'

import { useEffect, useState } from 'react'
import { Property } from '@/types'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

interface PropertyFavoriteButtonProps {
  property: Property
  userId?: string // Get user ID from props instead of useAuth hook
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export default function PropertyFavoriteButton({
  property,
  userId, // User ID passed as prop
  size = 'md',
  showText = false,
}: PropertyFavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [loading, setLoading] = useState(false)

  console.log('🎯 [PropertyFavoriteButton] Component rendered:', {
    userId,
    property: property?.$id,
    isFavorited,
    loading,
  })

  // Check favorite status on mount
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      console.log('🔄 [PropertyFavoriteButton] Checking favorite status...')

      if (!userId) {
        console.log('❌ [PropertyFavoriteButton] No user ID')
        setIsFavorited(false)
        return
      }

      if (!property?.$id) {
        console.log('❌ [PropertyFavoriteButton] No property ID')
        setIsFavorited(false)
        return
      }

      try {
        console.log(
          '🔍 [PropertyFavoriteButton] Making API call to check favorites...'
        )
        const params = new URLSearchParams({
          userId: userId,
          propertyId: property.$id,
        })

        console.log(
          '📤 [PropertyFavoriteButton] API URL:',
          `/api/favorites?${params}`
        )

        const response = await fetch(`/api/favorites?${params}`)
        console.log(
          '📡 [PropertyFavoriteButton] Response status:',
          response.status
        )

        const data = await response.json()
        console.log('📊 [PropertyFavoriteButton] API response:', data)

        const favorited = data.total > 0
        console.log(
          '✅ [PropertyFavoriteButton] Favorite status result:',
          favorited
        )
        setIsFavorited(favorited)
      } catch (error) {
        console.error(
          '❌ [PropertyFavoriteButton] Error checking favorite status:',
          error
        )
        setIsFavorited(false)
      }
    }

    checkFavoriteStatus()
  }, [userId, property?.$id])

  const handleToggleFavorite = async () => {
    console.log('🖱️ ========== FAVORITE BUTTON CLICKED ==========')
    console.log('📋 [PropertyFavoriteButton] Current state:', {
      isFavorited,
      loading,
      userId: userId,
      propertyId: property?.$id,
    })

    if (!userId) {
      console.log('❌ [PropertyFavoriteButton] No user ID - showing toast')
      toast.error('Please log in to add favorites')
      return
    }

    if (!property?.$id) {
      console.log('❌ [PropertyFavoriteButton] No property ID')
      toast.error('Invalid property')
      return
    }

    if (loading) {
      console.log(
        '⏳ [PropertyFavoriteButton] Already loading - ignoring click'
      )
      return
    }

    setLoading(true)
    console.log('🔄 [PropertyFavoriteButton] Starting toggle process...')

    try {
      if (isFavorited) {
        // Remove from favorites
        console.log('➖ [PropertyFavoriteButton] REMOVING from favorites...')

        // First find the favorite ID
        const findParams = new URLSearchParams({
          userId: userId,
          propertyId: property.$id,
        })

        console.log('🔍 [PropertyFavoriteButton] Finding favorite to delete...')
        const findResponse = await fetch(`/api/favorites?${findParams}`)
        console.log(
          '📡 [PropertyFavoriteButton] Find response status:',
          findResponse.status
        )

        const findData = await findResponse.json()
        console.log('📊 [PropertyFavoriteButton] Find response data:', findData)

        if (findData.total > 0) {
          const favoriteId = findData.favorites[0].$id
          console.log(
            '🗑️ [PropertyFavoriteButton] Deleting favorite:',
            favoriteId
          )

          const deleteResponse = await fetch(`/api/favorites/${favoriteId}`, {
            method: 'DELETE',
          })

          console.log(
            '📡 [PropertyFavoriteButton] Delete response status:',
            deleteResponse.status
          )
          console.log(
            '📡 [PropertyFavoriteButton] Delete response ok:',
            deleteResponse.ok
          )

          if (deleteResponse.ok) {
            setIsFavorited(false)
            toast.success('Removed from favorites')
            console.log(
              '✅ [PropertyFavoriteButton] Successfully removed favorite'
            )
          } else {
            const errorData = await deleteResponse.json()
            console.error(
              '❌ [PropertyFavoriteButton] Delete failed:',
              errorData
            )
            throw new Error(errorData.error || 'Failed to remove favorite')
          }
        } else {
          console.log('⚠️ [PropertyFavoriteButton] No favorite found to delete')
          setIsFavorited(false)
          toast.success('Removed from favorites')
        }
      } else {
        // Add to favorites
        console.log('➕ [PropertyFavoriteButton] ADDING to favorites...')

        const favoriteData = {
          userId: userId,
          propertyId: property.$id,
          category: 'wishlist',
        }

        console.log(
          '📦 [PropertyFavoriteButton] Sending data to API:',
          favoriteData
        )

        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(favoriteData),
        })

        console.log(
          '📡 [PropertyFavoriteButton] Add response status:',
          response.status
        )
        console.log('📡 [PropertyFavoriteButton] Add response ok:', response.ok)

        if (response.ok) {
          const result = await response.json()
          console.log(
            '✅ [PropertyFavoriteButton] Successfully added favorite:',
            result
          )
          setIsFavorited(true)
          toast.success('Added to favorites! ❤️')
        } else {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to add favorite')
        }
      }
    } catch {
      toast.error('Failed to update favorites')
    } finally {
      setLoading(false)
    }
  }

  const buttonClass = `relative ${
    isFavorited
      ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
      : 'hover:bg-gray-50'
  } transition-colors`

  return (
    <Button
      variant="outline"
      className={buttonClass}
      onClick={handleToggleFavorite}
      disabled={loading}
      size={size === 'sm' ? 'sm' : 'default'}
    >
      <Heart
        className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`}
      />

      {showText && (
        <span className="ml-2">
          {isFavorited ? 'Favorited' : 'Add to Favorites'}
        </span>
      )}

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-md">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
        </div>
      )}
    </Button>
  )
}
