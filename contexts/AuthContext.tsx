// contexts/AuthContext.tsx
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
import { toast } from 'sonner'

import EmailVerificationModal from '@/components/EmailVerificationModal'
import {
  account,
  DATABASE_ID,
  databases,
  USERS_COLLECTION_ID,
} from '@/lib/appwrite'

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  checkEmail: (email: string) => Promise<EmailCheckResult>
  refreshUser: () => Promise<void>
  resendVerificationEmail: (email: string) => Promise<VerificationEmailResult>
  dismissVerificationModal: () => void
  showVerificationModal: boolean
  checkVerificationStatus: () => Promise<boolean>
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

  // Fetch user document from database
  const fetchUserDocument = async (userId: string): Promise<User | null> => {
    try {
      console.log('📄 Fetching user document for:', userId)
      const userDoc = await databases.getDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId
      )

      console.log('✅ User document fetched successfully:', {
        id: userDoc.$id,
        email: userDoc.email,
        name: userDoc.name,
        userType: userDoc.userType,
        emailVerified: userDoc.emailVerified,
        avatar: userDoc.avatar,
      })

      return {
        $id: userDoc.$id,
        $createdAt: userDoc.$createdAt,
        $updatedAt: userDoc.$updatedAt,
        name: userDoc.name,
        email: userDoc.email,
        bio: userDoc.bio,
        city: userDoc.city,
        state: userDoc.state,
        emailVerified: userDoc.emailVerified,
        phone: userDoc.phone,
        mobilePhone: userDoc.mobilePhone,
        userType: userDoc.userType,
        isActive: userDoc.isActive,
        verificationToken: userDoc.verificationToken,
        lastVerificationRequest: userDoc.lastVerificationRequest,
        emailVerifiedAt: userDoc.emailVerifiedAt,
        savedSearches: userDoc.savedSearches || [],
        favoriteProperties: userDoc.favoriteProperties || [],
        avatar: userDoc.avatar,
      }
    } catch {
      return null
    }
  }

  // Create user document if it doesn't exist
  // This function is kept for potential future use, but eslint warning is suppressed
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const createUserDocument = async (userId: string): Promise<User | null> => {
    try {
      console.log('📝 Creating user document for:', userId)

      const appwriteUser = await account.get()

      const userDoc = await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId,
        {
          name: appwriteUser.name,
          email: appwriteUser.email,
          emailVerified: false,
          userType: 'buyer',
          isActive: true,
          savedSearches: [],
          favoriteProperties: [],
        }
      )

      console.log('✅ User document created:', userDoc)

      return {
        $id: userDoc.$id,
        $createdAt: userDoc.$createdAt,
        $updatedAt: userDoc.$updatedAt,
        name: userDoc.name,
        email: userDoc.email,
        bio: userDoc.bio,
        state: userDoc.state,
        city: userDoc.city,
        emailVerified: userDoc.emailVerified,
        phone: userDoc.phone,
        mobilePhone: userDoc.mobilePhone,
        userType: userDoc.userType,
        isActive: userDoc.isActive,
        verificationToken: userDoc.verificationToken,
        lastVerificationRequest: userDoc.lastVerificationRequest,
        emailVerifiedAt: userDoc.emailVerifiedAt,
        savedSearches: userDoc.savedSearches || [],
        favoriteProperties: userDoc.favoriteProperties || [],
        avatar: userDoc.avatar,
      }
    } catch (error) {
      console.error('❌ Error creating user document:', error)
      return null
    }
  }

  const checkAuthStatus = useCallback(async () => {
    try {
      console.log('🔍 Starting auth status check...')
      setAuthState((prev) => ({ ...prev, isLoading: true }))

      // Check if we have a valid session first
      try {
        const session = await account.getSession('current')
        console.log('✅ Session found:', {
          id: session.$id,
          userId: session.userId,
          expire: session.expire,
        })
      } catch {
        console.log('❌ No active session found')
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
      console.log('✅ Appwrite user account found:', {
        id: appwriteUser.$id,
        email: appwriteUser.email,
        name: appwriteUser.name,
      })

      // Fetch complete user data from database
      const userDoc = await fetchUserDocument(appwriteUser.$id)

      if (userDoc) {
        console.log('🎯 Setting authenticated state with user:', {
          email: userDoc.email,
          userType: userDoc.userType,
          emailVerified: userDoc.emailVerified,
        })

        setAuthState({
          user: userDoc,
          isLoading: false,
          isAuthenticated: true,
        })
        setAuthCheckComplete(true)

        // Show verification modal if user is not verified and hasn't dismissed it
        if (!userDoc.emailVerified && !verificationDismissed) {
          console.log('📧 Showing verification modal - user not verified')
          setShowVerificationModal(true)
        } else if (userDoc.emailVerified) {
          console.log('✅ User is verified, hiding modal')
          setShowVerificationModal(false)
        }
      } else {
        console.log('❌ Could not fetch user document')
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
    console.log('🚀 AuthProvider mounted - checking auth status')
    checkAuthStatus()
  }, [checkAuthStatus])

  const checkVerificationStatus = async (): Promise<boolean> => {
    try {
      if (!authState.user) {
        console.log('❌ No user in auth state for verification check')
        return false
      }

      console.log(
        '🔍 Checking verification status for user:',
        authState.user.$id
      )
      const updatedUser = await fetchUserDocument(authState.user.$id)

      if (updatedUser?.emailVerified) {
        console.log('✅ User email is verified!')
        setAuthState((prev) => ({
          ...prev,
          user: updatedUser,
        }))
        setShowVerificationModal(false)
        return true
      }

      console.log('📧 User email not yet verified')
      return false
    } catch (error) {
      console.error('❌ Error checking verification status:', error)
      return false
    }
  }

  // CORRECTED refreshUser function (single implementation)
  const refreshUser = async () => {
    try {
      console.log('🔄 Refreshing user data...')

      if (!authState.user) {
        console.log('❌ No user to refresh')
        return
      }

      const updatedUserDoc = await fetchUserDocument(authState.user.$id)

      if (updatedUserDoc) {
        console.log('✅ User data refreshed:', {
          name: updatedUserDoc.name,
          email: updatedUserDoc.email,
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
      console.log('🔍 Checking email existence:', email)

      const normalizedEmail = email.toLowerCase().trim()

      const response = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal('email', normalizedEmail), Query.limit(1)]
      )

      console.log('📊 Database query result:', {
        total: response.total,
        documents: response.documents.length,
      })

      if (response.documents.length > 0) {
        const userDoc = response.documents[0]
        console.log('✅ User found in database:', {
          id: userDoc.$id,
          userType: userDoc.userType,
          emailVerified: userDoc.emailVerified,
        })

        return {
          exists: true,
          user: {
            $id: userDoc.$id,
            name: userDoc.name,
            email: userDoc.email,
            emailVerified: userDoc.emailVerified,
            isActive: userDoc.isActive,
            userType: userDoc.userType,
          },
        }
      } else {
        console.log('❌ No user found with email:', normalizedEmail)
        return { exists: false }
      }
    } catch {
      return { exists: false }
    }
  }

  const login = async (credentials: LoginCredentials) => {
    try {
      console.log('🔐 Attempting login for:', credentials.email)
      setAuthState((prev) => ({ ...prev, isLoading: true }))

      await account.createEmailPasswordSession(
        credentials.email,
        credentials.password
      )

      await checkAuthStatus()
    } catch {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
    }
  }

  const register = async (data: RegisterData) => {
    try {
      console.log('📝 Starting registration for:', data.email)
      setAuthState((prev) => ({ ...prev, isLoading: true }))

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('❌ Registration API error:', result.error)
        throw new Error(result.error || 'Registration failed')
      }

      console.log('✅ Registration successful, user:', result.user)

      // Immediately update auth state
      setAuthState({
        user: result.user,
        isLoading: false,
        isAuthenticated: true,
      })
      setAuthCheckComplete(true)

      // Show verification modal
      setVerificationDismissed(false)
      setShowVerificationModal(true)

      console.log('📧 Verification modal shown')
    } catch {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
      throw toast.error('Registration failed')
    }
  }

  const resendVerificationEmail = async (
    email: string
  ): Promise<VerificationEmailResult> => {
    try {
      console.log('📧 Resending verification email to:', email)

      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Resend verification error:', errorData)
        throw new Error(
          errorData.error || 'Failed to resend verification email'
        )
      }

      console.log('✅ Verification email resent successfully')

      return {
        success: true,
        message: 'Verification email sent! Please check your inbox.',
      }
    } catch {
      throw toast.error('Failed to send verification email')
    }
  }

  const dismissVerificationModal = () => {
    console.log('📧 Verification modal dismissed')
    setShowVerificationModal(false)
    setVerificationDismissed(true)
  }

  const logout = async () => {
    try {
      console.log('🚪 Logging out...')
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
      console.log('✅ Logout completed')
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
    console.log('🔄 Auth state updated:', {
      isAuthenticated: authState.isAuthenticated,
      isLoading: authState.isLoading,
      authCheckComplete,
      user: authState.user
        ? {
            email: authState.user.email,
            name: authState.user.name,
            userType: authState.user.userType,
            emailVerified: authState.user.emailVerified,
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
          console.log('📧 Resend email triggered for:', authState.user?.email)
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
