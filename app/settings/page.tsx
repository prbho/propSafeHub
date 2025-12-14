// app/settings/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  Key,
  Lock,
  LogOut,
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
import { account, updateUserProfile } from '@/lib/appwrite'

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
    'profile' | 'notifications' | 'security' | 'danger'
  >('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

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

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: '',
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

  // Calculate password strength
  useEffect(() => {
    if (!securitySettings.newPassword) {
      setPasswordStrength({ score: 0, feedback: '' })
      return
    }

    const password = securitySettings.newPassword
    let score = 0
    const feedback = []

    // Length check
    if (password.length >= 8) score += 1
    else feedback.push('At least 8 characters')

    // Uppercase check
    if (/[A-Z]/.test(password)) score += 1
    else feedback.push('One uppercase letter')

    // Lowercase check
    if (/[a-z]/.test(password)) score += 1
    else feedback.push('One lowercase letter')

    // Number check
    if (/\d/.test(password)) score += 1
    else feedback.push('One number')

    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1
    else feedback.push('One special character')

    // Length bonus
    if (password.length >= 12) score += 1

    setPasswordStrength({
      score,
      feedback: feedback.length > 0 ? feedback.join(', ') : 'Strong password!',
    })
  }, [securitySettings.newPassword])

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
      await updateUserProfile(user.$id, userSettings)
      await refreshUser()
      toast.success('Profile updated successfully!', {
        description: 'Your changes have been saved.',
      })
    } catch {
      toast.error('Error updating profile', {
        description: 'Please try again.',
      })
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
      toast.success('Notification preferences saved!', {
        description: 'Your preferences have been updated.',
      })
    } catch {
      toast.error('Error saving notification settings', {
        description: 'Please try again.',
      })
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    // Validation
    if (!securitySettings.currentPassword) {
      toast.error('Current password required', {
        description: 'Please enter your current password.',
      })
      return
    }

    if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      toast.error('Passwords do not match', {
        description: 'New password and confirmation must match.',
      })
      return
    }

    if (securitySettings.newPassword.length < 6) {
      toast.error('Password too short', {
        description: 'Password must be at least 6 characters long.',
      })
      return
    }

    if (passwordStrength.score < 3) {
      toast.error('Weak password', {
        description: 'Please choose a stronger password.',
      })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      console.log('🔒 Attempting password change...')

      // Direct Appwrite call
      await account.updatePassword(
        securitySettings.newPassword,
        securitySettings.currentPassword
      )

      toast.success('Password changed successfully!', {
        description: 'You can now use your new password to log in.',
      })

      // Clear the form
      setSecuritySettings({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error: any) {
      console.error('❌ Password change error:', error)

      if (error.code === 401) {
        toast.error('Current password incorrect', {
          description: 'Please check your current password and try again.',
        })
      } else if (error.code === 400) {
        toast.error('Invalid password format', {
          description: 'Please choose a stronger password.',
        })
      } else if (error.type === 'general_unauthorized_scope') {
        toast.error('Session expired', {
          description: 'Please log in again to continue.',
        })
      } else {
        toast.error('Failed to change password', {
          description: 'Please try again later.',
        })
      }
    } finally {
      setSaving(false)
    }
  }

  const handleLogoutAllSessions = async () => {
    if (!user) return

    setIsLoggingOut(true)
    try {
      await account.deleteSessions()
      await logout()
      toast.success('Logged out from all sessions', {
        description: 'You have been logged out from all devices.',
      })
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to log out from all sessions', {
        description: 'Please try again.',
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return

    setIsDeleting(true)
    try {
      const response = await fetch('/api/users/delete-account', {
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

      toast.success('Account deleted successfully', {
        description: 'Your account and all data have been permanently removed.',
      })

      // Redirect to home page
      router.push('/')
    } catch {
      toast.error('Failed to delete account', {
        description: 'Please try again later.',
      })
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
      // Danger zone has separate buttons for each action
    }
  }

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading settings...</p>
          <p className="text-sm text-gray-500 mt-1">Please wait a moment</p>
        </div>
      </div>
    )
  }

  // Not authenticated state
  if (!user) {
    return (
      <div className="min-h-screen bg-linear-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="h-10 w-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Sign In Required
            </h2>
            <p className="text-gray-600 mb-8">
              Please sign in to access your account settings and preferences
            </p>
            <Button
              onClick={() => router.push('/login')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-medium text-base shadow-sm hover:shadow transition-all duration-200"
            >
              Sign In Now
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => router.push('/profile')}
              className="flex items-center gap-2 border-gray-300 hover:border-emerald-300 hover:bg-emerald-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Profile
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Account Settings
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your profile, security, and account preferences
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Sidebar Navigation */}
            <div className="lg:w-64 bg-linear-to-b from-gray-50 to-gray-100 border-r border-gray-200 p-6">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Image
                      className="w-10 h-10 rounded-full"
                      src={user.avatar || '/default-avatar.png'}
                      alt="User Avatar"
                      width={40}
                      height={40}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
              </div>

              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                    activeTab === 'profile'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100 hover:shadow-sm'
                  }`}
                >
                  <User
                    className={`h-5 w-5 ${activeTab === 'profile' ? 'text-white' : 'text-gray-500'}`}
                  />
                  <span className="font-medium">Profile</span>
                </button>

                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                    activeTab === 'notifications'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100 hover:shadow-sm'
                  }`}
                >
                  <Bell
                    className={`h-5 w-5 ${activeTab === 'notifications' ? 'text-white' : 'text-gray-500'}`}
                  />
                  <span className="font-medium">Notifications</span>
                </button>

                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                    activeTab === 'security'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100 hover:shadow-sm'
                  }`}
                >
                  <Shield
                    className={`h-5 w-5 ${activeTab === 'security' ? 'text-white' : 'text-gray-500'}`}
                  />
                  <span className="font-medium">Security</span>
                </button>

                <button
                  onClick={() => setActiveTab('danger')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                    activeTab === 'danger'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-red-600 hover:bg-red-50 hover:shadow-sm'
                  }`}
                >
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">Danger Zone</span>
                </button>
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Profile Information
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Update your personal information and preferences
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
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
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
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
                                handleUserSettingsChange(
                                  'email',
                                  e.target.value
                                )
                              }
                              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
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
                                handleUserSettingsChange(
                                  'phone',
                                  e.target.value
                                )
                              }
                              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                              placeholder="Enter your phone number"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
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
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
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
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            placeholder="Enter your state"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bio
                          </label>
                          <textarea
                            value={userSettings.bio}
                            onChange={(e) =>
                              handleUserSettingsChange('bio', e.target.value)
                            }
                            rows={4}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            placeholder="Tell us about yourself..."
                          />
                          <p className="text-sm text-gray-500 mt-2">
                            Brief description for your profile
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Notification Preferences
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Choose how you want to be notified about property updates
                    </p>

                    <div className="space-y-4">
                      {[
                        {
                          id: 'emailNotifications',
                          title: 'Email Notifications',
                          description: 'Receive notifications via email',
                          enabled: notificationSettings.emailNotifications,
                        },
                        {
                          id: 'smsNotifications',
                          title: 'SMS Notifications',
                          description: 'Receive notifications via SMS',
                          enabled: notificationSettings.smsNotifications,
                        },
                        {
                          id: 'propertyAlerts',
                          title: 'Property Alerts',
                          description:
                            'Get alerts for properties matching your criteria',
                          enabled: notificationSettings.propertyAlerts,
                        },
                        {
                          id: 'priceDropAlerts',
                          title: 'Price Drop Alerts',
                          description:
                            'Notify me when properties I like drop in price',
                          enabled: notificationSettings.priceDropAlerts,
                        },
                        {
                          id: 'newListingAlerts',
                          title: 'New Listing Alerts',
                          description:
                            'Get notified about new properties in your area',
                          enabled: notificationSettings.newListingAlerts,
                        },
                        {
                          id: 'viewingReminders',
                          title: 'Viewing Reminders',
                          description:
                            'Reminders for scheduled property viewings',
                          enabled: notificationSettings.viewingReminders,
                        },
                      ].map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-5 border border-gray-200 rounded-xl hover:border-emerald-300 transition-all"
                        >
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {item.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {item.description}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.enabled}
                              onChange={(e) =>
                                handleNotificationSettingsChange(
                                  item.id as keyof NotificationSettings,
                                  e.target.checked
                                )
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Security Settings
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Update your password and enhance account security
                    </p>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password *
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="password"
                              value={securitySettings.currentPassword}
                              onChange={(e) =>
                                handleSecuritySettingsChange(
                                  'currentPassword',
                                  e.target.value
                                )
                              }
                              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                              placeholder="Enter your current password"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password *
                          </label>
                          <div className="relative">
                            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="password"
                              value={securitySettings.newPassword}
                              onChange={(e) =>
                                handleSecuritySettingsChange(
                                  'newPassword',
                                  e.target.value
                                )
                              }
                              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                              placeholder="Enter your new password"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password *
                          </label>
                          <div className="relative">
                            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="password"
                              value={securitySettings.confirmPassword}
                              onChange={(e) =>
                                handleSecuritySettingsChange(
                                  'confirmPassword',
                                  e.target.value
                                )
                              }
                              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                              placeholder="Confirm your new password"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Password Strength Indicator */}
                      {securitySettings.newPassword && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              Password Strength
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {passwordStrength.score}/6
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                passwordStrength.score <= 2
                                  ? 'bg-red-500'
                                  : passwordStrength.score <= 4
                                    ? 'bg-yellow-500'
                                    : 'bg-emerald-500'
                              }`}
                              style={{
                                width: `${(passwordStrength.score / 6) * 100}%`,
                              }}
                            />
                          </div>
                          <p className="text-sm text-gray-600">
                            {passwordStrength.feedback}
                          </p>
                        </div>
                      )}

                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                        <h3 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                          <Lock className="h-5 w-5" />
                          Password Requirements
                        </h3>
                        <ul className="text-sm text-emerald-700 space-y-2">
                          <li className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${securitySettings.newPassword?.length >= 8 ? 'bg-emerald-500' : 'bg-emerald-200'}`}
                            />
                            At least 8 characters long
                          </li>
                          <li className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${/[A-Z]/.test(securitySettings.newPassword) ? 'bg-emerald-500' : 'bg-emerald-200'}`}
                            />
                            One uppercase letter (A-Z)
                          </li>
                          <li className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${/[a-z]/.test(securitySettings.newPassword) ? 'bg-emerald-500' : 'bg-emerald-200'}`}
                            />
                            One lowercase letter (a-z)
                          </li>
                          <li className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${/\d/.test(securitySettings.newPassword) ? 'bg-emerald-500' : 'bg-emerald-200'}`}
                            />
                            One number (0-9)
                          </li>
                          <li className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${/[!@#$%^&*(),.?":{}|<>]/.test(securitySettings.newPassword) ? 'bg-emerald-500' : 'bg-emerald-200'}`}
                            />
                            One special character
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Danger Zone Tab */}
              {activeTab === 'danger' && (
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          Danger Zone
                        </h2>
                        <p className="text-gray-600">
                          Irreversible actions that affect your account
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Logout All Sessions */}
                      <div className="border border-red-200 rounded-xl bg-red-50 overflow-hidden">
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-red-800 mb-1 flex items-center gap-2">
                                <LogOut className="h-5 w-5" />
                                Log Out From All Sessions
                              </h3>
                              <p className="text-sm text-red-600">
                                This will log you out from all devices where
                                you&apos;re currently signed in.
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            onClick={handleLogoutAllSessions}
                            disabled={isLoggingOut}
                            className="border-red-300 text-red-700 hover:bg-red-100 hover:text-red-800"
                          >
                            {isLoggingOut ? (
                              <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                Logging out...
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <LogOut className="h-4 w-4" />
                                Log Out Everywhere
                              </div>
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Delete Account */}
                      <div className="border border-red-200 rounded-xl bg-red-50 overflow-hidden">
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-red-800 mb-1 flex items-center gap-2">
                                <Trash2 className="h-5 w-5" />
                                Delete Account Permanently
                              </h3>
                              <p className="text-sm text-red-600">
                                Once you delete your account, there is no going
                                back. This action cannot be undone. All your
                                data, properties, and preferences will be
                                permanently removed.
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            onClick={() => setShowDeleteModal(true)}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 text-white shadow-sm"
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

              {/* Save Button (Not shown for Danger Zone) */}
              {activeTab !== 'danger' && (
                <div className="mt-10 pt-8 border-t border-gray-200">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-lg font-medium shadow-sm hover:shadow transition-all duration-200"
                  >
                    {saving ? (
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving Changes...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <Save className="h-5 w-5" />
                        <span>Save Changes</span>
                      </div>
                    )}
                  </Button>
                </div>
              )}
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
