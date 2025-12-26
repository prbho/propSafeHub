import {
  AuthState,
  EmailCheckResult,
  LoginCredentials,
  RegisterData,
  VerificationEmailResult,
} from './auth'

export interface Property {
  $id: string
  $collectionId: string
  $databaseId: string
  $createdAt: string
  $updatedAt: string
  $permissions: string[]

  // Properties attributes
  ownerName?: string
  agentId: string
  titles: string[]
  userId: string
  name: string
  propertyId: string
  agentName: string
  title: string
  description: string
  propertyType: 'house' | 'apartment' | 'condo' | 'land' | 'townhouse'
  status: 'for-sale' | 'for-rent' | 'short-let' | 'sold' | 'rented' | 'active'
  price: number
  priceUnit: 'monthly' | 'yearly' | 'total'
  originalPrice?: number
  priceHistory?: PriceHistory[]
  address: string
  paymentOutright: string
  phone: string
  city: string
  state: string
  zipCode: string
  country: string
  neighborhood?: string
  latitude: number
  longitude: number
  bedrooms: number
  bathrooms: number
  squareFeet: number
  lotSize?: number
  yearBuilt?: number
  features: string[]
  amenities: string[]
  images: string[]
  videos: string[]
  ownerId: string
  listedBy: 'owner' | 'agent'
  listDate: string
  lastUpdated: string
  isActive: boolean
  isFeatured: boolean
  isVerified: boolean
  tags: string[]
  views: number
  favorites: number

  // FOR SHORT-LET
  minimumStay?: number // Minimum nights
  maximumStay?: number // Maximum nights
  availabilityStart?: string // ISO date string
  availabilityEnd?: string // ISO date string
  instantBooking?: boolean // Can be booked instantly
  checkInTime?: string // e.g., "14:00"
  checkOutTime?: string // e.g., "11:00"
  houseRules?: string[] // Array of house rules
  cancellationPolicy?: 'flexible' | 'moderate' | 'strict'

  // paymentOptions
  outright: boolean
  paymentPlan: boolean
  mortgageEligible: boolean
  customPlanAvailable: boolean
  customPlanDepositPercent: number
  customPlanMonths: number

  // analytics
  leads?: number // Add this
  conversionRate?: number // Add this
}

export interface PriceHistory {
  price: number
  date: string
  currency?: string
  reason?: string
}

export interface PropertyFilters {
  city?: string
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  propertyType?: string
  status?: string
  page?: number
  limit?: number
  q?: string
  location?: string
}

export interface PropertyFormData {
  // Basic Information
  title: string
  description: string
  propertyType: 'house' | 'apartment' | 'condo' | 'land' | 'townhouse'
  status: 'for-sale' | 'for-rent' | 'short-let' | 'sold' | 'rented'
  price: number
  priceUnit: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'total'
  originalPrice?: number

  // SHORT-LET SPECIFIC FIELDS
  minimumStay?: number
  maximumStay?: number
  availabilityStart?: string
  availabilityEnd?: string
  instantBooking?: boolean
  checkInTime?: string
  checkOutTime?: string
  houseRules?: string[]
  cancellationPolicy?: 'flexible' | 'moderate' | 'strict'

  // Location
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  neighborhood?: string
  latitude?: number
  longitude?: number

  // Property Details
  bedrooms: number
  bathrooms: number
  squareFeet: number
  lotSize?: number
  yearBuilt?: number

  // Features & Amenities
  features: string[]
  amenities: string[]

  // titles
  titles: string[]

  // Media
  images: File[]
  videos: string[]

  // Listing Details
  listedBy: string
  isFeatured: boolean
  tags: string[]

  // Payment Options
  paymentOutright: boolean
  paymentPlan: boolean
  mortgageEligible: boolean
  customPlanAvailable: boolean
  customPlanDepositPercent: number
  customPlanMonths: number
}

export const PROPERTY_TYPES = [
  'house',
  'apartment',
  'condo',
  'land',
  'townhouse',
] as const

export const PROPERTY_FEATURES = [
  'Air Conditioning',
  'Heating',
  'Balcony',
  'Fireplace',
  'Hardwood Floors',
  'Walk-in Closet',
  'Granite Countertops',
  'Stainless Steel Appliances',
  'Updated Kitchen',
  'Updated Bathroom',
  'Smart Home',
  'Solar Panels',
  'Swimming Pool',
  'Garden',
  'Parking',
  'Garage',
  'Security System',
  'Pet Friendly',
  'Furnished',
  'Waterfront',
] as const

