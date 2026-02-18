// lib/agents/getAgentPropertiesDebug.ts
import { Query } from 'node-appwrite'

import { serverDatabases } from '@/lib/appwrite-server'

export async function getAgentPropertiesDebug(agentId: string) {
  try {
    // 1. First, check if properties collection exists and has data
    // Get ALL properties without any filters
    const allProperties = await serverDatabases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_PROPERTIES_TABLE_ID!,
      [Query.limit(50)]
    )

    allProperties.documents.slice(0, 10).forEach((prop, index) => {
    })

    // 2. Now query with agentId filter ONLY (no status filter)
    const propertiesByAgentId = await serverDatabases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_PROPERTIES_TABLE_ID!,
      [Query.equal('agentId', agentId), Query.limit(20)]
    )

    propertiesByAgentId.documents.forEach((prop, index) => {
    })

    // 3. Check if properties have status field at all
    const propertiesWithStatus = propertiesByAgentId.documents.filter(
      (p) => p.status !== undefined
    )
    // 4. Check what status values exist
    const statusCounts: Record<string, number> = {}
    propertiesByAgentId.documents.forEach((p) => {
      const status = p.status || 'undefined'
      statusCounts[status] = (statusCounts[status] || 0) + 1
    })

    return {
      totalProperties: allProperties.total,
      propertiesForAgent: propertiesByAgentId.documents,
      statusDistribution: statusCounts,
    }
  } catch (error) {
    console.error('❌ Debug error:', error)
    return null
  }
}

