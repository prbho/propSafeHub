'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useLoading } from '@/contexts/LoadingContext'

export function usePageLoad() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { setLoading, setLoadingMessage } = useLoading()

  useEffect(() => {
    // Set loading when route changes
    setLoading(true)
    setLoadingMessage('Loading page...')

    // Simulate minimum loading time for better UX (you can adjust this)
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [pathname, searchParams, setLoading, setLoadingMessage])
}
