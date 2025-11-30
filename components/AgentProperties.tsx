// components/agents/AgentProperties.tsx - WITH DEBUGGING
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Property } from '@/types'
import { ArrowRight } from 'lucide-react'

import PropertyCard from '@/components/PropertyCard'

interface AgentPropertiesProps {
  agentId: string
  initialProperties: Property[]
  agentName: string
}

export default function AgentProperties({
  agentId,
  initialProperties,
  agentName,
}: AgentPropertiesProps) {
  const [properties] = useState<Property[]>(initialProperties)

  // Debug logging
  console.log('🔍 AgentProperties Debug:', {
    agentId,
    agentName,
    initialPropertiesCount: initialProperties.length,
    initialProperties: initialProperties.map((p) => ({
      id: p.$id,
      title: p.title,
      agentId: p.agentId,
      status: p.status,
    })),
    propertiesCount: properties.length,
  })

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {agentName}&apos;s Properties
          </h2>
          <p className="text-gray-600 mt-1">
            Featured listings from this agent
          </p>
        </div>

        <Link
          href={`/agents/${agentId}/properties`}
          className="flex items-center gap-2 text-emerald-600 hover:text-blue-700 font-medium"
        >
          View All Properties
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard key={property.$id} property={property} />
        ))}
      </div>
    </section>
  )
}
