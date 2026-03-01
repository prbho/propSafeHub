'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const Chatbot = dynamic(() => import('@/components/chatbot/Chatbot'), {
  ssr: false,
})

export default function LazyChatbot() {
  const [shouldMount, setShouldMount] = useState(false)

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    let idleId: number | null = null

    const mount = () => setShouldMount(true)
    const win = window as Window & {
      requestIdleCallback?: (
        callback: () => void,
        options?: { timeout: number }
      ) => number
      cancelIdleCallback?: (id: number) => void
    }

    if (typeof win.requestIdleCallback === 'function') {
      idleId = win.requestIdleCallback(mount, { timeout: 4000 })
    } else {
      timeoutId = setTimeout(mount, 2000)
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      if (idleId !== null && typeof win.cancelIdleCallback === 'function') {
        win.cancelIdleCallback(idleId)
      }
    }
  }, [])

  if (!shouldMount) return null

  return <Chatbot />
}

