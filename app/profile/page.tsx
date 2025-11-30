// app/profile/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function ProfileRedirectPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        // Redirect to the user's own profile
        router.replace(`/profile/${user.$id}`)
      } else {
        // Redirect to login if not authenticated
        router.replace('/signin')
      }
    }
  }, [isAuthenticated, user, isLoading, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to your profile...</p>
      </div>
    </div>
  )
}
