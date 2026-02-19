import { CreateFavoriteDto, UpdateFavoriteDto } from '@/types'

const API_BASE = '/api/favorites'
const FAVORITE_STATUS_TTL_MS = 15000

type FavoriteStatusCacheEntry = {
  value: boolean
  favoriteId?: string
  expiresAt: number
}

const favoriteStatusCache = new Map<string, FavoriteStatusCacheEntry>()
const inFlightFavoriteStatus = new Map<
  string,
  Promise<{ value: boolean; favoriteId?: string }>
>()

function statusKey(userId: string, propertyId: string) {
  return `${userId}:${propertyId}`
}

function readStatusCache(userId: string, propertyId: string) {
  const key = statusKey(userId, propertyId)
  const cached = favoriteStatusCache.get(key)

  if (!cached) return null
  if (cached.expiresAt <= Date.now()) {
    favoriteStatusCache.delete(key)
    return null
  }

  return cached
}

function writeStatusCache(
  userId: string,
  propertyId: string,
  value: boolean,
  favoriteId?: string
) {
  favoriteStatusCache.set(statusKey(userId, propertyId), {
    value,
    favoriteId,
    expiresAt: Date.now() + FAVORITE_STATUS_TTL_MS,
  })
}

async function parseError(response: Response, fallback: string) {
  try {
    const data = await response.json()
    return data?.error || fallback
  } catch {
    return fallback
  }
}

export const favoritesAPI = {
  async getFavorites(userId: string, category?: string) {
    const params = new URLSearchParams({ userId })
    if (category) params.append('category', category)

    const response = await fetch(`${API_BASE}?${params}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch favorites: ${response.status}`)
    }

    return response.json()
  },

  async isPropertyFavorited(userId: string, propertyId: string) {
    const cached = readStatusCache(userId, propertyId)
    if (cached) {
      return cached.value
    }

    const key = statusKey(userId, propertyId)
    const pending = inFlightFavoriteStatus.get(key)
    if (pending) {
      const result = await pending
      return result.value
    }

    const request = (async () => {
      const params = new URLSearchParams({ userId, propertyId })
      const response = await fetch(`${API_BASE}?${params}`)

      if (!response.ok) {
        throw new Error(`Failed to check favorite status: ${response.status}`)
      }

      const data = await response.json()
      const favorite = Array.isArray(data?.favorites) ? data.favorites[0] : null
      const result = { value: (data?.total || 0) > 0, favoriteId: favorite?.$id }

      writeStatusCache(userId, propertyId, result.value, result.favoriteId)
      return result
    })()

    inFlightFavoriteStatus.set(key, request)

    try {
      const result = await request
      return result.value
    } finally {
      inFlightFavoriteStatus.delete(key)
    }
  },

  async addToFavorite(favoriteData: CreateFavoriteDto) {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(favoriteData),
    })

    if (!response.ok) {
      throw new Error(
        await parseError(
          response,
          `Failed to add to favorites: ${response.status}`
        )
      )
    }

    const result = await response.json()

    if (favoriteData.userId && favoriteData.propertyId) {
      writeStatusCache(
        favoriteData.userId,
        favoriteData.propertyId,
        true,
        result?.$id
      )
    }

    return result
  },

  async createLeadFromFavorite(
    userId: string,
    propertyId: string,
    notes?: string
  ) {
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

    if (!response.ok) {
      throw new Error(
        await parseError(response, `Failed to create lead: ${response.status}`)
      )
    }

    return response.json()
  },

  async getFavoriteLeads(agentId: string, userId?: string) {
    const params = new URLSearchParams({ agentId })
    if (userId) {
      params.append('userId', userId)
    }

    const response = await fetch(`/api/favorites/leads?${params}`)
    if (!response.ok) {
      throw new Error(
        await parseError(
          response,
          `Failed to get favorite leads: ${response.status}`
        )
      )
    }

    return response.json()
  },

  async updateFavorite(favoriteId: string, updateData: UpdateFavoriteDto) {
    const response = await fetch(`${API_BASE}/${favoriteId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    })

    if (!response.ok) {
      throw new Error(
        await parseError(response, `Failed to update favorite: ${response.status}`)
      )
    }

    return response.json()
  },

  async removeFromFavorite(favoriteId: string) {
    const response = await fetch(`/api/favorites/remove?favoriteId=${favoriteId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(
        await parseError(
          response,
          `Failed to remove from favorites: ${response.status}`
        )
      )
    }

    return response.json()
  },

  async removeFavoriteByProperty(userId: string, propertyId: string) {
    const cached = readStatusCache(userId, propertyId)
    let favoriteId = cached?.favoriteId

    if (!favoriteId) {
      const params = new URLSearchParams({ userId, propertyId })
      const response = await fetch(`${API_BASE}?${params}`)

      if (!response.ok) {
        throw new Error(`Failed to find favorite: ${response.status}`)
      }

      const data = await response.json()
      if ((data?.total || 0) === 0) {
        throw new Error('Favorite not found')
      }

      favoriteId = data.favorites[0].$id
    }

    if (!favoriteId) {
      throw new Error('Favorite not found')
    }

    const result = await this.removeFromFavorite(favoriteId)
    writeStatusCache(userId, propertyId, false)
    return result
  },
}
