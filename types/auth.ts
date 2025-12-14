//types/auth.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

export type UserType = 'buyer' | 'seller' | 'agent' | 'admin'

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
  userType: UserType
  isActive?: boolean
  savedSearches: string[]
  favoriteProperties: string[]
  verificationToken: string
  lastVerificationRequest: string
  city: string
  state: string
  recentlyViewed?: string[]

  // Agent-specific fields
  agentDocumentId?: string
  agency?: string
  licenseNumber?: string
  yearsExperience?: number
  specialties?: string[]
  languages?: string[]
  totalListings?: number
  rating?: number
  reviewCount?: number
  isVerified?: boolean
  verificationDocuments?: string[]
  officePhone?: string
  website?: string
  specialty?: string
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

// types/auth.ts
export type RegisterData = {
  name: string
  email: string
  password: string
  userType: 'buyer' | 'seller' | 'agent'
  phone?: string
  agentData?: {
    agency: string
    city: string
    licenseNumber: string
    yearsExperience?: number
    specialties?: string[]
    languages?: string[]
    bio?: string
    state?: string
    website?: string
    specialty?: string
  }
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
    city: string
    agency: string
  }
}

export interface VerificationEmailResult {
  success: boolean
  message?: string
  data?: any
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

export interface UserDocument {
  name: string
  avatar?: string
  userType: string
  $id: string
  $sequence: number
  $collectionId: string
  $databaseId: string
  createdAt: string
  $updatedAt: string
  $permissions: string[]
  $createdAt: string
}
