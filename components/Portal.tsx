// components/Portal.tsx
'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface PortalProps {
  children: React.ReactNode
}

export default function Portal({ children }: PortalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true)
    })

    return () => {
      cancelAnimationFrame(frame)
      setMounted(false)
    }
  }, [])

  if (!mounted) return null

  return createPortal(children, document.body)
}
