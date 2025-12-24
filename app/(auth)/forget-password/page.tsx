// app/auth/forget-password/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { Suspense, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ForgotPasswordPage() {
  const [resetEmail, setResetEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/auth/forget-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset link')
      }

      setSuccess(true)
      setError('')

      // Optional: Show success message for a few seconds
      setTimeout(() => {
        router.push('/auth/signin')
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
      setSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  const renderForgotPasswordStep = () => (
    <form
      onSubmit={handleForgotPassword}
      className="space-y-4 bg-white p-8 rounded-2xl shadow-xl border"
    >
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-4">
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </p>
      </div>

      <div>
        <Label
          htmlFor="reset-email"
          className="text-sm font-medium text-gray-700"
        >
          Email Address
        </Label>
        <Input
          id="reset-email"
          type="email"
          value={resetEmail}
          onChange={(e) => setResetEmail(e.target.value)}
          placeholder="Enter your email address"
          className="mt-1 h-12"
          required
          disabled={isLoading}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-600">
            ✅ Reset link sent! Check your email. Redirecting to sign in...
          </p>
        </div>
      )}

      <div className="flex space-x-3 pt-2">
        <Button
          type="submit"
          className="flex-1 disabled:cursor-alias hover:cursor-pointer h-12 bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-4 text-base font-semibold rounded-xl transition-all duration-200"
          disabled={isLoading || !resetEmail}
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </div>
    </form>
  )

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
              Forgot your password?
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Don&apos;t worry, we&apos;ll help you reset it
            </p>
          </div>

          {renderForgotPasswordStep()}

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <Button
                variant="link"
                className="cursor-pointer text-emerald-600 hover:text-emerald-800 p-0 h-auto font-medium"
                onClick={() => router.push('/login')}
              >
                Sign in here
              </Button>
            </p>
          </div>
        </div>
      </div>
    </Suspense>
  )
}
