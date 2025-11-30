// lib/services/premium-service.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { PlanType, PremiumListing } from '@/types'
import { ID, Models, Query } from 'appwrite'

import {
  DATABASE_ID,
  PREMIUM_COLLECTION_ID,
  serverDatabases,
} from '../appwrite-server'
import { PropertyService } from './property-service' // Add this import

export const PREMIUM_PLANS: Record<
  PlanType,
  {
    name: string
    description: string
    price: number
    duration: number
    priority: number
    features: string[]
  }
> = {
  featured: {
    name: 'Featured Listing',
    description: 'Get your property featured at the top of search results',
    price: 5000,
    duration: 7,
    priority: 8,
    features: [
      'Top of search results',
      'Featured badge',
      '7 days visibility',
      'Priority placement',
    ],
  },
  premium: {
    name: 'Premium Listing',
    description: 'Maximum visibility with premium placement',
    price: 15000,
    duration: 30,
    priority: 9,
    features: [
      'Top of search results',
      'Premium badge',
      '30 days visibility',
      'Highest priority',
      'Featured in premium section',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    description: 'For agencies with multiple premium listings',
    price: 50000,
    duration: 30,
    priority: 10,
    features: [
      'Multiple listings',
      'Agency branding',
      'Highest priority',
      'Dedicated support',
      'Analytics dashboard',
    ],
  },
}

export class PremiumListingService {
  // Create premium listing
  static async createPremiumListing(data: {
    propertyId: string
    agentId: string
    userId: string
    planType: PlanType
    paymentId: string
  }): Promise<PremiumListing> {
    const plan = PREMIUM_PLANS[data.planType]
    const startDate = new Date().toISOString()
    const endDate = new Date(
      Date.now() + plan.duration * 24 * 60 * 60 * 1000
    ).toISOString()

    const premiumListing = await serverDatabases.createDocument(
      DATABASE_ID,
      PREMIUM_COLLECTION_ID,
      ID.unique(),
      {
        propertyId: data.propertyId,
        agentId: data.agentId,
        userId: data.userId,
        planType: data.planType,
        status: 'active',
        startDate,
        endDate,
        priority: plan.priority,
        impressions: 0,
        clicks: 0,
        paymentId: data.paymentId,
        renewal: 'monthly',
      }
    )

    return this.mapToPremiumListing(premiumListing)
  }

  // Get active premium listings for search
  static async getActivePremiumListings(): Promise<PremiumListing[]> {
    const now = new Date().toISOString()

    const result = await serverDatabases.listDocuments(
      DATABASE_ID,
      PREMIUM_COLLECTION_ID,
      [
        Query.equal('status', 'active'),
        Query.greaterThan('endDate', now),
        Query.orderDesc('priority'),
        Query.orderDesc('startDate'),
      ]
    )

    return result.documents.map((doc) => this.mapToPremiumListing(doc))
  }

  // Check if property has active premium
  static async isPropertyPremium(propertyId: string): Promise<boolean> {
    const now = new Date().toISOString()

    const result = await serverDatabases.listDocuments(
      DATABASE_ID,
      PREMIUM_COLLECTION_ID,
      [
        Query.equal('propertyId', propertyId),
        Query.equal('status', 'active'),
        Query.greaterThan('endDate', now),
      ]
    )

    return result.total > 0
  }

  // Get agent's premium listings
  static async getAgentPremiumListings(
    agentId: string
  ): Promise<PremiumListing[]> {
    const now = new Date().toISOString()

    const result = await serverDatabases.listDocuments(
      DATABASE_ID,
      PREMIUM_COLLECTION_ID,
      [
        Query.equal('agentId', agentId),
        Query.equal('status', 'active'),
        Query.greaterThan('endDate', now),
        Query.orderDesc('priority'),
      ]
    )

    return result.documents.map((doc) => this.mapToPremiumListing(doc))
  }

  // Record impression
  static async recordImpression(premiumListingId: string): Promise<void> {
    const listing = await serverDatabases.getDocument(
      DATABASE_ID,
      PREMIUM_COLLECTION_ID,
      premiumListingId
    )

    await serverDatabases.updateDocument(
      DATABASE_ID,
      PREMIUM_COLLECTION_ID,
      premiumListingId,
      {
        impressions: ((listing as any).impressions || 0) + 1,
      }
    )
  }

  // Record click
  static async recordClick(premiumListingId: string): Promise<void> {
    const listing = await serverDatabases.getDocument(
      DATABASE_ID,
      PREMIUM_COLLECTION_ID,
      premiumListingId
    )

    await serverDatabases.updateDocument(
      DATABASE_ID,
      PREMIUM_COLLECTION_ID,
      premiumListingId,
      {
        clicks: ((listing as any).clicks || 0) + 1,
      }
    )
  }

  /**
   * Check for expired premium listings and update their status
   */
  static async processExpiredListings(): Promise<{ expired: number }> {
    try {
      const now = new Date().toISOString()

      // Find active listings that have expired
      const expiredListings = await serverDatabases.listDocuments(
        DATABASE_ID,
        PREMIUM_COLLECTION_ID,
        [Query.equal('status', 'active'), Query.lessThanEqual('endDate', now)]
      )

      // Update expired listings
      const updatePromises = expiredListings.documents.map((listing) =>
        serverDatabases.updateDocument(
          DATABASE_ID,
          PREMIUM_COLLECTION_ID,
          listing.$id,
          {
            status: 'expired',
          }
        )
      )

      await Promise.all(updatePromises)

      return { expired: expiredListings.total }
    } catch (error) {
      console.error('Error processing expired listings:', error)
      throw error
    }
  }

  /**
   * Sync all premium listings with property featured status
   * This should be run periodically to ensure consistency
   */
  static async syncAllPremiumProperties() {
    try {
      const activeListings = await this.getActivePremiumListings()

      // Get unique property IDs from active listings
      const premiumPropertyIds = [
        ...new Set(activeListings.map((listing) => listing.propertyId)),
      ]

      // Sync each property
      const syncPromises = premiumPropertyIds.map((propertyId) =>
        PropertyService.syncPropertyWithPremium(propertyId)
      )

      const results = await Promise.allSettled(syncPromises)
      const successful = results.filter(
        (result) => result.status === 'fulfilled'
      ).length

      return {
        successful,
        total: premiumPropertyIds.length,
      }
    } catch (error) {
      console.error('Error syncing all premium properties:', error)
      throw error
    }
  }

  /**
   * Sync premium status with property featuring
   */
  static async syncPremiumPropertyStatus(userId: string) {
    try {
      const activeListings = await this.getAgentPremiumListings(userId)
      const hasPremium = activeListings.length > 0

      if (hasPremium) {
        // Get all properties for this user and feature them
        await PropertyService.featureAllUserProperties(userId)
      }

      return hasPremium
    } catch (error) {
      console.error('Error syncing premium property status:', error)
      throw error
    }
  }

  // Helper method to map AppWrite document to PremiumListing
  private static mapToPremiumListing(doc: Models.Document): PremiumListing {
    // Use type assertion for document properties
    const typedDoc = doc as any

    return {
      $id: doc.$id,
      $createdAt: doc.$createdAt,
      $updatedAt: doc.$updatedAt,
      propertyId: typedDoc.propertyId,
      agentId: typedDoc.agentId,
      userId: typedDoc.userId,
      planType: typedDoc.planType,
      status: typedDoc.status,
      startDate: typedDoc.startDate,
      endDate: typedDoc.endDate,
      priority: typedDoc.priority,
      impressions: typedDoc.impressions || 0,
      clicks: typedDoc.clicks || 0,
      paymentId: typedDoc.paymentId,
      renewal: typedDoc.renewal,
    }
  }
}
