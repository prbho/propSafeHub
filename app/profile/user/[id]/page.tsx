// app/profile/page.tsx - UPDATED WITH PREMIUM FEATURES
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  Camera,
  Check,
  Crown,
  Edit3,
  Eye,
  Heart,
  Home,
  Mail,
  Phone,
  Save,
  Star,
  User,
  X,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'

import CountdownTimer from '@/components/CountdownTimer'
import DeleteAccountModal from '@/components/DeleteAccountModal'
import ImageCropperModal from '@/components/ImageCropperModal'
import PremiumButton from '@/components/PremiumButton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { updateAgentProfile, uploadAgentAvatar } from '@/lib/appwrite'
import { deleteUserAccount } from '@/lib/appwrite-auth'

const checkUserPremiumStatus = async (userId: string) => {
  try {
    const response = await fetch(`/api/premium/status?userId=${userId}`)
    if (response.ok) {
      return await response.json()
    }
    throw new Error('Failed to fetch premium status')
  } catch (error) {
    console.error('Error checking premium status:', error)
    return {
      hasPremium: false,
      activePlans: [],
      startDate: null,
      expiresAt: null,
    }
  }
}

export default function UserProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, logout, isLoading, refreshUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showCropper, setShowCropper] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
  })
  const [premiumStatus, setPremiumStatus] = useState({
    hasPremium: false,
    activePlans: [] as string[],
    startDate: null as string | null,
    expiresAt: null as string | null,
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Move loadPremiumStatus inside useEffect and memoize it with useCallback
  const loadPremiumStatus = useCallback(async () => {
    if (!user) return

    try {
      const status = await checkUserPremiumStatus(user.$id)
      setPremiumStatus(status)
    } catch {}
  }, [user])

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
      })

      // Load premium status
      loadPremiumStatus()
    }
  }, [user, loadPremiumStatus]) // Now loadPremiumStatus is included in dependencies

  const handleSave = async () => {
    if (!user) return

    try {
      // Update user profile in database
      await updateAgentProfile(user.$id, formData)

      // Refresh the user data in AuthContext
      await refreshUser()

      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    // Create object URL for the selected image
    const imageUrl = URL.createObjectURL(file)
    setSelectedImage(imageUrl)
    setShowCropper(true)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    if (!user) return

    setIsUploading(true)
    try {
      console.log('🔄 Uploading cropped avatar...')

      // Convert blob to file
      const croppedFile = new File([croppedImageBlob], 'avatar.jpg', {
        type: 'image/jpeg',
        lastModified: Date.now(),
      })

      await uploadAgentAvatar(user.$id, croppedFile)

      // Refresh user data to get the new avatar
      await refreshUser()
    } catch (error) {
      console.error('Error uploading cropped avatar:', error)
    } finally {
      setIsUploading(false)
      // Clean up object URL
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage)
      }
    }
  }

  const handleCancelCrop = () => {
    setShowCropper(false)
    // Clean up object URL
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage)
      setSelectedImage('')
    }
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
      })
    }
    setIsEditing(false)
  }

  const handleDeleteAccount = async () => {
    if (!user) return

    setIsDeleting(true)
    try {
      console.log('🗑️ Starting account deletion process...')

      await deleteUserAccount(user.$id)

      // Logout and redirect
      await logout()

      // Redirect to home page
      router.push('/')
    } catch (error) {
      console.error('❌ Error deleting account:', error)
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Not Signed In
          </h2>
          <p className="text-gray-600 mb-4">
            Please sign in to view your profile
          </p>
          <button
            onClick={() => router.push('/login')}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="shrink-0">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={user?.avatar} alt={user.name} />
                  <AvatarFallback>
                    <User className="w-12 h-12 text-gray-400" />
                  </AvatarFallback>
                </Avatar>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />

                {/* Camera Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute bottom-2 right-2 p-2 bg-emerald-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
              </div>
              {isUploading && (
                <p className="text-sm text-gray-600 mt-2 text-center">
                  Uploading...
                </p>
              )}
            </div>

            {/* User Details */}
            <div className="flex-1 space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
                      disabled
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Email cannot be changed
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Tell us about yourself..."
                      maxLength={500}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {formData.bio.length}/500 characters
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {user.name}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {user.bio || 'No bio yet.'}
                    </p>
                    {user.userType && (
                      <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {user.userType === 'agent'
                          ? 'Real Estate Agent'
                          : 'Property Buyer'}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-gray-700">
                      <Mail className="w-4 h-4" />
                      <span>{user.email}</span>
                      {user.emailVerified && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Verified
                        </span>
                      )}
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <Phone className="w-4 h-4" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Premium Subscription Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Crown className="w-6 h-6 text-yellow-500" />
                Premium Features
              </h2>
              <p className="text-gray-600 mt-1">
                Unlock exclusive features to boost your real estate experience
              </p>
            </div>

            {premiumStatus.hasPremium ? (
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                Premium Active
              </div>
            ) : (
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-2">Ready to upgrade?</p>
                <PremiumButton
                  propertyId="profile-upgrade" // Special ID for profile upgrades
                  propertyTitle="Profile Premium Upgrade"
                  currentPlan={null}
                />
              </div>
            )}
          </div>
          {/* Premium Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 - Enhanced Visibility */}
            <div
              className={`border rounded-lg p-4 ${premiumStatus.hasPremium ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`p-2 rounded-lg ${premiumStatus.hasPremium ? 'bg-green-100' : 'bg-blue-100'}`}
                >
                  <Eye
                    className={`w-5 h-5 ${premiumStatus.hasPremium ? 'text-green-600' : 'text-emerald-600'}`}
                  />
                </div>
                <h3 className="font-semibold text-gray-900">
                  Enhanced Visibility
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Your properties appear at the top of search results
              </p>
              {premiumStatus.hasPremium ? (
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <Check className="w-4 h-4" />
                  <span>Active</span>
                </div>
              ) : (
                <span className="text-emerald-600 text-sm font-medium">
                  Upgrade to unlock
                </span>
              )}
            </div>

            {/* Feature 2 - Premium Badge */}
            <div
              className={`border rounded-lg p-4 ${premiumStatus.hasPremium ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`p-2 rounded-lg ${premiumStatus.hasPremium ? 'bg-green-100' : 'bg-blue-100'}`}
                >
                  <Star
                    className={`w-5 h-5 ${premiumStatus.hasPremium ? 'text-green-600' : 'text-emerald-600'}`}
                  />
                </div>
                <h3 className="font-semibold text-gray-900">Premium Badge</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Stand out with exclusive premium verification badge
              </p>
              {premiumStatus.hasPremium ? (
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <Check className="w-4 h-4" />
                  <span>Active</span>
                </div>
              ) : (
                <span className="text-emerald-600 text-sm font-medium">
                  Upgrade to unlock
                </span>
              )}
            </div>

            {/* Feature 3 - Priority Support */}
            <div
              className={`border rounded-lg p-4 ${premiumStatus.hasPremium ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`p-2 rounded-lg ${premiumStatus.hasPremium ? 'bg-green-100' : 'bg-blue-100'}`}
                >
                  <Zap
                    className={`w-5 h-5 ${premiumStatus.hasPremium ? 'text-green-600' : 'text-emerald-600'}`}
                  />
                </div>
                <h3 className="font-semibold text-gray-900">
                  Priority Support
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Get faster responses and dedicated support
              </p>
              {premiumStatus.hasPremium ? (
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <Check className="w-4 h-4" />
                  <span>Active</span>
                </div>
              ) : (
                <span className="text-emerald-600 text-sm font-medium">
                  Upgrade to unlock
                </span>
              )}
            </div>
          </div>
          {/* Current Plan Info */}
          {premiumStatus.hasPremium && premiumStatus.expiresAt && (
            <div className="mt-6">
              {/* Use CountdownTimer instead of EnhancedCountdown */}
              <div className="bg-linear-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                      Time Remaining
                    </h4>
                    <CountdownTimer
                      targetDate={premiumStatus.expiresAt}
                      showLabels={true}
                      className="justify-start"
                    />
                  </div>
                  <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    Extend Plan
                  </button>
                </div>
              </div>

              {/* Additional plan info */}
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex flex-wrap gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Active Plans:</span>
                    <span className="ml-2 font-semibold capitalize">
                      {premiumStatus.activePlans.join(', ') ||
                        'Premium Membership'}
                    </span>
                  </div>
                  <div className="ml-auto">
                    <span className="text-gray-600">Expires:</span>
                    <span className="ml-2 font-semibold">
                      {new Date(premiumStatus.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Saved Properties */}
          <div
            onClick={() => router.push('/profile/saved')}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-50 rounded-lg">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {user.favoriteProperties?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Saved Properties</div>
              </div>
            </div>
            <div className="text-emerald-600 text-sm font-medium hover:text-blue-700">
              View all →
            </div>
          </div>

          {/* Recent Views */}
          <div
            onClick={() => router.push('/profile/recent')}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Eye className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {user.savedSearches?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Saved Searches</div>
              </div>
            </div>
            <div className="text-emerald-600 text-sm font-medium hover:text-blue-700">
              View searches →
            </div>
          </div>

          {/* Account Type */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <Home className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 capitalize">
                  {user.userType || 'buyer'}
                </div>
                <div className="text-sm text-gray-600">Account Type</div>
              </div>
            </div>
            {(user.userType === 'buyer' || user.userType === 'seller') && (
              <button
                onClick={() => router.push('/become-agent')}
                className="text-emerald-600 text-sm font-medium hover:text-blue-700"
              >
                Become an Agent →
              </button>
            )}
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Account Settings
          </h2>
          <div className="space-y-4">
            <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="font-medium text-gray-900">Change Password</div>
              <div className="text-sm text-gray-600">
                Update your account password
              </div>
            </button>

            <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="font-medium text-gray-900">Privacy Settings</div>
              <div className="text-sm text-gray-600">
                Manage your privacy preferences
              </div>
            </button>

            {!user.emailVerified && (
              <button
                onClick={() => router.push('/auth/verify-email')}
                className="w-full text-left p-4 border border-yellow-200 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <div className="font-medium text-yellow-800">
                  Verify Email Address
                </div>
                <div className="text-sm text-yellow-600">
                  Complete your account verification
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Delete Account */}
        <button
          onClick={() => setShowDeleteModal(true)}
          disabled={isDeleting}
          className="w-full text-left p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors bg-white mt-6 text-red-600 disabled:opacity-50"
        >
          <div className="font-medium flex items-center gap-2">
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                Deleting Account...
              </>
            ) : (
              'Delete Account'
            )}
          </div>
          <div className="text-sm">
            Permanently delete your account and all data
          </div>
        </button>

        {showDeleteModal && (
          <DeleteAccountModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDeleteAccount}
            userEmail={user?.email || ''}
          />
        )}
      </div>

      {/* Cropper Modal */}
      {showCropper && (
        <ImageCropperModal
          image={selectedImage}
          onClose={handleCancelCrop}
          onCropComplete={handleCropComplete}
          aspectRatio={1}
        />
      )}
    </div>
  )
}
