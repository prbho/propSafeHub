// lib/appwrite-auth.ts
import { User } from '@/types/auth'
import { Account, Client, Databases, ID, Query, Storage } from 'appwrite'
import { Models } from 'node-appwrite'
import { toast } from 'sonner'

const client = new Client()

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!

if (!endpoint || !projectId) {
  throw new Error('Missing Appwrite configuration')
}

client.setEndpoint(endpoint).setProject(projectId)

export const databases = new Databases(client)
export const account = new Account(client)
export const storage = new Storage(client)

export { Query, ID }

// Database and Collection IDs
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!
export const PROPERTIES_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_PROPERTIES_TABLE_ID!
export const USERS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_USERS_TABLE_ID!
export const AGENTS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_AGENTS_TABLE_ID!
export const FAVORITES_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_FAVORITES_TABLE_ID!
export const STORAGE_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID!

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

export async function updateUserProfile(
  userId: string,
  data: Partial<User>
): Promise<User> {
  try {
    // Include ALL fields that can be updated, including avatar
    const updateData: UserUpdateData = {}

    if (data.name !== undefined) updateData.name = data.name
    if (data.phone !== undefined) updateData.phone = data.phone
    if (data.bio !== undefined) updateData.bio = data.bio
    if (data.avatar !== undefined) updateData.avatar = data.avatar // THIS WAS MISSING!

    const updatedUser = await databases.updateDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      userId,
      updateData
    )

    return {
      $id: updatedUser.$id,
      $createdAt: updatedUser.$createdAt,
      $updatedAt: updatedUser.$updatedAt,
      name: updatedUser.name,
      email: updatedUser.email,
      city: updatedUser.city,
      state: updatedUser.state,
      emailVerified: updatedUser.emailVerified,
      phone: updatedUser.phone,
      mobilePhone: updatedUser.mobilePhone,

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
    console.error('Error updating user profile:', error)
    throw new Error('Failed to update profile')
  }
}

// Add image upload function
export async function uploadAvatar(
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
      // Continue with upload even if deletion fails
    }

    // Create unique filename with userId
    const fileName = `avatar_${userId}_${Date.now()}.jpg`

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

    // Update user document with avatar URL
    await databases.updateDocument(DATABASE_ID, USERS_COLLECTION_ID, userId, {
      avatar: avatarUrl,
    })

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

// Delete function
export async function deleteUserAccount(userId: string): Promise<void> {
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
      }
    } catch (error) {
    }

    // 3. Delete user document from database
    await databases.deleteDocument(DATABASE_ID, USERS_COLLECTION_ID, userId)
    // 4. Delete user's account (this will also delete sessions)
    await account.deleteIdentity(userId)
    // Show success toast
    showToast('Account deleted successfully', 'success')
  } catch (error) {
    console.error('❌ Error deleting user account:', error)

    // Show error toast
    showToast('Failed to delete account. Please try again.', 'warning')

    throw new Error('Failed to delete account')
  }
}

// Helper functions
export const getCurrentUser = async () => {
  try {
    return await account.get()
  } catch {
    throw toast.error
  }
}

