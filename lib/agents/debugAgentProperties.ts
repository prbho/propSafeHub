// lib/agents/debugAgentProperties.ts
import { Query } from 'node-appwrite'

import { serverDatabases } from '@/lib/appwrite-server'

export async function debugAgentProperties(agentId: string) {
  console.log('🔍 DEBUG: Analyzing agent-properties relationship')

  // 1. Get the agent
  const agent = await serverDatabases.getDocument(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    process.env.NEXT_PUBLIC_APPWRITE_AGENTS_TABLE_ID!,
    agentId
  )

  console.log('📋 AGENT DETAILS:', {
    agentId: agent.$id,
    name: agent.name,
    email: agent.email,
  })

  // 2. Check if agent has an externalAgentId field
  console.log('📋 All agent fields:', Object.keys(agent))

  // 3. Find ALL properties to see what agent IDs exist
  const allProperties = await serverDatabases.listDocuments(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    process.env.NEXT_PUBLIC_APPWRITE_PROPERTIES_TABLE_ID!,
    [Query.limit(100)]
  )

  // 4. Analyze agent IDs in properties
  const agentIdsInProperties = [
    ...new Set(allProperties.documents.map((p) => p.agentId)),
  ]
  console.log('🆔 Unique agent IDs found in properties:', agentIdsInProperties)

  // 5. Find properties for this specific agent by name (current workaround)
  const propertiesByAgentName = allProperties.documents.filter(
    (p) => p.agentName === agent.name
  )

  console.log(
    `📊 Found ${propertiesByAgentName.length} properties by agent name: "${agent.name}"`
  )

  return {
    agent,
    allAgentIds: agentIdsInProperties,
    propertiesByAgentName,
  }
}
