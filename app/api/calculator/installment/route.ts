// app/api/calculator/installment/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server'
import { InstallmentRequest } from '@/types/mortgage'

import {
  DATABASE_ID,
  databases,
  ID,
  MORTGAGECALCULATIONS_COLLECTION_ID,
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
    const body: InstallmentRequest = await request.json()

    const {
      propertyId,
      propertyPrice,
      depositPercent,
      months,
      interestRate = 0,
      userId,
      saveCalculation = false,
    } = body

    // Validate required fields
    if (!propertyPrice || !depositPercent || !months) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate Nigerian installment constraints
    if (months < 6 || months > 36) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment plan must be between 6 and 36 months',
        },
        { status: 400 }
      )
    }

    if (depositPercent < 10 || depositPercent > 50) {
      return NextResponse.json(
        { success: false, error: 'Deposit must be between 10% and 50%' },
        { status: 400 }
      )
    }

    // Installment calculation
    const depositAmount = propertyPrice * (depositPercent / 100)
    const remainingAmount = propertyPrice - depositAmount
    const monthlyInterestRate = interestRate / 100 / 12

    let monthlyPayment: number
    if (interestRate > 0) {
      monthlyPayment = calculateMonthlyPayment(
        remainingAmount,
        monthlyInterestRate,
        months
      )
    } else {
      monthlyPayment = remainingAmount / months
    }

    const totalPayment = depositAmount + monthlyPayment * months

    // FIX: Ensure isSaved is a proper boolean
    const isSavedBoolean = Boolean(saveCalculation && userId)

    const calculationData = {
      userId: userId || undefined,
      propertyId: propertyId || undefined,
      propertyPrice: Number(propertyPrice),
      calculationType: 'installment',
      depositPercent: Number(depositPercent),
      depositAmount: Math.round(depositAmount),
      months: Number(months),
      interestRate: Number(interestRate),
      monthlyPayment: Math.round(monthlyPayment),
      totalPayment: Math.round(totalPayment),
      calculationDate: new Date().toISOString(),
      currency: 'NGN',
      isSaved: isSavedBoolean, // This must be a boolean, not string
    }

    console.log('Saving installment calculation data:', {
      ...calculationData,
      isSavedType: typeof calculationData.isSaved,
      isSavedValue: calculationData.isSaved,
    })

    // Save to database if requested
    if (isSavedBoolean && userId) {
      try {
        console.log(
          'Attempting to save installment calculation to database...',
          {
            userId,
            propertyId,
            isSaved: calculationData.isSaved,
          }
        )

        const result = await databases.createDocument(
          DATABASE_ID,
          MORTGAGECALCULATIONS_COLLECTION_ID,
          ID.unique(),
          calculationData
        )

        console.log('Installment calculation saved successfully:', result.$id)

        return NextResponse.json({
          success: true,
          calculation: result,
          saved: true,
        })
      } catch (dbError: any) {
        console.error('Database save error:', dbError)

        // Return the calculation without saving, but indicate the save failed
        return NextResponse.json({
          success: true,
          calculation: calculationData,
          saved: false,
          saveError: 'Failed to save calculation to history',
          error: dbError.message || 'Database error',
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
    return NextResponse.json({ status: 500 })
  }
}
