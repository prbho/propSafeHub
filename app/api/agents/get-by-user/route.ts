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
    const name = searchParams.get('name') // Add name parameter

    console.log('🔍 Searching agent by:', { userId, email, name })

    // Try multiple methods to find agent
    let agent = null

    // 1. Try by userId (direct link)
    if (userId) {
      try {
        const agentsByUserId = await serverDatabases.listDocuments(
          DATABASE_ID,
          AGENTS_COLLECTION_ID,
          [Query.equal('userId', userId), Query.limit(1)]
        )
        if (agentsByUserId.documents.length > 0) {
          agent = agentsByUserId.documents[0]
          console.log('✅ Found agent by userId:', agent.$id)
        }
      } catch {}
    }

    // 2. Try by email
    if (!agent && email) {
      try {
        const agentsByEmail = await serverDatabases.listDocuments(
          DATABASE_ID,
          AGENTS_COLLECTION_ID,
          [Query.equal('email', email), Query.limit(1)]
        )
        if (agentsByEmail.documents.length > 0) {
          agent = agentsByEmail.documents[0]
          console.log('✅ Found agent by email:', agent.$id)
        }
      } catch {}
    }

    // 3. Try by name (fuzzy matching)
    if (!agent && name) {
      try {
        const allAgents = await serverDatabases.listDocuments(
          DATABASE_ID,
          AGENTS_COLLECTION_ID,
          [Query.limit(50)] // Get more agents for name matching
        )

        // Find agent with similar name
        const foundAgent = allAgents.documents.find(
          (a) =>
            a.name?.toLowerCase().includes(name.toLowerCase()) ||
            name.toLowerCase().includes(a.name?.toLowerCase() || '')
        )

        if (foundAgent) {
          agent = foundAgent
          console.log('✅ Found agent by name similarity:', agent.$id)
        }
      } catch {}
    }

    if (!agent) {
      console.log('❌ No agent profile found')
      return NextResponse.json(
        { error: 'Agent profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(agent)
  } catch (error) {
    console.error('❌ Error fetching agent profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch agent profile' },
      { status: 500 }
    )
  }
}
