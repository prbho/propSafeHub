/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// Don't initialize Resend at the top level during build
// Instead, create a function to get it lazily
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY

  // Provide a mock client during build or when API key is missing
  if (!apiKey) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('RESEND_API_KEY is not set')
    }

    // Return a mock client that won't fail during initialization
    // but will fail gracefully when trying to send emails
    return {
      emails: {
        send: async () => {
          throw new Error('Resend API key not configured')
        },
      },
    } as unknown as Resend
  }

  return new Resend(apiKey)
}

export async function POST(request: NextRequest) {
  try {
    const { email, userName, verificationUrl } = await request.json()

    if (!email || !verificationUrl) {
      return NextResponse.json(
        { error: 'Email and verification URL are required' },
        { status: 400 }
      )
    }

    // Initialize Resend client inside the POST handler (runtime)
    const resend = getResendClient()

    const { data, error } = await resend.emails.send({
      from: 'PropSafeHub <noreply@notifications.propsafehub.com>',
      to: email,
      subject: 'Verify your email - PropSafeHub',
      html: generateVerificationEmail(verificationUrl, userName || email), // Changed to html
    })

    if (error) {
      console.error('Resend API error:', error)
      return NextResponse.json(
        {
          error: 'Failed to send verification email.',
          code: 'EMAIL_SEND_FAILED',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully!',
      emailId: data?.id,
    })
  } catch (error: any) {
    console.error('Error in send-verification-email:', error)

    // Handle missing API key gracefully
    if (error.message === 'Resend API key not configured') {
      return NextResponse.json(
        {
          error: 'Email service is temporarily unavailable.',
          code: 'SERVICE_UNAVAILABLE',
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to send verification email.' },
      { status: 500 }
    )
  }
}

// Email template function (returns HTML string, not React component)
function generateVerificationEmail(verificationUrl: string, userName: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Verify Your Email - PropSafeHub</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Verify Your Email Address</h1>
          <p>Hello ${userName},</p>
          <p>Thank you for registering with PropSafeHub! Please verify your email address by clicking the button below:</p>
          <p>
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </p>
          <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
          <p><a href="${verificationUrl}">${verificationUrl}</a></p>
          <p>This verification link will expire in 24 hours.</p>
          <div class="footer">
            <p>If you didn't create an account with PropSafeHub, please ignore this email.</p>
            <p>&copy; 2024 PropSafeHub. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