export const TITLE_DOCUMENTS = [
  'C of O',
  'Government Allocation ',
  'Governors Consent',
  'Registered Survey',
  'Deed of Assignment ',
  'FreeHold',
] as const

export const PROPERTY_AMENITIES = [
  'Swimming Pool',
  'Gym',
  'Spa',
  'Tennis Court',
  'Basketball Court',
  'Playground',
  'Clubhouse',
  'Concierge',
  'Elevator',
  'Laundry Facility',
  'Business Center',
  'Roof Deck',
  'Parking Garage',
  'Security',
  'Gated Community',
  'Pet Park',
  'Bike Storage',
  'Storage Units',
] as const

export interface ApiResponse<T> {
  documents: T[]
  total: number
}

export interface Agent {
  $id: string
  name: string
  email: string
  avatar?: string
  phone?: string
  licenseNumber: string
  agency: string
  bio: string
  specialties: string[]
  languages: string[]
  officePhone: string
  mobilePhone: string
  website: string
  totalListings: number
  yearsExperience: number
  rating: number
  reviewCount: number
  isVerified: boolean
  verificationDocuments: string[]
  city: string
  $createdAt: string
  $updatedAt: string
}

export interface Review {
  $id: string
  $collectionId: string
  $databaseId: string
  $createdAt: string
  $updatedAt: string
  reviewId: string
  propertyId?: string
  agentId?: string
  userId: string
  rating: number
  title: string
  comment: string
  isVerified: boolean

  // Relationship fields (when populated)
  user?: {
    $id: string
    name: string
    email: string
    avatar?: string
  }
  agent?: {
    $id: string
    name: string
    agency: string
    avatar?: string
  }
  property?: {
    $id: string
    title: string
    address: string
    images?: string[]
  }

  // Denormalized fields for quick access
  userName?: string
  userAvatar?: string
  agentName?: string
  propertyTitle?: string
}

// types/message
export interface Message {
  $id: string
  fromUserId: string
  toUserId: string
  propertyId?: string
  message: string
  sentAt: string
  isRead: boolean
  messageType: 'inquiry' | 'response' | 'general'
  messageTitle: string
  $createdAt: string
  $updatedAt: string
}

export interface CreateMessageData {
  toUserId: string
  propertyId?: string
  message: string
  messageType: 'inquiry' | 'response' | 'general'
  messageTitle?: string
}

export interface Conversation {
  id: string
  otherUserId: string
  otherUserName: string
  otherUserAvatar?: string
  otherUserType: 'buyer' | 'seller' | 'agent' | 'admin' | 'lead'
  propertyId?: string
  propertyTitle?: string
  propertyImage?: string
  lastMessage: string
  lastMessageAt: string
  lastMessageFromUserId: string
  unreadCount: number
}

export type PlanType = 'featured' | 'premium' | 'enterprise'

export interface PremiumListing {
  $id: string
  $createdAt: string
  $updatedAt: string
  propertyId: string
  agentId: string
  userId: string
  planType: PlanType
  status: 'active' | 'expired' | 'cancelled' | 'pending'
  startDate: string
  endDate: string
  priority: number
  impressions: number
  clicks: number
  paymentId: string
  renewal: 'monthly' | 'quarterly' | 'yearly'
}

export interface PaymentRecord {
  $id: string
  $createdAt: string
  $updatedAt: string
  propertyId: string
  userId: string
  agentId: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  paymentMethod: 'card' | 'bank_transfer' | 'wallet'
  paymentGateway: 'paystack'
  gatewayReference: string
  planType: PlanType
  duration: number
  customerEmail: string
  ipAddress: string
  fees: string
  paidAt: string
  transactionDate: string
  cardBrand: string
  cardLast4: string
  bank: string
}

//mortgage.ts
export interface PaymentOptions {
  outright: boolean
  paymentPlan: boolean
  mortgageEligible: boolean
  customPlanAvailable: boolean
  customPlanDepositPercent: number
  customPlanMonths: number
}

export interface MortgageCalculation {
  $id?: string
  userId?: string
  propertyId?: string
  propertyPrice: number
  calculationType: 'mortgage'
  propertyTitle: string
  propertySlug: string
  loanAmount: number
  downPayment: number
  downPaymentPercent: number
  interestRate: number
  loanTerm: number
  monthlyPayment: number
  totalPayment: number
  totalInterest: number
  calculationDate: string
  currency: string
  isSaved: boolean
  $createdAt?: string
  $updatedAt?: string
}

