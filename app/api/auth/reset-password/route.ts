// app/api/auth/reset-password/route.ts - UPDATED (Using your existing admin API)
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server'
import { Query } from 'appwrite'

import {
  DATABASE_ID,
  databases,
  serverUsers, // This should have admin privileges
} from '@/lib/appwrite-server'
import { emailService } from '@/lib/services/email-service'

// Collection for storing reset tokens
const PASSWORD_RESET_TOKENS_COLLECTION = 'password_reset_tokens'

export async function POST(request: NextRequest) {
  try {
    console.log('🔑 Reset password request received')

    // Parse request body
    const { token, email, password, confirmPassword } = await request.json()

    // Validate required fields
    if (!token || !email || !password || !confirmPassword) {
      console.error('❌ Missing fields:', {
        hasToken: !!token,
        hasEmail: !!email,
        hasPassword: !!password,
        hasConfirmPassword: !!confirmPassword,
      })
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Strong password validation
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      return NextResponse.json(
        {
          error:
            'Password must contain at least one uppercase letter, one lowercase letter, and one number',
          code: 'WEAK_PASSWORD',
        },
        { status: 400 }
      )
    }

    console.log('🔄 Processing password reset for email:', email)

    try {
      // 1. Find the reset token in database
      const tokens = await databases.listDocuments(
        DATABASE_ID,
        PASSWORD_RESET_TOKENS_COLLECTION,
        [
          Query.equal('token', token),
          Query.equal('email', email),
          Query.equal('used', false),
        ]
      )

      if (tokens.total === 0) {
        console.error('❌ Token not found or already used')
        return NextResponse.json(
          {
            error: 'Invalid or expired reset token.',
            code: 'INVALID_TOKEN',
          },
          { status: 401 }
        )
      }

      const resetToken = tokens.documents[0]

      // 2. Check if token is expired
      const expiresAt = new Date(resetToken.expiresAt)
      if (expiresAt < new Date()) {
        // Mark token as used
        await databases.updateDocument(
          DATABASE_ID,
          PASSWORD_RESET_TOKENS_COLLECTION,
          resetToken.$id,
          { used: true }
        )

        console.error('❌ Token expired')
        return NextResponse.json(
          {
            error: 'Reset token has expired. Please request a new one.',
            code: 'EXPIRED_TOKEN',
          },
          { status: 401 }
        )
      }

      // 3. Get user from appropriate collection
      const collection = resetToken.userCollection || 'users'
      const users = await databases.listDocuments(DATABASE_ID, collection, [
        Query.equal('email', email),
      ])

      if (users.total === 0) {
        console.error('❌ User not found in collection:', collection)
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      const user = users.documents[0]
      const appwriteUserId = user.userId // This is the Appwrite user ID

      if (!appwriteUserId) {
        console.error('❌ No Appwrite userId found for user:', user.$id)
        return NextResponse.json(
          { error: 'User account configuration error' },
          { status: 500 }
        )
      }

      console.log(
        '✅ Token validated for user:',
        appwriteUserId.substring(0, 8) + '...'
      )

      // 4. UPDATE PASSWORD USING ADMIN API (NO EMAIL SENT!)
      try {
        console.log('🔑 Attempting to update password using admin API...')

        // Use serverUsers (which should have admin privileges with your API key)
        await serverUsers.updatePassword(appwriteUserId, password)

        console.log('✅ Password updated successfully using Admin API!')
      } catch (adminError: any) {
        console.error('❌ Admin API password update failed:', {
          message: adminError.message,
          code: adminError.code,
          type: adminError.type,
        })

        // Check if it's a permissions error
        if (
          adminError.code === 401 ||
          adminError.message?.includes('permission') ||
          adminError.message?.includes('access')
        ) {
          console.error('⚠️ API key might not have user write permissions')

          // You need to update your Appwrite API key permissions:
          // 1. Go to Appwrite Console → API Keys
          // 2. Edit your API key
          // 3. Add "users.write" permission

          return NextResponse.json(
            {
              error: 'Server configuration error. Please contact support.',
              code: 'ADMIN_PERMISSION_ERROR',
            },
            { status: 500 }
          )
        }

        throw new Error('Unable to update password. Please try again.')
      }

      // 5. Mark token as used
      await databases.updateDocument(
        DATABASE_ID,
        PASSWORD_RESET_TOKENS_COLLECTION,
        resetToken.$id,
        {
          used: true,
          usedAt: new Date().toISOString(),
        }
      )

      console.log('✅ Password reset completed for:', email)

      // 6. Send confirmation email
      try {
        await emailService.sendPasswordResetSuccessEmail({
          name: user.name || '',
          email: email,
          userType:
            user.userType || (collection === 'agents' ? 'agent' : 'user'),
        })
        console.log('📧 Confirmation email sent to:', email)
      } catch (emailError: any) {
        console.warn(
          '⚠️ Failed to send confirmation email:',
          emailError.message
        )
      }

      // Log success
      console.log('🔒 Security event - Password successfully reset:', {
        userId: appwriteUserId,
        email: email,
        timestamp: new Date().toISOString(),
      })

      return NextResponse.json({
        success: true,
        message:
          'Password has been reset successfully. You can now sign in with your new password.',
        data: {
          email: email,
          updatedAt: new Date().toISOString(),
        },
      })
    } catch (error: any) {
      console.error('❌ Password reset error:', error.message)

      // Handle specific errors
      if (error.message?.includes('token') || error.code === 401) {
        return NextResponse.json(
          {
            error:
              'Invalid or expired reset token. Please request a new password reset.',
            code: 'INVALID_TOKEN',
          },
          { status: 401 }
        )
      }

      if (error.code === 429) {
        return NextResponse.json(
          {
            error: 'Too many attempts. Please try again later.',
            code: 'RATE_LIMITED',
          },
          { status: 429 }
        )
      }

      return NextResponse.json(
        {
          error: error.message || 'Unable to reset password. Please try again.',
          code: 'INTERNAL_ERROR',
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('❌ Reset password endpoint error:', error.message)

    return NextResponse.json(
      {
        error: 'Unable to process password reset request. Please try again.',
        code: 'SERVER_ERROR',
      },
      { status: 500 }
    )
  }
}
