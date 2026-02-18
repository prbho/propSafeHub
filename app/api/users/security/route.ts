// app/api/users/security/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server'

import { account } from '@/lib/appwrite'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { currentPassword, newPassword } = body

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

    // First, let's check the current user session
    try {
      const user = await account.get()
    } catch (sessionError: any) {
      console.error('❌ Session error:', sessionError)
      return NextResponse.json(
        {
          success: false,
          error: 'Session expired or invalid. Please log in again.',
        },
        { status: 401 }
      )
    }

    // Update password using Appwrite
    try {
      const result = await account.updatePassword(newPassword, currentPassword)
      return NextResponse.json({
        success: true,
        message: 'Password updated successfully',
      })
    } catch (appwriteError: any) {
      console.error('❌ Appwrite password update error:')
      console.error('Error code:', appwriteError.code)
      console.error('Error type:', appwriteError.type)
      console.error('Error message:', appwriteError.message)
      console.error('Full error:', appwriteError)

      if (appwriteError.code === 401) {
        return NextResponse.json(
          {
            success: false,
            error: 'Current password is incorrect. Please check and try again.',
          },
          { status: 401 }
        )
      }

      if (appwriteError.code === 400) {
        return NextResponse.json(
          {
            success: false,
            error:
              'Password is too weak or invalid. Please choose a stronger password.',
          },
          { status: 400 }
        )
      }

      // For other errors
      return NextResponse.json(
        {
          success: false,
          error: `Failed to update password: ${appwriteError.message || 'Unknown error'}`,
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('❌ Unexpected error in API route:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

// Add OPTIONS handler for CORS
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  )
}

