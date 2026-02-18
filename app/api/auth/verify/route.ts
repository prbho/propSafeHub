// app/api/auth/verify/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server'
import { Query } from 'appwrite'

import {
  AGENTS_COLLECTION_ID,
  DATABASE_ID,
  databases,
  USERS_COLLECTION_ID,
} from '@/lib/appwrite-server'

// Disable GET method - only POST allowed
export function GET() {
  return new NextResponse('Method not allowed. Please use POST.', {
    status: 405,
    headers: {
      Allow: 'POST',
      'Content-Type': 'text/plain',
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      console.error('❌ Missing verification token in request body')
      return NextResponse.json(
        {
          success: false,
          error: 'Verification token is required',
          code: 'MISSING_TOKEN',
        },
        { status: 400 }
      )
    }

    // Extract userId from token (token format: userId:timestamp:random)
    let userId = ''
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8')
      const parts = decoded.split(':')
      if (parts.length >= 1) {
        userId = parts[0]
      }
    } catch (decodeError) {
      console.error('❌ Failed to decode token:', decodeError)
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid verification token format',
          code: 'INVALID_TOKEN_FORMAT',
        },
        { status: 400 }
      )
    }

    if (!userId) {
      console.error('❌ Could not extract userId from token')
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid verification token',
          code: 'INVALID_TOKEN',
        },
        { status: 400 }
      )
    }

    // ========== TRY TO FIND USER IN BOTH COLLECTIONS ==========
    let userDoc
    let collectionId

    // Strategy 1: Search by token across both collections
    let foundByTokenSearch = false

    // Search in users collection
    try {
      const usersWithToken = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal('verificationToken', token)]
      )

      if (usersWithToken.total > 0) {
        userDoc = usersWithToken.documents[0]
        collectionId = USERS_COLLECTION_ID
        foundByTokenSearch = true
      }
    } catch (searchError: any) {
      console.error('❌ Error searching users collection:', searchError.message)
    }

    // Search in agents collection if not found
    if (!userDoc) {
      try {
        const agentsWithToken = await databases.listDocuments(
          DATABASE_ID,
          AGENTS_COLLECTION_ID,
          [Query.equal('verificationToken', token)]
        )

        if (agentsWithToken.total > 0) {
          userDoc = agentsWithToken.documents[0]
          collectionId = AGENTS_COLLECTION_ID
          foundByTokenSearch = true
        }
      } catch (searchError: any) {
        console.error(
          '❌ Error searching agents collection:',
          searchError.message
        )
      }
    }

    // Strategy 2: Fallback - find by userId
    if (!userDoc) {
      // First try users collection
      try {
        userDoc = await databases.getDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          userId
        )
        collectionId = USERS_COLLECTION_ID
      } catch {
        // If not found in users, try agents collection
        try {
          userDoc = await databases.getDocument(
            DATABASE_ID,
            AGENTS_COLLECTION_ID,
            userId
          )
          collectionId = AGENTS_COLLECTION_ID
        } catch {
          console.error('❌ User not found in any collection by ID:', userId)
          return NextResponse.json(
            {
              success: false,
              error: 'User account not found',
              code: 'USER_NOT_FOUND',
            },
            { status: 404 }
          )
        }
      }
    }

    // Debug info
    // Check if user already verified
    if (userDoc.emailVerified) {
      return NextResponse.json({
        success: true,
        message: 'Email is already verified',
        email: userDoc.email,
        name: userDoc.name,
        alreadyVerified: true,
      })
    }

    // Verify token matches (if we found by userId, check token matches)
    if (!foundByTokenSearch && userDoc.verificationToken !== token) {
      console.error('❌ Token mismatch!')
      console.error('   Provided token:', token)
      console.error('   Stored token:', userDoc.verificationToken)

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid verification token',
          code: 'TOKEN_MISMATCH',
          email: userDoc.email,
        },
        { status: 400 }
      )
    }

    // Check if token exists in user document
    if (!userDoc.verificationToken) {
      console.error('❌ No verification token in user document')
      return NextResponse.json(
        {
          success: false,
          error:
            'No verification token found. Please request a new verification email.',
          code: 'NO_TOKEN',
          email: userDoc.email,
        },
        { status: 400 }
      )
    }

    // Check if token is expired (24 hours)
    if (userDoc.lastVerificationRequest) {
      try {
        const lastVerificationDate = new Date(userDoc.lastVerificationRequest)
        const now = new Date()
        const hoursDiff =
          (now.getTime() - lastVerificationDate.getTime()) / (1000 * 60 * 60)

        if (hoursDiff > 24) {
          console.error(
            '❌ Token expired (more than 24 hours):',
            hoursDiff.toFixed(2)
          )
          return NextResponse.json(
            {
              success: false,
              error: 'Verification link expired. Please request a new one.',
              code: 'TOKEN_EXPIRED',
              email: userDoc.email,
            },
            { status: 400 }
          )
        }
      } catch (parseError: any) {
        console.error('❌ Error checking token age:', parseError.message)
        // Continue with verification even if age check fails
      }
    }

    // ========== UPDATE USER AS VERIFIED ==========
    try {
      const updateData: any = {
        emailVerified: true,
        emailVerifiedAt: new Date().toISOString(),
        verificationToken: null, // Clear the used token
        lastVerificationRequest: null, // Clear the timestamp
        isActive: true,
      }

      await databases.updateDocument(
        DATABASE_ID,
        collectionId!,
        userDoc.$id,
        updateData
      )

      return NextResponse.json({
        success: true,
        message: 'Email verified successfully!',
        email: userDoc.email,
        name: userDoc.name,
        userType: userDoc.userType,
      })
    } catch (updateError: any) {
      console.error('❌ Error updating user verification:', updateError.message)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update verification status. Please try again.',
          code: 'UPDATE_FAILED',
          email: userDoc.email,
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('❌ Unhandled error in verification:', error.message)
    console.error('❌ Error stack:', error.stack)

    return NextResponse.json(
      {
        success: false,
        error:
          'An unexpected error occurred. Please try again or contact support.',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    )
  }
}

