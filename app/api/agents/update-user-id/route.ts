import { NextRequest, NextResponse } from 'next/server'

import {
  AGENTS_COLLECTION_ID,
  DATABASE_ID,
  serverDatabases,
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

    console.log('🔄 Linking user to agent profile:', { agentId, userId })

    // Update agent profile with userId
    await serverDatabases.updateDocument(
      DATABASE_ID,
      AGENTS_COLLECTION_ID,
      agentId,
      { userId }
    )

    console.log('✅ Agent profile updated with userId')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error updating agent profile:', error)
    return NextResponse.json(
      { error: 'Failed to update agent profile' },
      { status: 500 }
    )
  }
}
