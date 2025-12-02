import { NextRequest, NextResponse } from 'next/server'
import { Query } from 'node-appwrite'

import {
  AGENTS_COLLECTION_ID,
  DATABASE_ID,
  serverDatabases,
} from '@/lib/appwrite-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const email = searchParams.get('email')

    if (!userId && !email) {
      return NextResponse.json(
        { error: 'Either userId or email is required' },
        { status: 400 }
      )
    }

    console.log('🔍 Searching for agent profile:', { userId, email })

    // Try to find agent by userId first
    if (userId) {
      try {
        const agentsByUserId = await serverDatabases.listDocuments(
          DATABASE_ID,
          AGENTS_COLLECTION_ID,
          [Query.equal('userId', userId), Query.limit(1)]
        )

        if (agentsByUserId.documents.length > 0) {
          const agent = agentsByUserId.documents[0]
          console.log('✅ Found agent by userId:', agent.$id)
          return NextResponse.json(agent)
        }
      } catch {}
    }

    // Try by email as fallback
    if (email) {
      try {
        const agentsByEmail = await serverDatabases.listDocuments(
          DATABASE_ID,
          AGENTS_COLLECTION_ID,
          [Query.equal('email', email), Query.limit(1)]
        )

        if (agentsByEmail.documents.length > 0) {
          const agent = agentsByEmail.documents[0]
          return NextResponse.json(agent)
        }
      } catch {}
    }

    console.log('❌ No agent profile found')
    return NextResponse.json(
      { error: 'Agent profile not found' },
      { status: 404 }
    )
  } catch (error) {
    console.error('❌ Error fetching agent profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch agent profile' },
      { status: 500 }
    )
  }
}
