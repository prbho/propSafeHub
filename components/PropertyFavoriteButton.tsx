'use client'

import { useEffect, useState } from 'react'
import { Property } from '@/types'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { favoritesAPI } from '@/lib/favorites'

interface PropertyFavoriteButtonProps {
  property: Property
  userId?: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export default function PropertyFavoriteButton({
  property,
  userId,
  size = 'md',
  showText = false,
}: PropertyFavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    const checkFavoriteStatus = async () => {
      if (!userId || !property?.$id) {
        setIsFavorited(false)
        return
      }

      try {
        const favorited = await favoritesAPI.isPropertyFavorited(
          userId,
          property.$id
        )

        if (!cancelled) {
          setIsFavorited(favorited)
        }
      } catch {
        if (!cancelled) {
          setIsFavorited(false)
        }
      }
    }

    checkFavoriteStatus()

    return () => {
      cancelled = true
    }
  }, [property?.$id, userId])

  const handleToggleFavorite = async () => {
    if (!userId) {
      toast.error('Please log in to add favorites')
      return
    }

    if (!property?.$id || loading) {
      return
    }

    setLoading(true)

    try {
      if (isFavorited) {
        await favoritesAPI.removeFavoriteByProperty(userId, property.$id)
        setIsFavorited(false)
        toast.success('Removed from favorites')
      } else {
        await favoritesAPI.addToFavorite({
          userId,
          propertyId: property.$id,
          category: 'wishlist',
        })
        setIsFavorited(true)
        toast.success('Added to favorites!')
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
