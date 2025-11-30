'use client'

import { useAuth } from '@/contexts/AuthContext'
import { AlertCircle, Mail } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function VerificationBanner() {
  const { user, showVerificationModal, resendVerificationEmail } = useAuth()

  // Don't show if user is verified, modal is open, or no user
  if (!user || user.emailVerified || showVerificationModal) {
    return null
  }

  const handleResendEmail = async () => {
    try {
      // Pass the user's email to the function
      await resendVerificationEmail(user.email)
    } catch (error) {
      console.error('Failed to resend verification email:', error)
    }
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <span className="text-sm text-amber-800">
            Please verify your email at <strong>{user.email}</strong>
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleResendEmail}
          className="text-amber-700 border-amber-300 hover:bg-amber-100 h-8"
        >
          <Mail className="h-3 w-3 mr-1" />
          Resend
        </Button>
      </div>
    </div>
  )
}
