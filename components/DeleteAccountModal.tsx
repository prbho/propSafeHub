'use client'

import { useState } from 'react'
import { AlertTriangle, Loader2, X } from 'lucide-react'

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  userEmail: string
}

export default function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirm,
  userEmail,
}: DeleteAccountModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  if (!isOpen) return null

  const handleConfirm = async () => {
    if (confirmText !== 'DELETE') {
      return
    }

    setIsDeleting(true)
    try {
      await onConfirm()
    } catch (error) {
      console.error('Error in delete confirmation:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmText('')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-br from-red-50 to-orange-50 border-b border-red-100 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Delete Account
              </h2>
            </div>
            <button
              onClick={handleClose}
              disabled={isDeleting}
              className="p-1.5 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Warning Banner */}
          <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4">
            <p className="text-red-900 font-semibold text-sm">
              ⚠️ This action cannot be undone
            </p>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <p className="text-gray-700 leading-relaxed">
              You are about to permanently delete your account and all
              associated data. This will immediately:
            </p>
            <ul className="text-sm text-gray-600 space-y-2.5 bg-gray-50 rounded-lg p-4">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>Delete your profile information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>Remove all your saved properties and searches</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>Delete your profile picture</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>Permanently remove your account</span>
              </li>
            </ul>
          </div>

          {/* Account Info */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-900 text-sm">
              <span className="font-semibold">Account being deleted:</span>
              <br />
              <span className="font-mono text-xs mt-1 block">{userEmail}</span>
            </p>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-2.5">
            <label className="block text-sm font-medium text-gray-900">
              Type{' '}
              <span className="font-mono text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                DELETE
              </span>{' '}
              to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none font-mono uppercase transition-all"
              placeholder="DELETE"
              disabled={isDeleting}
              autoComplete="off"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="flex-1 bg-white border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirmText !== 'DELETE' || isDeleting}
            className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Account'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
