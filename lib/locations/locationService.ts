// lib/locations/locationService.ts
import { Client, Databases, Models, Query } from 'node-appwrite'

export interface Location {
  $id: string
  name: string
  type: 'state' | 'lga' | 'area'
  state: string
  lga?: string
  latitude?: number
  longitude?: number
  altitude?: number
  isPopular?: boolean
  isFavored?: boolean
  searchTerms?: string[]
  population?: number
  description?: string
}

// Appwrite document type for locations
interface LocationDocument extends Models.Document, Location {}

export class LocationService {
  // Use your actual database and collection IDs
  private static get databaseId(): string {
    return process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'default_fallback_id'
  }
  private static get collectionId(): string {
    return (
      process.env.NEXT_PUBLIC_APPWRITE_LOCATIONS_COLLECTION_ID || 'locations'
    )
  }

  // Create Appwrite client at runtime (not module load time)
  private static createAppwriteClient(): Databases {
    const client = new Client()

    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
    const apiKey = process.env.APPWRITE_API_KEY

    // Check if we have all required environment variables
    if (!endpoint || !projectId || !apiKey) {
      const missing = []
      if (!endpoint) missing.push('NEXT_PUBLIC_APPWRITE_ENDPOINT')
      if (!projectId) missing.push('NEXT_PUBLIC_APPWRITE_PROJECT_ID')
      if (!apiKey) missing.push('APPWRITE_API_KEY')

      console.error('❌ Missing Appwrite environment variables:', missing)
      throw new Error(
        `Missing Appwrite environment variables: ${missing.join(', ')}`
      )
    }

    client.setEndpoint(endpoint).setProject(projectId).setKey(apiKey)

    return new Databases(client)
  }

  private static validateConfig(): boolean {
    if (!this.databaseId || !this.collectionId) {
      console.error('❌ Missing database or collection ID')
      return false
    }
    return true
  }

  // Search locations by query
  static async searchLocations(
    query: string,
    limit: number = 10
  ): Promise<Location[]> {
    try {
      if (!this.validateConfig()) {
        return []
      }

      // Create client at runtime when the method is called
      const databases = this.createAppwriteClient()

      const response = await databases.listDocuments<LocationDocument>(
        this.databaseId,
        this.collectionId,
        [
          Query.search('name', query),
          Query.or([
            Query.equal('type', 'area'),
            Query.equal('type', 'lga'),
            Query.equal('type', 'state'),
          ]),
          Query.limit(limit),
          Query.orderAsc('name'),
        ]
      )

      return response.documents
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('❌ Error searching locations:', errorMessage)
      return []
    }
  }

  // Get popular locations
  static async getPopularLocations(limit: number = 8): Promise<Location[]> {
    try {
      if (!this.validateConfig()) {
        return []
      }

      const databases = this.createAppwriteClient()

      const response = await databases.listDocuments<LocationDocument>(
        this.databaseId,
        this.collectionId,
        [
          Query.equal('isPopular', true),
          Query.limit(limit),
          Query.orderAsc('name'),
        ]
      )
      return response.documents
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Error fetching popular locations:', errorMessage)
      return []
    }
  }

  // Get favored locations (user favorites)
  static async getFavoredLocations(limit: number = 8): Promise<Location[]> {
    try {
      if (!this.validateConfig()) {
        return []
      }

      const databases = this.createAppwriteClient()

      const response = await databases.listDocuments<LocationDocument>(
        this.databaseId,
        this.collectionId,
        [
          Query.equal('isFavored', true),
          Query.limit(limit),
          Query.orderAsc('name'),
        ]
      )
      return response.documents
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Error fetching favored locations:', errorMessage)
      return []
    }
  }

  // Get all states
  static async getStates(): Promise<Location[]> {
    try {
      if (!this.validateConfig()) {
        return []
      }

      const databases = this.createAppwriteClient()

      const response = await databases.listDocuments<LocationDocument>(
        this.databaseId,
        this.collectionId,
        [Query.equal('type', 'state'), Query.orderAsc('name')]
      )
      return response.documents
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Error fetching states:', errorMessage)
      return []
    }
  }

  // Get LGAs by state
  static async getLGAsByState(state: string): Promise<Location[]> {
    try {
      if (!this.validateConfig()) {
        return []
      }

      const databases = this.createAppwriteClient()

      const response = await databases.listDocuments<LocationDocument>(
        this.databaseId,
        this.collectionId,
        [
          Query.equal('type', 'lga'),
          Query.equal('state', state),
          Query.orderAsc('name'),
        ]
      )
      return response.documents
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Error fetching LGAs:', errorMessage)
      return []
    }
  }

