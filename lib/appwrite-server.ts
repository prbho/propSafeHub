// lib/appwrite-server.ts
import {
  Account,
  Client,
  Databases,
  ID,
  Query,
  Storage,
  Users,
} from 'node-appwrite'

const client = new Client()

// For Edge Runtime compatibility, we need to handle environment variables differently
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || ''
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || ''
const apiKey = process.env.APPWRITE_API_KEY || ''

// DON'T run validation/console.log at the top level during build
// Instead, initialize lazily and check only when needed
let initialized = false

function initializeAppwrite() {
  if (initialized) return

  // Check if we're in a server environment and NOT during build
  const isServer = typeof window === 'undefined'
  const isBuildTime =
    isServer &&
    process.env.NODE_ENV === 'production' &&
    !process.env.RESEND_API_KEY

  if (isServer && !isBuildTime) {
    console.log('🔧 Appwrite Server Config Check:')
    console.log('NEXT_PUBLIC_APPWRITE_ENDPOINT:', endpoint ? '✓' : '✗')
    console.log('NEXT_PUBLIC_APPWRITE_PROJECT_ID:', projectId ? '✓' : '✗')
    console.log('APPWRITE_API_KEY:', apiKey ? '✓ (hidden)' : '✗')
  }

  if (!endpoint || !projectId || !apiKey) {
    if (isServer && !isBuildTime) {
      console.warn('⚠️ Missing Appwrite server configuration')
      console.warn(
        '⚠️ Some features may not work. Check your environment variables.'
      )
    }
    // Don't throw error - just don't initialize
    return
  } else {
    try {
      client.setEndpoint(endpoint).setProject(projectId).setKey(apiKey)
      initialized = true
      if (isServer && !isBuildTime) {
        console.log('✅ Appwrite client initialized successfully')
      }
    } catch (error) {
      if (isServer && !isBuildTime) {
        console.error('❌ Failed to initialize Appwrite client:', error)
      }
    }
  }
}

// Initialize on first use
function ensureInitialized() {
  if (!initialized) {
    initializeAppwrite()
  }
  return initialized
}

// Create clients but they won't work until initialized
export const serverDatabases = new Databases(client)
export const serverAccount = new Account(client)
export const serverUsers = new Users(client)
export const serverStorage = new Storage(client)

// Wrap each method to ensure initialization
export const databases = {
  createDocument: async (
    ...args: Parameters<typeof serverDatabases.createDocument>
  ) => {
    if (!ensureInitialized()) {
      throw new Error('Appwrite not configured')
    }
    return serverDatabases.createDocument(...args)
  },
  listDocuments: async (
    ...args: Parameters<typeof serverDatabases.listDocuments>
  ) => {
    if (!ensureInitialized()) {
      throw new Error('Appwrite not configured')
    }
    return serverDatabases.listDocuments(...args)
  },
  getDocument: async (
    ...args: Parameters<typeof serverDatabases.getDocument>
  ) => {
    if (!ensureInitialized()) {
      throw new Error('Appwrite not configured')
    }
    return serverDatabases.getDocument(...args)
  },
  updateDocument: async (
    ...args: Parameters<typeof serverDatabases.updateDocument>
  ) => {
    if (!ensureInitialized()) {
      throw new Error('Appwrite not configured')
    }
    return serverDatabases.updateDocument(...args)
  },
  deleteDocument: async (
    ...args: Parameters<typeof serverDatabases.deleteDocument>
  ) => {
    if (!ensureInitialized()) {
      throw new Error('Appwrite not configured')
    }
    return serverDatabases.deleteDocument(...args)
  },
  // Add other methods you use...
}

// Database and Collection IDs - with fallbacks for build
export const DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'fallback-db-id'
export const USERS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_USERS_TABLE_ID || 'fallback-users'
export const PROPERTIES_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_PROPERTIES_TABLE_ID || 'fallback-properties'
export const AGENTS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_AGENTS_TABLE_ID || 'fallback-agents'
export const FAVORITES_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_FAVORITES_TABLE_ID || 'fallback-favorites'
export const REVIEWS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_REVIEWS_TABLE_ID || 'fallback-reviews'
export const MESSAGES_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_TABLE_ID || 'fallback-messages'
export const PAYMENT_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_PAYMENT_TABLE_ID || 'fallback-payment'
export const PREMIUM_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_PREMIUM_TABLE_ID || 'fallback-premium'
export const PAYMENTPLANS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_PAYMENTPLANS_TABLE_ID ||
  'fallback-paymentplans'
export const MORTGAGECALCULATIONS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_MORTGAGECALCULATIONS_TABLE_ID ||
  'fallback-mortgage'
export const LOCATIONS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_LOCATIONS_TABLE_ID || 'fallback-locations'
export const SCHEDULE_VIEWING_COLLECTION_ID =
  process.env.NEXT_PUBLIC_SCHEDULE_VIEWING_COLLECTION_ID || 'fallback-schedule'
export const NOTIFICATIONS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_NOTIFICATIONS_COLLECTION_ID ||
  'fallback-notifications'
export const LEADS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_LEADS_COLLECTION_ID || 'fallback-leads'

// Storage
export const STORAGE_BUCKET_ID =
  process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID || 'fallback-storage'

// Validation function - only run at runtime, not during build
export function validateAppwriteConfig(): boolean {
  const isBuildTime =
    typeof window === 'undefined' &&
    process.env.NODE_ENV === 'production' &&
    !process.env.RESEND_API_KEY

  if (isBuildTime) {
    // During build, return true to avoid breaking
    return true
  }

  const required = [
    'NEXT_PUBLIC_APPWRITE_ENDPOINT',
    'NEXT_PUBLIC_APPWRITE_PROJECT_ID',
    'APPWRITE_API_KEY',
    'NEXT_PUBLIC_APPWRITE_DATABASE_ID',
  ]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0 && typeof window === 'undefined') {
    console.error('❌ Missing required environment variables:', missing)
    return false
  }

  return missing.length === 0
}

// Export for backward compatibility
export { ID, Query }