// Helper function to handle the new fields
// Helper function to handle the new fields with validation
export function toCalculations(documents: unknown[]): Calculation[] {
  const calculations: Calculation[] = []

  for (const doc of documents) {
    if (typeof doc !== 'object' || doc === null) continue

    const document = doc as Record<string, unknown>

    // Validate common required fields
    if (
      typeof document.$id !== 'string' ||
      typeof document.propertyPrice !== 'number' ||
      typeof document.monthlyPayment !== 'number' ||
      typeof document.calculationType !== 'string'
    ) {
      continue
    }

    const calculationType = document.calculationType as
      | 'mortgage'
      | 'installment'

    // Common properties
    const commonProps = {
      $id: document.$id as string,
      userId: document.userId as string,
      propertyId: document.propertyId as string,
      propertyPrice: document.propertyPrice as number,
      calculationType: calculationType,
      monthlyPayment: document.monthlyPayment as number,
      totalPayment: document.totalPayment as number,
      calculationDate: document.calculationDate as string,
      currency: document.currency as string,
      isSaved: document.isSaved as boolean,
      propertyTitle: document.propertyTitle as string,
      propertySlug: document.propertySlug as string,
    }

    try {
      if (calculationType === 'mortgage') {
        // Validate mortgage-specific fields
        if (
          typeof document.loanAmount !== 'number' ||
          typeof document.downPayment !== 'number' ||
          typeof document.interestRate !== 'number' ||
          typeof document.loanTerm !== 'number'
        ) {
          continue
        }

        calculations.push({
          ...commonProps,
          loanAmount: document.loanAmount as number,
          downPayment: document.downPayment as number,
          downPaymentPercent: document.downPaymentPercent as number,
          interestRate: document.interestRate as number,
          loanTerm: document.loanTerm as number,
          totalInterest: document.totalInterest as number,
        } as MortgageCalculation)
      } else if (calculationType === 'installment') {
        // Validate installment-specific fields
        if (
          typeof document.depositPercent !== 'number' ||
          typeof document.months !== 'number'
        ) {
          continue
        }

        calculations.push({
          ...commonProps,
          depositPercent: document.depositPercent as number,
          depositAmount: document.depositAmount as number,
          months: document.months as number,
          interestRate: document.interestRate as number,
        } as InstallmentCalculation)
      }
    } catch (error) {
      // Skip invalid documents
      console.warn('Skipping invalid calculation document:', error)
      continue
    }
  }

  return calculations
}

export interface InstallmentCalculation {
  $id?: string
  userId?: string
  propertyId?: string
  propertyPrice: number
  calculationType: 'installment'
  depositPercent: number
  depositAmount: number
  months: number
  interestRate: number
  monthlyPayment: number
  totalPayment: number
  calculationDate: string
  currency: string
  isSaved: boolean
}

export interface MortgageFormData {
  propertyPrice: number
  loanAmount: number
  downPayment: number
  interestRate: number
  loanTerm: number
}

export interface MortgageCalculationBase {
  userId?: string
  propertyId?: string
  propertyPrice: number
  calculationType: 'mortgage'
  loanAmount: number
  downPayment: number
  downPaymentPercent: number
  interestRate: number
  loanTerm: number
  monthlyPayment: number
  totalPayment: number
  totalInterest: number
  calculationDate: string
  currency: string
  isSaved: boolean
  depositPercent: number
  depositAmount: number
  months: number
}

export interface InstallmentCalculationBase {
  userId?: string
  propertyId?: string
  propertyPrice: number
  calculationType: 'installment'
  depositPercent: number
  depositAmount: number
  months: number
  interestRate: number
  monthlyPayment: number
  totalPayment: number
  calculationDate: string
  currency: string
  isSaved: boolean
}

export interface InstallmentFormData {
  propertyPrice: number
  depositPercent: number
  months: number
  interestRate: number
}

// Mortgage calculation types
export interface MortgageCalculation {
  $id?: string
  userId?: string
  propertyId?: string
  propertyPrice: number
  calculationType: 'mortgage'
  loanAmount: number
  downPayment: number
  downPaymentPercent: number
  interestRate: number
  loanTerm: number
  monthlyPayment: number
  totalPayment: number
  totalInterest: number
  calculationDate: string
  currency: string
  isSaved: boolean
}

