// app/api/test-notification/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { userId, title, message } = await request.json()

    console.log('🧪 TEST: Creating notification for user:', userId)

    const response = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notifications`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          title: title || 'Test Notification',
          message: message || 'This is a test notification',
          type: 'test',
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ error: `Failed: ${error}` }, { status: 500 })
    }

    const notification = await response.json()

    // Now fetch to verify it was created
    const fetchResponse = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notifications?userId=${userId}`
    )
    const notifications = await fetchResponse.json()

    return NextResponse.json({
      created: notification,
      allNotifications: notifications,
      count: notifications.length,
    })
  } catch {
    return NextResponse.json({ status: 500 })
  }
}
