// app/api/auth/forget-password/route.ts - Custom token system with Resend
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server'
import { ID, Query } from 'appwrite'

import { DATABASE_ID, databases } from '@/lib/appwrite-server'
import { EmailTemplateParams } from '@/lib/email-templates'
import { emailService } from '@/lib/services/email-service'

// Collection for storing reset tokens
const PASSWORD_RESET_TOKENS_COLLECTION = 'password_reset_tokens'

export async function POST(request: NextRequest) {
  try {
    console.log('🔑 Forget password request received')

    // Get security headers
    const userAgent = request.headers.get('user-agent') || 'Unknown'
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'Unknown'

    // Parse request body
    let email: string
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      const jsonData = await request.json()
      email = jsonData.email?.trim().toLowerCase()
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      email = (formData.get('email') as string)?.trim().toLowerCase()
    } else {
      return NextResponse.json(
        { error: 'Unsupported content type' },
        { status: 400 }
      )
    }

    // Validate email
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    console.log('📧 Processing password reset for:', {
      email,
      ip: ipAddress,
      userAgent: userAgent.substring(0, 50) + '...',
    })

    try {
      // Search for user in database
      let user: any = null
      let collection = 'users'

      // Check users collection
      const users = await databases.listDocuments(DATABASE_ID, 'users', [
        Query.equal('email', email),
      ])

      if (users.total === 0) {
        // Check agents collection
        const agents = await databases.listDocuments(DATABASE_ID, 'agents', [
          Query.equal('email', email),
        ])

        if (agents.total === 0) {
          // User not found, but return success for security
          console.log('ℹ️ User not found in any collection')
          return NextResponse.json({
            success: true,
            message:
              'If an account exists with this email, a password reset link has been sent.',
            data: { email: email },
          })
        } else {
          user = agents.documents[0]
          collection = 'agents'
        }
      } else {
        user = users.documents[0]
      }

      // Generate a secure token
      const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')

      // Calculate expiration (1 hour from now)
      const expiresAt = new Date(Date.now() + 3600000)

      // Store token in database
      await databases.createDocument(
        DATABASE_ID,
        PASSWORD_RESET_TOKENS_COLLECTION,
        ID.unique(),
        {
          userId: user.userId || user.$id,
          token: token,
          email: email,
          expiresAt: expiresAt.toISOString(),
          used: false,
          ipAddress: ipAddress,
          userAgent: userAgent,
          //   createdAt: new Date().toISOString(),
          userCollection: collection,
        }
      )

      // Create reset URL with our token
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/(auth)/reset-password?token=${token}&email=${encodeURIComponent(email)}`

      console.log('✅ Custom password token created for:', email)

      // Send branded email using Resend
      const emailParams: EmailTemplateParams = {
        name: user.name || '',
        email: email,
        resetUrl: resetUrl,
        userType: user.userType || (collection === 'agents' ? 'agent' : 'user'),
        userAgent: userAgent,
      }

      console.log('📤 Sending email via Resend...')
      const emailResult = await emailService.sendPasswordResetEmail(emailParams)

      if (!emailResult.success) {
        console.error(
          '❌ Failed to send password reset email:',
          emailResult.error
        )
        // Clean up the token since email failed
        throw new Error('Failed to send email')
      }

      console.log('✅ Branded password reset email sent to:', email)

      // Security logging
      console.log('🔒 Security event - Password reset requested:', {
        email,
        userId: user.userId || user.$id,
        timestamp: new Date().toISOString(),
        ipAddress,
        userAgent,
      })

      return NextResponse.json({
        success: true,
        message:
          'If an account exists with this email, a password reset link has been sent.',
        data: {
          email: email,
          expiresIn: '1 hour',
        },
      })
    } catch (error: any) {
      console.error('❌ Password recovery error:', {
        message: error.message,
        code: error.code,
        type: error.type,
      })

      // Log failed attempt
      console.log('🔒 Security event - Failed password reset attempt:', {
        email,
        error: error.message,
        timestamp: new Date().toISOString(),
        ipAddress,
        userAgent,
      })

      // For security, always return the same success message
      return NextResponse.json({
        success: true,
        message:
          'If an account exists with this email, a password reset link has been sent.',
        data: { email: email },
      })
    }
  } catch (error: any) {
    console.error('❌ Forget password endpoint error:', error.message)

    return NextResponse.json(
      {
        error: 'Unable to process password reset request. Please try again.',
        code: 'SERVER_ERROR',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    )
  }
}
