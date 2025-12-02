import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, userName, verificationUrl } = await request.json()

    if (!email || !verificationUrl) {
      return NextResponse.json(
        { error: 'Email and verification URL are required' },
        { status: 400 }
      )
    }

    console.log('Sending verification email to:', email)

    const { data, error } = await resend.emails.send({
      from: 'PropSafeHub <noreply@notifications.propsafehub.com>',
      to: email,
      subject: 'Verify your email - PropSafeHub',
      react: VerificationEmail({
        verificationUrl,
        userName: userName || email,
      }),
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

    console.log('✅ Email sent successfully via public API')
    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully!',
      emailId: data?.id,
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to send verification email.' },
      { status: 500 }
    )
  }
}

// Email template component
function VerificationEmail({
  verificationUrl,
  userName,
}: {
  verificationUrl: string
  userName: string
}) {
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
          <p>${verificationUrl}</p>
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
