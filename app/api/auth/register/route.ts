import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

import {
  DATABASE_ID,
  ID,
  serverAccount,
  serverDatabases,
  serverUsers, // Add this import
  USERS_COLLECTION_ID,
} from '@/lib/appwrite-server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone, userType } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create user account in Appwrite using server client
    let appwriteUser
    try {
      appwriteUser = await serverAccount.create(
        ID.unique(),
        email,
        password,
        name
      )
    } catch {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Generate verification token
    const verificationToken = Buffer.from(
      `${appwriteUser.$id}:${Date.now()}:${Math.random()}`
    ).toString('base64')

    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${verificationToken}&userId=${appwriteUser.$id}`

    // Create user document in database WITH verification token
    let userDoc
    try {
      userDoc = await serverDatabases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        appwriteUser.$id,
        {
          name,
          email,
          phone: phone || '',
          userType: userType || 'buyer',
          emailVerified: false,
          isActive: true,
          verificationToken: verificationToken,
          lastVerificationRequest: new Date().toISOString(),
        }
      )
    } catch {
      // Clean up: delete the Appwrite account using serverUsers
      try {
        await serverUsers.delete(appwriteUser.$id) // Use serverUsers.delete()
      } catch {}

      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      )
    }

    // Create session immediately after registration
    // let session
    // try {
    //   session = await serverAccount.createEmailPasswordSession(email, password)
    // } catch {}

    // Send verification email using Resend
    try {
      const emailHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email - PropSafeHub</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                    background-color: #f9f9f9;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background: white;
                    padding: 40px;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .header h1 {
                    color: #2563eb;
                    margin: 0;
                    font-size: 28px;
                }
                .content {
                    background: #f8fafc;
                    padding: 25px;
                    border-radius: 8px;
                    margin-bottom: 25px;
                }
                .button {
                    display: inline-block;
                    padding: 14px 28px;
                    background-color: #2563eb;
                    color: white;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: bold;
                    font-size: 16px;
                    text-align: center;
                }
                .link-box {
                    background: white;
                    padding: 15px;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    word-break: break-all;
                    font-size: 14px;
                    color: #2563eb;
                    margin: 20px 0;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #e2e8f0;
                    color: #64748b;
                    font-size: 12px;
                }
                .warning {
                    background: #fef3c7;
                    border: 1px solid #f59e0b;
                    padding: 15px;
                    border-radius: 6px;
                    margin: 20px 0;
                    color: #92400e;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>PropSafeHub</h1>
                    <p style="color: #64748b; margin: 10px 0 0 0;">Find Your Perfect Property</p>
                </div>
                
                <div class="content">
                    <h2 style="color: #1e293b; margin-top: 0;">Hello ${name}!</h2>
                    
                    <p style="color: #475569; margin-bottom: 25px;">
                        Thank you for registering with PropSafeHub! To complete your registration and start exploring thousands of properties, please verify your email address by clicking the button below:
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}" class="button">Verify Email Address</a>
                    </div>
                    
                    <p style="color: #64748b; font-size: 14px; margin-bottom: 10px;">
                        If the button doesn't work, copy and paste this link into your browser:
                    </p>
                    
                    <div class="link-box">
                        ${verificationUrl}
                    </div>
                </div>
                
                <div class="warning">
                    <strong>Important:</strong> This verification link will expire in 24 hours.
                </div>
                
                <div class="footer">
                    <p>If you didn't create an account with PropSafeHub, please ignore this email.</p>
                    <p>&copy; 2024 PropSafeHub. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
      `

      const { error } = await resend.emails.send({
        from: 'PropSafeHub <noreply@notifications.cofellow.com>',
        to: email,
        subject: 'Verify your email - PropSafeHub',
        html: emailHtml,
      })

      if (error) {
      } else {
      }
    } catch (emailError) {
      console.error('❌ Email sending error:', emailError)
      // Don't fail registration if email fails
    }

    const userResponse = {
      id: userDoc.$id,
      name: userDoc.name,
      email: userDoc.email,
      phone: userDoc.phone,
      userType: userDoc.userType,
      emailVerified: userDoc.emailVerified,
      isActive: userDoc.isActive,
      createdAt: userDoc.$createdAt,
      updatedAt: userDoc.$updatedAt,
    }

    return NextResponse.json({
      success: true,
      message:
        'Registration successful! Please check your email to verify your account.',
      user: userResponse,
    })
  } catch {
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    )
  }
}
