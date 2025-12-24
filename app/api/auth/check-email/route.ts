// app/api/auth/check-email/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server'

import {
  AGENTS_COLLECTION_ID,
  DATABASE_ID,
  databases,
  Query,
  USERS_COLLECTION_ID,
} from '@/lib/appwrite-server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const cleanEmail = email.trim().toLowerCase()

    try {
      // Check both collections in parallel
      const [usersResponse, agentsResponse] = await Promise.all([
        databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [
          Query.equal('email', cleanEmail),
          Query.limit(1),
        ]),
        databases.listDocuments(DATABASE_ID, AGENTS_COLLECTION_ID, [
          Query.equal('email', cleanEmail),
          Query.limit(1),
        ]),
      ])

      // Check if email exists in either collection
      if (usersResponse.documents.length > 0) {
        const user = usersResponse.documents[0]
        return NextResponse.json({
          exists: true,
          user: {
            id: user.$id,
            name: user.name,
            email: user.email,
            isActive: user.isActive !== false,
            userType: user.userType || 'user',
          },
        })
      }

      if (agentsResponse.documents.length > 0) {
        const agent = agentsResponse.documents[0]
        return NextResponse.json({
          exists: true,
          user: {
            id: agent.$id,
            name: agent.name,
            email: agent.email,
            isActive: agent.isActive !== false,
            userType: agent.userType || 'agent',
            agency: agent.agency,
            city: agent.city,
          },
        })
      }

      // Email doesn't exist
      return NextResponse.json({
        exists: false,
      })
    } catch (dbError: any) {
      console.error('Database error:', dbError.message)

      // If database query fails, allow registration but return warning
      return NextResponse.json({
        exists: false,
        warning: 'Unable to verify email availability',
      })
    }
  } catch (error: any) {
    console.error('Unexpected error:', error.message)

    // For any other errors, still allow registration
    return NextResponse.json({
      exists: false,
      warning: 'Service temporarily unavailable',
    })
  }
}
