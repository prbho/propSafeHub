// app/calculations/history/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import {
  Calculation,
  isInstallmentCalculation,
  isMortgageCalculation,
} from '@/types/mortgage'
import { formatCurrency } from '@/utils/formatters'
import { Calculator, Calendar, ExternalLink, Home, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

export default function CalculationHistoryPage() {
  const [calculations, setCalculations] = useState<Calculation[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchCalculationHistory()
    }
  }, [user])

  const fetchCalculationHistory = async () => {
    try {
      const response = await fetch(
        `/api/calculator/history?userId=${user?.$id}`
      )
      const data = await response.json()

      if (data.success) {
        setCalculations(data.calculations || [])
      } else {
        toast.error('Failed to load calculation history')
      }
    } catch (error) {
      console.error('Error fetching history:', error)
      toast.error('Error loading calculation history')
    } finally {
      setLoading(false)
    }
  }

  const deleteCalculation = async (calculationId: string) => {
    try {
      const response = await fetch(
        `/api/calculator/history?id=${calculationId}`,
        {
          method: 'DELETE',
        }
      )

      const data = await response.json()

      if (data.success) {
        toast.success('Calculation deleted successfully')
        fetchCalculationHistory()
      } else {
        toast.error('Failed to delete calculation')
      }
    } catch (error) {
      console.error('Error deleting calculation:', error)
      toast.error('Error deleting calculation')
    }
  }

  // Helper function to safely access propertyTitle and propertySlug
  const getPropertyTitle = (calculation: Calculation): string | undefined => {
    return (calculation as any).propertyTitle
  }

  const getPropertySlug = (calculation: Calculation): string | undefined => {
    return (calculation as any).propertySlug
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <h1 className="text-xl font-bold text-gray-900 mb-4">
              Calculation History
            </h1>
            <p className="text-gray-600 mb-6">
              Please sign in to view your saved calculations and mortgage
              estimates.
            </p>
            <Link href="/auth/signin">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Sign In to View History
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading your calculations...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Calculation History
              </h1>
              <p className="text-gray-600 tex-sm">
                Your saved mortgage and installment calculations
              </p>
            </div>
          </div>
        </div>

        {/* Calculations List */}
        {calculations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <Calculator className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No calculations yet
            </h2>
            <p className="text-gray-600 mb-6">
              Your saved mortgage and installment calculations will appear here.
            </p>
            <Link href="/properties">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Browse Properties
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {calculations.map((calculation) => {
              const propertyTitle = getPropertyTitle(calculation)
              const propertySlug = getPropertySlug(calculation)

              return (
                <div
                  key={calculation.$id}
                  className="bg-white rounded-xl border-gray-200 p-6"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {/* Property Title and Link */}
                      {propertyTitle && calculation.propertyId && (
                        <div className="mb-4">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1">
                              <p className="text-sm font-medium mb-1">
                                Linked Property
                              </p>
                              <Link
                                href={`/properties/${propertySlug || calculation.propertyId}`}
                                className="text-lg font-semibold  hover:text-blue-800 hover:underline flex items-center space-x-1"
                              >
                                <span>{propertyTitle}</span>
                                <ExternalLink className="h-3 w-3 text-blue-700" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* No Property Linked Message */}
                      {!propertyTitle && calculation.propertyId && (
                        <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex items-center space-x-2">
                            <Home className="h-4 w-4 text-yellow-600 shrink-0" />
                            <div>
                              <p className="text-sm text-yellow-800 font-medium">
                                Property Reference
                              </p>
                              <p className="text-sm text-yellow-700">
                                Property ID: {calculation.propertyId}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* No Property ID at all */}
                      {!calculation.propertyId && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center space-x-2">
                            <Home className="h-4 w-4 text-gray-400 shrink-0" />
                            <p className="text-sm text-gray-600">
                              General calculation (not linked to a specific
                              property)
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-3 mb-4">
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            calculation.calculationType === 'mortgage'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {calculation.calculationType === 'mortgage'
                            ? 'Mortgage'
                            : 'Installment'}
                        </div>
                        <div className="flex items-center text-gray-500 text-sm">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(
                            calculation.calculationDate
                          ).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">
                            Property Price
                          </p>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(calculation.propertyPrice)}
                          </p>
                        </div>

                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">
                            Monthly Payment
                          </p>
                          <p className="font-semibold text-emerald-600">
                            {formatCurrency(calculation.monthlyPayment)}
                          </p>
                        </div>

                        {isMortgageCalculation(calculation) ? (
                          <>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm text-gray-600 mb-1">
                                Loan Amount
                              </p>
                              <p className="font-semibold text-gray-900">
                                {formatCurrency(calculation.loanAmount)}
                              </p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm text-gray-600 mb-1">
                                Interest Rate
                              </p>
                              <p className="font-semibold text-gray-900">
                                {calculation.interestRate}%
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm text-gray-600 mb-1">
                                Deposit
                              </p>
                              <p className="text-lg font-semibold text-gray-900">
                                {formatCurrency(calculation.depositAmount!)}
                              </p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm text-gray-600 mb-1">Term</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {calculation.months} months
                              </p>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Additional Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {isMortgageCalculation(calculation) && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Down Payment:
                              </span>
                              <span className="font-semibold">
                                {formatCurrency(calculation.downPayment)} (
                                {calculation.downPaymentPercent?.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Loan Term:</span>
                              <span className="font-semibold">
                                {calculation.loanTerm} years
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Total Interest:
                              </span>
                              <span className="font-semibold text-orange-600">
                                {formatCurrency(calculation.totalInterest)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Total Payment:
                              </span>
                              <span className="font-semibold text-green-600">
                                {formatCurrency(calculation.totalPayment)}
                              </span>
                            </div>
                          </>
                        )}
                        {isInstallmentCalculation(calculation) && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Deposit Percentage:
                              </span>
                              <span className="font-semibold">
                                {calculation.depositPercent}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Total Payment:
                              </span>
                              <span className="font-semibold text-green-600">
                                {formatCurrency(calculation.totalPayment)}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteCalculation(calculation.$id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-4 shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
