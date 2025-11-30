'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, Crown, Loader2, X } from 'lucide-react'

export default function PaymentVerifyPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  )
  const [message, setMessage] = useState('Verifying your payment...')

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get('reference')
      const trxref = searchParams.get('trxref')

      if (!reference && !trxref) {
        setStatus('error')
        setMessage('No payment reference found')
        return
      }

      try {
        const response = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reference: reference || trxref,
          }),
        })

        const result = await response.json()

        if (response.ok && result.success) {
          setStatus('success')
          setMessage('Payment successful! Your listing is now premium.')

          // Redirect to property page after 3 seconds
          setTimeout(() => {
            router.push('/properties')
          }, 3000)
        } else {
          setStatus('error')
          setMessage(result.error || 'Payment verification failed')
        }
      } catch (error) {
        console.error('Payment verification error:', error)
        setStatus('error')
        setMessage('Failed to verify payment. Please contact support.')
      }
    }

    verifyPayment()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verifying Payment
            </h1>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <div className="flex justify-center mb-4">
              <Crown className="w-12 h-12 text-yellow-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-600 mb-4">{message}</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">
                Your listing is now featured and will appear at the top of
                search results. Redirecting you...
              </p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Failed
            </h1>
            <p className="text-gray-600 mb-4">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/properties')}
                className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Properties
              </button>
              <button
                onClick={() => router.push('/support')}
                className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Contact Support
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
