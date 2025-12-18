// app/api/calculator/history/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server'
import { Calculation, toCalculations } from '@/types/mortgage'

import {
  DATABASE_ID,
  databases,
  MORTGAGECALCULATIONS_COLLECTION_ID,
  PROPERTIES_COLLECTION_ID,
  Query,
} from '@/lib/appwrite-server'

interface HistoryResponse {
  success: boolean
  calculations?: Calculation[]
  error?: string
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<HistoryResponse>> {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, calculations: [], error: 'User ID is required' },
        { status: 400 }
      )
    }

    const result = await databases.listDocuments(
      DATABASE_ID,
      MORTGAGECALCULATIONS_COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.equal('isSaved', true),
        Query.orderDesc('$createdAt'),
        Query.limit(20),
      ]
    )

    // Fetch property details for calculations that have propertyId
    const calculationsWithProperties = await Promise.all(
      result.documents.map(async (doc) => {
        // Start with the basic calculation
        let calculation = toCalculations([doc])[0]

        if (doc.propertyId) {
          try {
            const property = await databases.getDocument(
              DATABASE_ID,
              PROPERTIES_COLLECTION_ID,
              doc.propertyId
            )

            // Add property details to the calculation object
            // We need to cast to any to add the properties, but they're defined in our type
            const calculationWithProperty = calculation as any
            calculationWithProperty.propertyTitle = property.title
            calculationWithProperty.propertySlug = property.slug || property.$id

            calculation = calculationWithProperty as Calculation
          } catch (error) {
            console.error(`Error fetching property ${doc.propertyId}:`, error)
            // Keep calculation without property details if fetch fails
          }
        }

        return calculation
      })
    )

    return NextResponse.json({
      success: true,
      calculations: calculationsWithProperties,
    })
  } catch (error) {
    console.error('History fetch error:', error)
    return NextResponse.json(
      { success: false, calculations: [], error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest
): Promise<NextResponse<HistoryResponse>> {
  try {
    const { searchParams } = new URL(request.url)
    const calculationId = searchParams.get('id')

    if (!calculationId) {
      return NextResponse.json(
        { success: false, error: 'Calculation ID is required' },
        { status: 400 }
      )
    }

    await databases.deleteDocument(
      DATABASE_ID,
      MORTGAGECALCULATIONS_COLLECTION_ID,
      calculationId
    )

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Delete calculation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete calculation' },
      { status: 500 }
    )
  }
}
