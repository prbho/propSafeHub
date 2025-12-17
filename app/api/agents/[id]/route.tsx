// app/api/agents/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'

import {
  AGENTS_COLLECTION_ID,
  DATABASE_ID,
  serverDatabases,
} from '@/lib/appwrite-server'

interface Context {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: Context) {
  try {
    const params = await context.params
    const agentId = params.id

    if (!agentId || agentId.trim().length === 0) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      )
    }

    console.log('🔍 Fetching agent from database with ID:', agentId)

    const agent = await serverDatabases.getDocument(
      DATABASE_ID,
      AGENTS_COLLECTION_ID,
      agentId.trim()
    )

    console.log('✅ Agent found:', agent.name)
    return NextResponse.json(agent)
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
