import { User } from '@/types/auth'
import {
  Account,
  Client,
  Databases,
  ID,
  Models,
  Query,
  Realtime,
  Storage,
} from 'appwrite'

// Don't throw errors during build - check if we're in build vs runtime
const isBuildTime =
  typeof window === 'undefined' && process.env.NODE_ENV === 'production'

const client = new Client()

// Use safe getters that don't throw during build
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || ''
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || ''

// Only initialize and validate if we have the config and we're not in build
if (endpoint && projectId && !isBuildTime) {
  client.setEndpoint(endpoint).setProject(projectId)

  // Optionally set API key if available
  // const apiKey = process.env.APPWRITE_API_KEY
  // if (apiKey) {
  //   client.setKey(apiKey)
  // }
}

// Export clients (will be properly initialized at runtime)
export const databases = new Databases(client)
export const account = new Account(client)
export const storage = new Storage(client)
export const realtime = new Realtime(client)

export { Query, ID }

// Database and Collection IDs - with fallbacks for build time
export const DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'fallback-db-id'
export const PROPERTIES_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_PROPERTIES_TABLE_ID || 'fallback-properties'
export const USERS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_USERS_TABLE_ID || 'fallback-users'
export const AGENTS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_AGENTS_TABLE_ID || 'fallback-agents'
export const FAVORITES_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_FAVORITES_TABLE_ID || 'fallback-favorites'
export const STORAGE_BUCKET_ID =
  process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID || 'fallback-storage'

// Helper to check if Appwrite is configured
export function isAppwriteConfigured(): boolean {
  return !!(endpoint && projectId && DATABASE_ID)
}

// Update all functions to check configuration first
interface UserUpdateData {
  name?: string
  phone?: string
  bio?: string
  city?: string
  state?: string
  avatar?: string
}

interface StorageFile extends Models.Document {
  name: string
}

// Generic profile update function
async function _updateProfile(
  userId: string,
  collectionId: string,
  data: Partial<User>
): Promise<User> {
  if (!isAppwriteConfigured()) {
    throw new Error('Appwrite not configured')
  }

  try {
    // Validate input data
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data provided for profile update')
    }

    const updateData: UserUpdateData = {}
    if (data.name != null) updateData.name = data.name
    if (data.phone != null) updateData.phone = data.phone
    if (data.bio != null) updateData.bio = data.bio
    if (data.city != null) updateData.city = data.city
    if (data.state != null) updateData.state = data.state

    if (Object.keys(updateData).length === 0) {
      throw new Error('No valid fields to update')
    }

    const updatedUser = await databases.updateDocument(
      DATABASE_ID,
      collectionId,
      userId,
      updateData
    )

    return {
      $id: updatedUser.$id,
      $createdAt: updatedUser.$createdAt,
      $updatedAt: updatedUser.$updatedAt,
      name: updatedUser.name,
      email: updatedUser.email,
      mobilePhone: updatedUser.mobilePhone,
      emailVerified: updatedUser.emailVerified,
      phone: updatedUser.phone,
      city: updatedUser.city,
      state: updatedUser.state,
      userType: updatedUser.userType,
      isActive: updatedUser.isActive,
      verificationToken: updatedUser.verificationToken,
      lastVerificationRequest: updatedUser.lastVerificationRequest,
      emailVerifiedAt: updatedUser.emailVerifiedAt,
      savedSearches: updatedUser.savedSearches || [],
      favoriteProperties: updatedUser.favoriteProperties || [],
      bio: updatedUser.bio,
      avatar: updatedUser.avatar,
    }
  } catch (error) {
    console.error('Error updating profile:', error)
    throw new Error('Failed to update profile')
  }
}

// User-specific wrapper
export async function updateUserProfile(
  userId: string,
  data: Partial<User>
): Promise<User> {
  if (!userId) {
    throw new Error('User ID is required')
  }
  if (!data) {
    throw new Error('Update data is required')
  }
  return _updateProfile(userId, USERS_COLLECTION_ID, data)
}

// Agent-specific wrapper
export async function updateAgentProfile(
  agentId: string,
  data: Partial<User>
): Promise<User> {
  if (!agentId) {
    throw new Error('Agent ID is required')
  }
  if (!data) {
    throw new Error('Update data is required')
  }
  return _updateProfile(agentId, AGENTS_COLLECTION_ID, data)
}

