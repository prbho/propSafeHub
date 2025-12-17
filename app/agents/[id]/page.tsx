// app/agents/[id]/page.tsx - FIXED
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

  if (!id || id.trim().length === 0) {
    notFound()
  }

  // Fetch agent data ONCE
  const agent = await getAgent(id)

  if (!agent) {
    notFound()
  }

  // Get properties
  const agentProperties = await getAgentProperties(id)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Pass agent data as props - NO FETCHING IN CHILD COMPONENTS */}
      <AgentHeader agent={agent} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-8">
            <AgentAboutSection agent={agent} />

            {/* Agent's Properties */}
            {agentProperties.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  No Properties Listed
                </h3>
                <p className="text-gray-600 mb-4">
                  {agent.name} hasn`&apos;t listed any properties yet.
                </p>
              </div>
            ) : (
              <AgentProperties
                agentId={agent.$id}
                initialProperties={agentProperties}
                agentName={agent.name}
                userId={''}
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
