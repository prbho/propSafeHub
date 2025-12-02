// app/(auth)/signup/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'

import { RegistrationForm } from '@/components/auth/RegistrationForm'

export default function SignUpPage() {
  const [email, setEmail] = useState('')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join PropSafe Hub to find your perfect property
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <RegistrationForm
            initialEmail={email}
            onRegistrationComplete={() => {
              // Handle successful registration
              // Redirect or show success message
            }}
            showBackButton={false}
          />
        </div>

        {/* Terms and Conditions */}
        <p className="text-xs text-gray-500 text-center mt-6">
          By creating an account, you agree to our{' '}
          <Link
            href="/terms"
            className="text-emerald-600 hover:text-emerald-700"
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            href="/privacy"
            className="text-emerald-600 hover:text-emerald-700"
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}
