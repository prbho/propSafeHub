/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useEffect, useState } from 'react'

interface EnhancedCountdownProps {
  targetDate: string
  startDate?: string // Optional: for progress calculation
  className?: string
  showProgress?: boolean
  compact?: boolean
}

export default function EnhancedCountdown({
  targetDate,
  startDate,
  className = '',
  showProgress = true,
  compact = false,
}: EnhancedCountdownProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate))
  const [progress, setProgress] = useState(0)

  function calculateTimeLeft(target: string) {
    const difference = new Date(target).getTime() - new Date().getTime()

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      expired: false,
    }
  }

  // Calculate progress percentage if startDate is provided
  useEffect(() => {
    if (startDate) {
      const totalDuration =
        new Date(targetDate).getTime() - new Date(startDate).getTime()
      const elapsed = new Date().getTime() - new Date(startDate).getTime()
      const percentage = Math.min(
        100,
        Math.max(0, (elapsed / totalDuration) * 100)
      )

      // Use setTimeout to avoid synchronous state update
      const timer = setTimeout(() => {
        setProgress(percentage)
      }, 0)

      return () => clearTimeout(timer)
    }
  }, [startDate, targetDate])

  useEffect(() => {
    if (timeLeft.expired) return

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate))
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate, timeLeft.expired])

  if (timeLeft.expired) {
    return (
      <div
        className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-800 font-semibold">Plan Expired</span>
          </div>
          <button className="text-red-600 hover:text-red-800 text-sm font-medium">
            Renew Now
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`bg-linear-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 ${className}`}
    >
      {/* Progress Bar */}
      {showProgress && startDate && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Plan Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-linear-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Countdown */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-1">
            Time Remaining
          </h4>
          {compact ? (
            <CompactTimer timeLeft={timeLeft} />
          ) : (
            <DetailedTimer timeLeft={timeLeft} />
          )}
        </div>

        {/* Quick Action */}
        <button className="bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          Extend Plan
        </button>
      </div>
    </div>
  )
}

// Compact timer for small spaces
function CompactTimer({ timeLeft }: { timeLeft: any }) {
  if (timeLeft.days > 0) {
    return (
      <div className="flex items-center gap-1 text-lg font-bold text-gray-900">
        <span>{timeLeft.days}d</span>
        <span>:</span>
        <span>{timeLeft.hours.toString().padStart(2, '0')}h</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 text-lg font-bold text-gray-900">
      <span>{timeLeft.hours.toString().padStart(2, '0')}</span>
      <span>:</span>
      <span>{timeLeft.minutes.toString().padStart(2, '0')}</span>
      <span>:</span>
      <span>{timeLeft.seconds.toString().padStart(2, '0')}</span>
    </div>
  )
}

// Detailed timer with labels
function DetailedTimer({ timeLeft }: { timeLeft: any }) {
  if (timeLeft.days > 0) {
    return (
      <div className="flex gap-4">
        <TimeBox value={timeLeft.days} label="Days" />
        <TimeBox value={timeLeft.hours} label="Hours" />
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <TimeBox value={timeLeft.hours} label="Hours" />
      <TimeBox value={timeLeft.minutes} label="Minutes" />
      <TimeBox value={timeLeft.seconds} label="Seconds" />
    </div>
  )
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="bg-white border border-gray-300 rounded-lg px-2 py-1 min-w-[50px]">
        <span className="text-base font-bold text-gray-900 tabular-nums">
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  )
}
