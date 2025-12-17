// lib/appwrite-build-fix.ts
// This file should be imported at the top of ALL API routes

// Trick to prevent Appwrite from failing during build
if (
  typeof window === 'undefined' &&
  process.env.NODE_ENV === 'production' &&
  !process.env.RESEND_API_KEY
) {
  // This is a build-time environment
  console.log(
    '⚙️ Build environment detected - setting dummy environment variables'
  )

  // Set dummy environment variables for build
  const dummyVars = {
    NEXT_PUBLIC_APPWRITE_ENDPOINT: 'https://dummy.appwrite.io/v1',
    NEXT_PUBLIC_APPWRITE_PROJECT_ID: 'dummy-project-id',
    APPWRITE_API_KEY: 'dummy-api-key',
    RESEND_API_KEY: 'dummy-resend-key',
    NEXT_PUBLIC_APPWRITE_DATABASE_ID: 'dummy-db-id',
    NEXT_PUBLIC_APPWRITE_USERS_TABLE_ID: 'dummy-users',
    NEXT_PUBLIC_APPWRITE_AGENTS_TABLE_ID: 'dummy-agents',
    NEXT_PUBLIC_APPWRITE_PROPERTIES_TABLE_ID: 'dummy-properties',
    NEXT_PUBLIC_APPWRITE_STORAGE_ID: 'dummy-storage',
  }

  Object.entries(dummyVars).forEach(([key, value]) => {
    if (!process.env[key]) {
      process.env[key] = value
    }
  })
}
