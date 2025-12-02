// app/api/auth/verify-email/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server'

import {
  AGENTS_COLLECTION_ID,
  DATABASE_ID,
  serverDatabases,
  USERS_COLLECTION_ID,
} from '@/lib/appwrite-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const userId = searchParams.get('userId')

    if (!token || !userId) {
      console.error('❌ Missing token or userId')
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?toastType=error&toastMessage=Missing verification parameters`
      )
    }

    // ========== TRY TO FIND USER IN BOTH COLLECTIONS ==========
    let userDoc
    let collectionId

    // First try users collection
    try {
      userDoc = await serverDatabases.getDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId
      )
      collectionId = USERS_COLLECTION_ID
    } catch {
      // If not found in users, try agents collection
      try {
        userDoc = await serverDatabases.getDocument(
          DATABASE_ID,
          AGENTS_COLLECTION_ID,
          userId
        )
        collectionId = AGENTS_COLLECTION_ID
      } catch {
        console.error('❌ User not found in any collection')
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/?toastType=error&toastMessage=User not found`
        )
      }
    }

    // Check if user already verified
    if (userDoc.emailVerified) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/?toastType=info&toastMessage=Email already verified`
      )
    }

    // Verify the token exists in user document
    if (!userDoc.verificationToken) {
      console.error('❌ No verification token in user document')
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/?toastType=error&toastMessage=Invalid verification token`
      )
    }

    // Verify token match
    if (userDoc.verificationToken !== token) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/?toastType=error&toastMessage=Invalid verification token`
      )
    }

    // Check if token is expired (24 hours)
    try {
      if (!userDoc.lastVerificationRequest) {
        console.error('❌ No lastVerificationRequest timestamp')
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/?toastType=error&toastMessage=Verification link expired. Please request a new one.`
        )
      }

      const lastVerificationDate = new Date(userDoc.lastVerificationRequest)
      const now = new Date()
      const hoursDiff =
        (now.getTime() - lastVerificationDate.getTime()) / (1000 * 60 * 60)

      if (hoursDiff > 24) {
        console.error('❌ Token expired (more than 24 hours)')
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/?toastType=error&toastMessage=Verification link expired. Please request a new one.`
        )
      }
    } catch (parseError) {
      console.error('❌ Error checking token age:', parseError)
      // Continue with verification even if age check fails
      console.log('⚠️ Token age check failed, proceeding anyway...')
    }

    // Update user as verified in the correct collection
    try {
      const updateData: any = {
        emailVerified: true,
        emailVerifiedAt: new Date().toISOString(),
        verificationToken: null, // Clear the used token
        lastVerificationRequest: null, // Clear the timestamp
      }

      // Don't assign to a variable if not used
      await serverDatabases.updateDocument(
        DATABASE_ID,
        collectionId!,
        userId,
        updateData
      )

      // Redirect to success page
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/?toastType=success&toastMessage=Email verified successfully! You can now log in.`
      )
    } catch (updateError: any) {
      console.error('❌ Error updating user verification:', updateError.message)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/?toastType=error&toastMessage=Failed to verify email. Please try again.`
      )
    }
  } catch (error: any) {
    console.error('❌ Unhandled error in verify-email:', error.message)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/?toastType=error&toastMessage=An unexpected error occurred. Please try again.`
    )
  }
}
