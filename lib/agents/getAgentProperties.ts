// lib/agents/getAgentProperties.ts - WITH isVerified FILTER
import { Property } from '@/types'
import { Query } from 'node-appwrite'

import { serverDatabases } from '@/lib/appwrite-server'

export async function getAgentProperties(agentId: string): Promise<Property[]> {
  try {
    if (!agentId || agentId.trim().length === 0) {
      return []
    }

    // Get properties by agentId with isVerified filter
    const properties = await serverDatabases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_PROPERTIES_TABLE_ID!,
      [
        Query.equal('agentId', agentId),
        Query.equal('isVerified', true), // Only show verified properties
        Query.equal('isActive', true), // And active properties
        Query.orderDesc('$createdAt'),
        Query.limit(20),
      ]
    )

    // Debug log
    if (properties.documents.length > 0) {
      properties.documents.forEach((prop, index) => {
      })
    } else {
      // Debug: Check what properties exist but aren't verified
      const allProperties = await serverDatabases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_PROPERTIES_TABLE_ID!,
        [Query.equal('agentId', agentId), Query.limit(10)]
      )

      allProperties.documents.forEach((prop, index) => {
      })
    }

    return properties.documents as unknown as Property[]
  } catch (error) {
    console.error('❌ Error in getAgentProperties:', error)
    return []
  }
}

