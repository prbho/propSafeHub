// app/api/user/profile/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server'

import { getCurrentUser } from '@/lib/appwrite'
import {
  DATABASE_ID,
  databases,
  USERS_COLLECTION_ID,
} from '@/lib/appwrite-server'

export async function PUT(request: NextRequest) {
  try {
    // Parse the request body
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body',
        },
        { status: 400 }
      )
    }

    const { name, email, phone, bio, city, state } = body

    // Get the current user
    const user = await getCurrentUser()

    if (!user) {
      console.error('❌ No user found - user is null')
      return NextResponse.json(
        {
          success: false,
          error: 'You must be logged in to update your profile',
        },
        { status: 401 }
      )
    }

    const userId = user.$id
    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name and email are required',
        },
        { status: 400 }
      )
    }

    try {
      // First, check if the user document exists
      try {
        await databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, userId)
      } catch {}

      // Update user document
      const updatedUser = await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId,
        {
          name,
          email,
          phone: phone || '',
          bio: bio || '',
          city: city || '',
          state: state || '',
        }
      )

      return NextResponse.json({
        success: true,
        user: {
          $id: updatedUser.$id,
          $createdAt: updatedUser.$createdAt,
          $updatedAt: updatedUser.$updatedAt,
          name: updatedUser.name,
          email: updatedUser.email,
          bio: updatedUser.bio,
          emailVerified: updatedUser.emailVerified,
          phone: updatedUser.phone,
          mobilePhone: updatedUser.mobilePhone,
          userType: updatedUser.userType,
          isActive: updatedUser.isActive,
          verificationToken: updatedUser.verificationToken,
          lastVerificationRequest: updatedUser.lastVerificationRequest,
          emailVerifiedAt: updatedUser.emailVerifiedAt,
          savedSearches: updatedUser.savedSearches || [],
          favoriteProperties: updatedUser.favoriteProperties || [],
          avatar: updatedUser.avatar,
          city: updatedUser.city,
          state: updatedUser.state,
        },
      })
    } catch (dbError: any) {
      console.error('❌ Database error:', dbError)

      if (dbError.code === 404) {
        return NextResponse.json(
          {
            success: false,
            error: 'User document not found in database',
          },
          { status: 404 }
        )
      }

      if (dbError.code === 401) {
        return NextResponse.json(
          {
            success: false,
            error: 'Database authentication failed',
          },
          { status: 500 }
        )
      }

      throw dbError
    }
  } catch {
    return NextResponse.json(
      {
        success: false,
      },
      { status: 500 }
    )
  }
}

// Add GET method for testing
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not authenticated',
        },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Profile API route is working',
      user: {
        id: user.$id,
        name: user.name,
        email: user.email,
      },
      timestamp: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json(
      {
        success: false,
      },
      { status: 500 }
    )
  }
}

