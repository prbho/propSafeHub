// app/verify/[token]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle, Loader2, RefreshCw, XCircle } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function VerifyPage() {
  const router = useRouter()
  const params = useParams()
  const rawToken = params.token as string

  const token = decodeURIComponent(rawToken)

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  )
  const [message, setMessage] = useState('Verifying your email...')
  const [userEmail, setUserEmail] = useState<string>('')
  const [isResending, setIsResending] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)

  // Countdown timer effect
  useEffect(() => {
    if (resendCountdown <= 0) return

    const timer = setInterval(() => {
      setResendCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [resendCountdown])

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error')
        setMessage('Invalid verification link')
        return
      }

      try {
        console.log('🔐 Verifying token:', token.substring(0, 20) + '...')

        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()
        console.log('📡 Verification response:', data)

        if (response.ok && data.success) {
          setStatus('success')
          setMessage(data.message || 'Email verified successfully!')
          setUserEmail(data.email || '')

          // Redirect to success page after 3 seconds
          setTimeout(() => {
            router.push('/login')
          }, 3000)
        } else {
          setStatus('error')
          setMessage(data.error || 'Verification failed')
          if (data.email) setUserEmail(data.email)
        }
      } catch (error) {
        console.error('❌ Verification error:', error)
        setStatus('error')
        setMessage('An unexpected error occurred. Please try again.')
      }
    }

    verifyEmail()
  }, [token, router, rawToken])

  const handleResend = async () => {
    if (!userEmail || isResending || resendCountdown > 0) return

    setIsResending(true)

    try {
      toast.loading('Sending verification email...', {
        id: 'resend-verification',
      })

      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success('New verification email sent! Check your inbox.', {
          id: 'resend-verification',
          duration: 5000,
        })

        // Start countdown (60 seconds)
        setResendCountdown(60)
      } else {
        toast.error(data.error || 'Failed to resend verification email', {
          id: 'resend-verification',
        })
      }
    } catch (error) {
      console.error('❌ Resend error:', error)
      toast.error('Failed to send verification email. Please try again.', {
        id: 'resend-verification',
      })
    } finally {
      setIsResending(false)
    }
  }

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <Loader2 className="w-12 h-12 mx-auto animate-spin text-blue-600" />
              <div className="space-y-2">
                <p className="text-gray-700 font-medium text-lg">{message}</p>
                <p className="text-sm text-gray-500">
                  Please wait while we verify your email address...
                </p>
              </div>
            </div>
          </div>
        )

      case 'success':
        return (
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <div className="space-y-2">
                <p className="text-green-700 font-medium text-lg">{message}</p>
                {userEmail && (
                  <p className="text-sm text-gray-600">Verified: {userEmail}</p>
                )}
                <p className="text-sm text-gray-500">
                  You will be redirected automatically...
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/login')}
                className="w-full"
                size="lg"
              >
                Go to Login
              </Button>
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="w-full"
              >
                Go to Homepage
              </Button>
            </div>
          </div>
        )

      case 'error':
        return (
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <div className="space-y-2">
                <p className="text-red-700 font-medium text-lg">{message}</p>
                {userEmail && (
                  <p className="text-sm text-gray-600">Account: {userEmail}</p>
                )}
                <p className="text-sm text-gray-500">
                  Please request a new verification email or contact support.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {userEmail && (
                <Button
                  onClick={handleResend}
                  disabled={isResending || resendCountdown > 0}
                  variant="outline"
                  className="w-full"
                >
                  {isResending ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </span>
                  ) : resendCountdown > 0 ? (
                    `Resend available in ${resendCountdown}s`
                  ) : (
                    <span className="flex items-center justify-center">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Resend Verification Email
                    </span>
                  )}
                </Button>
              )}

              <Button
                onClick={() => router.push('/login')}
                className="w-full"
                size="lg"
              >
                Go to Login Page
              </Button>

              <Button
                onClick={() => router.push('/')}
                variant="ghost"
                className="w-full"
              >
                Return to Homepage
              </Button>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold text-gray-900">
              Email Verification
            </CardTitle>
            <p className="text-gray-600">PropSafe Hub Account Verification</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderContent()}
          <div className="pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Need help? Contact{' '}
              <a
                href="mailto:support@propsafehub.com"
                className="text-blue-600 hover:underline font-medium"
              >
                support@propsafehub.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