export interface InstallmentCalculation {
  $id?: string
  userId?: string
  propertyId?: string
  propertyPrice: number
  calculationType: 'installment'
  depositPercent: number
  depositAmount: number
  months: number
  interestRate: number
  monthlyPayment: number
  totalPayment: number
  calculationDate: string
  currency: string
  isSaved: boolean
}

export type Calculation = MortgageCalculation | InstallmentCalculation

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

// Add these to your existing types in types/index.ts

// Schedule Viewing Types
export interface ScheduleViewing {
  $id: string
  $collectionId: string
  $databaseId: string
  $createdAt: string
  $updatedAt: string
  $permissions: string[]

  // Required fields
  propertyId: string
  propertyTitle: string
  agentId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  date: string
  time: string
  preferredContact: 'email' | 'phone'
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  isConfirmed: boolean
  scheduledAt: string

  // Optional fields
  customerMessage?: string
  confirmedAt?: string
  agentNotes?: string
  reminderSent?: boolean

  // Relationship fields (when populated)
  property?: Property
  agent?: Agent
}

export interface ScheduleViewingFormData {
  date: string
  time: string
  name: string
  email: string
  phone: string
  message: string
  preferredContact: 'email' | 'phone'
}

export interface CreateScheduleViewingData {
  propertyId: string
  propertyTitle: string
  agentId: string
  date: string
  time: string
  name: string
  email: string
  phone: string
  message?: string
  preferredContact: 'email' | 'phone'
}

// User Types with Labels
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
  labels: string[] // Add this for label-based permissions
  isActive?: boolean
  savedSearches: string[]
  favoriteProperties: string[]
  verificationToken: string
  lastVerificationRequest: string
}

// Agent Dashboard Types
export interface AgentDashboardStats {
  totalListings: number
  totalViews: number
  totalFavorites: number
  pendingViewings: number
  confirmedViewings: number
  messagesCount: number
}

export interface AgentViewing {
  $id: string
  propertyId: string
  propertyTitle: string
  customerName: string
  customerEmail: string
  customerPhone: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  isConfirmed: boolean
  scheduledAt: string
  customerMessage?: string
  property?: {
    $id: string
    title: string
    images: string[]
    address: string
  }
}

// API Response Types
export interface ScheduleViewingResponse {
  success: boolean
  scheduleId?: string
  message?: string
  error?: string
  details?: string
}

export interface ViewingConfirmationData {
  viewingId: string
  status: 'confirmed' | 'cancelled'
  agentNotes?: string
}

// Extended Property Type with Viewings
export interface PropertyWithViewings extends Property {
  viewings?: ScheduleViewing[]
  upcomingViewings?: ScheduleViewing[]
}

// Search and Filter Types for Viewings
export interface ViewingFilters {
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  dateFrom?: string
  dateTo?: string
  agentId?: string
  propertyId?: string
  page?: number
  limit?: number
}

// Notification Types
export interface ViewingNotification {
  $id: string
  type: 'viewing_request' | 'viewing_confirmation' | 'viewing_reminder'
  title: string
  message: string
  viewingId: string
  userId: string
  isRead: boolean
  createdAt: string
}

// Calendar Types
export interface ViewingCalendarEvent {
  id: string
  title: string
  start: string
  end: string
  extendedProps: {
    viewingId: string
    propertyTitle: string
    customerName: string
    customerPhone: string
    status: string
    type: 'viewing'
  }
}

// Update your existing AuthContextType to include label checking
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
  // Add label checking methods
  hasLabel: (label: string) => boolean
  isAgent: () => boolean
  isAdmin: () => boolean
}

// Helper function types for label-based permissions
export type UserRole = 'user' | 'agent' | 'admin'

export interface RolePermissions {
  canViewProperties: boolean
  canCreateProperties: boolean
  canEditProperties: boolean
  canDeleteProperties: boolean
  canScheduleViewings: boolean
  canManageViewings: boolean
  canAccessDashboard: boolean
}

// Notification types/index.ts
export interface Notification {
  $id: string
  $collectionId: string
  $databaseId: string
  $createdAt: string
  $updatedAt: string
  $permissions: string[]

  // Required fields
  userId: string
  type:
    | 'message'
    | 'favorite'
    | 'property_view'
    | 'viewing_request'
    | 'system'
    | 'property_update'
  title: string
  message: string
  isRead: boolean
  relatedId?: string
  actionUrl?: string
  metadata?: string // JSON string
  agentId?: string
}

// Update the notification count type
export interface NotificationCount {
  total: number
  unread: number
  byType: {
    message: number
    favorite: number
    property_view: number
    viewing_request: number
    system: number
    property_update: number
  }
}

