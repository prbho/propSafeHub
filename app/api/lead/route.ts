import { NextResponse } from 'next/server'
import { Client, Databases, ID } from 'node-appwrite'
import nodemailer from 'nodemailer'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, phone, country, intent } = body

    console.log('📝 Received lead data:', {
      name,
      email,
      phone,
      country,
      intent,
    })

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { message: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Check environment variables
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
    const apiKey = process.env.APPWRITE_API_KEY
    const databaseId = process.env.APPWRITE_DATABASE_ID
    const leadsSiteCollectionId =
      process.env.NEXT_PUBLIC_LEADS_SITE_COLLECTION_ID

    console.log('🔍 Environment check:', {
      hasEndpoint: !!endpoint,
      hasProjectId: !!projectId,
      hasApiKey: !!apiKey,
      hasDatabaseId: !!databaseId,
      hasLeadsSiteCollectionId: !!leadsSiteCollectionId,
    })

    // Save to Appwrite if all variables are present
    if (
      endpoint &&
      projectId &&
      apiKey &&
      databaseId &&
      leadsSiteCollectionId
    ) {
      try {
        const client = new Client()
          .setEndpoint(endpoint)
          .setProject(projectId)
          .setKey(apiKey)

        const databases = new Databases(client)

        // Save lead to Appwrite
        const document = await databases.createDocument(
          databaseId,
          leadsSiteCollectionId,
          ID.unique(),
          {
            name,
            email,
            phone: phone || '',
            country: country || '',
            intent: intent?.join(', ') || '',
            createdAt: new Date().toISOString(),
          }
        )

        console.log('✅ Lead saved to Appwrite:', document.$id)
      } catch (appwriteError) {
        console.error('❌ Appwrite error:', appwriteError)
        // Continue with email even if Appwrite fails
      }
    } else {
      console.warn('⚠️ Missing Appwrite credentials, skipping database save')
    }

    // Send emails
    try {
      const pdfUrl = process.env.PDF_URL || 'https://yourdomain.com/guide.pdf'

      // Check email credentials
      const emailUser = process.env.EMAIL_USER
      const emailPass = process.env.EMAIL_PASS

      if (!emailUser || !emailPass) {
        console.error('❌ Missing email credentials')
        throw new Error('Email credentials not configured')
      }

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      })

      // Verify email connection
      await transporter.verify()
      console.log('✅ Email transporter verified')

      // Send guide to user
      await transporter.sendMail({
        from: `"Property Safety Hub" <${emailUser}>`,
        to: email,
        subject: 'Your Free Property Safety Guide 🇳🇬',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0D2A52;">Hi ${name},</h2>
            <p>Thank you for requesting your <strong>Free Property Safety Guide</strong>!</p>
            <p>Click the button below to download your guide:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${pdfUrl}" 
                 style="background-color: #0D2A52; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Download Your Guide
              </a>
            </div>
            <p>We'll also send you verified property listings and safety tips to your email.</p>
            <hr style="margin: 30px 0;" />
            <p style="font-size: 12px; color: #666;">Stay safe,<br/>The Property Safety Hub Team</p>
          </div>
        `,
      })

      console.log('✅ Guide email sent to:', email)

      // Send notification to admin
      await transporter.sendMail({
        from: `"Property Safety Hub" <${emailUser}>`,
        to: emailUser,
        subject: '🔔 New Lead Received!',
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2>New Lead Details:</h2>
            <table style="border-collapse: collapse; width: 100%;">
              <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Name:</strong></td><td>${name}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Email:</strong></td><td>${email}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Phone:</strong></td><td>${phone || 'Not provided'}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Country:</strong></td><td>${country || 'Not provided'}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Intent:</strong></td><td>${intent?.join(', ') || 'Not specified'}</td></tr>
            </table>
          </div>
        `,
      })

      console.log('✅ Admin notification sent')

      return NextResponse.json({
        success: true,
        message: 'Lead saved and emails sent successfully',
      })
    } catch (emailError) {
      console.error('❌ Email error:', emailError)
      return NextResponse.json(
        {
          success: false,
          message: 'Lead saved but email failed. We will contact you shortly.',
          error:
            emailError instanceof Error
              ? emailError.message
              : 'Unknown email error',
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('❌ General error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
