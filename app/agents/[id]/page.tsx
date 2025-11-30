import { notFound } from 'next/navigation'

import AgentProperties from '@/components/AgentProperties'
import AgentAboutSection from '@/components/agents/AgentAboutSection'
import AgentHeader from '@/components/agents/AgentHeader'
import AgentSidebar from '@/components/agents/AgentSidebar'
import ReviewsSection from '@/components/reviews/ReviewsSection'
import { getAgent } from '@/lib/agents/getAgent'
import { getAgentProperties } from '@/lib/agents/getAgentProperties'

interface AgentProfilePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AgentProfilePage({
  params,
}: AgentProfilePageProps) {
  const { id } = await params

  console.log('🔄 Agent profile page loading with ID:', id)

  if (!id || id.trim().length === 0) {
    console.error('❌ No agent ID provided')
    notFound()
  }

  const agent = await getAgent(id)

  if (!agent) {
    console.error('❌ Agent not found for ID:', id)
    notFound()
  }

  console.log('🔍 Agent found:', {
    id: agent.$id,
    name: agent.name,
    email: agent.email,
  })

  // Debug the properties fetch
  const agentProperties = await getAgentProperties(id)

  console.log('🔍 Agent properties debug:', {
    agentId: id,
    propertiesCount: agentProperties.length,
    properties: agentProperties.map((p) => ({
      id: p.$id,
      title: p.title,
      agentId: p.agentId,
      status: p.status,
    })),
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <AgentHeader agent={agent} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <AgentAboutSection agent={agent} />

            {/* Agent's Properties - Add fallback message for debugging */}
            {agentProperties.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  No Properties Found
                </h3>
                <p className="text-yellow-700">
                  Agent ID: {agent.$id}
                  <br />
                  Properties array length: {agentProperties.length}
                  <br />
                  This agent might not have any published properties yet.
                </p>
              </div>
            ) : (
              <AgentProperties
                agentId={agent.$id}
                initialProperties={agentProperties}
                agentName={agent.name}
              />
            )}

            {/* Reviews Section */}
            <ReviewsSection
              targetId={agent.$id}
              targetType="agent"
              targetName={agent.name}
            />
          </div>

          {/* Sidebar */}
          <AgentSidebar agent={agent} />
        </div>
      </div>
    </div>
  )
}
