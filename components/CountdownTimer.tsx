'use client'

import { useEffect, useState } from 'react'

interface CountdownTimerProps {
  targetDate: string // ISO string or Date string
  className?: string
  showLabels?: boolean
  onExpire?: () => void
}

export default function CountdownTimer({
  targetDate,
  className = '',
  showLabels = true,
  onExpire,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate))

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

  useEffect(() => {
    if (timeLeft.expired) {
      onExpire?.()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate))
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate, timeLeft.expired, onExpire])

  if (timeLeft.expired) {
    return (
      <div className={`text-red-600 font-semibold ${className}`}>
        ⏰ Plan Expired
      </div>
    )
  }

  // If more than 1 day, show days + hours
  if (timeLeft.days > 0) {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <TimeUnit value={timeLeft.days} label="days" showLabels={showLabels} />
        <TimeUnit
          value={timeLeft.hours}
          label="hours"
          showLabels={showLabels}
        />
        {showLabels && (
          <TimeUnit
            value={timeLeft.minutes}
            label="minutes"
            showLabels={showLabels}
          />
        )}
      </div>
    )
  }

  // If less than 1 day, show hours + minutes + seconds
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <TimeUnit value={timeLeft.hours} label="hours" showLabels={showLabels} />
      <TimeUnit
        value={timeLeft.minutes}
        label="minutes"
        showLabels={showLabels}
      />
      <TimeUnit
        value={timeLeft.seconds}
        label="seconds"
        showLabels={showLabels}
      />
    </div>
  )
}

// Individual time unit component
function TimeUnit({
  value,
  label,
  showLabels,
}: {
  value: number
  label: string
  showLabels: boolean
}) {
  return (
    <div className="text-center">
      <div className="bg-white  rounded-lg  min-w-14">
        <span className="text-lg font-bold text-gray-900 tabular-nums">
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      {showLabels && (
        <div className="text-xs text-gray-500 mt-1 uppercase tracking-wide">
          {label}
        </div>
      )}
    </div>
  )
}
