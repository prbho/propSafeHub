/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server'

// Import from appwrite-server (server-side SDK)
import {
  DATABASE_ID,
  databases, // ← Server-side databases wrapper
  serverAccount, // ← Server-side account (not 'account')
  USERS_COLLECTION_ID,
} from '@/lib/appwrite-server'

// ← CORRECT import

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Create session with Appwrite (using SERVER account)
    let session
    try {
      session = await serverAccount.createEmailPasswordSession(email, password)
      console.log('Login session created:', session.$id)
    } catch (error: any) {
      console.error('Login failed:', error.message)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Get user details from Appwrite (using SERVER account)
    const appwriteUser = await serverAccount.get()

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
        } as any // May need 'as any' if createDocument wrapper isn't fixed yet
      )
      console.log('New user document created:', userDoc.$id)
    }

    const userResponse = {
      id: userDoc.$id,
      name: userDoc.name,
      email: userDoc.email,
      phone: userDoc.phone || '',
      userType: userDoc.userType || 'buyer',
      emailVerified: userDoc.emailVerified || false,
      isActive: userDoc.isActive !== false, // Default to true
      createdAt: userDoc.$createdAt,
      updatedAt: userDoc.$updatedAt,
    }

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userResponse,
    })
  } catch (error: any) {
    console.error('Login error:', error.message)
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    )
  }
}
