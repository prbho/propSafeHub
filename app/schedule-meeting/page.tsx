'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm, ValidationError } from '@formspree/react'
import {
  Building,
  Calendar,
  CheckCircle,
  Globe,
  PhoneCall,
  Send,
  Shield,
  Users,
  Video,
} from 'lucide-react'

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

export default function ScheduleMeetingPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    meetingType: 'property-consultation',
    preferredDate: '',
    preferredTime: '',
    timezone: 'WAT',
    notes: '',
    contactMethod: 'whatsapp',
  })

  // Formspree integration
  const [state, handleSubmit] = useForm('xyzrpvdb', {
    data: {
      _subject: `PropSafe Hub Meeting Request: ${formData.meetingType} - ${formData.name}`,
      meetingType: formData.meetingType,
      contactMethod: formData.contactMethod,
      timezone: formData.timezone,
    },
  })

  const meetingTypes = [
    {
      id: 'property-consultation',
      title: 'Property Consultation',
      description: 'Detailed property analysis and verification',
      duration: '30 minutes',
      icon: Building,
      color: 'bg-emerald-600',
    },
    {
      id: 'quick-call',
      title: '15-min Quick Call',
      description: 'Brief introduction and initial questions',
      duration: '15 minutes',
      icon: PhoneCall,
      color: 'bg-blue-600',
    },
    {
      id: 'investment-strategy',
      title: 'Investment Strategy',
      description: 'Comprehensive portfolio planning session',
      duration: '45 minutes',
      icon: Shield,
      color: 'bg-purple-600',
    },
    {
      id: 'video-consultation',
      title: 'Video Consultation',
      description: 'Virtual meeting with screen sharing',
      duration: '60 minutes',
      icon: Video,
      color: 'bg-amber-600',
    },
    {
      id: 'diaspora-consultation',
      title: 'Diaspora Consultation',
      description: 'Overseas investor support and guidance',
      duration: '45 minutes',
      icon: Globe,
      color: 'bg-indigo-600',
    },
    {
      id: 'developer-partnership',
      title: 'Developer Partnership',
      description: 'Discuss collaboration opportunities',
      duration: '60 minutes',
      icon: Users,
      color: 'bg-rose-600',
    },
  ]

  const timeSlots = [
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '01:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
  ]

  const timezones = [
    { value: 'WAT', label: 'West Africa Time (WAT)' },
    { value: 'GMT', label: 'Greenwich Mean Time (GMT)' },
    { value: 'EST', label: 'Eastern Standard Time (EST)' },
    { value: 'CET', label: 'Central European Time (CET)' },
    { value: 'PST', label: 'Pacific Standard Time (PST)' },
    { value: 'IST', label: 'Indian Standard Time (IST)' },
  ]

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const selectedMeeting = meetingTypes.find(
    (m) => m.id === formData.meetingType
  )

  // Formspree states
  const isSubmitting = state.submitting
  const isSubmitted = state.succeeded

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50">
      {/* Hero */}
      <section className="bg-linear-to-r from-emerald-600 to-emerald-700 text-white py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex p-4 bg-white/10 rounded-2xl mb-6">
              <Calendar className="h-12 w-12" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              Schedule a Meeting
            </h1>
            <p className="text-xl text-emerald-100 mb-8">
              Request a consultation with our real estate experts
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="bg-white/10 px-4 py-2 rounded-lg">
                <span className="font-semibold">24-48 hour response time</span>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-lg">
                <span className="font-semibold">Flexible scheduling</span>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-lg">
                <span className="font-semibold">No cost consultation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-4xl py-16">
        <div className="bg-white rounded-2xl border shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Request a Meeting
            </h2>
            <p className="text-gray-600">
              Fill out this form and our team will contact you to confirm the
              schedule
            </p>
          </div>

          {isSubmitted ? (
            <div className="text-center py-12">
              <div className="inline-flex p-4 bg-emerald-100 text-emerald-600 rounded-full mb-6">
                <CheckCircle className="h-16 w-16" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Meeting Request Sent!
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Thank you for scheduling a meeting. Our team will contact you
                within 24-48 hours to confirm the details.
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild variant="outline">
                  <Link href="/">Back to Home</Link>
                </Button>
                <Button asChild>
                  <Link href="/contact">Contact Support</Link>
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Your Information
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <Input
                      required
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="John Doe"
                    />
                    <ValidationError
                      prefix="Name"
                      field="name"
                      errors={state.errors}
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      required
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="john@example.com"
                    />
                    <ValidationError
                      prefix="Email"
                      field="email"
                      errors={state.errors}
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <Input
                      type="tel"
                      required
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="+234 800 000 0000"
                    />
                    <ValidationError
                      prefix="Phone"
                      field="phone"
                      errors={state.errors}
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Contact Method *
                    </label>
                    <Select
                      value={formData.contactMethod}
                      onValueChange={(value) =>
                        handleChange('contactMethod', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="phone">Phone Call</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="video">Video Call</SelectItem>
                      </SelectContent>
                    </Select>
                    <input
                      type="hidden"
                      name="contactMethod"
                      value={formData.contactMethod}
                    />
                  </div>
                </div>
              </div>

              {/* Meeting Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Meeting Details
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meeting Type *
                    </label>
                    <Select
                      value={formData.meetingType}
                      onValueChange={(value) =>
                        handleChange('meetingType', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select meeting type" />
                      </SelectTrigger>
                      <SelectContent>
                        {meetingTypes.map((meeting) => (
                          <SelectItem key={meeting.id} value={meeting.id}>
                            <div className="flex items-center gap-2">
                              <meeting.icon className="h-4 w-4" />
                              {meeting.title} ({meeting.duration})
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input
                      type="hidden"
                      name="meetingType"
                      value={formData.meetingType}
                    />
                    {selectedMeeting && (
                      <p className="text-sm text-gray-500 mt-2">
                        {selectedMeeting.description}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Time Zone *
                    </label>
                    <Select
                      value={formData.timezone}
                      onValueChange={(value) => handleChange('timezone', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time zone" />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input
                      type="hidden"
                      name="timezone"
                      value={formData.timezone}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Date *
                    </label>
                    <Input
                      type="date"
                      required
                      id="preferredDate"
                      name="preferredDate"
                      value={formData.preferredDate}
                      onChange={(e) =>
                        handleChange('preferredDate', e.target.value)
                      }
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <ValidationError
                      prefix="Preferred Date"
                      field="preferredDate"
                      errors={state.errors}
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Time *
                    </label>
                    <Select
                      value={formData.preferredTime}
                      onValueChange={(value) =>
                        handleChange('preferredTime', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input
                      type="hidden"
                      name="preferredTime"
                      value={formData.preferredTime}
                    />
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes or Questions
                </label>
                <Textarea
                  rows={4}
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Tell us more about what you'd like to discuss..."
                  className="resize-none"
                />
                <ValidationError
                  prefix="Notes"
                  field="notes"
                  errors={state.errors}
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              {/* Hidden Formspree Fields */}
              <input
                type="hidden"
                name="_subject"
                value={`PropSafe Hub Meeting Request: ${formData.meetingType} - ${formData.name}`}
              />
              <input type="hidden" name="_format" value="plain" />
              <input
                type="hidden"
                name="_next"
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/schedule-meeting?success=true`}
              />

              {/* Consent Checkbox */}
              <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="consent"
                  name="consent"
                  required
                  className="h-4 w-4 text-emerald-600 rounded mt-1 mr-3"
                />
                <label htmlFor="consent" className="text-sm text-gray-600">
                  I agree to receive communication from PropSafe Hub regarding
                  my meeting request. By submitting this form, I consent to
                  being contacted via the method I selected above. I understand
                  that this is a request for a meeting and actual scheduling
                  will be confirmed by our team.
                </label>
              </div>

              {/* Error Display */}
              {state.errors && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">
                    There was an error submitting your meeting request. Please
                    check your entries and try again.
                  </p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 py-6 text-lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Submit Meeting Request
                  </>
                )}
              </Button>

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-500">
                  We&apos;ll contact you within 24-48 hours to confirm your
                  meeting time.
                </p>
                <p className="text-xs text-gray-400">
                  Need immediate assistance? Call us at{' '}
                  <a
                    href="tel:+2349023558992"
                    className="text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    +234 902 355 8992
                  </a>
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Meeting Types Information */}
        {/* <div className="mt-12">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Types of Meetings Available
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meetingTypes.map((meeting) => (
              <div
                key={meeting.id}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className={`${meeting.color} p-3 rounded-lg text-white`}>
                    <meeting.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {meeting.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {meeting.description}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {meeting.duration}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div> */}
      </div>
    </div>
  )
}
