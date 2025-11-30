// components/properties/AgentDetails.tsx - FIXED AVATAR FETCHING
'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { Agent, Property } from '@/types'
import { RefreshCw, Star, User } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { AGENTS_COLLECTION_ID, DATABASE_ID, databases } from '@/lib/appwrite' // Add these imports
import { getAgentById, syncUserToAgent } from '@/lib/services/agentService'

interface AgentDetailsProps {
  property: Property | null
}

export default function AgentDetails({ property }: AgentDetailsProps) {
  const { user } = useAuth()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [syncAttempted, setSyncAttempted] = useState(false)
  const [avatarError, setAvatarError] = useState(false)

  const fetchAgentData = async (retrySync = false) => {
    if (!property || !property.agentId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      let agentData = await getAgentById(property.agentId)

      // If agent not found by direct ID, try to sync
      if (!agentData && (!syncAttempted || retrySync)) {
        setSyncAttempted(true)

        if (user) {
          agentData = await syncUserToAgent({
            userId: property.agentId,
            userName: property.agentName || user.name,
            userEmail: user.email,
            userPhone: user.phone,
          })
        }
      }

      // ✅ NEW: If still no agent data, try to fetch directly from agents collection
      if (!agentData && property.agentId) {
        try {
          const directAgentData = await databases.getDocument(
            DATABASE_ID,
            AGENTS_COLLECTION_ID,
            property.agentId
          )
          if (directAgentData) {
            agentData = {
              $id: directAgentData.$id,
              name:
                directAgentData.name || property.agentName || 'Property Agent',
              email: directAgentData.email || '',
              licenseNumber: directAgentData.licenseNumber,
              bio: directAgentData.bio || '',
              specialties: directAgentData.specialties || '',
              languages: directAgentData.languages || '',
              officePhone: directAgentData.officePhone || '',
              mobilePhone: directAgentData.mobilePhone || '',
              website: directAgentData.website || '',
              yearsExperience: directAgentData.yearsExperience || '',
              isVerified: directAgentData.isVerified || '',
              verificationDocuments:
                directAgentData.verificationDocuments || '',
              city: directAgentData.city || '',
              totalListings: directAgentData.totalListings || '',
              phone: directAgentData.phone || property.phone || '',
              avatar: directAgentData.avatar || '', // ✅ This should have the avatar
              agency: directAgentData.agency || 'Independent Agent',
              rating: directAgentData.rating || 4.5,
              reviewCount: directAgentData.reviewCount || 0,
              $createdAt: directAgentData.$createdAt,
              $updatedAt: directAgentData.$updatedAt,
            }
          }
        } catch (directError) {
          console.log(
            '❌ Direct fetch from agents collection failed:',
            directError
          )
        }
      }

      if (agentData) {
        setAgent(agentData)
        console.log('✅ Agent data loaded successfully:', {
          name: agentData.name,
          hasAvatar: !!agentData.avatar,
          avatar: agentData.avatar,
        })
      } else {
        console.log('⚠️ Using property data as fallback')
        setError('Using basic agent information')
      }
    } catch {
      toast.error('Failed to load agent details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAgentData()
  }, [property?.agentId, property?.agentName, user])

  useEffect(() => {
    setAvatarError(false)
  }, [agent])

  // Return early if no property
  if (!property) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Property Agent</h3>
        <div className="text-center text-gray-500 py-4">
          <p>No property information available</p>
        </div>
      </div>
    )
  }

  // Use agent data if available, otherwise fallback to property data
  const displayAgent = agent || {
    $id: property.agentId || '',
    name: property.agentName || property.listedBy || 'Property Agent',
    email: '',
    phone: property.phone || '',
    avatar: '', // This will be empty in fallback
    agency: 'Independent Agent',
    rating: 4.5,
    reviewCount: 0,
  }

  const agentName = displayAgent.name
  const agentAvatar = displayAgent.avatar
  const agentRating = displayAgent.rating || 4.5
  const agentReviewCount = displayAgent.reviewCount || 0
  const agentAgency = displayAgent.agency || 'Licensed Real Estate Agent'

  // Avatar logic
  const shouldShowAvatar = agentAvatar && !avatarError

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
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleRetrySync = () => {
    fetchAgentData(true)
  }

  const handleAvatarError = () => {
    console.log('❌ Avatar image failed to load:', agentAvatar)
    setAvatarError(true)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Property Agent</h3>

      <div className="flex items-start gap-4 mb-5">
        {/* Agent Avatar */}
        <div className="w-16 h-16 rounded-full overflow-hidden bg-linear-to-br from-emerald-400 to-blue-500 flex items-center justify-center shrink-0">
          {shouldShowAvatar ? (
            <Image
              src={agentAvatar}
              alt={agentName}
              width={64}
              height={64}
              className="w-full h-full object-cover"
              onError={handleAvatarError}
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

      {/* Status messages */}
      {error && !agent && (
        <div className="mt-4 space-y-3">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
            <div className="text-blue-800">
              <p>
                ✨ <strong>Direct Listing!</strong> This property was listed by
                the owner.
              </p>
            </div>
          </div>

          {error !== 'Using basic agent information' && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
              <div className="text-yellow-800">
                <p>
                  ⚠️ <strong>Sync Issue:</strong> {error}
                </p>
                <Button
                  onClick={handleRetrySync}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Sync
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
