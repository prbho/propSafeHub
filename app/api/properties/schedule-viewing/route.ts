// app/api/properties/schedule-viewing/route.ts - WITH NOTIFICATIONS
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server'
import { ID } from 'node-appwrite'

import {
  DATABASE_ID,
  databases,
  NOTIFICATIONS_COLLECTION_ID, // Make sure this is in your lib/appwrite-server
  SCHEDULE_VIEWING_COLLECTION_ID,
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

    // Validate required fields
    if (!propertyId || !agentId || !date || !time || !name || !email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      )
    }

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
      customerPhone: phone ? phone.substring(0, 20) : '',
      customerMessage: (message || '').substring(0, 2000),
      preferredContact: preferredContact || 'email',
      status: 'pending',
      scheduledAt: scheduledAt,
      isConfirmed: false,
    }

    const schedule = await databases.createDocument(
      DATABASE_ID,
      SCHEDULE_VIEWING_COLLECTION_ID,
      ID.unique(),
      scheduleData
    )

    console.log('✅ Viewing record created:', schedule.$id)

    // Create notification for the agent
    const notificationData = {
      userId: agentId,
      type: 'userMessage', // Use 'userMessage' for viewing requests
      title: 'New Viewing Request',
      message: `${name} wants to view "${propertyTitle}" on ${date} at ${time}`,
      isRead: false,
      relatedId: schedule.$id,
      actionUrl: `/agent/dashboard/viewings?viewing=${schedule.$id}`,
      metadata: JSON.stringify({
        propertyId: propertyId,
        propertyTitle: propertyTitle,
        customerName: name,
        customerEmail: email,
        customerPhone: phone || '',
        viewingDate: date,
        viewingTime: time,
        scheduleId: schedule.$id,
      }),
      createdAt: new Date().toISOString(),
    }

    try {
      const notification = await databases.createDocument(
        DATABASE_ID,
        NOTIFICATIONS_COLLECTION_ID,
        ID.unique(),
        notificationData
      )

      console.log('🔔 Notification created:', notification.$id)
      console.log('🎯 Notification sent to agent:', agentId)
    } catch (notificationError: any) {
      console.error(
        '❌ Failed to create notification:',
        notificationError.message
      )
      // Don't fail the whole request if notification fails
      // The viewing was still scheduled successfully
      console.log('⚠️ Viewing scheduled but notification failed')
    }

    return NextResponse.json({
      success: true,
      scheduleId: schedule.$id,
      message:
        'Viewing scheduled successfully. The agent will contact you soon.',
    })
  } catch (error: any) {
    console.error('❌ Error scheduling viewing:', error.message)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to schedule viewing. Please try again.',
      },
      { status: 500 }
    )
  }
}
