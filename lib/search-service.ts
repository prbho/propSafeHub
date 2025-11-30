// lib/search-service.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Query } from 'appwrite'

import {
  DATABASE_ID,
  PROPERTIES_COLLECTION_ID,
  serverDatabases,
} from './appwrite-server'
import { PremiumListingService } from './services/premium-service'

export class SearchService {
  static async searchProperties(
    filters: any = {},
    page: number = 1,
    limit: number = 20
  ) {
    try {
      // Get premium properties first
      const premiumProperties = await this.getPremiumProperties(filters)

      // Calculate remaining spots for regular properties
      const remainingLimit = limit - premiumProperties.length

      // Get regular properties if there's space
      const regularProperties =
        remainingLimit > 0
          ? await this.getRegularProperties(filters, page, remainingLimit)
          : []

      // Combine results
      const allProperties = [...premiumProperties, ...regularProperties]

      return {
        properties: allProperties,
        total: allProperties.length,
        hasMore:
          regularProperties.length === remainingLimit && remainingLimit > 0,
        premiumCount: premiumProperties.length,
      }
    } catch (error) {
      console.error('Search error:', error)
      throw error
    }
  }

  private static async getPremiumProperties(filters: any) {
    const activePremiumListings =
      await PremiumListingService.getActivePremiumListings()

    if (activePremiumListings.length === 0) return []

    const premiumPropertyIds = activePremiumListings.map(
      (listing) => listing.propertyId
    )

    // Build filters for premium properties
    const queryFilters = this.buildFilters(filters)
    queryFilters.push(Query.equal('$id', premiumPropertyIds))

    const result = await serverDatabases.listDocuments(
      DATABASE_ID,
      PROPERTIES_COLLECTION_ID,
      queryFilters
    )

    // Record impressions for analytics
    activePremiumListings.forEach((listing) => {
      PremiumListingService.recordImpression(listing.$id).catch(console.error)
    })

    // Return properties in premium priority order
    return premiumPropertyIds
      .map((id) => result.documents.find((doc) => doc.$id === id))
      .filter(Boolean)
  }

  private static async getRegularProperties(
    filters: any,
    page: number,
    limit: number
  ) {
    const offset = (page - 1) * limit
    const queryFilters = this.buildFilters(filters)

    queryFilters.push(
      Query.offset(offset),
      Query.limit(limit),
      Query.orderDesc('$createdAt')
    )

    const result = await serverDatabases.listDocuments(
      DATABASE_ID,
      PROPERTIES_COLLECTION_ID,
      queryFilters
    )

    return result.documents
  }

  private static buildFilters(filters: any) {
    const queryFilters = []

    if (filters.city) queryFilters.push(Query.equal('city', filters.city))
    if (filters.minPrice)
      queryFilters.push(
        Query.greaterThanEqual('price', Number(filters.minPrice))
      )
    if (filters.maxPrice)
      queryFilters.push(Query.lessThanEqual('price', Number(filters.maxPrice)))
    if (filters.propertyType)
      queryFilters.push(Query.equal('propertyType', filters.propertyType))
    if (filters.bedrooms)
      queryFilters.push(Query.equal('bedrooms', Number(filters.bedrooms)))
    if (filters.bathrooms)
      queryFilters.push(Query.equal('bathrooms', Number(filters.bathrooms)))

    // Only show active properties
    queryFilters.push(Query.equal('status', 'active'))

    return queryFilters
  }
}
