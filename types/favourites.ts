/* eslint-disable @typescript-eslint/no-explicit-any */

// Define types based on your interfaces
export interface FavoriteDocument {
  $id: string
  userId: string
  propertyId: string
  addedAt: string // Note: 'addedAt' not 'addedAtt'
  notes?: string
  category?: 'wishlist' | 'tour' | 'buy' | 'rent' | 'investment'
  $createdAt: string
  $updatedAt: string
  $sequence: number
  $collectionId: string
  $databaseId: string
  $permissions: string[]

  // Appwrite DefaultDocument fields (may exist):
  [key: string]: any // Add index signature to accept any additional fields
}
