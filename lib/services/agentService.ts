// lib/services/agentService.ts - IMPROVED ERROR HANDLING

import { Agent } from '@/types'

export async function getAgentById(id: string): Promise<Agent | null> {
  try {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      console.error('❌ Invalid agent ID:', id)
      return null
    }

    const response = await fetch(`/api/agents/${id.trim()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ getAgentById error response:', errorText)
      throw new Error(`Failed to fetch agent: ${response.status}`)
    }

    return await response.json()
  } catch {
    return null
  }
}

export async function syncUserToAgent(userData: {
  userId: string
  userName: string
  userEmail?: string
  userPhone?: string
}): Promise<Agent | null> {
  try {
    const response = await fetch('/api/agents/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      let errorMessage = 'Failed to create agent profile'
      let errorDetails = ''

      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorMessage
        errorDetails = errorData.details || ''
        console.error('❌ Sync API error:', errorData)
      } catch {
        const errorText = await response.text()
        console.error('❌ Sync API raw error:', errorText)
        errorDetails = errorText
      }

      // Create a more descriptive error
      const descriptiveError = new Error(
        `${errorMessage}${errorDetails ? `: ${errorDetails}` : ''}`
      )
      throw descriptiveError
    }

    const agent = await response.json()
    return agent
  } catch {
    return null
  }
}

