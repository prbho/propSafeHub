// components/properties/ScheduleViewingModal.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Property } from '@/types'
import { Calendar, MapPin, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { ScrollArea } from '../ui/scroll-area'

interface ScheduleViewingModalProps {
  property: Property
  isOpen: boolean
  onClose: () => void
  onSchedule: (data: ScheduleData) => void
}

export interface ScheduleData {
  date: string
  time: string
  name: string
  email: string
  phone: string
  message: string
  preferredContact: 'email' | 'phone'
}

const availableTimeSlots = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '01:00 PM',
  '01:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
  '05:30 PM',
]

export default function ScheduleViewingModal({
  property,
  isOpen,
  onClose,
  onSchedule,
}: ScheduleViewingModalProps) {
  const [formData, setFormData] = useState<ScheduleData>({
    date: '',
    time: '',
    name: '',
    email: '',
    phone: '',
    message: '',
    preferredContact: 'email',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onSchedule(formData)
      // Reset form on success
      setFormData({
        date: '',
        time: '',
        name: '',
        email: '',
        phone: '',
        message: '',
        preferredContact: 'email',
      })
    } catch (error) {
      console.error('Error scheduling viewing:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: keyof ScheduleData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Get tomorrow's date for min date
  const getTomorrow = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  // Get date 30 days from now for max date
  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 30)
    return maxDate.toISOString().split('T')[0]
  }

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-emerald-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              Schedule Viewing
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Arrange a visit to {property.title}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Property Info */}
        <ScrollArea className="h-140">
          <div className="p-6 bg-emerald-50">
            <div className="flex items-start gap-3">
              {property.images && property.images.length > 0 && (
                <Image
                  src={property.images[0]}
                  alt={property.title}
                  className="w-16 h-16 rounded-lg object-cover"
                  width={64}
                  height={64}
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">
                  {property.title}
                </h3>
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {property.address}, {property.city}, {property.state}
                </p>
                <p className="text-sm font-semibold text-black mt-1">
                  ₦{property.price.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Date *
                </label>
                <Input
                  type="date"
                  required
                  min={getTomorrow()}
                  max={getMaxDate()}
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Time *
                </label>
                <Select
                  value={formData.time}
                  onValueChange={(value) => handleChange('time', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                Your Information
              </h3>

              <Input
                placeholder="Full Name *"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />

              <Input
                type="email"
                placeholder="Email Address *"
                required
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />

              <Input
                type="tel"
                placeholder="Phone Number *"
                required
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Contact Method
                </label>
                <Select
                  value={formData.preferredContact}
                  onValueChange={(value: 'email' | 'phone') =>
                    handleChange('preferredContact', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Additional Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Message (Optional)
              </label>
              <Textarea
                placeholder="Any specific requirements or questions about the property..."
                value={formData.message}
                onChange={(e) => handleChange('message', e.target.value)}
                rows={3}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Scheduling...' : 'Schedule Viewing'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              The agent will contact you to confirm the viewing appointment.
            </p>
          </form>
        </ScrollArea>
      </div>
    </div>
  )
}
