'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle,
  ArrowLeft,
  Building,
  Compass,
  Globe,
  Home,
  Map,
  RefreshCw,
  Search,
  Shield,
  TrendingUp,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function NotFound() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(10)

  // Countdown timer for auto-redirect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      router.push('/')
    }
  }, [countdown, router])

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          {/* Error Header */}
          <div className="text-center">
            <div className="inline-flex p-6 rounded-2xl mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-red-100 rounded-full animate-ping"></div>
                <div className="relative p-4 bg-red-100 rounded-full">
                  <AlertTriangle className="h-12 w-12 text-red-500" />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-4 text-red-100 rounded-full text-6xl font-bold mb-4">
                Error 404
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
                Page Not Found
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                The page or property you&apos;re looking for might have been
                moved, sold, or doesn&apos;t exist. Let&apos;s help you find
                what you need.
              </p>
            </div>

            {/* Auto Redirect Notice */}
            <div className="mb-8 p-4 bg-emerald-50 rounded-lg inline-flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-emerald-800 font-medium">
                  Redirecting to homepage in {countdown} seconds
                </p>
                <p className="text-emerald-600 text-sm">
                  Or click any link below to go there now
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
