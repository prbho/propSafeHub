import '@/lib/appwrite-build-fix'
// app/api/agents/become-agent/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server'
import { ID } from 'appwrite'

import {
  AGENTS_COLLECTION_ID,
  DATABASE_ID,
  serverDatabases,
  USERS_COLLECTION_ID,
} from '@/lib/appwrite-server'
import { uploadAvatarServer } from '@/lib/services/appwrite-server-avatar'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const userId = formData.get('userId') as string
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const licenseNumber = formData.get('licenseNumber') as string
    const agency = formData.get('agency') as string
    const specialties = JSON.parse(formData.get('specialties') as string)
    const yearsExperience = parseInt(formData.get('yearsExperience') as string)
    const bio = formData.get('bio') as string
    const phone = formData.get('phone') as string
    const officePhone = formData.get('officePhone') as string
    const mobilePhone = formData.get('mobilePhone') as string
    const website = formData.get('website') as string
    const languages = JSON.parse(formData.get('languages') as string)
    const city = formData.get('city') as string
    const specialty = formData.get('specialty') as string
    const avatarFile = formData.get('avatar') as File
    const existingAvatar = formData.get('existingAvatar') as string

    console.log('🔄 Processing agent upgrade for user:', userId)

    // 1. Verify user exists and is currently a buyer
    const user = await serverDatabases.getDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      userId
    )

    if (user.userType === 'agent') {
      return NextResponse.json(
        { error: 'User is already an agent' },
        { status: 400 }
      )
    }

    // 2. Handle avatar - it's required
    let avatarUrl = existingAvatar

    // Validate existing avatar URL if it exists
    if (avatarUrl && !isValidUrl(avatarUrl)) {
      console.log('⚠️ Existing avatar URL is invalid, will upload new one')
      avatarUrl = ''
    }

    // If new avatar file is provided, upload it
    if (avatarFile && avatarFile.size > 0) {
      console.log('📸 Uploading new avatar for agent...')

      try {
        // Use server-compatible upload function
        avatarUrl = await uploadAvatarServer(userId, avatarFile)
        console.log('✅ New avatar uploaded:', avatarUrl)
      } catch {
        return NextResponse.json(
          { error: 'Failed to upload professional photo' },
          { status: 500 }
        )
      }
    }

    // If no avatar exists (neither existing nor new), return error
    if (!avatarUrl || !isValidUrl(avatarUrl)) {
      return NextResponse.json(
        { error: 'Professional photo is required to become an agent' },
        { status: 400 }
      )
    }

    // 3. Check if agent profile already exists for this user
    try {
      const existingAgent = await serverDatabases.listDocuments(
        DATABASE_ID,
        AGENTS_COLLECTION_ID,
        [`equal("userId", "${userId}")`]
      )

      if (existingAgent.total > 0) {
        return NextResponse.json(
          { error: 'Agent profile already exists for this user' },
          { status: 409 }
        )
      }
    } catch {}

    // 4. Create agent document with shared user attributes including avatar
    const agentData = {
      userId: userId,
      name: name,
      email: email,
      avatar: avatarUrl,
      licenseNumber,
      agency,
      specialties,
      yearsExperience,
      bio,
      phone: mobilePhone || phone,
      officePhone,
      mobilePhone,
      website,
      languages: languages || ['English'],
      city,
      specialty: specialty || specialties[0] || '',
      totalListings: 0,
      rating: 0,
      reviewCount: 0,
      isVerified: false,
      verificationDocuments: [],
    }

    console.log('📝 Creating agent document with data:', {
      ...agentData,
      avatar: avatarUrl.substring(0, 100) + '...', // Log truncated URL
    })

    const agent = await serverDatabases.createDocument(
      DATABASE_ID,
      AGENTS_COLLECTION_ID,
      ID.unique(),
      agentData
    )

    // 5. Update user type to 'agent' and ensure avatar is synced
    const updateData: any = {
      userType: 'agent',
    }

    // Update phone if mobile phone was provided and different
    if (mobilePhone && mobilePhone !== user.phone) {
      updateData.phone = mobilePhone
    }

    // Update bio if provided and different
    if (bio && bio !== user.bio) {
      updateData.bio = bio
    }

    // Ensure avatar is synced to user collection (in case it was newly uploaded)
    if (avatarUrl && avatarUrl !== user.avatar) {
      updateData.avatar = avatarUrl
    }

    await serverDatabases.updateDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      userId,
      updateData
    )

    console.log('✅ User upgraded to agent with synced avatar:', userId)

    return NextResponse.json({
      success: true,
      agentId: agent.$id,
      message: 'Successfully upgraded to agent account',
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to validate URL format
function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}
