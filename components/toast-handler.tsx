'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner' // or 'react-hot-toast' depending on what you use

export function ToastHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const toastType = searchParams.get('toastType')
    const toastMessage = searchParams.get('toastMessage')

    if (toastType && toastMessage) {
      // Show toast based on type
      switch (toastType) {
        case 'success':
          toast.success(toastMessage)
          break
        case 'error':
          toast.error(toastMessage)
          break
        case 'info':
          toast.info(toastMessage)
          break
        case 'warning':
          toast.warning(toastMessage)
          break
        default:
          toast(toastMessage)
      }

      // Clear the query parameters to prevent showing toast again on refresh
      const newUrl = window.location.pathname
      router.replace(newUrl, { scroll: false })
    }
  }, [searchParams, router])

  return null // This component doesn't render anything
}
