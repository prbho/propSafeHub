// lib/services/property-service.ts
import { Query } from 'appwrite'

import {
  DATABASE_ID,
  databases,
  PROPERTIES_COLLECTION_ID,
} from '@/lib/appwrite'

import { PremiumListingService } from './premium-service'

export class PropertyService {
  /**
   * Update a property's isFeatured status
   */
  static async updateFeaturedStatus(propertyId: string, isFeatured: boolean) {
    try {
      const updatedProperty = await databases.updateDocument(
        DATABASE_ID,
        PROPERTIES_COLLECTION_ID,
        propertyId,
        {
          isFeatured,
          lastUpdated: new Date().toISOString(),
        }
      )

      return updatedProperty
    } catch (error) {
      console.error('Error updating property featured status:', error)
      throw error
    }
  }

  /**
   * Get all properties for a user/agent
   */
  static async getUserProperties(userId: string) {
    try {
      const properties = await databases.listDocuments(
        DATABASE_ID,
        PROPERTIES_COLLECTION_ID,
        [Query.equal('agentId', userId), Query.equal('isActive', true)]
      )

      return properties.documents
    } catch (error) {
      console.error('Error fetching user properties:', error)
      throw error
    }
  }

  /**
   * Update all user properties to featured when they become premium
   */
  static async featureAllUserProperties(userId: string) {
    try {
      const userProperties = await this.getUserProperties(userId)

      const updatePromises = userProperties.map((property) =>
        this.updateFeaturedStatus(property.$id, true)
      )

      const results = await Promise.allSettled(updatePromises)

      const successful = results.filter(
        (result) => result.status === 'fulfilled'
      ).length
      const failed = results.filter(
        (result) => result.status === 'rejected'
      ).length

      return {
        successful,
        failed,
        total: userProperties.length,
      }
    } catch (error) {
      console.error('Error featuring all user properties:', error)
      throw error
    }
  }

  /**
   * Sync property featured status with premium listings
   * This ensures properties are featured only when they have active premium
   */
  static async syncPropertyWithPremium(propertyId: string) {
    try {
      const hasActivePremium =
        await PremiumListingService.isPropertyPremium(propertyId)

      // Update featured status based on premium status
      await this.updateFeaturedStatus(propertyId, hasActivePremium)

      return hasActivePremium
    } catch (error) {
      console.error('Error syncing property with premium:', error)
      throw error
    }
  }

  /**
   * Sync all user properties with their premium status
   */
  static async syncUserPropertiesPremiumStatus(userId: string) {
    try {
      const userProperties = await this.getUserProperties(userId)

      const syncPromises = userProperties.map((property) =>
        this.syncPropertyWithPremium(property.$id)
      )

      const results = await Promise.allSettled(syncPromises)
      const successful = results.filter(
        (result) => result.status === 'fulfilled'
      ).length

      return {
        successful,
        total: userProperties.length,
      }
    } catch (error) {
      console.error('Error syncing user properties premium status:', error)
      throw error
    }
  }

  /**
   * Get property by ID
   */
  static async getPropertyById(propertyId: string) {
    try {
      const property = await databases.getDocument(
        DATABASE_ID,
        PROPERTIES_COLLECTION_ID,
        propertyId
      )
      return property
    } catch (error) {
      console.error('Error fetching property:', error)
      throw error
    }
  }
}

