import { Location } from './locationService'

export const clientLocationService = {
  async searchLocations(
    query: string,
    limit: number = 10
  ): Promise<Location[]> {
    try {
      const response = await fetch(
        `/api/locations/search?q=${encodeURIComponent(query)}&limit=${limit}`
      )
      if (!response.ok) throw new Error('Failed to search locations')
      return await response.json()
    } catch (error) {
      console.error('Error searching locations:', error)
      return []
    }
  },

  async getPopularLocations(limit: number = 8): Promise<Location[]> {
    try {
      const response = await fetch(`/api/locations/popular?limit=${limit}`)
      if (!response.ok) throw new Error('Failed to fetch popular locations')
      return await response.json()
    } catch (error) {
      console.error('Error fetching popular locations:', error)
      return []
    }
  },

  async getFavoredLocations(limit: number = 8): Promise<Location[]> {
    try {
      const response = await fetch(`/api/locations/favored?limit=${limit}`)
      if (!response.ok) throw new Error('Failed to fetch favored locations')
      return await response.json()
    } catch (error) {
      console.error('Error fetching favored locations:', error)
      return []
    }
  },

  async getStates(): Promise<Location[]> {
    try {
      const response = await fetch('/api/locations/states')
      if (!response.ok) throw new Error('Failed to fetch states')
      return await response.json()
    } catch (error) {
      console.error('Error fetching states:', error)
      return []
    }
  },

  async toggleFavored(locationId: string, favored: boolean): Promise<void> {
    try {
      const response = await fetch('/api/locations/favored', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locationId, favored }),
      })
      if (!response.ok) throw new Error('Failed to toggle favored status')
    } catch (error) {
      console.error('Error toggling favored status:', error)
      throw error
    }
  },
}
