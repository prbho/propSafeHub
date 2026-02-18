// app/api/dashboard/[userType]/[id]/activity/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server'
import { Query } from 'appwrite'

import {
  DATABASE_ID,
  databases,
  NOTIFICATIONS_COLLECTION_ID,
  PROPERTIES_COLLECTION_ID,
  SCHEDULE_VIEWING_COLLECTION_ID,
  validateAppwriteConfig,
} from '@/lib/appwrite-server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userType: string; id: string }> }
) {
  try {
    const { userType, id } = await params
    // Validate Appwrite configuration
    if (!validateAppwriteConfig()) {
      throw new Error('Server configuration error')
    }

    let activities = []

    switch (userType) {
      case 'admin':
        activities = await getAdminActivity()
        break
      case 'agent':
        activities = await getAgentActivity(id)
        break
      case 'seller':
        activities = await getSellerActivity(id)
        break
      case 'buyer':
        activities = await getBuyerActivity(id)
        break
      default:
        return NextResponse.json([], { status: 200 })
    }

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Error fetching activity:', error)
    return NextResponse.json([], { status: 200 })
  }
}

async function getAdminActivity() {
  try {
    // Get recent property submissions
    const recentProperties = await databases.listDocuments(
      DATABASE_ID,
      PROPERTIES_COLLECTION_ID,
      [
        Query.orderDesc('$createdAt'),
        Query.limit(5),
        Query.select(['$createdAt', 'title', 'agentName', 'isVerified']),
      ]
    )

    return recentProperties.documents.map((property: any) => ({
      id: property.$id,
      type: 'property_submission',
      title: property.agentName || 'Unknown Agent',
      description: `submitted "${property.title}"`,
      time: new Date(property.$createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      status: property.isVerified ? 'approved' : 'pending',
    }))
  } catch (error) {
    console.error('Error in getAdminActivity:', error)
    return []
  }
}

async function getAgentActivity(agentId: string) {
  try {
    // Get recent viewings
    const recentViewings = await databases.listDocuments(
      DATABASE_ID,
      SCHEDULE_VIEWING_COLLECTION_ID,
      [
        Query.equal('agentId', agentId),
        Query.orderDesc('$createdAt'),
        Query.limit(5),
        Query.select(['$createdAt', 'propertyTitle', 'buyerName', 'status']),
      ]
    )

    return recentViewings.documents.map((viewing: any) => ({
      id: viewing.$id,
      type: 'viewing_request',
      title: viewing.buyerName || 'Unknown Buyer',
      description: `requested viewing for "${viewing.propertyTitle}"`,
      time: new Date(viewing.$createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      status: viewing.status || 'pending',
    }))
  } catch (error) {
    console.error('Error in getAgentActivity:', error)
    return []
  }
}

async function getSellerActivity(sellerId: string) {
  try {
    // Get recent inquiries/notifications
    const notifications = await databases.listDocuments(
      DATABASE_ID,
      NOTIFICATIONS_COLLECTION_ID,
      [
        Query.equal('userId', sellerId),
        Query.orderDesc('$createdAt'),
        Query.limit(5),
        Query.select(['$createdAt', 'title', 'message', 'type']),
      ]
    )

    return notifications.documents.map((notification: any) => ({
      id: notification.$id,
      type: notification.type || 'notification',
      title: notification.title,
      description: notification.message,
      time: new Date(notification.$createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'new',
    }))
  } catch (error) {
    console.error('Error in getSellerActivity:', error)
    return []
  }
}

async function getBuyerActivity(buyerId: string) {
  try {
    // Get recent notifications
    const notifications = await databases.listDocuments(
      DATABASE_ID,
      NOTIFICATIONS_COLLECTION_ID,
      [
        Query.equal('userId', buyerId),
        Query.orderDesc('$createdAt'),
        Query.limit(5),
        Query.select(['$createdAt', 'title', 'message', 'type']),
      ]
    )

    return notifications.documents.map((notification: any) => ({
      id: notification.$id,
      type: notification.type || 'notification',
      title: notification.title,
      description: notification.message,
      time: new Date(notification.$createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'new',
    }))
  } catch (error) {
    console.error('Error in getBuyerActivity:', error)
    return []
  }
}
