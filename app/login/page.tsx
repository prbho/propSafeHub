// app/login/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { toast, Toaster } from 'sonner'

import { ToastHandler } from '@/components/toast-handler'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const searchParams = useSearchParams()

  useEffect(() => {
    const verified = searchParams.get('verified') === 'true'
    const verificationError = searchParams.get('verification_error') === 'true'

    if (verified) {
      toast.success('Email verified successfully! You can now login.')
    }

    if (verificationError) {
      toast.error(
        'Email verification failed. Please try again or request a new verification link.'
      )
    }
  }, [searchParams])

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push('/')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!email || !password) {
      setError('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await login({ email, password })
      router.push('/')
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex flex-col justify-center pb-12 sm:px-6 lg:px-8">
      <Toaster position="top-right" expand={false} richColors closeButton />
      <ToastHandler />
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to your account to continue
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-gray-200">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start">
              <AlertCircle className="h-5 w-5 mr-3 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <Label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address *
              </Label>
              <div className="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="h-12 text-base"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password *
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="mt-1 relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-12 text-base pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-700"
              >
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-base font-semibold bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>
            </div>
          </form>

          {/* Sign Up Link */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link
                href="/sign-up"
                className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors"
              >
                Create account here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
