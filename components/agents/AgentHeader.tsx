import Image from 'next/image'
import { Agent } from '@/types'
import {
  BadgeCheck,
  Building2,
  MapPin,
  MessageCircle,
  Share2,
  Star,
} from 'lucide-react'

interface AgentHeaderProps {
  agent: Agent
}

export default function AgentHeader({ agent }: AgentHeaderProps) {
  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Agent Avatar */}
            <div className="shrink-0">
              <div className="relative w-32 h-32 lg:w-40 lg:h-40 rounded-2xl overflow-hidden bg-linear-to-br from-blue-50 to-indigo-100">
                {agent.avatar ? (
                  <Image
                    src={agent.avatar}
                    alt={agent.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-4xl text-gray-400">👨‍💼</div>
                  </div>
                )}

                {/* Verification Badge */}
                {agent.isVerified && (
                  <div className="absolute bottom-2 right-2">
                    <div className="bg-blue-500 text-white p-1 rounded-full">
                      <BadgeCheck className="w-4 h-4" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Agent Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {agent.name}
                    </h1>
                    {agent.isVerified && (
                      <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        <BadgeCheck className="w-4 h-4" />
                        Verified Agent
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      <span>{agent.agency}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{agent.city}</span>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="text-lg font-bold text-gray-900">
                          {agent.rating}
                        </span>
                      </div>
                      <span className="text-gray-600">/ 5.0</span>
                    </div>
                    <div className="h-4 w-px bg-gray-300"></div>
                    <div className="text-gray-600">
                      {agent.reviewCount} reviews
                    </div>
                    <div className="h-4 w-px bg-gray-300"></div>
                    <div className="text-gray-600">
                      License: {agent.licenseNumber}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4 sm:mt-0">
                  <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    <MessageCircle className="w-5 h-5" />
                    Contact
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {agent.yearsExperience}+
                  </div>
                  <div className="text-sm text-gray-600">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {agent.totalListings}+
                  </div>
                  <div className="text-sm text-gray-600">Properties Sold</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {agent.reviewCount}
                  </div>
                  <div className="text-sm text-gray-600">Happy Clients</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {agent.rating}/5
                  </div>
                  <div className="text-sm text-gray-600">Customer Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
