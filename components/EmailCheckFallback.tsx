// components/EmailCheckFallback.tsx
import { AlertCircle } from 'lucide-react'

interface EmailCheckFallbackProps {
  message: string
  onContinue: () => void
  onCancel: () => void
}

export function EmailCheckFallback({
  message,
  onContinue,
  onCancel,
}: EmailCheckFallbackProps) {
  return (
    <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-amber-800 text-sm mb-3">{message}</p>
          <div className="flex gap-2">
            <button
              onClick={onContinue}
              className="px-3 py-1 bg-amber-600 text-white text-sm rounded hover:bg-amber-700 transition-colors"
            >
              Continue Anyway
            </button>
            <button
              onClick={onCancel}
              className="px-3 py-1 border border-amber-300 text-amber-700 text-sm rounded hover:bg-amber-100 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
