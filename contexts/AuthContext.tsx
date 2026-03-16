// contexts/AuthContext.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import {
  AuthState,
  EmailCheckResult,
  LoginCredentials,
  RegisterData,
  User,
  VerificationEmailResult,
} from '@/types/auth'
import { Query } from 'appwrite'

import EmailVerificationModal from '@/components/EmailVerificationModal'
import {
  account,
  AGENTS_COLLECTION_ID,
  DATABASE_ID,
  databases,
  USERS_COLLECTION_ID,
} from '@/lib/appwrite'

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData | FormData) => Promise<void>
  logout: () => Promise<void>
  checkEmail: (email: string) => Promise<EmailCheckResult>
  refreshUser: () => Promise<void>
  resendVerificationEmail: (email: string) => Promise<VerificationEmailResult>
  dismissVerificationModal: () => void
  showVerificationModal: boolean
  checkVerificationStatus: () => Promise<boolean>
}

const debugLog = (...args: unknown[]) => {
  // Only log in development mode
  if (process.env.NODE_ENV === 'development') {
    console.log(...args)
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [verificationDismissed, setVerificationDismissed] = useState(false)
  const [authCheckComplete, setAuthCheckComplete] = useState(false)

  // Fetch user document from database - UPDATED TO CHECK BOTH COLLECTIONS

  const fetchUserDocument = async (userId: string): Promise<User | null> => {
    try {
      debugLog('📄 Fetching user document for:', userId)

      let userDoc
      let collectionId = USERS_COLLECTION_ID
      let agentDocumentId: string | undefined = undefined
      let avatarUrl: string | undefined = undefined

      // First, get the Appwrite account to know the user's type
      let userType = 'user' // default
      try {
        const appwriteUser = await account.get()
        userType = appwriteUser.labels?.includes('agent') ? 'agent' : 'user'
      } catch {
        // If can't get account, proceed with fallback method
      }

      // If user is likely an agent, try agents collection first
      if (userType === 'agent') {
        try {
          userDoc = await databases.getDocument(
            DATABASE_ID,
            AGENTS_COLLECTION_ID,
            userId
          )
          collectionId = AGENTS_COLLECTION_ID
          agentDocumentId = userDoc.$id
          avatarUrl = userDoc.avatar

          debugLog('✅ User found in AGENTS collection (direct agent login)')
        } catch {
          // If not found in agents, fall back to users collection
          try {
            userDoc = await databases.getDocument(
              DATABASE_ID,
              USERS_COLLECTION_ID,
              userId
            )
            collectionId = USERS_COLLECTION_ID
            avatarUrl = userDoc.avatar

            debugLog('✅ User found in USERS collection (fallback)')
          } catch {
            return null
          }
        }
      } else {
        // For regular users, try users collection first
        try {
          userDoc = await databases.getDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            userId
          )
          collectionId = USERS_COLLECTION_ID
          avatarUrl = userDoc.avatar

          // If user is an agent type but not found in agents, try to find agent profile
          if (userDoc.userType === 'agent') {
            try {
              const agentProfiles = await databases.listDocuments(
                DATABASE_ID,
                AGENTS_COLLECTION_ID,
                [Query.equal('userId', userId)]
              )

              if (agentProfiles.documents.length > 0) {
                const agentProfile = agentProfiles.documents[0]
                agentDocumentId = agentProfile.$id
                avatarUrl = agentProfile.avatar || userDoc.avatar

                debugLog('✅ Found agent profile for user:', {
                  userAccountId: userId,
                  agentDocumentId: agentProfile.$id,
                })
              }
            } catch (agentError) {
              debugLog('⚠️ Could not search for agent profile:', agentError)
            }
          }
        } catch {
          // If not found in users, try agents as last resort
          try {
            userDoc = await databases.getDocument(
              DATABASE_ID,
              AGENTS_COLLECTION_ID,
              userId
            )
            collectionId = AGENTS_COLLECTION_ID
            agentDocumentId = userDoc.$id
            avatarUrl = userDoc.avatar

            debugLog('✅ User found in AGENTS collection (last resort)')
          } catch {
            return null
          }
        }
      }

      debugLog('✅ User document fetched successfully:', {
        id: userDoc.$id,
        email: userDoc.email,
        name: userDoc.name,
        userType: userDoc.userType,
        collection: collectionId === USERS_COLLECTION_ID ? 'users' : 'agents',
      })

      // Build user object (rest of your existing code)
      const userObject: User = {
        $id: userDoc.$id,
        $createdAt: userDoc.$createdAt,
        $updatedAt: userDoc.$updatedAt,
        name: userDoc.name,
        email: userDoc.email,
        emailVerified: userDoc.emailVerified,
        phone: userDoc.phone || '',
        mobilePhone: userDoc.mobilePhone || '',
        userType: userDoc.userType || 'user',
        isActive: userDoc.isActive,
        verificationToken: userDoc.verificationToken,
        lastVerificationRequest: userDoc.lastVerificationRequest,
        emailVerifiedAt: userDoc.emailVerifiedAt,
        savedSearches: userDoc.savedSearches || [],
        favoriteProperties: userDoc.favoriteProperties || [],
        avatar: avatarUrl || userDoc.avatar || '',
        bio: userDoc.bio,
        city: userDoc.city,
        state: userDoc.state,
      }

      // Add agent document ID if found
      if (agentDocumentId) {
        userObject.agentDocumentId = agentDocumentId
      }

      // Add agent-specific fields if user is an agent
      if (
        collectionId === AGENTS_COLLECTION_ID ||
        userDoc.userType === 'agent'
      ) {
        userObject.agency = userDoc.agency
        userObject.licenseNumber = userDoc.licenseNumber
        userObject.yearsExperience = userDoc.yearsExperience
        userObject.specialties = userDoc.specialties || []
        userObject.languages = userDoc.languages || ['English']
        userObject.totalListings = userDoc.totalListings || 0
        userObject.rating = userDoc.rating || 0
        userObject.reviewCount = userDoc.reviewCount || 0
        userObject.isVerified = userDoc.isVerified || false
        userObject.verificationDocuments = userDoc.verificationDocuments || []
        userObject.officePhone = userDoc.officePhone
        userObject.website = userDoc.website
        userObject.specialty = userDoc.specialty
      }

      return userObject
    } catch (error) {
      console.error('❌ Error fetching user document:', error)
      return null
    }
  }

  // Create user document if it doesn't exist
  // This function is kept for potential future use, but eslint warning is suppressed
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const createUserDocument = async (userId: string): Promise<User | null> => {
  //   try {
  //     debugLog('📝 Creating user document for:', userId)

  //     const appwriteUser = await account.get()

  //     const userDoc = await databases.createDocument(
  //       DATABASE_ID,
  //       USERS_COLLECTION_ID,
  //       userId,
  //       {
  //         name: appwriteUser.name,
  //         email: appwriteUser.email,
  //         emailVerified: false,
  //         userType: 'buyer',
  //         isActive: true,
  //         savedSearches: [],
  //         favoriteProperties: [],
  //       }
  //     )

  //     debugLog('✅ User document created:', userDoc)

  //     return {
  //       $id: userDoc.$id,
  //       $createdAt: userDoc.$createdAt,
  //       $updatedAt: userDoc.$updatedAt,
  //       name: userDoc.name,
  //       email: userDoc.email,
  //       bio: userDoc.bio,
  //       state: userDoc.state,
  //       city: userDoc.city,
  //       emailVerified: userDoc.emailVerified,
  //       phone: userDoc.phone,
  //       mobilePhone: userDoc.mobilePhone,
  //       userType: userDoc.userType,
  //       isActive: userDoc.isActive,
  //       verificationToken: userDoc.verificationToken,
  //       lastVerificationRequest: userDoc.lastVerificationRequest,
  //       emailVerifiedAt: userDoc.emailVerifiedAt,
  //       savedSearches: userDoc.savedSearches || [],
  //       favoriteProperties: userDoc.favoriteProperties || [],
  //       avatar: userDoc.avatar,
  //     }
  //   } catch (error) {
  //     console.error('❌ Error creating user document:', error)
  //     return null
  //   }
  // }

  const checkAuthStatus = useCallback(async () => {
    try {
      debugLog('🔍 Starting auth status check...')
      setAuthState((prev) => ({ ...prev, isLoading: true }))

      // Check if we have a valid session first
      try {
        const session = await account.getSession('current')
        debugLog('✅ Session found:', {
          id: session.$id,
          userId: session.userId,
          expire: session.expire,
        })
      } catch {
        debugLog('❌ No active session found')
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        })
        setAuthCheckComplete(true)
        return
      }

      // Then get the Appwrite user
      const appwriteUser = await account.get()
      debugLog('✅ Appwrite user account found:', {
        id: appwriteUser.$id,
        email: appwriteUser.email,
        name: appwriteUser.name,
      })

      // Fetch complete user data from database (UPDATED TO CHECK BOTH COLLECTIONS)
      const userDoc = await fetchUserDocument(appwriteUser.$id)

      if (userDoc) {
        debugLog('🎯 Setting authenticated state with user:', {
          email: userDoc.email,
          userType: userDoc.userType,
          emailVerified: userDoc.emailVerified,
          isAgent: userDoc.userType === 'agent',
        })

        setAuthState({
          user: userDoc,
          isLoading: false,
          isAuthenticated: true,
        })
        setAuthCheckComplete(true)

        // Show verification modal if user is not verified and hasn't dismissed it
        if (!userDoc.emailVerified && !verificationDismissed) {
          debugLog('📧 Showing verification modal - user not verified')
          setShowVerificationModal(true)
        } else if (userDoc.emailVerified) {
          debugLog('✅ User is verified, hiding modal')
          setShowVerificationModal(false)
        }
      } else {
        debugLog('❌ Could not fetch user document')
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        })
        setAuthCheckComplete(true)
      }
    } catch {
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
      setAuthCheckComplete(true)
    }
  }, [verificationDismissed])

  useEffect(() => {
    debugLog('🚀 AuthProvider mounted - checking auth status')
    checkAuthStatus()
  }, [checkAuthStatus])

  const checkVerificationStatus = async (): Promise<boolean> => {
    try {
      if (!authState.user) {
        debugLog('❌ No user in auth state for verification check')
        return false
      }

      debugLog('🔍 Checking verification status for user:', authState.user.$id)
      const updatedUser = await fetchUserDocument(authState.user.$id)

      if (updatedUser?.emailVerified) {
        debugLog('✅ User email is verified!')
        setAuthState((prev) => ({
          ...prev,
          user: updatedUser,
        }))
        setShowVerificationModal(false)
        return true
      }

      debugLog('📧 User email not yet verified')
      return false
    } catch (error) {
      console.error('❌ Error checking verification status:', error)
      return false
    }
  }

  // refreshUser function (single implementation)
  const refreshUser = async () => {
    try {
      debugLog('🔄 Refreshing user data...')

      if (!authState.user) {
        debugLog('❌ No user to refresh')
        return
      }

      const updatedUserDoc = await fetchUserDocument(authState.user.$id)

      if (updatedUserDoc) {
        debugLog('✅ User data refreshed:', {
          name: updatedUserDoc.name,
          email: updatedUserDoc.email,
          userType: updatedUserDoc.userType,
          avatar: updatedUserDoc.avatar, // Check if avatar is included
          collection: updatedUserDoc.userType === 'agent' ? 'agents' : 'users',
        })

        setAuthState((prev) => ({
          ...prev,
          user: updatedUserDoc,
        }))
      }
    } catch (error) {
      console.error('❌ Error refreshing user:', error)
    }
  }

  const checkEmail = async (email: string): Promise<EmailCheckResult> => {
    try {
      debugLog('🔍 Checking email existence:', email)
      const normalizedEmail = email.toLowerCase().trim()
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      })

      if (!response.ok) {
        throw new Error('Unable to verify email at the moment')
      }

      const data = await response.json()
      return { exists: data.exists === true }
    } catch {
      return { exists: false }
    }
  }

  const login = async (credentials: LoginCredentials) => {
    try {
      debugLog('🔐 Attempting login for:', credentials.email)
      setAuthState((prev) => ({ ...prev, isLoading: true }))

      await account.createEmailPasswordSession(
        credentials.email,
        credentials.password
      )

      await checkAuthStatus()
    } catch (error: any) {
      console.error('❌ Login error details:', {
        code: error.code,
        message: error.message,
        type: error.type,
        response: error.response,
      })

      setAuthState((prev) => ({ ...prev, isLoading: false }))

      // Map Appwrite errors to user-friendly messages
      let userFriendlyError = error

      if (error.code === 400) {
        userFriendlyError = {
          ...error,
          message: 'Invalid email or password. Please try again.',
        }
      } else if (error.code === 401) {
        userFriendlyError = {
          ...error,
          message: 'Invalid credentials. Please check your email and password.',
        }
      } else if (error.code === 429) {
        userFriendlyError = {
          ...error,
          message: 'Too many login attempts. Please try again in 15 minutes.',
        }
      } else if (
        error.message?.toLowerCase().includes('password') ||
        error.message?.toLowerCase().includes('credentials')
      ) {
        userFriendlyError = {
          ...error,
          message: 'Incorrect password. Please try again.',
        }
      }

      throw userFriendlyError
    }
  }

  const register = async (data: RegisterData | FormData) => {
    try {
      debugLog('📝 Starting registration...')
      setAuthState((prev) => ({ ...prev, isLoading: true }))

      let response
      let registrationEmail = ''
      let registrationPassword = ''

      // Check if data is FormData (for file uploads)
      if (data instanceof FormData) {
        debugLog('📁 Using FormData for registration (with file)')
        registrationEmail = String(data.get('email') || '')
        registrationPassword = String(data.get('password') || '')

        // Add debug logging for FormData contents
        debugLog('📋 FormData entries:')
        for (const [key, value] of data.entries()) {
          if (key === 'avatar' && value instanceof File) {
            debugLog(`  ${key}:`, {
              name: value.name,
              type: value.type,
              size: value.size,
            })
          } else if (key === 'agentData' && typeof value === 'string') {
            try {
              debugLog(`  ${key}:`, JSON.parse(value))
            } catch {
              debugLog(`  ${key}:`, value)
            }
          } else {
            debugLog(`  ${key}:`, value)
          }
        }

        response = await fetch('/api/auth/register', {
          method: 'POST',
          body: data,
          // DO NOT set Content-Type header - browser will set it automatically
        })
      } else {
        // Handle regular JSON data (backward compatibility)
        debugLog('📄 Using JSON for registration (no file)')
        registrationEmail = data.email || ''
        registrationPassword = data.password || ''
        debugLog('📋 Registration data:', {
          ...data,
          password: '[PROTECTED]',
          email: data.email ? `${data.email.substring(0, 3)}...` : 'none',
        })

        response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      }

      const result = await response.json()

      if (!response.ok) {
        console.error('❌ Registration API error:', result.error)
        throw new Error(result.error || 'Registration failed')
      }

      debugLog('✅ Registration successful, user:', {
        id: result.user?.id,
        email: result.user?.email
          ? `${result.user.email.substring(0, 3)}...`
          : 'none',
        userType: result.user?.userType,
        hasAvatar: !!result.user?.avatar,
      })

      // Try to create a real client session after successful registration.
      // If session creation fails, keep the user in a non-authenticated state.
      let sessionCreated = false
      if (registrationEmail && registrationPassword) {
        try {
          await account.createEmailPasswordSession(
            registrationEmail,
            registrationPassword
          )
          sessionCreated = true
        } catch (sessionError) {
          console.warn('⚠️ Could not create session after registration:', {
            email: registrationEmail.substring(0, 3) + '...',
            error: sessionError,
          })
        }
      }

      // Update auth state
      setAuthState({
        user: result.user,
        isLoading: false,
        isAuthenticated: sessionCreated,
      })
      setAuthCheckComplete(true)

      // Show verification modal
      setVerificationDismissed(false)
      setShowVerificationModal(true)

      debugLog('📧 Verification modal shown')

      return result // Return the result for the caller
    } catch (error: any) {
      console.error('❌ Registration error:', error.message || error)
      setAuthState((prev) => ({ ...prev, isLoading: false }))
      throw error // Re-throw the error for the caller to handle
    }
  }

  const resendVerificationEmail = async (
    email: string
  ): Promise<VerificationEmailResult> => {
    try {
      debugLog('📧 Resending verification email to:', email)

      if (!email) {
        throw new Error('Email is required')
      }

      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      debugLog('📡 Response status:', response.status, response.statusText)

      // Get response text first to see what we're getting
      const responseText = await response.text()
      debugLog('📄 Raw response text:', responseText.substring(0, 200) + '...')

      let errorData
      try {
        errorData = JSON.parse(responseText)
      } catch (parseError) {
        console.error('❌ Failed to parse JSON response:', parseError)
        throw new Error(
          `Server returned invalid JSON: ${responseText.substring(0, 100)}`
        )
      }

      if (!response.ok) {
        console.error('❌ Resend verification API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        })

        // Provide more specific error messages
        let userMessage = 'Failed to resend verification email'

        if (errorData?.code === 'USER_NOT_FOUND') {
          userMessage = 'User not found with this email address'
        } else if (errorData?.code === 'ALREADY_VERIFIED') {
          userMessage = 'Email is already verified'
        } else if (errorData?.code === 'EMAIL_SEND_FAILED') {
          userMessage = 'Failed to send email. Please try again later.'
        } else if (errorData?.error) {
          userMessage = errorData.error
        } else if (errorData?.message) {
          userMessage = errorData.message
        }

        throw new Error(userMessage)
      }

      debugLog('✅ Verification email resent successfully:', errorData)

      return {
        success: true,
        message:
          errorData.message ||
          'Verification email sent! Please check your inbox.',
        data: errorData, // Pass along any additional data
      }
    } catch (error: any) {
      console.error('❌ Resend verification catch error:', error.message)
      // Don't use toast.error here - let the component handle it
      throw error // Re-throw so the component can show the error
    }
  }
  const dismissVerificationModal = () => {
    debugLog('📧 Verification modal dismissed')
    setShowVerificationModal(false)
    setVerificationDismissed(true)
  }

  const logout = async () => {
    try {
      debugLog('🚪 Logging out...')
      setAuthState((prev) => ({ ...prev, isLoading: true }))
      await account.deleteSession('current')
    } catch (error) {
      console.error('❌ Logout error:', error)
    } finally {
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
      setAuthCheckComplete(true)
      setShowVerificationModal(false)
      setVerificationDismissed(false)
      debugLog('✅ Logout completed')
    }
  }

  // CORRECTED context value (no duplicate refreshUser)
  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    checkEmail,
    refreshUser, // Only one instance
    resendVerificationEmail,
    dismissVerificationModal,
    showVerificationModal,
    checkVerificationStatus,
  }

  // Debug: Log when auth state changes
  useEffect(() => {
    debugLog('🔄 Auth state updated:', {
      isAuthenticated: authState.isAuthenticated,
      isLoading: authState.isLoading,
      authCheckComplete,
      user: authState.user
        ? {
            email: authState.user.email,
            name: authState.user.name,
            userType: authState.user.userType,
            emailVerified: authState.user.emailVerified,
            isAgent: authState.user.userType === 'agent',
          }
        : null,
    })
  }, [authState, authCheckComplete])

  return (
    <AuthContext.Provider value={value}>
      {children}
      <EmailVerificationModal
        isOpen={showVerificationModal && !authState.user?.emailVerified}
        userEmail={authState.user?.email || ''}
        onClose={dismissVerificationModal}
        onResendEmail={() => {
          debugLog('📧 Resend email triggered for:', authState.user?.email)
          return resendVerificationEmail(authState.user?.email || '')
        }}
        onCheckVerification={checkVerificationStatus}
      />
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
