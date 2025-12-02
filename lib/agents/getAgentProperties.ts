// lib/agents/getAgentProperties.ts - WITH isVerified FILTER
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

    console.log(
      `✅ Found ${properties.documents.length} verified properties for agent ${agentId}`
    )

    // Debug log
    if (properties.documents.length > 0) {
      console.log('📋 Verified properties found:')
      properties.documents.forEach((prop, index) => {
        console.log(`   ${index + 1}. ${prop.title}`, {
          isVerified: prop.isVerified,
          isActive: prop.isActive,
          status: prop.status,
          agentId: prop.agentId,
        })
      })
    } else {
      // Debug: Check what properties exist but aren't verified
      const allProperties = await serverDatabases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_PROPERTIES_TABLE_ID!,
        [Query.equal('agentId', agentId), Query.limit(10)]
      )

      console.log(
        `📋 Total properties for agent (including unverified): ${allProperties.documents.length}`
      )
      allProperties.documents.forEach((prop, index) => {
        console.log(`   ${index + 1}. ${prop.title}`, {
          isVerified: prop.isVerified,
          isActive: prop.isActive,
          status: prop.status,
        })
      })
    }

    return properties.documents as unknown as Property[]
  } catch (error) {
    console.error('❌ Error in getAgentProperties:', error)
    return []
  }
}