  // Get areas by LGA and state
  static async getAreasByLGA(state: string, lga: string): Promise<Location[]> {
    try {
      if (!this.validateConfig()) {
        return []
      }

      const databases = this.createAppwriteClient()

      const response = await databases.listDocuments<LocationDocument>(
        this.databaseId,
        this.collectionId,
        [
          Query.equal('type', 'area'),
          Query.equal('state', state),
          Query.equal('lga', lga),
          Query.orderAsc('name'),
        ]
      )
      return response.documents
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Error fetching areas:', errorMessage)
      return []
    }
  }

  // Get locations near coordinates (for map features)
  static async getLocationsNearby(
    latitude: number,
    longitude: number,
    radiusKm: number = 10,
    limit: number = 20
  ): Promise<Location[]> {
    try {
      if (!this.validateConfig()) {
        return []
      }

      const databases = this.createAppwriteClient()

      // This is a simplified approach - for production, consider using
      // a geospatial database or Appwrite's geospatial queries when available
      const allLocations = await databases.listDocuments<LocationDocument>(
        this.databaseId,
        this.collectionId,
        [Query.limit(1000)]
      )

      return allLocations.documents
        .filter(
          (location) =>
            location.latitude &&
            location.longitude &&
            this.calculateDistance(
              latitude,
              longitude,
              location.latitude,
              location.longitude
            ) <= radiusKm
        )
        .slice(0, limit)
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Error fetching nearby locations:', errorMessage)
      return []
    }
  }

  // Calculate distance between two coordinates using Haversine formula
  private static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371 // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1)
    const dLon = this.deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180)
  }

  // Toggle favored status
  static async toggleFavored(
    locationId: string,
    favored: boolean
  ): Promise<void> {
    try {
      if (!this.validateConfig()) {
        throw new Error('Location service not initialized')
      }

      const databases = this.createAppwriteClient()

      await databases.updateDocument(
        this.databaseId,
        this.collectionId,
        locationId,
        { isFavored: favored }
      )
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Error toggling favored status:', errorMessage)
      throw error
    }
  }

  // Get location by ID
  static async getLocationById(locationId: string): Promise<Location | null> {
    try {
      if (!this.validateConfig()) {
        return null
      }

      const databases = this.createAppwriteClient()

      const response = await databases.getDocument<LocationDocument>(
        this.databaseId,
        this.collectionId,
        locationId
      )
      return response
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Error fetching location by ID:', errorMessage)
      return null
    }
  }

  // Get all locations (with pagination)
  static async getAllLocations(
    page: number = 1,
    limit: number = 50
  ): Promise<{ locations: Location[]; total: number }> {
    try {
      if (!this.validateConfig()) {
        return { locations: [], total: 0 }
      }

      const databases = this.createAppwriteClient()

      const offset = (page - 1) * limit
      const response = await databases.listDocuments<LocationDocument>(
        this.databaseId,
        this.collectionId,
        [Query.limit(limit), Query.offset(offset), Query.orderAsc('name')]
      )

      return {
        locations: response.documents,
        total: response.total,
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Error fetching all locations:', errorMessage)
      return { locations: [], total: 0 }
    }
  }

  // Check if location service is available
  static isAvailable(): boolean {
    try {
      const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
      const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
      const apiKey = process.env.APPWRITE_API_KEY

      return !!(endpoint && projectId && apiKey)
    } catch {
      return false
    }
  }

  // Get service status for debugging
  static getServiceStatus(): { available: boolean; reason?: string } {
    try {
      const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
      const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
      const apiKey = process.env.APPWRITE_API_KEY

      if (endpoint && projectId && apiKey) {
        return { available: true }
      }

      const missing = []
      if (!endpoint) missing.push('NEXT_PUBLIC_APPWRITE_ENDPOINT')
      if (!projectId) missing.push('NEXT_PUBLIC_APPWRITE_PROJECT_ID')
      if (!apiKey) missing.push('APPWRITE_API_KEY')

      return {
        available: false,
        reason: `Missing environment variables: ${missing.join(', ')}`,
      }
    } catch {
      return {
        available: false,
        reason: 'Error checking service status',
      }
    }
  }
}
