'use client'

import Image from 'next/image'
import { Share2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

interface AgentHeaderProps {
  agent: {
    $id: string
    name: string
    email: string
    avatar?: string
    isVerified?: boolean
    licenseNumber?: string
    agency: string
    yearsExperience?: number
    totalListings: number
    reviewCount?: number
    rating?: number
    city?: string
    state?: string
    specialties?: string[]
    languages?: string[]
    phone?: string
    mobilePhone?: string
    officePhone?: string
    website?: string
    bio?: string
  }
}

export default function AgentHeader({ agent }: AgentHeaderProps) {
  const avatarUrl =
    agent.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(agent.email)}`

  const handleShare = async () => {
    const shareData = {
      title: `${agent.name} - Real Estate Agent`,
      text: `Check out ${agent.name}'s profile on PropSafe Hub`,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      await navigator.clipboard.writeText(shareData.url)
      toast.success('Link copied to clipboard!')
    }
  }

  return (
    <div className="bg-linear-to-r from-emerald-600 to-emerald-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Agent Info */}
          <div className="flex items-center gap-6">
            <Image
              src={avatarUrl}
              alt={agent.name}
              width={120}
              height={120}
              className="rounded-full border-4 border-white shadow-lg"
              unoptimized
            />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">{agent.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-emerald-100">{agent.agency}</p>
                {agent.isVerified && (
                  <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                    Verified
                  </span>
                )}
              </div>
              {agent.city && (
                <p className="text-emerald-100 text-sm mt-1">
                  Based in {agent.city}
                </p>
              )}
            </div>
          </div>

          {/* Share Button */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleShare}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
