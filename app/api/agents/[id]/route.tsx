import { NextRequest, NextResponse } from 'next/server'

import {
  AGENTS_COLLECTION_ID,
  DATABASE_ID,
  databases,
} from '@/lib/appwrite-server'

interface Context {
  params: Promise<{ id: string }>
}

type CachedAgent = Record<string, unknown>
const agentCache = new Map<string, { expiresAt: number; data: CachedAgent }>()

export async function GET(request: NextRequest, context: Context) {
  try {
    const params = await context.params
    const agentId = params.id?.trim()

    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      )
    }

    const now = Date.now()
    const cached = agentCache.get(agentId)
    if (cached && cached.expiresAt > now) {
      return NextResponse.json(cached.data, {
        headers: {
          'Cache-Control': 'private, max-age=20, stale-while-revalidate=40',
        },
      })
    }

    const agent = await databases.getDocument(
      DATABASE_ID,
      AGENTS_COLLECTION_ID,
      agentId
    )

    agentCache.set(agentId, {
      expiresAt: now + 30_000,
      data: agent,
    })

    if (agentCache.size > 1000) {
      for (const [key, value] of agentCache.entries()) {
        if (value.expiresAt <= now) {
          agentCache.delete(key)
        }
      }
    }

    return NextResponse.json(agent, {
      headers: {
        'Cache-Control': 'private, max-age=20, stale-while-revalidate=40',
      },
    })
  } catch (error) {
    console.error('Error fetching agent:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
