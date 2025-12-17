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
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
const apiKey = process.env.APPWRITE_API_KEY

// Check if we're in a server environment
const isServer = typeof window === 'undefined'

if (isServer) {
  console.log('🔧 Appwrite Server Config Check:')
  console.log('NEXT_PUBLIC_APPWRITE_ENDPOINT:', endpoint ? '✓' : '✗')
  console.log('NEXT_PUBLIC_APPWRITE_PROJECT_ID:', projectId ? '✓' : '✗')
  console.log('APPWRITE_API_KEY:', apiKey ? '✓' : '✗')
}

if (!endpoint || !projectId || !apiKey) {
  if (isServer) {
    console.error('❌ Missing Appwrite server configuration')
    console.error('Please check your environment variables in .env')
  }
} else {
  client.setEndpoint(endpoint).setProject(projectId).setKey(apiKey)
}

export const serverDatabases = new Databases(client)
export const serverAccount = new Account(client)
export const serverUsers = new Users(client)
export const serverStorage = new Storage(client)

export { ID, Query }

// Database and Collection IDs
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!
export const USERS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_USERS_TABLE_ID!
export const PROPERTIES_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_PROPERTIES_TABLE_ID!
export const AGENTS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_AGENTS_TABLE_ID!
export const FAVORITES_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_FAVORITES_TABLE_ID!
export const REVIEWS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_REVIEWS_TABLE_ID!
export const MESSAGES_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_TABLE_ID!
export const PAYMENT_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_PAYMENT_TABLE_ID!
export const PREMIUM_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_PREMIUM_TABLE_ID!
export const PAYMENTPLANS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_PAYMENTPLANS_TABLE_ID!
export const MORTGAGECALCULATIONS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_MORTGAGECALCULATIONS_TABLE_ID!
export const LOCATIONS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_LOCATIONS_TABLE_ID!
export const SCHEDULE_VIEWING_COLLECTION_ID =
  process.env.NEXT_PUBLIC_SCHEDULE_VIEWING_COLLECTION_ID!
export const NOTIFICATIONS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_NOTIFICATIONS_COLLECTION_ID!
export const LEADS_COLLECTION_ID = process.env.NEXT_PUBLIC_LEADS_COLLECTION_ID!

//Storage
export const STORAGE_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID!

// Validation function to check if all required environment variables are set
export function validateAppwriteConfig(): boolean {
  const required = [
    'NEXT_PUBLIC_APPWRITE_ENDPOINT',
    'NEXT_PUBLIC_APPWRITE_PROJECT_ID',
    'APPWRITE_API_KEY',
    'NEXT_PUBLIC_APPWRITE_DATABASE_ID',
    'NEXT_PUBLIC_APPWRITE_AGENTS_TABLE_ID',
    'NEXT_PUBLIC_APPWRITE_PROPERTIES_TABLE_ID',
    'NEXT_PUBLIC_APPWRITE_REVIEWS_TABLE_ID',
    'NEXT_PUBLIC_APPWRITE_MESSAGES_TABLE_ID',
    'NEXT_PUBLIC_APPWRITE_PREMIUM_TABLE_ID',
    'NEXT_PUBLIC_APPWRITE_PAYMENT_TABLE_ID',
    'NEXT_PUBLIC_APPWRITE_PAYMENTPLANS_TABLE_ID',
    'MORTGAGECALCULATIONS_COLLECTION_ID',
    'LOCATIONS_COLLECTION_ID',
  ]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0 && typeof window === 'undefined') {
    console.error('❌ Missing required environment variables:', missing)
    return false
  }

  return missing.length === 0
}
