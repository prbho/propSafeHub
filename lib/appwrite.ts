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

const client = new Client()

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!

// FIXED: Better production detection
const isProductionBuild = process.env.NODE_ENV === 'production'
const isBrowser = typeof window !== 'undefined'

// Only initialize if we have the config AND we're not in a problematic state
if (endpoint && projectId) {
  // We have config, initialize normally
  client.setEndpoint(endpoint).setProject(projectId)
  console.log('✅ Appwrite initialized')
} else if (!isBrowser && isProductionBuild) {
  // Server-side during production build - skip initialization
  console.warn('⚠️ Appwrite: Skipping initialization during production build')
} else if (isBrowser) {
  // Client-side at runtime - throw helpful error
  console.error('❌ Appwrite configuration missing in browser')
  // Don't throw immediately, let the app render and show a user-friendly error
}

export const databases = new Databases(client)
export const account = new Account(client)
export const storage = new Storage(client)
export const realtime = new Realtime(client)

export { Query, ID }

// Database and Collection IDs - with runtime checks
export const DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'missing-db-id'
export const PROPERTIES_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_PROPERTIES_TABLE_ID || 'missing-properties'
export const USERS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_USERS_TABLE_ID || 'missing-users'
export const AGENTS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_AGENTS_TABLE_ID || 'missing-agents'
export const FAVORITES_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_FAVORITES_TABLE_ID || 'missing-favorites'
export const STORAGE_BUCKET_ID =
  process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID || 'missing-storage'

// Add a helper to check if Appwrite is configured
export function isAppwriteConfigured(): boolean {
  return !!(endpoint && projectId && client.config.endpoint)
}

// Add this function and call it in your app
export function initializeAppwriteWithRetry() {
  if (!endpoint || !projectId) {
    console.error('Cannot initialize Appwrite: Missing configuration')
    return false
  }

  if (!client.config.endpoint || !client.config.project) {
    client.setEndpoint(endpoint).setProject(projectId)
    console.log('Appwrite initialized successfully')
  }
  return true
}

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

// Generic profile update function (internal/private - not exported)
async function _updateProfile(
  userId: string,
  collectionId: string,
  data: Partial<User>
): Promise<User> {
  try {
    // Validate input data
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data provided for profile update')
    }

    // Only include fields that exist in your Appwrite collection
    const updateData: UserUpdateData = {}

    // Safely check each property with nullish checks
    if (data.name != null) updateData.name = data.name
    if (data.phone != null) updateData.phone = data.phone
    if (data.bio != null) updateData.bio = data.bio
    if (data.city != null) updateData.city = data.city
    if (data.state != null) updateData.state = data.state

    // Validate that at least one field is being updated
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

// User-specific wrapper (exported - use this for users)
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

// Agent-specific wrapper (exported - use this for agents)
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

    // Show upload progress
    showToast('Uploading avatar...', 'info')

    // Delete old avatar if exists - search by name pattern
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
      // Continue with upload even if deletion fails
    }

    // Create unique filename with userId
    // const fileName = `avatar_${userId}_${Date.now()}.jpg`

    // Upload new avatar with proper permissions
    const result = await storage.createFile(
      STORAGE_BUCKET_ID,
      ID.unique(),
      uploadFile
    )

    // Get the file URL - use getFileView for permanent URLs
    const avatarUrl = storage
      .getFileView(STORAGE_BUCKET_ID, result.$id)
      .toString()

    // Update user/agent document with avatar URL
    await databases.updateDocument(DATABASE_ID, collectionId, userId, {
      avatar: avatarUrl,
    })

    console.log('✅ User document updated with avatar URL')

    // Show success toast
    showToast('Avatar uploaded successfully!', 'success')

    return avatarUrl
  } catch (error) {
    console.error('❌ Error uploading avatar:', error)

    // Show error toast
    showToast('Failed to upload avatar. Please try again.', 'warning')

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

// Generic delete account function (internal)
async function _deleteAccount(
  userId: string,
  collectionId: string
): Promise<void> {
  try {
    console.log('🗑️ Starting account deletion for user:', userId)

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
        console.log(
          '✅ Deleted avatar file:',
          (file as unknown as StorageFile).name
        )
      }
    } catch (error) {
      console.log('No avatar files found or error deleting avatars:', error)
    }

    // 2. Delete user's favorites (if you have a separate favorites collection)
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
        console.log('✅ Deleted favorite:', favorite.$id)
      }
    } catch (error) {
      console.log('No favorites found or error deleting favorites:', error)
    }

    // 3. Delete user document from database
    await databases.deleteDocument(DATABASE_ID, collectionId, userId)
    console.log('✅ Deleted user document')

    // 4. Delete user's account (this will also delete sessions)
    await account.deleteIdentity(userId)
    console.log('✅ Deleted user account')

    // Show success toast
    showToast('Account deleted successfully', 'success')
  } catch (error) {
    console.error('❌ Error deleting user account:', error)

    // Show error toast
    showToast('Failed to delete account. Please try again.', 'warning')

    throw new Error('Failed to delete account')
  }
}

// User-specific delete wrapper (exported)
export async function deleteUserAccount(userId: string): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required')
  }
  return _deleteAccount(userId, USERS_COLLECTION_ID)
}

// Agent-specific delete wrapper (exported)
export async function deleteAgentAccount(agentId: string): Promise<void> {
  if (!agentId) {
    throw new Error('Agent ID is required')
  }
  return _deleteAccount(agentId, AGENTS_COLLECTION_ID)
}

// Toast notification function using browser dialogs
function showToast(
  message: string,
  type: 'success' | 'warning' | 'info' = 'info'
): void {
  const existingToast = document.getElementById('custom-toast')
  if (existingToast) {
    existingToast.remove()
  }

  // Create toast element
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

  // Set background color based on type
  switch (type) {
    case 'success':
      toast.style.backgroundColor = '#10b981' // green
      break
    case 'warning':
      toast.style.backgroundColor = '#f59e0b' // amber
      break
    case 'info':
      toast.style.backgroundColor = '#3b82f6' // blue
      break
  }

  toast.textContent = message

  // Add styles for animation
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

  // Add to DOM
  document.body.appendChild(toast)

  // Auto remove after 4 seconds
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

  // Optional: Allow manual dismissal by clicking
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

// Delete Property Images
export async function deleteImageFromStorage(imageUrl: string): Promise<void> {
  try {
    // Extract file ID from URL
    const urlParts = imageUrl.split('/')
    const fileId = urlParts[urlParts.length - 1]

    await storage.deleteFile(STORAGE_BUCKET_ID, fileId)
    console.log('✅ Deleted image:', fileId)
  } catch (error) {
    console.error('❌ Error deleting image:', error)
    // Don't throw - we'll continue even if one image fails
  }
}

// Bulk delete function
export async function deleteImagesFromStorage(
  imageUrls: string[]
): Promise<void> {
  for (const url of imageUrls) {
    await deleteImageFromStorage(url)
  }
}
