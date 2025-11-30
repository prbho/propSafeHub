// app/api/calculator/mortgage/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { MortgageRequest } from '@/types/mortgage'

import {
  DATABASE_ID,
  ID,
  MORTGAGECALCULATIONS_COLLECTION_ID,
  serverDatabases,
} from '@/lib/appwrite-server'

function calculateMonthlyPayment(
  principal: number,
  monthlyRate: number,
  numberOfPayments: number
): number {
  if (monthlyRate === 0) {
    return principal / numberOfPayments
  }

  const rateFactor = Math.pow(1 + monthlyRate, numberOfPayments)
  return (principal * monthlyRate * rateFactor) / (rateFactor - 1)
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: MortgageRequest = await request.json()

    const {
      propertyId,
      propertyPrice,
      loanAmount,
      downPayment,
      interestRate,
      loanTerm,
      userId,
      saveCalculation = false,
    } = body

    // Validate required fields
    if (
      !propertyPrice ||
      !loanAmount ||
      !downPayment ||
      !interestRate ||
      !loanTerm
    ) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate Nigerian mortgage constraints
    if (interestRate < 17 || interestRate > 30) {
      return NextResponse.json(
        { success: false, error: 'Interest rate must be between 17% and 30%' },
        { status: 400 }
      )
    }

    if (loanTerm < 5 || loanTerm > 20) {
      return NextResponse.json(
        { success: false, error: 'Loan term must be between 5 and 20 years' },
        { status: 400 }
      )
    }

    if (downPayment >= propertyPrice) {
      return NextResponse.json(
        {
          success: false,
          error: 'Down payment must be less than property price',
        },
        { status: 400 }
      )
    }

    if (loanAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Loan amount must be greater than 0' },
        { status: 400 }
      )
    }

    // Mortgage calculation formula
    const monthlyInterestRate = interestRate / 100 / 12
    const numberOfPayments = loanTerm * 12

    const monthlyPayment = calculateMonthlyPayment(
      loanAmount,
      monthlyInterestRate,
      numberOfPayments
    )

    const totalPayment = monthlyPayment * numberOfPayments
    const totalInterest = totalPayment - loanAmount

    // FIX: Ensure isSaved is a proper boolean
    const isSavedBoolean = Boolean(saveCalculation && userId)

    const calculationData = {
      userId: userId || undefined,
      propertyId: propertyId || undefined,
      propertyPrice: Number(propertyPrice),
      calculationType: 'mortgage',
      loanAmount: Number(loanAmount),
      downPayment: Number(downPayment),
      downPaymentPercent: Number((downPayment / propertyPrice) * 100),
      interestRate: Number(interestRate),
      loanTerm: Number(loanTerm),
      monthlyPayment: Math.round(monthlyPayment),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
      calculationDate: new Date().toISOString(),
      currency: 'NGN',
      isSaved: isSavedBoolean,
    }

    console.log('Saving calculation data:', {
      ...calculationData,
      isSavedType: typeof calculationData.isSaved,
      isSavedValue: calculationData.isSaved,
    })

    // Save to database if requested
    if (isSavedBoolean && userId) {
      try {
        console.log('Attempting to save calculation to database...', {
          userId,
          propertyId,
          isSaved: calculationData.isSaved,
        })

        const result = await serverDatabases.createDocument(
          DATABASE_ID,
          MORTGAGECALCULATIONS_COLLECTION_ID,
          ID.unique(),
          calculationData
        )

        return NextResponse.json({
          success: true,
          calculation: result,
          saved: true,
        })
      } catch {
        // Return the calculation without saving, but indicate the save failed
        return NextResponse.json({
          success: true,
          calculation: calculationData,
          saved: false,
          saveError: 'Failed to save calculation to history',
        })
      }
    }

    // Return calculation without saving
    return NextResponse.json({
      success: true,
      calculation: calculationData,
      saved: false,
    })
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
