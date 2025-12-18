// lib/appwrite-server.ts - FIXED VERSION
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Account,
  Client,
  Databases,
  ID,
  Query,
  Storage,
  Users,
} from 'node-appwrite'

// Create UNINITIALIZED client
const client = new Client()

// Environment variables - NO VALIDATION HERE
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || ''
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || ''
const apiKey = process.env.APPWRITE_API_KEY || ''

// DON'T initialize or validate at the top level
// We'll do it lazily when actually needed

// Export uninitialized clients
export const serverDatabases = new Databases(client)
export const serverAccount = new Account(client)
export const serverUsers = new Users(client)
export const serverStorage = new Storage(client)

export { ID, Query }

// Database IDs - with safe fallbacks (not throwing !)
export const DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'default-db-id'
export const USERS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_USERS_TABLE_ID || 'users'
export const PROPERTIES_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_PROPERTIES_TABLE_ID || 'properties'
export const AGENTS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_AGENTS_TABLE_ID || 'agents'
export const FAVORITES_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_FAVORITES_TABLE_ID || 'favorites'
export const REVIEWS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_REVIEWS_TABLE_ID || 'reviews'
export const MESSAGES_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_TABLE_ID || 'messages'
export const PAYMENT_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_PAYMENT_TABLE_ID || 'payments'
export const PREMIUM_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_PREMIUM_TABLE_ID || 'premium'
export const PAYMENTPLANS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_PAYMENTPLANS_TABLE_ID || 'payment-plans'
export const MORTGAGECALCULATIONS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_MORTGAGECALCULATIONS_TABLE_ID ||
  'mortgage-calculations'
export const LOCATIONS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_LOCATIONS_TABLE_ID || 'locations'
export const SCHEDULE_VIEWING_COLLECTION_ID =
  process.env.NEXT_PUBLIC_SCHEDULE_VIEWING_COLLECTION_ID || 'schedule-viewing'
export const NOTIFICATIONS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_NOTIFICATIONS_COLLECTION_ID || 'notifications'
export const LEADS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_LEADS_COLLECTION_ID || 'leads'

// Storage
export const STORAGE_BUCKET_ID =
  process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID || 'storage'

// Helper function to initialize Appwrite ONLY when needed
function initializeIfNeeded(): boolean {
  // Check if already initialized
  if (client.config.endpoint && client.config.project && client.config.key) {
    return true
  }

  // Don't initialize during build time
  const isBuildTime =
    typeof window === 'undefined' &&
    process.env.NODE_ENV === 'production' &&
    !process.env.RESEND_API_KEY

  if (isBuildTime) {
    // During build, skip initialization but don't throw
    return false
  }

  // Only validate when actually trying to use Appwrite
  if (!endpoint || !projectId || !apiKey) {
    console.warn('⚠️ Appwrite not configured - some features may not work')
    return false
  }

  try {
    client.setEndpoint(endpoint).setProject(projectId).setKey(apiKey)
    return true
  } catch (error) {
    console.error('❌ Failed to initialize Appwrite:', error)
    return false
  }
}

// Wrapper functions that initialize on demand

export const databases = {
  // Fix createDocument to accept custom fields
  createDocument: async (
    databaseId: string,
    collectionId: string,
    documentId: string,
    data: any,
    permissions?: string[]
  ) => {
    if (!initializeIfNeeded()) {
      throw new Error('Appwrite not configured or not available during build')
    }
    return serverDatabases.createDocument(
      databaseId,
      collectionId,
      documentId,
      data,
      permissions
    )
  },

  listDocuments: async (
    ...args: Parameters<typeof serverDatabases.listDocuments>
  ) => {
    if (!initializeIfNeeded()) {
      throw new Error('Appwrite not configured or not available during build')
    }
    return serverDatabases.listDocuments(...args)
  },

  getDocument: async (
    ...args: Parameters<typeof serverDatabases.getDocument>
  ) => {
    if (!initializeIfNeeded()) {
      throw new Error('Appwrite not configured or not available during build')
    }
    return serverDatabases.getDocument(...args)
  },

  // Fix updateDocument to accept custom fields
  updateDocument: async (
    databaseId: string,
    collectionId: string,
    documentId: string,
    data: any, // ← Already fixed, keep as 'any'
    permissions?: string[]
  ) => {
    if (!initializeIfNeeded()) {
      throw new Error('Appwrite not configured or not available during build')
    }
    return serverDatabases.updateDocument(
      databaseId,
      collectionId,
      documentId,
      data,
      permissions
    )
  },

  deleteDocument: async (
    ...args: Parameters<typeof serverDatabases.deleteDocument>
  ) => {
    if (!initializeIfNeeded()) {
      throw new Error('Appwrite not configured or not available during build')
    }
    return serverDatabases.deleteDocument(...args)
  },
}

// Updated validation function - doesn't run during build
export function validateAppwriteConfig(): boolean {
  // Don't validate during build
  const isBuildTime =
    typeof window === 'undefined' &&
    process.env.NODE_ENV === 'production' &&
    !process.env.RESEND_API_KEY

  if (isBuildTime) {
    return true // Return true during build to avoid breaking
  }

  const required = [
    'NEXT_PUBLIC_APPWRITE_ENDPOINT',
    'NEXT_PUBLIC_APPWRITE_PROJECT_ID',
    'APPWRITE_API_KEY',
    'NEXT_PUBLIC_APPWRITE_DATABASE_ID',
  ]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0 && typeof window === 'undefined') {
    console.warn('⚠️ Missing Appwrite environment variables:', missing)
    return false
  }

  return missing.length === 0
}
