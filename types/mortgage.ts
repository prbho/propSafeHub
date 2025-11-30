// types/mortgage.ts
import { Models } from 'appwrite'

export interface PaymentOptions {
  outright: boolean
  paymentPlan: boolean
  mortgageEligible: boolean
  customPlan: {
    available: boolean
    depositPercent: number
    months: number
  }
}

// Base interfaces for creating new documents
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

// Extended interfaces with Appwrite document properties AND our custom properties
export interface MortgageCalculation
  extends MortgageCalculationBase,
    Models.Document {
  // These are optional because they're added later when fetching property details
  propertyTitle?: string
  propertySlug?: string
}

export interface InstallmentCalculation
  extends InstallmentCalculationBase,
    Models.Document {
  // These are optional because they're added later when fetching property details
  propertyTitle?: string
  propertySlug?: string
}

// Union type for both calculation types
export type Calculation = MortgageCalculation | InstallmentCalculation

// Type guards for runtime validation
export function isMortgageCalculation(
  obj: unknown
): obj is MortgageCalculation {
  if (typeof obj !== 'object' || obj === null) return false

  const candidate = obj as Record<string, unknown>

  return (
    candidate.calculationType === 'mortgage' &&
    typeof candidate.propertyPrice === 'number' &&
    typeof candidate.loanAmount === 'number' &&
    typeof candidate.downPayment === 'number' &&
    typeof candidate.monthlyPayment === 'number' &&
    typeof candidate.$id === 'string' &&
    typeof candidate.$collectionId === 'string' &&
    typeof candidate.$databaseId === 'string' &&
    typeof candidate.$createdAt === 'string' &&
    typeof candidate.$updatedAt === 'string'
  )
}

export function isInstallmentCalculation(
  obj: unknown
): obj is InstallmentCalculation {
  if (typeof obj !== 'object' || obj === null) return false

  const candidate = obj as Record<string, unknown>

  return (
    candidate.calculationType === 'installment' &&
    typeof candidate.propertyPrice === 'number' &&
    typeof candidate.depositPercent === 'number' &&
    typeof candidate.monthlyPayment === 'number' &&
    typeof candidate.$id === 'string' &&
    typeof candidate.$collectionId === 'string' &&
    typeof candidate.$databaseId === 'string' &&
    typeof candidate.$createdAt === 'string' &&
    typeof candidate.$updatedAt === 'string'
  )
}

export function isCalculation(obj: unknown): obj is Calculation {
  return isMortgageCalculation(obj) || isInstallmentCalculation(obj)
}

// Helper function to safely convert documents to Calculation type
export function toCalculation(
  document: Models.Document & {
    propertyTitle?: string
    propertySlug?: string
    [key: string]: unknown
  }
): Calculation | null {
  if (isCalculation(document)) {
    return document as Calculation
  }
  return null
}

export function toCalculations(
  documents: (Models.Document & {
    propertyTitle?: string
    propertySlug?: string
    [key: string]: unknown
  })[]
): Calculation[] {
  return documents
    .map(toCalculation)
    .filter((calc): calc is Calculation => calc !== null)
}

export interface MortgageFormData {
  propertyPrice: number
  loanAmount: number
  downPayment: number
  interestRate: number
  loanTerm: number
}

export interface InstallmentFormData {
  propertyPrice: number
  depositPercent: number
  months: number
  interestRate: number
}

export interface MortgageRequest {
  propertyId?: string
  propertyPrice: number
  loanAmount: number
  downPayment: number
  interestRate: number
  loanTerm: number
  userId?: string
  saveCalculation?: boolean
}

export interface InstallmentRequest {
  propertyId?: string
  propertyPrice: number
  depositPercent: number
  months: number
  interestRate?: number
  userId?: string
  saveCalculation?: boolean
}

export interface ApiResponse<T> {
  success: boolean
  calculation?: T
  calculations?: T
  data?: T
  error?: string
}
