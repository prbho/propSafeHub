// app/api/viewings/[id]/status/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server'

import {
  DATABASE_ID,
  databases,
  SCHEDULE_VIEWING_COLLECTION_ID,
} from '@/lib/appwrite-server'

// Cache for frequent status updates
const statusUpdateCache = new Map()

interface Context {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, context: Context) {
  const startTime = Date.now()

  try {
    const params = await context.params
    const viewingId = params.id
    const { status } = await request.json()

    // Basic validation
    if (!viewingId || !status) {
      return NextResponse.json(
        { error: 'Viewing ID and status are required' },
        { status: 400 }
      )
    }

    if (!['confirmed', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Check cache for recent updates to prevent duplicate operations
    const cacheKey = `${viewingId}-${status}`
    const lastUpdate = statusUpdateCache.get(cacheKey)

    if (lastUpdate && Date.now() - lastUpdate < 5000) {
      // 5 second cache
      console.log('Returning cached status update response')
      return NextResponse.json({
        success: true,
        cached: true,
        message: 'Status update processed recently',
      })
    }

    // Prepare update data - only include confirmedAt if status is confirmed
    const updateData: any = {
      status,
      isConfirmed: status === 'confirmed',
    }

    if (status === 'confirmed') {
      updateData.confirmedAt = new Date().toISOString()
    }

    const updatedViewing = await databases.updateDocument(
      DATABASE_ID,
      SCHEDULE_VIEWING_COLLECTION_ID,
      viewingId,
      updateData
    )

    // Cache this update
    statusUpdateCache.set(cacheKey, Date.now())

    // Clean cache periodically (simple implementation)
    if (statusUpdateCache.size > 100) {
      const now = Date.now()
      for (const [key, timestamp] of statusUpdateCache.entries()) {
        if (now - timestamp > 30000) {
          // 30 seconds
          statusUpdateCache.delete(key)
        }
      }
    }

    const duration = Date.now() - startTime
    console.log(`Viewing status update completed in ${duration}ms`)

    return NextResponse.json(updatedViewing)
  } catch {
    const duration = Date.now() - startTime
    console.error(`Viewing status update failed after ${duration}ms`)

    return NextResponse.json({ status: 500 })
  }
}

// Optional: Export config for better performance
export const runtime = 'edge' // Consider using edge runtime for faster responses
export const dynamic = 'force-dynamic'
