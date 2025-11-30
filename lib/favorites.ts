// lib/favorites.ts

import { CreateFavoriteDto, UpdateFavoriteDto } from '@/types'

const API_BASE = '/api/favorites'

export const favoritesAPI = {
  // Get user's favorites
  async getFavorites(userId: string, category?: string) {
    console.log(
      '🔍 [favoritesAPI] Getting favorites for user:',
      userId,
      'category:',
      category
    )
    const params = new URLSearchParams({ userId })
    if (category) params.append('category', category)

    try {
      const response = await fetch(`${API_BASE}?${params}`)
      console.log('📡 [favoritesAPI] Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(
          '❌ [favoritesAPI] Failed to fetch favorites:',
          response.status,
          errorText
        )
        throw new Error(`Failed to fetch favorites: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ [favoritesAPI] Favorites data received:', data)
      return data
    } catch (error) {
      console.error(
        '❌ [favoritesAPI] Network error fetching favorites:',
        error
      )
      throw error
    }
  },

  // Check if property is favorited
  async isPropertyFavorited(userId: string, propertyId: string) {
    console.log('🔍 [favoritesAPI] Checking if property is favorited:', {
      userId,
      propertyId,
    })
    const params = new URLSearchParams({ userId, propertyId })

    try {
      const response = await fetch(`${API_BASE}?${params}`)
      console.log(
        '📡 [favoritesAPI] Favorite check response status:',
        response.status
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error(
          '❌ [favoritesAPI] Failed to check favorite status:',
          response.status,
          errorText
        )
        throw new Error(`Failed to check favorite status: ${response.status}`)
      }

      const data = await response.json()
      console.log(
        '✅ [favoritesAPI] Favorite check result:',
        data.total > 0,
        'total:',
        data.total
      )
      return data.total > 0
    } catch (error) {
      console.error('❌ [favoritesAPI] Network error checking favorite:', error)
      throw error
    }
  },

  // Add to favorites
  async addToFavorite(favoriteData: CreateFavoriteDto) {
    console.log('➕ [favoritesAPI] Adding to favorites:', favoriteData)

    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(favoriteData),
      })

      console.log(
        '📡 [favoritesAPI] Add favorite response status:',
        response.status
      )

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Unknown error' }))
        console.error(
          '❌ [favoritesAPI] Failed to add to favorites:',
          response.status,
          errorData
        )
        throw new Error(
          errorData.error || `Failed to add to favorites: ${response.status}`
        )
      }

      const result = await response.json()
      console.log('✅ [favoritesAPI] Successfully added to favorites:', result)
      return result
    } catch (error) {
      console.error('❌ [favoritesAPI] Network error adding favorite:', error)
      throw error
    }
  },

  async createLeadFromFavorite(
    userId: string,
    propertyId: string,
    notes?: string
  ) {
    console.log('🎯 [favoritesAPI] Creating lead from favorite:', {
      userId,
      propertyId,
      notes,
    })

    try {
      const response = await fetch('/api/favorites/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          propertyId,
          notes,
        }),
      })

      console.log(
        '📡 [favoritesAPI] Create lead response status:',
        response.status
      )

      if (!response.ok) {
        let errorMessage = `Failed to create lead: ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          errorMessage = response.statusText || errorMessage
        }
        console.error('❌ [favoritesAPI] Failed to create lead:', errorMessage)
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log('✅ [favoritesAPI] Successfully created lead:', result)
      return result
    } catch (error) {
      console.error('❌ [favoritesAPI] Network error creating lead:', error)
      throw error
    }
  },

  // Get favorite leads for agent
  async getFavoriteLeads(agentId: string, userId?: string) {
    console.log('🔍 [favoritesAPI] Getting favorite leads for agent:', agentId)

    const params = new URLSearchParams({ agentId })
    if (userId) {
      params.append('userId', userId)
    }

    try {
      const response = await fetch(`/api/favorites/leads?${params}`)
      console.log(
        '📡 [favoritesAPI] Get favorite leads response status:',
        response.status
      )

      if (!response.ok) {
        let errorMessage = `Failed to get favorite leads: ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          errorMessage = response.statusText || errorMessage
        }
        console.error(
          '❌ [favoritesAPI] Failed to get favorite leads:',
          errorMessage
        )
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('✅ [favoritesAPI] Favorite leads data received:', data)
      return data
    } catch (error) {
      console.error(
        '❌ [favoritesAPI] Network error getting favorite leads:',
        error
      )
      throw error
    }
  },
  // Update favorite
  async updateFavorite(favoriteId: string, updateData: UpdateFavoriteDto) {
    console.log('✏️ [favoritesAPI] Updating favorite:', favoriteId, updateData)

    try {
      const response = await fetch(`${API_BASE}/${favoriteId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      console.log(
        '📡 [favoritesAPI] Update favorite response status:',
        response.status
      )

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Unknown error' }))
        console.error(
          '❌ [favoritesAPI] Failed to update favorite:',
          response.status,
          errorData
        )
        throw new Error(
          errorData.error || `Failed to update favorite: ${response.status}`
        )
      }

      const result = await response.json()
      console.log('✅ [favoritesAPI] Successfully updated favorite:', result)
      return result
    } catch (error) {
      console.error('❌ [favoritesAPI] Network error updating favorite:', error)
      throw error
    }
  },

  // Remove from favorites
  async removeFromFavorite(favoriteId: string) {
    console.log('🗑️ [favoritesAPI] Removing favorite:', favoriteId)

    try {
      // Use the query parameter approach
      const response = await fetch(
        `/api/favorites/remove?favoriteId=${favoriteId}`,
        {
          method: 'DELETE',
        }
      )

      console.log(
        '📡 [favoritesAPI] Remove favorite response status:',
        response.status
      )

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Unknown error' }))
        console.error(
          '❌ [favoritesAPI] Failed to remove from favorites:',
          response.status,
          errorData
        )
        throw new Error(
          errorData.error ||
            `Failed to remove from favorites: ${response.status}`
        )
      }

      const result = await response.json()
      console.log('✅ [favoritesAPI] Successfully removed favorite:', result)
      return result
    } catch (error) {
      console.error('❌ [favoritesAPI] Network error removing favorite:', error)
      throw error
    }
  },

  // Remove favorite by user and property
  async removeFavoriteByProperty(userId: string, propertyId: string) {
    console.log('🔍 [favoritesAPI] Removing favorite by property:', {
      userId,
      propertyId,
    })

    try {
      // First get the favorite ID
      const params = new URLSearchParams({ userId, propertyId })
      const response = await fetch(`${API_BASE}?${params}`)

      console.log(
        '📡 [favoritesAPI] Find favorite response status:',
        response.status
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error(
          '❌ [favoritesAPI] Failed to find favorite:',
          response.status,
          errorText
        )
        throw new Error(`Failed to find favorite: ${response.status}`)
      }

      const data = await response.json()
      console.log('📋 [favoritesAPI] Found favorites:', data)

      if (data.total === 0) {
        console.log('❌ [favoritesAPI] Favorite not found')
        throw new Error('Favorite not found')
      }

      const favoriteId = data.favorites[0].$id
      console.log('🎯 [favoritesAPI] Found favorite ID to remove:', favoriteId)

      return await this.removeFromFavorite(favoriteId)
    } catch (error) {
      console.error(
        '❌ [favoritesAPI] Error removing favorite by property:',
        error
      )
      throw error
    }
  },
}
