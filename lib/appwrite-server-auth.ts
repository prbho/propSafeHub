// lib/appwrite-server-auth.ts
import { cookies } from 'next/headers'
import { User } from '@/types/auth'
import { Client } from 'node-appwrite'

const client = new Client()

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

export async function getServerCurrentUser(): Promise<User | null> {
  try {
    // Get the session cookie from the request
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(
      `a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID?.toLowerCase()}`
    )

    if (!sessionCookie?.value) {
      console.log('❌ No session cookie found in server context')
      return null
    }

    // For server-side authentication, we have a few options:

    // Option 1: Use API key (but this authenticates as the API key owner, not the session user)
    // This is problematic because it doesn't represent the actual logged-in user

    // Option 2: Use Appwrite's admin SDK to verify the session
    // This requires the Appwrite server SDK to have session verification capabilities

    // Option 3: Pass the user ID from the client (less secure)

    // Since Appwrite's node SDK doesn't easily support session cookies in server components,
    // let's use a different approach...

    return null
  } catch {
    return null
  }
}

// Alternative: Create a client that can use the session
export async function createAuthenticatedClient() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(
    `a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID?.toLowerCase()}`
  )

  if (!sessionCookie) {
    return null
  }

  // This approach has limitations with the current Appwrite node SDK
  // You might need to use a different authentication strategy
  return null
}
