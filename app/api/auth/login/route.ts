import '@/lib/appwrite-build-fix'
import { NextRequest, NextResponse } from 'next/server'

import {
  account,
  DATABASE_ID,
  databases,
  USERS_COLLECTION_ID,
} from '@/lib/appwrite'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Create session with Appwrite
    let session
    try {
      session = await account.createEmailPasswordSession(email, password)
      console.log('Login session created:', session.$id)
    } catch {}

    // Get user details from Appwrite
    const appwriteUser = await account.get()

    // Get or create user document from database
    let userDoc
    try {
      userDoc = await databases.getDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        appwriteUser.$id
      )
    } catch {
      // Create user document if it doesn't exist
      userDoc = await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        appwriteUser.$id,
        {
          name: appwriteUser.name,
          email: appwriteUser.email,
          userType: 'buyer',
          emailVerified: false,
          isActive: true,
          // No createdAt/updatedAt - Appwrite adds them automatically
        }
      )
    }

    const userResponse = {
      id: userDoc.$id,
      name: userDoc.name,
      email: userDoc.email,
      phone: userDoc.phone,
      userType: userDoc.userType,
      emailVerified: userDoc.emailVerified,
      isActive: userDoc.isActive,
      //   createdAt: userDoc.$createdAt,
      //   updatedAt: userDoc.$updatedAt,
    }

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userResponse,
    })
  } catch {
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    )
  }
}
