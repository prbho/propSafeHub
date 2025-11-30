// app/agent/dashboard/viewings/components/ViewingsSidebar.tsx
'use client'

import { ScheduleViewing } from '@/types'
import { Calendar, Clock } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

import {
  formatDate,
  formatTime,
  getStatusBadgeVariant,
} from './utils/viewingHelpers'

interface ViewingsSidebarProps {
  viewings: ScheduleViewing[]
  selectedViewing: ScheduleViewing | null
  onSelectViewing: (viewing: ScheduleViewing) => void
}

export default function ViewingsSidebar({
  viewings,
  selectedViewing,
  onSelectViewing,
}: ViewingsSidebarProps) {
  if (viewings.length === 0) {
    return (
      <div className="lg:col-span-1 space-y-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">
              No Viewing Requests
            </h3>
            <p className="text-gray-600 mt-2">
              You don&apos;t have any viewing requests yet.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="lg:col-span-1 space-y-4">
      {viewings.map((viewing) => (
        <Card
          key={viewing.$id}
          className={`cursor-pointer transition-all ${
            selectedViewing?.$id === viewing.$id
              ? 'ring-2 ring-blue-500 border-blue-500'
              : 'hover:shadow-md border-gray-200'
          }`}
          onClick={() => onSelectViewing(viewing)}
        >
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-gray-900 line-clamp-1">
                  {viewing.customerName}
                </h3>
                <Badge variant={getStatusBadgeVariant(viewing.status)}>
                  {viewing.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 line-clamp-1">
                {viewing.propertyTitle}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(viewing.date)}</span>
                <span>•</span>
                <Clock className="w-4 h-4" />
                <span>{formatTime(viewing.time)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
