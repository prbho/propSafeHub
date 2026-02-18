import { NextRequest, NextResponse } from 'next/server'

import {
  AGENTS_COLLECTION_ID,
  DATABASE_ID,
  databases,
} from '@/lib/appwrite-server'

export async function POST(request: NextRequest) {
  try {
    const { agentId, userId } = await request.json()

    if (!agentId || !userId) {
      return NextResponse.json(
        { error: 'agentId and userId are required' },
        { status: 400 }
      )
    }

    // Update agent profile with userId
    await databases.updateDocument(DATABASE_ID, AGENTS_COLLECTION_ID, agentId, {
      userId,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error updating agent profile:', error)
    return NextResponse.json(
      { error: 'Failed to update agent profile' },
      { status: 500 }
    )
  }
}