// Add image upload function
export async function uploadAvatar(
  userId: string,
  file: File | Blob,
  collectionId: string = USERS_COLLECTION_ID
): Promise<string> {
  if (!isAppwriteConfigured()) {
    throw new Error('Appwrite not configured')
  }

  try {
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
      const existingFiles = await storage.listFiles(STORAGE_BUCKET_ID)
      const userAvatarFile = existingFiles.files.find((f) => {
        const storageFile = f as unknown as StorageFile
        return (
          storageFile.name.startsWith(`avatar_${userId}_`) ||
          storageFile.name === `avatar_${userId}.jpg`
        )
      })

      if (userAvatarFile) {
        await storage.deleteFile(STORAGE_BUCKET_ID, userAvatarFile.$id)
      }
    } catch (error) {
      console.log('No existing avatar found or error deleting:', error)
    }

    // Upload new avatar
    const result = await storage.createFile(
      STORAGE_BUCKET_ID,
      ID.unique(),
      uploadFile
    )

    const avatarUrl = storage
      .getFileView(STORAGE_BUCKET_ID, result.$id)
      .toString()

    await databases.updateDocument(DATABASE_ID, collectionId, userId, {
      avatar: avatarUrl,
    })

    return avatarUrl
  } catch (error) {
    console.error('❌ Error uploading avatar:', error)
    throw new Error('Failed to upload avatar')
  }
}

// User avatar upload wrapper
export async function uploadUserAvatar(
  userId: string,
  file: File | Blob
): Promise<string> {
  return uploadAvatar(userId, file, USERS_COLLECTION_ID)
}

// Agent avatar upload wrapper
export async function uploadAgentAvatar(
  agentId: string,
  file: File | Blob
): Promise<string> {
  return uploadAvatar(agentId, file, AGENTS_COLLECTION_ID)
}

// Generic delete account function
async function _deleteAccount(
  userId: string,
  collectionId: string
): Promise<void> {
  if (!isAppwriteConfigured()) {
    throw new Error('Appwrite not configured')
  }

  try {
    // 1. Delete user's avatar from storage if exists
    try {
      const existingFiles = await storage.listFiles(STORAGE_BUCKET_ID)
      const userAvatarFiles = existingFiles.files.filter((f) => {
        const storageFile = f as unknown as StorageFile
        return (
          storageFile.name.startsWith(`avatar_${userId}_`) ||
          storageFile.name === `avatar_${userId}.jpg`
        )
      })

      for (const file of userAvatarFiles) {
        await storage.deleteFile(STORAGE_BUCKET_ID, file.$id)
      }
    } catch (error) {
      console.log('No avatar files found or error deleting avatars:', error)
    }

    // 2. Delete user's favorites
    try {
      const favorites = await databases.listDocuments(
        DATABASE_ID,
        FAVORITES_COLLECTION_ID,
        [Query.equal('userId', userId)]
      )

      for (const favorite of favorites.documents) {
        await databases.deleteDocument(
          DATABASE_ID,
          FAVORITES_COLLECTION_ID,
          favorite.$id
        )
      }
    } catch (error) {
      console.log('No favorites found or error deleting favorites:', error)
    }

    // 3. Delete user document from database
    await databases.deleteDocument(DATABASE_ID, collectionId, userId)

    // 4. Delete user's account
    await account.deleteIdentity(userId)
  } catch (error) {
    console.error('❌ Error deleting user account:', error)
    throw new Error('Failed to delete account')
  }
}

// User-specific delete wrapper
export async function deleteUserAccount(userId: string): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required')
  }
  return _deleteAccount(userId, USERS_COLLECTION_ID)
}

// Agent-specific delete wrapper
export async function deleteAgentAccount(agentId: string): Promise<void> {
  if (!agentId) {
    throw new Error('Agent ID is required')
  }
  return _deleteAccount(agentId, AGENTS_COLLECTION_ID)
}

// Toast notification function - only works in browser
function showToast(
  message: string,
  type: 'success' | 'warning' | 'info' = 'info'
): void {
  // Only run in browser
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    console.log(`[Toast ${type}]: ${message}`)
    return
  }

  const existingToast = document.getElementById('custom-toast')
  if (existingToast) {
    existingToast.remove()
  }

  const toast = document.createElement('div')
  toast.id = 'custom-toast'
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    font-weight: 500;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    max-width: 300px;
    word-wrap: break-word;
    animation: slideIn 0.3s ease-out;
  `

  switch (type) {
    case 'success':
      toast.style.backgroundColor = '#10b981'
      break
    case 'warning':
      toast.style.backgroundColor = '#f59e0b'
      break
    case 'info':
      toast.style.backgroundColor = '#3b82f6'
      break
  }

  toast.textContent = message

  const style = document.createElement('style')
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `
  document.head.appendChild(style)
  document.body.appendChild(toast)

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-in forwards'
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast)
      }
      if (style.parentNode) {
        style.parentNode.removeChild(style)
      }
    }, 300)
  }, 4000)

  toast.addEventListener('click', () => {
    toast.style.animation = 'slideOut 0.3s ease-in forwards'
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast)
      }
      if (style.parentNode) {
        style.parentNode.removeChild(style)
      }
    }, 300)
  })
}

// Helper functions
export const getCurrentUser = async () => {
  if (!isAppwriteConfigured()) {
    return null
  }

  try {
    return await account.get()
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      'code' in error &&
      (error as { code?: number }).code === 401
    ) {
      return null
    }
    throw error
  }
}
