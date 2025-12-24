// app/auth/success/page.tsx
'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function SuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get('type') || 'registration'

  useEffect(() => {
    // Auto-redirect after 8 seconds
    const timer = setTimeout(() => {
      router.push('/login')
    }, 8000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {type === 'registration' ? 'Registration Successful!' : 'Success!'}
          </h2>

          <p className="text-gray-600 mb-6">
            {type === 'registration'
              ? 'Your account has been created successfully. Please check your email to verify your account before logging in.'
              : 'Operation completed successfully.'}
          </p>

          <div className="space-y-4">
            <Button
              onClick={() => router.push('/login')}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              Go to Login
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="w-full"
            >
              Go to Homepage
            </Button>

            <p className="text-sm text-gray-500 mt-4">
              Redirecting to login in 8 seconds...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
