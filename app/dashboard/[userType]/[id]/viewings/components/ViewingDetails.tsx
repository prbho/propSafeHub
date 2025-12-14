// app/agent/dashboard/viewings/components/ViewingDetails.tsx
'use client'

import { ScheduleViewing } from '@/types'
import { Check, X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { formatDate, formatTime } from './utils/viewingHelpers'

interface ViewingDetailsProps {
  selectedViewing: ScheduleViewing | null
  onStatusUpdate: (id: string, status: 'confirmed' | 'cancelled') => void
  viewingsCount: number
  onSelectFirst: () => void
}

export default function ViewingDetails({
  selectedViewing,
  onStatusUpdate,
  viewingsCount,
  onSelectFirst,
}: ViewingDetailsProps) {
  if (!selectedViewing) {
    return (
      <div className="lg:col-span-2">
        <Card>
          <CardContent className="p-6 text-center">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-400 mx-auto mb-4"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900">
              Select a Viewing Request
            </h3>
            <p className="text-gray-600 mt-2">
              Choose a viewing request from the list to see details and manage
              it.
            </p>
            {viewingsCount > 0 && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={onSelectFirst}
              >
                Select First Viewing
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="lg:col-span-2 sticky h-[80vh] top-6 w-full">
      <Card>
        <CardHeader className="border-b py-0!">
          <div className="flex items-center">
            <CardTitle>Viewing Details</CardTitle>
            <CardDescription className="ml-auto">
              Requested on {formatDate(selectedViewing.scheduledAt)}
              {selectedViewing.confirmedAt && (
                <span>
                  • Confirmed on {formatDate(selectedViewing.confirmedAt)}
                </span>
              )}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Property Info */}
          <div>
            <h3 className="font-semibold text-base mb-2">Property</h3>
            <p className="text-gray-900">{selectedViewing.propertyTitle}</p>
          </div>

          {/* Customer Info */}
          <div>
            <h3 className="font-semibold text-base mb-2">
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <p className="font-medium text-sm">Name</p>
                <p className="text-gray-600">{selectedViewing.customerName}</p>
              </div>
              <div>
                <p className="font-medium text-sm">Email</p>
                <p className="text-gray-600">{selectedViewing.customerEmail}</p>
              </div>
              <div>
                <p className="font-medium text-sm">Phone</p>
                <p className="text-gray-600">{selectedViewing.customerPhone}</p>
              </div>
              <div>
                <p className="font-medium text-sm">Preferred Contact</p>
                <p className="text-gray-600 capitalize">
                  {selectedViewing.preferredContact}
                </p>
              </div>
            </div>
          </div>

          {/* Viewing Details */}
          <div>
            <h3 className="font-semibold text-base mb-2">
              Viewing Appointment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <div>
                <p className="font-medium text-sm">Date</p>
                <p className="text-gray-600">
                  {formatDate(selectedViewing.date)}
                </p>
              </div>
              <div>
                <p className="font-medium text-sm">Time</p>
                <p className="text-gray-600">
                  {formatTime(selectedViewing.time)}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Message */}
          {selectedViewing.customerMessage && (
            <div>
              <h3 className="font-semibold text-base mb-2">Customer Message</h3>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                {selectedViewing.customerMessage}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {selectedViewing.status === 'pending' && (
              <>
                <ButtonGroup className="border border-emerald-100 rounded-lg">
                  <Button
                    onClick={() =>
                      onStatusUpdate(selectedViewing.$id, 'confirmed')
                    }
                    className="bg-emerald-600 hover:bg-green-700 cursor-pointer"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Confirm Viewing
                  </Button>
                  <Button
                    className="cursor-pointer"
                    variant="outline"
                    onClick={() =>
                      onStatusUpdate(selectedViewing.$id, 'cancelled')
                    }
                  >
                    <X className="w-4 h-4 mr-2" />
                    Decline
                  </Button>
                </ButtonGroup>
              </>
            )}
            {selectedViewing.status === 'confirmed' && (
              <div className="flex items-center gap-2">
                <Badge variant="default" className="px-3 py-1">
                  <Check className="w-4 h-4 mr-1" />
                  Confirmed
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onStatusUpdate(selectedViewing.$id, 'cancelled')
                  }
                >
                  Cancel Viewing
                </Button>
              </div>
            )}
            {selectedViewing.status === 'cancelled' && (
              <Badge variant="destructive" className="px-3 py-1">
                <X className="w-4 h-4 mr-1" />
                Cancelled
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
