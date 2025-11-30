// app/api/user/security/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server'

import { account } from '@/lib/appwrite'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { currentPassword, newPassword } = body

    console.log('🔒 Password update request received')

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'Current password and new password are required',
        },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: 'New password must be at least 6 characters long',
        },
        { status: 400 }
      )
    }

    // Update password using Appwrite
    try {
      await account.updatePassword(newPassword, currentPassword)
      console.log('✅ Password updated successfully')

      return NextResponse.json({
        success: true,
        message: 'Password updated successfully',
      })
    } catch (appwriteError: any) {
      console.error('❌ Appwrite password update error:', appwriteError)

      if (appwriteError.code === 401) {
        return NextResponse.json(
          {
            success: false,
            error: 'Current password is incorrect',
          },
          { status: 401 }
        )
      }

      if (appwriteError.code === 400) {
        return NextResponse.json(
          {
            success: false,
            error:
              'New password is too weak. Please choose a stronger password.',
          },
          { status: 400 }
        )
      }

      throw appwriteError
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
