//types/auth.ts
export interface User {
  $id: string
  $createdAt: string
  $updatedAt: string
  emailVerifiedAt: string
  name: string
  bio: string
  email: string
  mobilePhone: string
  phone: string
  avatar: string
  emailVerified?: boolean
  userType: 'buyer' | 'seller' | 'agent' | 'admin'
  isActive?: boolean
  savedSearches: string[]
  favoriteProperties: string[]
  verificationToken: string
  lastVerificationRequest: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  phone?: string
  userType: 'buyer' | 'seller' | 'agent'
}

export interface EmailCheckResult {
  exists: boolean
  user?: {
    $id: string
    name: string
    email: string
    emailVerified: boolean
    isActive: boolean
    userType: 'buyer' | 'seller' | 'agent' | 'admin'
  }
}

export interface VerificationEmailResult {
  success: boolean
  message?: string
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  checkEmail: (email: string) => Promise<EmailCheckResult>
  refreshUser: () => Promise<void>
  resendVerificationEmail: () => Promise<VerificationEmailResult>
  dismissVerificationModal: () => void
  showVerificationModal: boolean
  checkVerificationStatus: () => Promise<boolean>
}

export interface AgentDocument {
  name: string
  avatar?: string
  $id: string
  $sequence: number
  $collectionId: string
  $databaseId: string
  $createdAt: string
  $updatedAt: string
  $permissions: string[]
}
