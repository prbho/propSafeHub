import '@/lib/appwrite-build-fix'
// app/api/auth/register/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

import {
  AGENTS_COLLECTION_ID,
  DATABASE_ID,
  ID,
  serverAccount,
  serverDatabases,
  serverStorage,
  serverUsers,
  STORAGE_BUCKET_ID,
  USERS_COLLECTION_ID,
} from '@/lib/appwrite-server'
import { EmailTemplateParams } from '@/lib/email-templates'
import { emailService } from '@/lib/services/email-service'

const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed='

// SIMPLIFIED: Always use manual URL construction to avoid Promise issues
function getFileUrl(fileId: string): string {
  const endpoint =
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1'
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID

  if (!endpoint || !projectId) {
    console.error('Missing Appwrite configuration:', { endpoint, projectId })
    throw new Error('Appwrite configuration missing')
  }

  // Always use view endpoint (no transformations)
  return `${endpoint}/storage/buckets/${STORAGE_BUCKET_ID}/files/${fileId}/view?project=${projectId}`
}

// Helper function to convert base64 to File
function base64ToFile(base64Data: string, mimeType: string): File {
  const base64 = base64Data.includes(',')
    ? base64Data.split(',')[1]
    : base64Data

  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length)

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }

  const byteArray = new Uint8Array(byteNumbers)
  const blob = new Blob([byteArray], { type: mimeType })

  return new File([blob], 'avatar.jpg', {
    type: mimeType,
    lastModified: Date.now(),
  })
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Registration request received')

    let name: string,
      email: string,
      password: string,
      phone: string | undefined,
      userType: 'buyer' | 'seller' | 'agent',
      agentData: any = {}
    let avatarUrl = ''

    // Check content type
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      // Handle FormData
      console.log('📁 Processing FormData request')
      const formData = await request.formData()

      name = formData.get('name') as string
      email = formData.get('email') as string
      password = formData.get('password') as string
      phone = (formData.get('phone') as string) || undefined
      userType = formData.get('userType') as 'buyer' | 'seller' | 'agent'
      const agentDataString = formData.get('agentData') as string
      const avatarFile = formData.get('avatar') as File

      // Parse agent data
      if (agentDataString) {
        try {
          agentData = JSON.parse(agentDataString)
        } catch (parseError) {
          console.error('❌ Error parsing agentData:', parseError)
          return NextResponse.json(
            { error: 'Invalid agent data format' },
            { status: 400 }
          )
        }
      }

      // Handle avatar upload
      if (avatarFile && avatarFile.size > 0) {
        console.log('📸 Avatar file found:', avatarFile.name)

        if (!avatarFile.type.startsWith('image/')) {
          console.error('❌ Invalid file type')
        } else if (avatarFile.size > 5 * 1024 * 1024) {
          console.error('❌ File too large')
        } else {
          try {
            const fileId = uuidv4()
            console.log(`📤 Uploading avatar with ID: ${fileId}`)

            // Upload file
            const uploadedFile = await serverStorage.createFile(
              STORAGE_BUCKET_ID,
              fileId,
              avatarFile
            )

            console.log('✅ File uploaded to Appwrite')

            // Get URL using manual construction (NO Appwrite SDK methods)
            avatarUrl = getFileUrl(uploadedFile.$id)
            console.log(`✅ Avatar URL: ${avatarUrl}`)

            // Debug: Check URL for transformations
            console.log('🔍 Generated avatar URL check:', {
              hasPreview: avatarUrl.includes('/preview'),
              hasView: avatarUrl.includes('/view'),
              hasTransformations:
                avatarUrl.includes('width=') || avatarUrl.includes('height='),
              url: avatarUrl.substring(0, 100) + '...',
            })
          } catch (uploadError: any) {
            console.error('❌ Upload error:', uploadError.message)
          }
        }
      }
    } else {
      // Handle JSON request
      console.log('📄 Processing JSON request')
      try {
        const jsonData = await request.json()
        name = jsonData.name
        email = jsonData.email
        password = jsonData.password
        phone = jsonData.phone || undefined
        userType = jsonData.userType
        agentData = jsonData.agentData || {}

        // Handle base64 avatar
        if (jsonData.avatarBase64) {
          console.log('📸 Avatar received as base64')
          try {
            const mimeType =
              jsonData.avatarBase64.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)?.[0] ||
              'image/jpeg'
            const file = base64ToFile(jsonData.avatarBase64, mimeType)

            const fileId = uuidv4()
            const uploadedFile = await serverStorage.createFile(
              STORAGE_BUCKET_ID,
              fileId,
              file
            )

            avatarUrl = getFileUrl(uploadedFile.$id)
            console.log(`✅ Base64 avatar uploaded: ${avatarUrl}`)
          } catch (error) {
            console.error('❌ Base64 processing error:', error)
          }
        }
      } catch (jsonError: any) {
        console.error('❌ JSON parsing error:', jsonError.message)
        return NextResponse.json(
          { error: 'Invalid JSON format' },
          { status: 400 }
        )
      }
    }

    console.log('📊 Registration summary:', {
      name,
      email,
      userType,
      agency: agentData?.agency || 'None',
      city: agentData?.city || 'None',
      hasAvatar: !!avatarUrl,
    })

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Agent validation
    if (userType === 'agent') {
      if (!agentData?.agency) {
        return NextResponse.json(
          { error: 'Agency name is required for agents' },
          { status: 400 }
        )
      }
      if (!agentData?.city) {
        return NextResponse.json(
          { error: 'City is required for agents' },
          { status: 400 }
        )
      }
    }

    // Create Appwrite account
    let appwriteUser
    try {
      appwriteUser = await serverAccount.create(
        ID.unique(),
        email,
        password,
        name
      )
      console.log('✅ Appwrite account created:', appwriteUser.$id)
    } catch (error: any) {
      console.error('❌ Account creation error:', error.message)

      if (error.message.includes('already exists')) {
        return NextResponse.json(
          { error: 'Email already registered. Please login instead.' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: 'Account creation failed' },
        { status: 400 }
      )
    }

    // Generate verification
    const verificationToken = Buffer.from(
      `${appwriteUser.$id}:${Date.now()}:${Math.random()}`
    ).toString('base64')

    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${verificationToken}`

    // Determine collection
    const isAgent = userType === 'agent'
    const collectionId = isAgent ? AGENTS_COLLECTION_ID : USERS_COLLECTION_ID

    // Create document
    let userDoc
    try {
      // Prepare avatar URL
      let finalAvatarUrl = avatarUrl

      // Validate avatar URL
      if (
        !avatarUrl ||
        avatarUrl.includes('[object') ||
        !avatarUrl.startsWith('http')
      ) {
        console.log('⚠️ Using default avatar')
        finalAvatarUrl = `${DEFAULT_AVATAR}${encodeURIComponent(email)}`
      }

      console.log(`🎯 Final avatar URL: ${finalAvatarUrl}`)

      // Build document data
      const documentData: any = {
        name,
        email,
        userType,
        emailVerified: false,
        isActive: true,
        verificationToken,
        lastVerificationRequest: new Date().toISOString(),
        avatar: finalAvatarUrl,
        phone: phone || '',
        mobilePhone: phone || '',
        userId: appwriteUser.$id,
      }

      // Add user-specific fields
      if (!isAgent) {
        documentData.savedSearches = []
        documentData.favoriteProperties = []
      }

      // Add agent-specific fields
      if (isAgent) {
        documentData.agency = agentData.agency || ''
        documentData.city = agentData.city || ''
        documentData.licenseNumber = agentData.licenseNumber || ''
        documentData.specialties = agentData.specialties || []
        documentData.languages = agentData.languages || ['English']
        documentData.totalListings = 0
        documentData.yearsExperience = agentData.yearsExperience || 0
        documentData.rating = 0
        documentData.reviewCount = 0
        documentData.isVerified = false
        documentData.verificationDocuments = []
        documentData.officePhone = phone || ''

        // Optional fields
        if (agentData.bio) documentData.bio = agentData.bio
        if (agentData.state) documentData.state = agentData.state
        if (agentData.website) documentData.website = agentData.website
        if (agentData.specialty) documentData.specialty = agentData.specialty

        console.log(`🏢 Agent data: ${agentData.agency} in ${agentData.city}`)
      }

      // Create the document
      userDoc = await serverDatabases.createDocument(
        DATABASE_ID,
        collectionId,
        appwriteUser.$id,
        documentData
      )

      console.log(
        `✅ ${isAgent ? 'Agent' : 'User'} document created in ${collectionId}:`,
        userDoc.$id
      )
    } catch (error: any) {
      // Cleanup on error
      try {
        await serverUsers.delete(appwriteUser.$id)
        console.log('🗑️ Cleaned up Appwrite account')
      } catch {}

      if (avatarUrl) {
        try {
          const fileId = avatarUrl.split('/files/')[1]?.split('/')[0]
          if (fileId) {
            await serverStorage.deleteFile(STORAGE_BUCKET_ID, fileId)
            console.log('🗑️ Cleaned up uploaded file')
          }
        } catch {}
      }

      console.error('❌ Document creation error:', error.message)
      return NextResponse.json(
        { error: 'Profile creation failed. Please try again.' },
        { status: 500 }
      )
    }

    // Send verification email
    try {
      const emailParams: EmailTemplateParams = {
        name,
        email,
        verificationUrl,
        userType,
        phone,
      }

      if (isAgent) {
        emailParams.agency = agentData.agency
        emailParams.city = agentData.city
      }

      await emailService.sendVerificationEmail(emailParams)
      console.log('📧 Verification email sent')
    } catch (emailError) {
      console.error('❌ Email error:', emailError)
      // Don't fail registration if email fails
    }

    // Prepare response
    const responseData: any = {
      id: userDoc.$id,
      name: userDoc.name,
      email: userDoc.email,
      userType: userDoc.userType,
      emailVerified: userDoc.emailVerified,
      isActive: userDoc.isActive,
      avatar: userDoc.avatar,
      createdAt: userDoc.$createdAt,
      updatedAt: userDoc.$updatedAt,
    }

    if (phone) {
      responseData.phone = phone
    }

    if (isAgent) {
      responseData.agency = userDoc.agency
      responseData.city = userDoc.city
      responseData.yearsExperience = userDoc.yearsExperience
      if (userDoc.specialty) responseData.specialty = userDoc.specialty

      console.log(
        `🎉 Agent registration complete: ${userDoc.name} (${userDoc.agency})`
      )
    }

    return NextResponse.json({
      success: true,
      message: isAgent
        ? 'Agent registration successful! Check your email to verify your account.'
        : 'Registration successful! Check your email to verify your account.',
      user: responseData,
      isAgent,
    })
  } catch (error: any) {
    console.error('❌ Registration endpoint error:', error.message)
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    )
  }
}
