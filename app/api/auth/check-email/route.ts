// app/api/auth/check-email/route.ts
import { NextRequest, NextResponse } from 'next/server'

import {
  DATABASE_ID,
  serverDatabases,
  USERS_COLLECTION_ID,
} from '@/lib/appwrite-server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    console.log('🔍 Checking email existence:', email)

    try {
      // Query the database for users with this email
      const response = await serverDatabases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [`email=${email}`, 'limit=1']
      )

      console.log('📊 Database query result:', {
        total: response.total,
        documents: response.documents.length,
      })

      if (response.documents.length > 0) {
        const userDoc = response.documents[0]
        console.log('✅ User found:', userDoc.$id)

        return NextResponse.json({
          exists: true,
          user: {
            id: userDoc.$id,
            name: userDoc.name,
            email: userDoc.email,
            emailVerified: userDoc.emailVerified,
            isActive: userDoc.isActive,
          },
        })
      } else {
        console.log('❌ No user found with email:', email)
        return NextResponse.json({
          exists: false,
        })
      }
    } catch {
      // If query fails, we can't determine if email exists, so allow registration
      return NextResponse.json({
        exists: false,
        error: 'Unable to verify email availability',
      })
    }
  } catch {
    return NextResponse.json({
      exists: false,
      error: 'Service temporarily unavailable',
    })
  }
}
