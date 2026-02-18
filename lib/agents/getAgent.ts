import { Agent } from '@/types'

import { serverDatabases } from '@/lib/appwrite-server'

export async function getAgent(id: string): Promise<Agent | null> {
  try {
    // Validate the ID parameter
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      console.error('Invalid agent ID:', id)
      return null
    }

    const agent = await serverDatabases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_AGENTS_TABLE_ID!,
      id.trim()
    )

    return agent as unknown as Agent
  } catch {
    console.error('Error details:', {})
    return null
  }
}

