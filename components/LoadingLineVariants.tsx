'use client'

import { useEffect, useState } from 'react'

type LoadingVariant = 'pulse' | 'progress' | 'indeterminate' | 'wave'

interface LoadingLineProps {
  variant?: LoadingVariant
  color?: 'blue' | 'green' | 'purple' | 'orange'
  height?: 'sm' | 'md' | 'lg'
}

export default function LoadingLine({
  variant = 'progress',
  color = 'blue',
  height = 'md',
}: LoadingLineProps) {
  const [progress, setProgress] = useState(0)

  const heightClasses = {
    sm: 'h-1',
    md: 'h-1.5',
    lg: 'h-2',
  }

  const colorClasses = {
    blue: 'bg-emerald-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    orange: 'bg-orange-600',
  }

  // Simulate progress for progress variant
  useEffect(() => {
    if (variant === 'progress') {
      const timer = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress === 100) {
            return 0
          }
          const diff = Math.random() * 10
          return Math.min(oldProgress + diff, 100)
        })
      }, 200)

      return () => {
        clearInterval(timer)
      }
    }
  }, [variant])

  return (
    <div className="fixed top-0 left-0 w-full z-50">
      <div
        className={`${heightClasses[height]} bg-gray-200 relative overflow-hidden`}
      >
        {variant === 'pulse' && (
          <div
            className={`h-full ${colorClasses[color]} animate-pulse`}
            style={{ width: '100%' }}
          />
        )}

        {variant === 'progress' && (
          <div
            className={`h-full ${colorClasses[color]} transition-all duration-300 ease-out`}
            style={{ width: `${progress}%` }}
          />
        )}

        {variant === 'indeterminate' && (
          <div
            className={`h-full ${colorClasses[color]} animate-indeterminate`}
          />
        )}

        {variant === 'wave' && (
          <div
            className={`h-full ${colorClasses[color]} relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent animate-wave opacity-30" />
          </div>
        )}
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes indeterminate {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes wave {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-indeterminate {
          animation: indeterminate 1.5s ease-in-out infinite;
          width: 50%;
        }
        .animate-wave {
          animation: wave 2s ease-in-out infinite;
          width: 50%;
        }
      `}</style>
    </div>
  )
}
