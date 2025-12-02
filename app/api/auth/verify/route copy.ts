import { NextRequest, NextResponse } from 'next/server'

import {
  account,
  DATABASE_ID,
  databases,
  USERS_COLLECTION_ID,
} from '@/lib/appwrite'

export async function POST(request: NextRequest) {
  try {
    const { userId, secret } = await request.json()

    if (!userId || !secret) {
      return NextResponse.json(
        { error: 'User ID and verification secret are required' },
        { status: 400 }
      )
    }

    // Verify the email using Appwrite
    const result = await account.updateVerification(userId, secret)
    console.log('Email verification successful:', result)

    // Update user document in database to mark as verified
    try {
      await databases.updateDocument(DATABASE_ID, USERS_COLLECTION_ID, userId, {
        emailVerified: true,
        emailVerifiedAt: new Date().toISOString(),
      })
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully!',
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to verify email. Please try again.' },
      { status: 500 }
    )
  }
}
