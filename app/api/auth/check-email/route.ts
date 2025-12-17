// app/api/auth/check-email/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server'

import {
  AGENTS_COLLECTION_ID,
  DATABASE_ID,
  databases, // Use the NEW wrapped databases (not serverDatabases)
  Query,
  USERS_COLLECTION_ID,
} from '@/lib/appwrite-server'

// REMOVE THIS: import '@/lib/appwrite-build-fix'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    console.log('🔍 Checking email existence:', email)
    console.log('📊 Collection IDs:', {
      USERS_COLLECTION_ID,
      AGENTS_COLLECTION_ID,
    })

    try {
      // Using Query.equal() for proper query syntax
      const [usersResponse, agentsResponse] = await Promise.all([
        // Check users collection - use databases.listDocuments (the wrapper)
        databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [
          Query.equal('email', email),
          Query.limit(1),
        ]),
        // Check agents collection - use databases.listDocuments (the wrapper)
        databases.listDocuments(DATABASE_ID, AGENTS_COLLECTION_ID, [
          Query.equal('email', email),
          Query.limit(1),
        ]),
      ])

      console.log('📊 Database query results:', {
        usersTotal: usersResponse.total,
        usersFound: usersResponse.documents.length,
        agentsTotal: agentsResponse.total,
        agentsFound: agentsResponse.documents.length,
      })

      // Log first few documents for debugging
      if (usersResponse.documents.length > 0) {
        console.log('📝 Sample user document:', {
          id: usersResponse.documents[0].$id,
          email: usersResponse.documents[0].email,
          name: usersResponse.documents[0].name,
        })
      }

      if (agentsResponse.documents.length > 0) {
        console.log('📝 Sample agent document:', {
          id: agentsResponse.documents[0].$id,
          email: agentsResponse.documents[0].email,
          name: agentsResponse.documents[0].name,
          agency: agentsResponse.documents[0].agency,
        })
      }

      // Check users collection first
      if (usersResponse.documents.length > 0) {
        const userDoc = usersResponse.documents[0]
        console.log('✅ User found in USERS collection:', userDoc.$id)

        return NextResponse.json({
          exists: true,
          collection: 'users',
          user: {
            id: userDoc.$id,
            name: userDoc.name,
            email: userDoc.email,
            emailVerified: userDoc.emailVerified,
            isActive: userDoc.isActive,
            userType: userDoc.userType || 'user',
          },
        })
      }

      // Check agents collection
      if (agentsResponse.documents.length > 0) {
        const userDoc = agentsResponse.documents[0]
        console.log('✅ User found in AGENTS collection:', userDoc.$id)

        return NextResponse.json({
          exists: true,
          collection: 'agents',
          user: {
            id: userDoc.$id,
            name: userDoc.name,
            email: userDoc.email,
            emailVerified: userDoc.emailVerified,
            isActive: userDoc.isActive,
            userType: userDoc.userType || 'agent',
            agency: userDoc.agency,
            city: userDoc.city,
          },
        })
      }

      // No user found in either collection
      console.log('❌ No user found with email in any collection:', email)

      // Debug: List all agents to see what's in the collection
      try {
        const allAgents = await databases.listDocuments(
          DATABASE_ID,
          AGENTS_COLLECTION_ID,
          [Query.limit(5)]
        )
        console.log(
          '🔍 First 5 agents in collection:',
          allAgents.documents.map((a) => ({
            id: a.$id,
            email: a.email,
            name: a.name,
            hasEmailField: !!a.email,
          }))
        )
      } catch (debugError) {
        console.error('❌ Error listing agents:', debugError)
      }

      return NextResponse.json({
        exists: false,
      })
    } catch (error: any) {
      console.error('❌ Database query error:', error.message)
      console.error('❌ Error details:', error)

      // Check if it's a configuration error
      if (error.message.includes('Appwrite not configured')) {
        return NextResponse.json(
          {
            exists: false,
            error: 'Service configuration error',
          },
          { status: 503 }
        )
      }

      // If query fails, we can't determine if email exists, so allow registration
      return NextResponse.json({
        exists: false,
        error: 'Unable to verify email availability',
      })
    }
  } catch (error: any) {
    console.error('❌ General error:', error.message)
    return NextResponse.json(
      {
        exists: false,
        error: 'Service temporarily unavailable',
      },
      { status: 500 }
    )
  }
}
