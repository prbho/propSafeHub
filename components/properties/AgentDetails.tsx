// components/properties/AgentDetails.tsx - UPDATED WITH FETCH
'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Star, User } from 'lucide-react'

interface AgentDetailsProps {
  property?: {
    agentId?: string
    agentName?: string
    listedBy?: string
    phone?: string
  }
  agent?: {
    name?: string
    avatar?: string
    rating?: number
    reviewCount?: number
    agency?: string
  }
}

export default function AgentDetails({ agent, property }: AgentDetailsProps) {
  const [agentData, setAgentData] = useState(agent)
  const [loading, setLoading] = useState(!agent)
  const [avatarError, setAvatarError] = useState(false)

  // Fetch agent data if not provided
  useEffect(() => {
    async function fetchAgent() {
      if (agent || !property?.agentId) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const response = await fetch(`/api/agents/${property.agentId}`)

        if (!response.ok) {
          throw new Error('Failed to fetch agent')
        }

        const data = await response.json()
        setAgentData({
          name: data.name,
          avatar: data.avatar,
          rating: data.rating,
          reviewCount: data.reviewCount,
          agency: data.agency,
        })
      } catch (error) {
        console.error('Failed to fetch agent:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAgent()
  }, [property?.agentId, agent])

  // Combine data from both agent prop and property
  const displayAgent = {
    name:
      agentData?.name ||
      property?.agentName ||
      property?.listedBy ||
      'Property Agent',
    avatar: agentData?.avatar || '',
    rating: agentData?.rating || '',
    reviewCount: agentData?.reviewCount || 0,
    agency: agentData?.agency || 'Licensed Real Estate Agent',
  }

  const agentName = displayAgent.name
  const agentAvatar = displayAgent.avatar
  const agentRating = displayAgent.rating
  const agentReviewCount = displayAgent.reviewCount
  const agentAgency = displayAgent.agency

  // Avatar logic
  const shouldShowAvatar = agentAvatar && !avatarError

  // Generate avatar URL if no avatar provided but we have agent name/email
  const getAvatarUrl = () => {
    if (agentAvatar) return agentAvatar
    // Fallback to DiceBear based on agent name
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(agentName)}`
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Property Agent</h3>
        <div className="animate-pulse">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Property Agent</h3>

      <div className="flex items-start gap-4">
        {/* Agent Avatar */}
        <div className="w-16 h-16 rounded-full overflow-hidden bg-linear-to-br from-emerald-400 to-blue-500 flex items-center justify-center shrink-0">
          {shouldShowAvatar ? (
            <Image
              src={getAvatarUrl()}
              alt={agentName}
              width={64}
              height={64}
              className="w-full h-full object-cover"
              unoptimized
              onError={() => setAvatarError(true)}
            />
          ) : (
            <User className="h-8 w-8 text-white" />
          )}
        </div>

        {/* Agent Info */}
        <div className="flex-1">
          <div className="font-bold text-gray-900 text-lg">{agentName}</div>
          <div className="text-sm text-gray-600 mb-2">{agentAgency}</div>
          <div className="flex items-center text-sm">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="ml-1 font-semibold text-gray-900">
              {agentRating}
            </span>
            <span className="text-gray-600 ml-1">
              ({agentReviewCount} reviews)
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
