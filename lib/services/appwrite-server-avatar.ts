// lib/appwrite-server-avatar.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ID, Permission, Role } from 'appwrite'

import {
  DATABASE_ID,
  databases,
  serverStorage,
  STORAGE_BUCKET_ID,
  USERS_COLLECTION_ID,
} from '../appwrite-server'

export async function uploadAvatarServer(
  userId: string,
  file: File | Blob
): Promise<string> {
  try {
    // Convert blob to file if needed
    let uploadFile: File
    if (file instanceof Blob && !(file instanceof File)) {
      uploadFile = new File([file], 'avatar.jpg', {
        type: 'image/jpeg',
        lastModified: Date.now(),
      })
    } else {
      uploadFile = file as File
    }

    // Delete old avatar if exists
    try {
      const existingFiles = await serverStorage.listFiles(STORAGE_BUCKET_ID)
      const userAvatarFile = existingFiles.files.find(
        (f: any) =>
          f.name.startsWith(`avatar_${userId}_`) ||
          f.name === `avatar_${userId}.jpg`
      )

      if (userAvatarFile) {
        await serverStorage.deleteFile(STORAGE_BUCKET_ID, userAvatarFile.$id)
      }
    } catch (error) {
    }

    // Upload new avatar with PUBLIC read permissions
    const result = await serverStorage.createFile(
      STORAGE_BUCKET_ID,
      ID.unique(),
      uploadFile,
      [
        Permission.read(Role.any()), // Make it publicly readable
        Permission.update(Role.user(userId)), // Only user can update
        Permission.delete(Role.user(userId)), // Only user can delete
      ]
    )

    // Generate proper file URL - Use the correct method based on your AppWrite setup
    const avatarUrl = generateFileUrl(result.$id)

    // Validate URL format before saving
    if (!isValidUrl(avatarUrl)) {
      throw new Error(`Invalid URL generated: ${avatarUrl}`)
    }

    // Update user document with avatar URL
    await databases.updateDocument(DATABASE_ID, USERS_COLLECTION_ID, userId, {
      avatar: avatarUrl,
    })

    return avatarUrl
  } catch (error) {
    console.error('❌ Server: Error uploading avatar:', error)
    throw new Error('Failed to upload avatar')
  }
}

// Helper function to generate proper file URL
function generateFileUrl(fileId: string): string {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!
  const bucketId = STORAGE_BUCKET_ID

  // Construct the proper file view URL
  const url = `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`

  return url
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

