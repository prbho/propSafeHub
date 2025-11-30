// lib/agents/getAgentProperties.ts - FIXED VERSION
import { Property } from '@/types'
import { Query } from 'node-appwrite'

import { serverDatabases } from '@/lib/appwrite-server'

export async function getAgentProperties(agentId: string): Promise<Property[]> {
  try {
    if (!agentId || agentId.trim().length === 0) {
      console.log('❌ getAgentProperties: No agentId provided')
      return []
    }

    console.log('🔍 getAgentProperties - Agent ID:', agentId)

    // First, let's find the correct agent ID by agent name
    const agent = await serverDatabases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_AGENTS_TABLE_ID!,
      agentId
    )

    if (!agent) {
      console.log('❌ Agent not found with ID:', agentId)
      return []
    }

    console.log('🔍 Agent details:', {
      id: agent.$id,
      name: agent.name,
      email: agent.email,
    })

    // Try to find properties by agent name since the IDs don't match
    const propertiesByName = await serverDatabases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_PROPERTIES_TABLE_ID!,
      [Query.equal('agentName', agent.name), Query.limit(10)]
    )

    console.log(
      `✅ Found ${propertiesByName.documents.length} properties by agent name: "${agent.name}"`
    )

    // Also try by the other agent ID that appears in properties
    const otherAgentId = '691889510031db5f47b0' // The ID that properties are actually linked to
    const propertiesByOtherId = await serverDatabases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_PROPERTIES_TABLE_ID!,
      [Query.equal('agentId', otherAgentId), Query.limit(10)]
    )

    console.log(
      `✅ Found ${propertiesByOtherId.documents.length} properties by other agent ID: "${otherAgentId}"`
    )

    // Combine both results (remove duplicates)
    const allProperties = [
      ...propertiesByName.documents,
      ...propertiesByOtherId.documents,
    ]
    const uniqueProperties = allProperties.filter(
      (prop, index, self) => index === self.findIndex((p) => p.$id === prop.$id)
    )

    console.log(
      `📊 Final result: ${uniqueProperties.length} unique properties for "${agent.name}"`
    )

    return uniqueProperties as unknown as Property[]
  } catch (error) {
    console.error('❌ Error in getAgentProperties:', error)
    return []
  }
}
