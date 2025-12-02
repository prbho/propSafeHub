'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { CheckCircle } from 'lucide-react'

export default function VerificationSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshUser, user } = useAuth()
  const [countdown, setCountdown] = useState(5)
  const [isRedirecting, setIsRedirecting] = useState(false)

  const redirectToProfile = useCallback(() => {
    if (isRedirecting || !user) return

    setIsRedirecting(true)
    const userType = user.userType || 'user'
    const userId = user.$id

    // Use setTimeout to ensure this happens in the next event loop
    setTimeout(() => {
      router.push(`/profile/${userType}/${userId}`)
    }, 0)
  }, [user, router, isRedirecting])

  useEffect(() => {
    // Refresh user data to get latest verification status
    const refreshUserData = async () => {
      try {
        await refreshUser()
        console.log('✅ User data refreshed')
      } catch (error) {
        console.error('Failed to refresh user:', error)
      }
    }

    refreshUserData()
  }, [refreshUser])

  useEffect(() => {
    if (!user || countdown <= 0) return

    // Start countdown for auto-redirect
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          redirectToProfile()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(countdownInterval)
  }, [countdown, redirectToProfile, user])

  const alreadyVerified = searchParams.get('already_verified') === 'true'

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900">
            {alreadyVerified ? 'Already Verified' : 'Email Verified'}
          </h1>
          <p className="text-gray-600">
            {alreadyVerified
              ? 'Your email was already confirmed'
              : 'Your email has been verified successfully'}
          </p>
        </div>

        {/* Countdown */}
        <div className="space-y-2">
          <div className="text-sm text-gray-500">
            Redirecting to profile in {countdown} seconds
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-green-600 h-1 rounded-full transition-all duration-1000"
              style={{ width: `${(5 - countdown) * 20}%` }}
            />
          </div>
        </div>

        {/* Email Display */}
        {user?.email && (
          <div className="text-sm text-gray-700">
            Verified email: <span className="font-medium">{user.email}</span>
          </div>
        )}

        {/* Button */}
        <button
          onClick={redirectToProfile}
          disabled={isRedirecting}
          className="w-full py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {isRedirecting ? 'Redirecting...' : 'Go to Profile'}
        </button>
      </div>
    </div>
  )
}
