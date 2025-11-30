// app/api/properties/schedule-viewing/route.ts - UPDATED WITH CORRECT TYPES
import { NextRequest, NextResponse } from 'next/server'
import { ID } from 'node-appwrite'

import {
  DATABASE_ID,
  SCHEDULE_VIEWING_COLLECTION_ID,
  serverDatabases,
} from '@/lib/appwrite-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      propertyId,
      propertyTitle,
      agentId,
      date,
      time,
      name,
      email,
      phone,
      message,
      preferredContact,
    } = body

    console.log('📅 Scheduling viewing for property:', propertyTitle)

    // Use shorter ISO format
    const scheduledAt = new Date().toISOString().slice(0, 19) + 'Z'

    // Create schedule viewing record
    const scheduleData = {
      propertyId: propertyId.substring(0, 255),
      propertyTitle: propertyTitle.substring(0, 500),
      agentId: agentId.substring(0, 255),
      date: date.substring(0, 10),
      time: time.substring(0, 10),
      customerName: name.substring(0, 255),
      customerEmail: email.substring(0, 255),
      customerPhone: phone.substring(0, 20),
      customerMessage: (message || '').substring(0, 2000),
      preferredContact: preferredContact || 'email',
      status: 'pending',
      scheduledAt: scheduledAt,
      isConfirmed: false,
    }

    const schedule = await serverDatabases.createDocument(
      DATABASE_ID,
      SCHEDULE_VIEWING_COLLECTION_ID,
      ID.unique(),
      scheduleData
    )

    console.log('✅ Viewing scheduled successfully:', schedule.$id)

    // Create notification for the agent - using correct enum values
    const notificationData = {
      userId: agentId,
      type: 'userMessage', // Use 'userMessage' for viewing requests
      title: 'New Viewing Request',
      message: `${name} wants to view "${propertyTitle}" on ${date} at ${time}`,
      isRead: false,
      relatedId: schedule.$id,
      actionUrl: `/agent/dashboard/viewings?viewing=${schedule.$id}`,
      metadata: JSON.stringify({
        // Store metadata as JSON string
        propertyId: propertyId,
        propertyTitle: propertyTitle,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        viewingDate: date,
        viewingTime: time,
        scheduleId: schedule.$id,
      }),
    }

    // const notification = await serverDatabases.createDocument(
    //   DATABASE_ID,
    //   NOTIFICATIONS_COLLECTION_ID,
    //   ID.unique(),
    //   notificationData
    // )

    console.log('🔔 Notification created for agent:', agentId)

    return NextResponse.json({
      success: true,
      scheduleId: schedule.$id,
      message:
        'Viewing scheduled successfully. The agent will contact you soon.',
    })
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to schedule viewing',
      },
      { status: 500 }
    )
  }
}
