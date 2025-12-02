// lib/agents/getAgentPropertiesDebug.ts
import { Query } from 'node-appwrite'

import { serverDatabases } from '@/lib/appwrite-server'

export async function getAgentPropertiesDebug(agentId: string) {
  try {
    console.log('🔍 DEBUG: getAgentProperties for agentId:', agentId)

    // 1. First, check if properties collection exists and has data
    console.log('📋 Checking properties collection...')

    // Get ALL properties without any filters
    const allProperties = await serverDatabases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_PROPERTIES_TABLE_ID!,
      [Query.limit(50)]
    )

    console.log(`📊 Total properties in database: ${allProperties.total}`)
    console.log('📋 First 10 properties:')

    allProperties.documents.slice(0, 10).forEach((prop, index) => {
      console.log(`   ${index + 1}. ${prop.title || 'No title'}`, {
        id: prop.$id,
        agentId: prop.agentId,
        agentName: prop.agentName,
        status: prop.status || 'NO STATUS FIELD',
        isActive: prop.isActive,
        matchesAgent: prop.agentId === agentId,
      })
    })

    // 2. Now query with agentId filter ONLY (no status filter)
    console.log(`\n🔍 Querying for agentId=${agentId} (no status filter)...`)
    const propertiesByAgentId = await serverDatabases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_PROPERTIES_TABLE_ID!,
      [Query.equal('agentId', agentId), Query.limit(20)]
    )

    console.log(
      `📊 Found ${propertiesByAgentId.documents.length} properties with agentId=${agentId}`
    )

    propertiesByAgentId.documents.forEach((prop, index) => {
      console.log(`   ${index + 1}. ${prop.title || 'No title'}`, {
        status: prop.status || 'NO STATUS FIELD',
        hasStatusField: prop.status !== undefined,
      })
    })

    // 3. Check if properties have status field at all
    const propertiesWithStatus = propertiesByAgentId.documents.filter(
      (p) => p.status !== undefined
    )
    console.log(
      `\n📊 Properties with status field: ${propertiesWithStatus.length}/${propertiesByAgentId.documents.length}`
    )

    // 4. Check what status values exist
    const statusCounts: Record<string, number> = {}
    propertiesByAgentId.documents.forEach((p) => {
      const status = p.status || 'undefined'
      statusCounts[status] = (statusCounts[status] || 0) + 1
    })

    console.log('📊 Status value distribution:', statusCounts)

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