export interface AnalyticsData {
  overview: {
    totalViews: number
    totalLeads: number
    conversionRate: number
    avgResponseTime: string
    totalRevenue: number
    activeListings: number
    pendingViewings: number
    confirmedViewings: number
  }
  propertyPerformance: {
    propertyId: string
    title: string
    views: number
    favorites: number
    leads: number
    conversionRate: number
    status: 'for-sale' | 'for-rent' | 'sold' | 'rented'
    price: number
  }[]
  leadSources: {
    source: string
    count: number
    percentage: number
    trend: 'up' | 'down' | 'neutral'
  }[]
  recentViewings: ScheduleViewing[]
  topPerformingProperties: Property[]
  timelineData: {
    date: string
    viewings: number
    leads: number
  }[]
  performanceTrends: Record<string, number>
}

// types/leads.ts
export interface Lead {
  $id: string
  name: string
  email: string
  phone: string
  propertyInterest: string
  budget: number
  timeline: string
  message: string
  source: string
  status: string
  assignedAgentId: string
  bedrooms: number
  location: string
  $createdAt: string
  $updatedAt: string
}

export interface CreateLeadDto {
  name: string
  email: string
  phone: string
  propertyInterest: string
  budget: number
  timeline: string
  message: string
  source: string
  status: string
  assignedAgentId: string
  bedrooms: number
  location: string
}

export interface UpdateLeadDto {
  name?: string
  email?: string
  phone?: string
  propertyInterest?: string
  budget?: number
  timeline?: string
  message?: string
  source?: string
  status?: string
  assignedAgentId?: string
  bedrooms?: number
  location?: string
}

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'viewing_scheduled'
  | 'offer_made'
  | 'closed_won'
  | 'closed_lost'

export type Timeline =
  | 'immediately'
  | 'within_1_week'
  | '1-3_months'
  | '3-6_months'
  | '6+_months'
  | 'flexible'

// types/favorites.ts
export interface Favorite {
  $id: string
  userId: string
  propertyId: string
  addedAt: string
  notes?: string
  category?: 'wishlist' | 'tour' | 'buy' | 'rent' | 'investment'
  property?: Property
  $createdAt: string
  $updatedAt: string
}

export interface CreateFavoriteDto {
  userId: string
  propertyId: string
  notes?: string
  category?: 'wishlist' | 'tour' | 'buy' | 'rent' | 'investment'
}

export interface UpdateFavoriteDto {
  notes?: string
  category?: 'wishlist' | 'tour' | 'buy' | 'rent' | 'investment'
}

// types/index.ts - Add these types
export interface PropertyFavoriteLead {
  $id: string
  $createdAt: string
  $updatedAt: string
  name: string
  email: string
  phone?: string
  interestedUserId: string
  propertyId: string
  propertyInterest: string
  location: string
  budget: number
  bedrooms?: string
  bathrooms?: string
  timeline: string
  source: string
  status: string
  message?: string
  assignedAgentId: string
  propertyDetails: PropertyDetails
  userDetails: UserDetails
  favoriteId: string
  leadCreatedAt: string
}

export interface PropertyDetails {
  title: string
  price: number
  address: string
  city: string
  state: string
  bedrooms?: number
  bathrooms?: number
  squareFeet?: number
  images: string[]
  propertyType: string
  status: string
}

export interface UserDetails {
  name: string
  email: string
  phone?: string
  userType: string
}

// Update your existing Lead type to be more generic
export interface Lead {
  $id: string
  avatar: string
  $createdAt: string
  $updatedAt: string
  name: string
  email: string
  phone: string
  interestedUserId?: string
  propertyId?: string
  propertyInterest: string
  location: string
  budget: number
  bedrooms: number
  bathrooms?: string
  timeline: string
  source: string
  status: string
  message: string
  assignedAgentId: string
  propertyDetails?: PropertyDetails
  userDetails?: UserDetails
  favoriteId?: string
  leadCreatedAt?: string
}

export interface Conversation {
  id: string
  userId: string
  userName: string
  otherUserId: string
  otherUserName: string
  userAvatar?: string
  userType: string
  otherUserAvatar?: string
  otherUserType: 'buyer' | 'seller' | 'agent' | 'admin' | 'lead'
  propertyId?: string
  propertyTitle?: string
  propertyImage?: string
  lastMessage: string
  lastMessageAt: string
  lastMessageFromUserId: string
  unreadCount: number
  messages: string[]
}
