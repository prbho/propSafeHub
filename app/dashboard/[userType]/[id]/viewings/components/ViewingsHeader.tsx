// app/agent/dashboard/viewings/components/ViewingsSidebar.tsx
'use client'

import { ScheduleViewing } from '@/types'

interface ViewingsSidebarProps {
  viewings: ScheduleViewing[]
}

export default function ViewingsHeader({ viewings }: ViewingsSidebarProps) {
  if (viewings.length === 0) {
    return (
      <div className="lg:col-span-1 space-y-4">
        <h2 className="text-lg font-semibold">All Requests (0)</h2>
      </div>
    )
  }

  return (
    <div className="lg:col-span-1 space-y-4">
      <h2 className="text-lg font-semibold">
        All Requests ({viewings.length})
      </h2>
    </div>
  )
}
