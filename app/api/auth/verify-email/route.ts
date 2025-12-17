import '@/lib/appwrite-build-fix'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server'

// This endpoint now only handles redirects from old verification links
// Old format: /api/auth/verify-email?token=abc&userId=123
// New format: /verify/abc

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const userId = searchParams.get('userId')

    console.log('🔄 Processing old verification link:', {
      hasToken: !!token,
      hasUserId: !!userId,
    })

    if (!token) {
      console.error('❌ Missing token in old verification link')
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/auth/verification-failed?error=missing_token`
      )
    }

    // Redirect to new clean URL format
    const newVerificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${token}`

    console.log('🔀 Redirecting to new format:', newVerificationUrl)

    return NextResponse.redirect(newVerificationUrl)
  } catch (error: any) {
    console.error('❌ Error processing old verification link:', error.message)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/verification-failed?error=invalid_link`
    )
  }
}

// Disable POST to this endpoint - use the new /api/auth/verify instead
export async function POST() {
  return NextResponse.json(
    {
      error:
        'This endpoint is deprecated. Please use the new verification system at /api/auth/verify',
      code: 'DEPRECATED_ENDPOINT',
    },
    { status: 410 } // 410 Gone
  )
}
