// app/api/auth/verify-email/route.ts

import { NextRequest, NextResponse } from 'next/server'

import {
  DATABASE_ID,
  serverDatabases,
  USERS_COLLECTION_ID,
} from '@/lib/appwrite-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const userId = searchParams.get('userId')

    console.log('🔍 Verification request received:', { token, userId })

    if (!token || !userId) {
      console.error('❌ Missing token or userId')
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/?verification=error&reason=missing_params`
      )
    }

    // Get user document using SERVER client
    let userDoc
    try {
      userDoc = await serverDatabases.getDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId
      )
      console.log('✅ User document found:', userDoc.$id)
    } catch {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/?verification=error&reason=user_not_found`
      )
    }

    // Check if user already verified
    if (userDoc.emailVerified) {
      console.log('ℹ️ User already verified')
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/?verification=success`
      )
    }

    // Verify the token exists in user document
    if (!userDoc.verificationToken) {
      console.error('❌ No verification token in user document')
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/?verification=error&reason=no_token`
      )
    }

    // Verify token match
    if (userDoc.verificationToken !== token) {
      console.error('❌ Token mismatch')
      console.log('Stored:', userDoc.verificationToken)
      console.log('Received:', token)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/?verification=invalid`
      )
    }

    // Check if token is expired (24 hours)
    try {
      const tokenString = Buffer.from(token, 'base64').toString()
      console.log('🔐 Decoded token:', tokenString)

      const tokenParts = tokenString.split(':')
      if (tokenParts.length < 2) {
        console.error('❌ Invalid token format')
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/?verification=error&reason=invalid_format`
        )
      }

      const tokenTimestamp = parseInt(tokenParts[1])
      if (isNaN(tokenTimestamp)) {
        console.error('❌ Invalid timestamp in token')
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/?verification=error&reason=invalid_timestamp`
        )
      }

      const tokenAge = Date.now() - tokenTimestamp
      const maxTokenAge = 24 * 60 * 60 * 1000 // 24 hours

      console.log('⏰ Token age check:', {
        tokenAge,
        maxTokenAge,
        isExpired: tokenAge > maxTokenAge,
      })

      if (tokenAge > maxTokenAge) {
        console.error('❌ Token expired')
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/?verification=expired`
        )
      }
    } catch (parseError) {
      console.error('❌ Error parsing token:', parseError)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/?verification=error&reason=parse_error`
      )
    }

    // Update user as verified using SERVER client
    try {
      const updatedUser = await serverDatabases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId,
        {
          emailVerified: true,
          emailVerifiedAt: new Date().toISOString(),
          verificationToken: null, // Clear the used token
        }
      )

      console.log('✅ Email verified successfully for user:', userId)
      console.log('📝 Updated user:', updatedUser)

      // Redirect to success page
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/?verification=success`
      )
    } catch {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/?verification=error&reason=update_failed`
      )
    }
  } catch {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/?verification=error&reason=unknown`
    )
  }
}
