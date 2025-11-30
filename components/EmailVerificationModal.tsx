'use client'

import { useEffect, useState } from 'react'
import {
  CheckCircle2,
  Clock,
  Info,
  Mail,
  RefreshCw,
  Shield,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface EmailVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onResendEmail: () => Promise<{ success: boolean; message?: string }>
  onCheckVerification: () => Promise<boolean>
  userEmail?: string
}

export default function EmailVerificationModal({
  isOpen,
  onClose,
  onResendEmail,
  onCheckVerification,
  userEmail,
}: EmailVerificationModalProps) {
  const [isSending, setIsSending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [resendMessage, setResendMessage] = useState('')
  const [isVerified, setIsVerified] = useState(false)

  // Auto-check verification status every 10 seconds when modal is open
  useEffect(() => {
    if (!isOpen) return

    // Initial check when modal opens
    checkVerificationStatus()

    const checkInterval = setInterval(async () => {
      await checkVerificationStatus()
    }, 10000) // Check every 10 seconds

    return () => clearInterval(checkInterval)
  }, [isOpen])

  const checkVerificationStatus = async () => {
    if (isChecking) return

    setIsChecking(true)
    try {
      const isVerified = await onCheckVerification()
      if (isVerified) {
        setIsVerified(true)
        setIsSuccess(true)
        setError('')
        setResendMessage('Email verified successfully!')

        // Auto-close after 3 seconds if verified
        setTimeout(() => {
          onClose()
          // Reset state for next time
          setTimeout(() => {
            setIsVerified(false)
            setIsSuccess(false)
            setResendMessage('')
          }, 500)
        }, 3000)
      }
      setLastChecked(new Date())
    } catch (error) {
      console.error('Error checking verification status:', error)
    } finally {
      setIsChecking(false)
    }
  }

  const handleResendVerification = async () => {
    try {
      setIsSending(true)
      setError('')
      setIsSuccess(false)
      setResendMessage('')

      const result = await onResendEmail()
      setIsSuccess(true)
      setResendMessage(
        result.message || 'Verification email sent successfully!'
      )

      // Clear success message after 5 seconds
      setTimeout(() => {
        setIsSuccess(false)
        setResendMessage('')
      }, 5000)
    } catch {
    } finally {
      setIsSending(false)
    }
  }

  const handleManualCheck = async () => {
    await checkVerificationStatus()
  }

  const handleClose = () => {
    setError('')
    setResendMessage('')
    setIsSuccess(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-emerald-600" />
            {isVerified ? 'Email Verified!' : 'Verify Your Email'}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-6 w-6 rounded-full hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4">
          {/* Success Message for Resend */}
          {isSuccess && resendMessage && !isVerified && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle2 className="h-5 w-5" />
                <div>
                  <p className="font-medium">Email sent!</p>
                  <p className="text-sm mt-1">{resendMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message for Verification */}
          {isVerified && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle2 className="h-5 w-5" />
                <div>
                  <p className="font-medium">Email verified successfully!</p>
                  <p className="text-sm mt-1">
                    Your email has been verified. You now have full access to
                    all features.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-red-800">
                <p className="font-medium">Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Info Message - Only show if not verified */}
          {!isVerified && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">You&apos;re signed in!</p>
                  <p className="mt-1">
                    Please verify your email to access all features. We&apos;ve
                    sent a verification link to:
                  </p>
                  <p className="font-mono text-xs bg-blue-100 px-2 py-1 rounded mt-2">
                    {userEmail}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Auto-check Status - Only show if not verified */}
          {!isVerified && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span className="text-sm text-amber-800">
                    {isChecking
                      ? 'Checking...'
                      : 'Auto-checking verification status...'}
                  </span>
                </div>
                {isChecking && (
                  <RefreshCw className="h-4 w-4 text-amber-600 animate-spin" />
                )}
              </div>
              {lastChecked && (
                <p className="text-xs text-amber-700 mt-1">
                  Last checked: {lastChecked.toLocaleTimeString()}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons - Only show if not verified */}
          {!isVerified && (
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <Button
                  onClick={handleResendVerification}
                  disabled={isSending}
                  className="flex-1 bg-emerald-600 hover:bg-blue-700"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Resend Email
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleManualCheck}
                  disabled={isChecking}
                  variant="outline"
                  className="flex-1"
                >
                  {isChecking ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    'Check Now'
                  )}
                </Button>
              </div>

              <Button
                onClick={handleClose}
                variant="outline"
                disabled={isSending || isChecking}
              >
                I&apos;ll Verify Later
              </Button>
            </div>
          )}

          {/* Help Information - Only show if not verified */}
          {!isVerified && (
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Didn&apos;t receive the email?
              </h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>Check your spam or junk folder</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>
                    Make sure <strong>{userEmail}</strong> is correct
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>
                    Wait a few minutes - emails can take time to arrive
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>
                    This modal will auto-close once you verify your email
                  </span>
                </li>
              </ul>
            </div>
          )}

          {/* Close button for verified state */}
          {isVerified && (
            <div className="flex justify-center pt-2">
              <Button
                onClick={handleClose}
                className="bg-green-600 hover:bg-green-700"
              >
                Continue to App
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
