// app/verify/[token]/page.tsx:

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
  const token = params.token as string
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  )
  const [message, setMessage] = useState('Verifying your email...')
  const [userEmail, setUserEmail] = useState<string>('')

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
            router.push('/auth/verification-success')
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
  }, [token, router])

  const handleResend = async () => {
    if (!userEmail) {
      toast.error('No email address found')
      return
    }

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success('New verification email sent! Check your inbox.')
      } else {
        toast.error(data.error || 'Failed to resend verification email')
      }
    } catch (error) {
      console.error('❌ Resend error:', error)
      toast.error('Failed to send verification email')
    }
  }

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-blue-600" />
            <div className="space-y-2">
              <p className="text-gray-600 font-medium">{message}</p>
              <p className="text-sm text-gray-500">
                Please wait while we verify your email address...
              </p>
            </div>
          </div>
        )

      case 'success':
        return (
          <div className="text-center space-y-4">
            <CheckCircle className="w-12 h-12 mx-auto text-green-600" />
            <div className="space-y-2">
              <p className="text-green-600 font-medium">{message}</p>
              {userEmail && (
                <p className="text-sm text-gray-600">Verified: {userEmail}</p>
              )}
              <p className="text-sm text-gray-500">
                Redirecting you to the success page...
              </p>
            </div>
            <Button
              onClick={() => router.push('/auth/verification-success')}
              className="mt-4 w-full"
              size="lg"
            >
              Go to Success Page
            </Button>
          </div>
        )

      case 'error':
        return (
          <div className="text-center space-y-4">
            <XCircle className="w-12 h-12 mx-auto text-red-600" />
            <div className="space-y-2">
              <p className="text-red-600 font-medium">{message}</p>
              {userEmail && (
                <p className="text-sm text-gray-600">Account: {userEmail}</p>
              )}
              <p className="text-sm text-gray-500">
                Please request a new verification email or contact support.
              </p>
            </div>
            <div className="space-y-3">
              {userEmail && (
                <Button
                  onClick={handleResend}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Resend Verification Email
                </Button>
              )}
              <Button
                onClick={() => router.push('/auth/verification-failed')}
                variant="outline"
                className="w-full"
              >
                View Error Details
              </Button>
              <Button onClick={() => router.push('/')} className="w-full">
                Go to Homepage
              </Button>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Email Verification</CardTitle>
          <p className="text-sm text-gray-500">
            PropSafeHub Account Verification
          </p>
        </CardHeader>
        <CardContent>
          {renderContent()}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Need help? Contact{' '}
              <a
                href="mailto:support@propsafehub.com"
                className="text-blue-600 hover:underline"
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
