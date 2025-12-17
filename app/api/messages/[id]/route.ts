import '@/lib/appwrite-build-fix'
// app/api/messages/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { User } from '@/types/auth'

import {
  DATABASE_ID,
  MESSAGES_COLLECTION_ID,
  serverDatabases,
} from '@/lib/appwrite-server'
import { getCurrentUser } from '@/lib/auth-utils'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params // Add await here
    const user = (await getCurrentUser()) as User | null

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Verify user owns this message or is the recipient
    const message = await serverDatabases.getDocument(
      DATABASE_ID,
      MESSAGES_COLLECTION_ID,
      id // Use the extracted id
    )

    if (message.toUserId !== user.$id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updatedMessage = await serverDatabases.updateDocument(
      DATABASE_ID,
      MESSAGES_COLLECTION_ID,
      id, // Use the extracted id
      body
    )

    return NextResponse.json(updatedMessage)
  } catch (error) {
    console.error('Error updating message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
