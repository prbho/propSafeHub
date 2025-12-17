'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Agent } from '@/types'
import { BadgeCheck, Mail, MapPin, Phone, Star, User } from 'lucide-react'

import { Badge } from './ui/badge'

interface AgentCardProps {
  agent: Agent
}

export default function AgentCard({ agent }: AgentCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200">
      {/* Header */}
      <div className="relative">
        <div className="aspect-4/3 bg-gray-100 relative">
          {agent.avatar ? (
            <Image
              src={agent.avatar}
              alt={agent.name}
              fill
              className="object-cover"
              unoptimized
              priority={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
              <User className="w-32 h-32 text-gray-400" />
            </div>
          )}

          {/* Verification Badge */}
          {agent.isVerified && (
            <div className="absolute top-4 left-4">
              <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <BadgeCheck className="w-3 h-3" />
                Verified
              </div>
            </div>
          )}

          {/* Rating Badge */}
          <div className="absolute top-4 right-4">
            <div className="bg-white px-3 py-2 rounded-full shadow-md flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold text-gray-900">
                {agent.rating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="px-4 py-3">
        <div className="flex items-start justify-between mb-2">
          <div>
            <Link
              href={`/agents/${agent.$id}`}
              className="hover:text-emerald-600 transition-colors"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">
                {agent.name}
              </h3>
            </Link>
            <p className="text-gray-600 text-sm">{agent.agency}</p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Mail className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Phone className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center text-gray-600 text-sm mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{agent.city}</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center mb-3 border-t border-b py-2">
          <div>
            <div className="text-lg font-bold text-gray-900">
              {agent.yearsExperience}
            </div>
            <div className="text-xs text-gray-600">Years Exp.</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">
              {agent.totalListings}
            </div>
            <div className="text-xs text-gray-600">Listings</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">
              {agent.reviewCount}
            </div>
            <div className="text-xs text-gray-600">Reviews</div>
          </div>
        </div>

        {/* Languages */}
        <div className="mb-2">
          <div className="text-xs text-gray-600 mb-1">Languages:</div>
          <div className="flex flex-wrap gap-1">
            {agent.languages.map((lang, idx) => (
              <Badge
                key={idx}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
              >
                {lang}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
