// app/agent/dashboard/viewings/components/ViewingsUI.tsx
'use client'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function LoadingState() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Checking access...</p>
      </div>
    </div>
  )
}

interface AccessDeniedProps {
  message: string
  showHomeButton?: boolean
}

export function AccessDenied({
  message,
  showHomeButton = false,
}: AccessDeniedProps) {
  const router = useRouter()

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
        <p className="text-gray-600 mt-2">{message}</p>
        {showHomeButton && (
          <Button onClick={() => router.push('/')} className="mt-4">
            Go to Homepage
          </Button>
        )}
      </div>
    </div>
  )
}

export function ViewingsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Skeleton className="h-6 w-32" />
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-60" />
            </CardHeader>
            <CardContent className="space-y-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
              <div className="flex gap-3 pt-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-24" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
