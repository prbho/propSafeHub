// app/settings/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  CheckCircle,
  Mail,
  Phone,
  Save,
  Shield,
  Trash2,
  User,
} from 'lucide-react'
import { toast } from 'sonner'

import DeleteAccountModal from '@/components/DeleteAccountModal'
import { Button } from '@/components/ui/button'
import { updateUserProfile } from '@/lib/appwrite'

interface UserSettings {
  name: string
  email: string
  phone: string
  bio: string
  city: string
  state: string
}

interface NotificationSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  propertyAlerts: boolean
  priceDropAlerts: boolean
  newListingAlerts: boolean
  viewingReminders: boolean
}

interface SecuritySettings {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function SettingsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading, logout, refreshUser } = useAuth()
  const [activeTab, setActiveTab] = useState<
    'profile' | 'notifications' | 'security'
  >('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // User profile settings
  const [userSettings, setUserSettings] = useState<UserSettings>({
    name: '',
    email: '',
    phone: '',
    bio: '',
    city: '',
    state: '',
  })

  // Notification settings
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>({
      emailNotifications: true,
      smsNotifications: false,
      propertyAlerts: true,
      priceDropAlerts: true,
      newListingAlerts: true,
      viewingReminders: true,
    })

  // Security settings
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Load notification settings from localStorage
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notificationSettings')
    if (savedNotifications) {
      try {
        setNotificationSettings(JSON.parse(savedNotifications))
      } catch (error) {
        console.error('Error loading notification settings:', error)
      }
    }
  }, [])

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setUserSettings({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        city: user.city || '',
        state: user.state || '',
      })
      setLoading(false)
    } else if (!authLoading) {
      // Auth check is complete but no user
      setLoading(false)
    }
  }, [user, authLoading])

  const handleUserSettingsChange = (
    field: keyof UserSettings,
    value: string
  ) => {
    setUserSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleNotificationSettingsChange = (
    field: keyof NotificationSettings,
    value: boolean
  ) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSecuritySettingsChange = (
    field: keyof SecuritySettings,
    value: string
  ) => {
    setSecuritySettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // saveProfileSettings function
  const saveProfileSettings = async () => {
    if (!user) return

    setSaving(true)
    setMessage(null)

    try {
      // Use the same function that works in your profile page
      await updateUserProfile(user.$id, userSettings)

      await refreshUser()
      toast.success('Profile updated successfully!')
    } catch {
      toast.error('Error updating profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }
  const saveNotificationSettings = async () => {
    setSaving(true)
    setMessage(null)

    try {
      localStorage.setItem(
        'notificationSettings',
        JSON.stringify(notificationSettings)
      )
      toast.success('Notification preferences saved!')
    } catch {
      toast.error('Error saving notification settings')
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (securitySettings.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/user/security', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: securitySettings.currentPassword,
          newPassword: securitySettings.newPassword,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Password changed successfully!')
        setSecuritySettings({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
      } else {
        toast.error('error', data.error || 'Failed to change password')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Error changing password. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return

    setIsDeleting(true)
    try {
      // Use the same delete function from your profile page
      const response = await fetch('/api/user/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.$id }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete account')
      }

      // Logout and redirect
      await logout()

      // Redirect to home page
      router.push('/')
    } catch {
      toast.error('Failed to delete account. Please try again.')
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const handleSave = () => {
    switch (activeTab) {
      case 'profile':
        saveProfileSettings()
        break
      case 'notifications':
        saveNotificationSettings()
        break
      case 'security':
        changePassword()
        break
    }
  }

  // Loading state - show spinner while checking authentication
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  // Not authenticated state - show after loading is complete
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Sign In Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please sign in to access your settings
          </p>
          <Button
            onClick={() => router.push('/auth/signin')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => router.push('/profile')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Profile
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Sidebar Navigation */}
            <div className="md:w-64 bg-gray-50 border-r border-gray-200 p-6">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">Profile</span>
                </button>

                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === 'notifications'
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Bell className="h-5 w-5" />
                  <span className="font-medium">Notifications</span>
                </button>

                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === 'security'
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Shield className="h-5 w-5" />
                  <span className="font-medium">Security</span>
                </button>
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Profile Information
                    </h2>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={userSettings.name}
                          onChange={(e) =>
                            handleUserSettingsChange('name', e.target.value)
                          }
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="email"
                            value={userSettings.email}
                            onChange={(e) =>
                              handleUserSettingsChange('email', e.target.value)
                            }
                            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="Enter your email"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="tel"
                            value={userSettings.phone}
                            onChange={(e) =>
                              handleUserSettingsChange('phone', e.target.value)
                            }
                            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="Enter your phone number"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          value={userSettings.city}
                          onChange={(e) =>
                            handleUserSettingsChange('city', e.target.value)
                          }
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Enter your city"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State
                        </label>
                        <input
                          type="text"
                          value={userSettings.state}
                          onChange={(e) =>
                            handleUserSettingsChange('state', e.target.value)
                          }
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Enter your state"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bio
                        </label>
                        <textarea
                          value={userSettings.bio}
                          onChange={(e) =>
                            handleUserSettingsChange('bio', e.target.value)
                          }
                          rows={4}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Notification Preferences
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Email Notifications
                        </h3>
                        <p className="text-sm text-gray-600">
                          Receive notifications via email
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.emailNotifications}
                          onChange={(e) =>
                            handleNotificationSettingsChange(
                              'emailNotifications',
                              e.target.checked
                            )
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          SMS Notifications
                        </h3>
                        <p className="text-sm text-gray-600">
                          Receive notifications via SMS
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.smsNotifications}
                          onChange={(e) =>
                            handleNotificationSettingsChange(
                              'smsNotifications',
                              e.target.checked
                            )
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Property Alerts
                        </h3>
                        <p className="text-sm text-gray-600">
                          Get alerts for properties matching your criteria
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.propertyAlerts}
                          onChange={(e) =>
                            handleNotificationSettingsChange(
                              'propertyAlerts',
                              e.target.checked
                            )
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Price Drop Alerts
                        </h3>
                        <p className="text-sm text-gray-600">
                          Notify me when properties I like drop in price
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.priceDropAlerts}
                          onChange={(e) =>
                            handleNotificationSettingsChange(
                              'priceDropAlerts',
                              e.target.checked
                            )
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Security Settings
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password *
                      </label>
                      <input
                        type="password"
                        value={securitySettings.currentPassword}
                        onChange={(e) =>
                          handleSecuritySettingsChange(
                            'currentPassword',
                            e.target.value
                          )
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Enter your current password"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password *
                      </label>
                      <input
                        type="password"
                        value={securitySettings.newPassword}
                        onChange={(e) =>
                          handleSecuritySettingsChange(
                            'newPassword',
                            e.target.value
                          )
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Enter your new password"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password *
                      </label>
                      <input
                        type="password"
                        value={securitySettings.confirmPassword}
                        onChange={(e) =>
                          handleSecuritySettingsChange(
                            'confirmPassword',
                            e.target.value
                          )
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Confirm your new password"
                        required
                      />
                    </div>

                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <h3 className="font-medium text-emerald-800 mb-2">
                        Password Requirements
                      </h3>
                      <ul className="text-sm text-emerald-700 space-y-1">
                        <li>• At least 6 characters long</li>
                        <li>• Include uppercase and lowercase letters</li>
                        <li>• Include numbers and special characters</li>
                      </ul>
                    </div>

                    {/* Delete Account Section */}
                    <div className="pt-6 mt-6 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Danger Zone
                      </h3>
                      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-red-800">
                              Delete Account
                            </h4>
                            <p className="text-sm text-red-600 mt-1">
                              Permanently delete your account and all associated
                              data
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            onClick={() => setShowDeleteModal(true)}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            {isDeleting ? (
                              <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Deleting...
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Trash2 className="h-4 w-4" />
                                Delete Account
                              </div>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3"
                >
                  {saving ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <DeleteAccountModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAccount}
          userEmail={user?.email || ''}
        />
      )}
    </div>
  )
}
