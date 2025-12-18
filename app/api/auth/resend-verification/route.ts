/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server'
import { Query } from 'appwrite'
// Import Resend properly using ES modules
import { Resend } from 'resend'

import {
  AGENTS_COLLECTION_ID,
  DATABASE_ID,
  databases,
  USERS_COLLECTION_ID,
} from '@/lib/appwrite-server'

// DON'T initialize Resend at top level - do it inside the function
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY

  // Don't fail during build
  if (!apiKey) {
    const isBuildTime =
      typeof window === 'undefined' && process.env.NODE_ENV === 'production'

    if (isBuildTime) {
      console.warn('📧 Skipping Resend initialization during build')
      return null
    }

    throw new Error('RESEND_API_KEY is required')
  }

  // Use ES module import - no require()
  return new Resend(apiKey)
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      console.error('❌ Missing email in request')
      return NextResponse.json(
        {
          error: 'Email is required',
          code: 'MISSING_EMAIL',
        },
        { status: 400 }
      )
    }

    console.log('🔄 START Resend verification for:', email)

    // Find user by email - check both collections
    let userDoc = null
    let collectionId = USERS_COLLECTION_ID

    try {
      // Use Query.equal() for proper query syntax
      const usersQuery = [Query.equal('email', email)]

      // First check users collection
      const users = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        usersQuery
      )

      if (users.total > 0) {
        userDoc = users.documents[0]
        console.log('✅ User found in USERS collection:', userDoc.$id)
      } else {
        // Check agents collection with same query
        const agents = await databases.listDocuments(
          DATABASE_ID,
          AGENTS_COLLECTION_ID,
          usersQuery // Reuse the same query
        )

        if (agents.total > 0) {
          userDoc = agents.documents[0]
          collectionId = AGENTS_COLLECTION_ID
          console.log('✅ User found in AGENTS collection:', userDoc.$id)
        } else {
          console.error('❌ User not found in any collection:', email)
          return NextResponse.json(
            {
              error: 'User not found',
              code: 'USER_NOT_FOUND',
              email,
            },
            { status: 404 }
          )
        }
      }
    } catch (dbError: any) {
      console.error('❌ Database query error:', dbError.message)
      console.error('❌ Database query stack:', dbError.stack)
      return NextResponse.json(
        {
          error: 'Database error',
          code: 'DATABASE_ERROR',
          details: dbError.message,
        },
        { status: 500 }
      )
    }

    // Check if already verified
    if (userDoc.emailVerified) {
      console.log('ℹ️ User already verified:', email)
      return NextResponse.json(
        {
          error: 'Email is already verified',
          code: 'ALREADY_VERIFIED',
          email,
        },
        { status: 400 }
      )
    }

    // Generate new verification token
    const verificationToken = Buffer.from(
      `${userDoc.$id}:${Date.now()}:${Math.random()}`
    ).toString('base64')

    // Create the NEW verification URL with the NEW token
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://propsafehub.com'}/verify/${verificationToken}`

    console.log('🔐 Generated NEW verification token:', {
      tokenPreview: verificationToken.substring(0, 30) + '...',
      tokenLength: verificationToken.length,
      userId: userDoc.$id,
      verificationUrl: verificationUrl,
    })

    // Update verification token in database FIRST
    try {
      await databases.updateDocument(DATABASE_ID, collectionId, userDoc.$id, {
        verificationToken: verificationToken, // Store in verificationToken field
        lastVerificationRequest: new Date().toISOString(),
      })
      console.log('✅ New verification token stored in database')
    } catch (updateError: any) {
      console.error('❌ Database update error:', updateError.message)
      return NextResponse.json(
        {
          error: 'Failed to update verification token',
          code: 'UPDATE_FAILED',
          details: updateError.message,
        },
        { status: 500 }
      )
    }

    // Send verification email
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email - PropSafeHub</title>
          <style>
              body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9f9f9; }
              .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
              .header { text-align: center; margin-bottom: 30px; }
              .header h1 { color: #2563eb; margin: 0; font-size: 28px; }
              .content { background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 25px; }
              .button { display: inline-block; padding: 14px 28px; background-color: #10b981; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; text-align: center; transition: background-color 0.3s; }
              .button:hover { background-color: #059669; }
              .link-box { background: white; padding: 15px; border: 1px solid #e2e8f0; border-radius: 6px; word-break: break-all; font-size: 14px; color: #2563eb; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px; }
              .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; color: #92400e; }
              .contact-info { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 6px; margin: 20px 0; font-size: 14px; }
              .contact-info strong { color: #1e293b; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <img 
                      src="https://fra.cloud.appwrite.io/v1/storage/buckets/6917066d002198df0c33/files/692f3007003c9a8fc197/view?project=6916ed0c0019cfe6bd36" 
                      alt="PropSafeHub Logo" 
                      style="width: 160px; height: auto; display: block; margin: 0 auto; border: 0;"
                  />
                  <p style="color: #64748b; margin: 10px 0 0 0;">Find Your Perfect Property Match</p>
              </div>
              
              <div class="content">
                  <h2 style="color: #1e293b; margin-top: 0;">Hello ${userDoc.name}!</h2>
                  
                  <p style="color: #475569; margin-bottom: 25px;">
                      You requested a new verification email. Please click the button below to verify your email address:
                  </p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                      <!-- CRITICAL: Use verificationUrl directly -->
                      <a href="${verificationUrl}" class="button">Verify Email Address</a>
                  </div>
                  
                  <p style="color: #64748b; font-size: 14px; margin-bottom: 10px;">
                      If the button doesn't work, copy and paste this link into your browser:
                  </p>
                  
                  <div class="link-box">
                      <!-- CRITICAL: Use verificationUrl directly -->
                      ${verificationUrl}
                  </div>
                  
                  <div class="warning">
                      <strong>⏰ Important:</strong> This verification link will expire in 24 hours.
                  </div>
                  
                  ${
                    userDoc.phone
                      ? `
                  <div class="contact-info">
                      <strong>📱 Registered Contact:</strong>
                      <p style="margin: 5px 0; color: #475569;">${userDoc.phone}</p>
                  </div>
                  `
                      : ''
                  }
              </div>
              
              <div class="footer">
                  <p>If you didn't request this email, please ignore it.</p>
                  <p>&copy; ${new Date().getFullYear()} PropSafeHub. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
    `

    console.log('📧 Sending email with verification URL:', {
      url: verificationUrl,
      urlContainsToken: verificationUrl.includes(verificationToken),
      emailTo: email,
    })

    try {
      const resend = getResendClient()

      if (!resend) {
        // During build, simulate success
        console.log('📧 [Build simulation] Email would be sent to:', email)
        return NextResponse.json({
          success: true,
          message: 'Verification email would be sent (build simulation)',
          email: email,
          simulated: true,
        })
      }

      const { error } = await resend.emails.send({
        from: 'PropSafeHub <noreply@notifications.propsafehub.com>',
        to: email,
        subject: 'Verify your email - PropSafeHub',
        html: emailHtml,
      })

      if (error) {
        console.error('❌ Email sending error:', error)
        return NextResponse.json(
          {
            error: 'Failed to send verification email',
            code: 'EMAIL_SEND_FAILED',
          },
          { status: 500 }
        )
      }

      console.log('✅ Email sent via Resend')
    } catch (emailError: any) {
      console.error('❌ Email service error:', emailError.message)
      return NextResponse.json(
        {
          error: 'Failed to send verification email',
          code: 'EMAIL_SEND_FAILED',
        },
        { status: 500 }
      )
    }

    console.log('✅ Verification email resent successfully to:', email)

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully!',
      email: email,
    })
  } catch (error: any) {
    console.error('❌ Unhandled error in resend verification:', error.message)
    console.error('❌ Error stack:', error.stack)
    return NextResponse.json(
      {
        error: 'Failed to resend verification email',
        code: 'INTERNAL_ERROR',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
