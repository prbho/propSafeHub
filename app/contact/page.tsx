'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm, ValidationError } from '@formspree/react'
import {
  Calendar,
  CheckCircle,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Phone,
  Send,
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

export default function ContactPage() {
  const [localFormData, setLocalFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    service: '',
    preferredContact: 'email',
    urgency: 'normal',
  })

  // Formspree integration
  const [state, handleSubmit] = useForm('mzznvwvy', {
    data: {
      _subject: `PropSafe Hub Contact: ${localFormData.subject}`,
      service: localFormData.service,
      preferredContact: localFormData.preferredContact,
      urgency: localFormData.urgency,
    },
  })

  // Handle form submission with local state reset
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Convert form data to FormData for Formspree
    const formData = new FormData(e.currentTarget as HTMLFormElement)

    // Add custom fields
    formData.append('service', localFormData.service)
    formData.append('preferredContact', localFormData.preferredContact)
    formData.append('urgency', localFormData.urgency)
    formData.append(
      '_subject',
      `PropSafe Hub Contact: ${localFormData.subject}`
    )

    // Submit to Formspree
    await handleSubmit(formData)

    // Reset local state only if submission was successful
    if (state.succeeded) {
      setLocalFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        service: '',
        preferredContact: 'email',
        urgency: 'normal',
      })
    }
  }

  const handleChange = (field: string, value: string) => {
    setLocalFormData((prev) => ({ ...prev, [field]: value }))
  }

  const contactInfo = {
    office: '50, Emerald Avenue, Monastery Road, Sangotedo, Ajah, Lagos',
    phone: '+234 902 355 8992',
    whatsapp: '+234 902 355 8992',
    email: 'propsafehub@gmail.com',
    hours:
      'Monday - Friday: 8:00 AM - 6:00 PM\nSaturday: 10:00 AM - 4:00 PM\nSunday: Closed',
  }

  // Form submission state
  const isSubmitting = state.submitting
  const isSubmitted = state.succeeded

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50">
      {/* Hero */}
      <section className="bg-linear-to-r from-emerald-600 to-emerald-700 text-white py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              Contact PropSafe Hub
            </h1>
            <p className="text-xl text-emerald-100 mb-8">
              Multiple ways to connect with our real estate experts
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-emerald-700 hover:bg-gray-100"
              >
                <Link href="#contact-form">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Send Message
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white bg-transparent text-white hover:bg-white/10"
              >
                <Link href="/schedule-meeting">
                  <Calendar className="mr-2 h-5 w-5" />
                  Schedule Meeting
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-7xl py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content - Contact Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact Form */}
            <div
              id="contact-form"
              className="bg-white rounded-2xl p-8 border shadow-lg"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Send Us a Message
                </h2>
                <p className="text-gray-600">
                  Fill out the form below and our team will get back to you
                  promptly.
                </p>
              </div>

              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="inline-flex p-4 bg-emerald-100 text-emerald-600 rounded-full mb-4">
                    <CheckCircle className="h-12 w-12" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Thank you for contacting PropSafe Hub. Our team will respond
                    to you within the timeframe specified for your inquiry type.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button asChild variant="outline">
                      <Link href="/">Back to Home</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/services">Explore Services</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <Input
                        required
                        id="name"
                        name="name"
                        value={localFormData.name}
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
                        value={localFormData.email}
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
                        value={localFormData.phone}
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
                        Service Interested In
                      </label>
                      <Select
                        value={localFormData.service}
                        onValueChange={(value) =>
                          handleChange('service', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="verification">
                            Property Verification
                          </SelectItem>
                          <SelectItem value="advisory">
                            Investment Advisory
                          </SelectItem>
                          <SelectItem value="diaspora">
                            Diaspora Services
                          </SelectItem>
                          <SelectItem value="mortgage">
                            Mortgage Financing
                          </SelectItem>
                          <SelectItem value="construction">
                            Construction & Development
                          </SelectItem>
                          <SelectItem value="marketing">
                            Real Estate Marketing
                          </SelectItem>
                          <SelectItem value="general">
                            General Inquiry
                          </SelectItem>
                          <SelectItem value="partnership">
                            Partnership Opportunity
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <Input
                      required
                      id="subject"
                      name="subject"
                      value={localFormData.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                      placeholder="Brief description of your inquiry"
                    />
                    <ValidationError
                      prefix="Subject"
                      field="subject"
                      errors={state.errors}
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <Textarea
                      required
                      id="message"
                      name="message"
                      rows={6}
                      value={localFormData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      placeholder="Please provide details about your inquiry..."
                      className="resize-none"
                    />
                    <ValidationError
                      prefix="Message"
                      field="message"
                      errors={state.errors}
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Contact Method
                      </label>
                      <Select
                        value={localFormData.preferredContact}
                        onValueChange={(value) =>
                          handleChange('preferredContact', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone Call</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="video">Video Call</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Urgency Level
                      </label>
                      <Select
                        value={localFormData.urgency}
                        onValueChange={(value) =>
                          handleChange('urgency', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select urgency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">
                            Normal (24-48 hours)
                          </SelectItem>
                          <SelectItem value="urgent">
                            Urgent (2-12 hours)
                          </SelectItem>
                          <SelectItem value="emergency">
                            Emergency (Immediate)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Consent Checkbox */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="consent"
                      name="consent"
                      required
                      className="h-4 w-4 text-emerald-600 rounded"
                    />
                    <label
                      htmlFor="consent"
                      className="ml-2 text-sm text-gray-600"
                    >
                      I agree to receive communication from PropSafe Hub
                      regarding my inquiry. Your information is secure and will
                      not be shared.
                    </label>
                  </div>

                  {/* Error Display */}
                  {state.errors && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 text-sm">
                        There was an error submitting the form. Please check
                        your entries and try again.
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gray-800 hover:bg-gray-900 py-6"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Right Column - Contact Info & Quick Actions */}
          <div className="space-y-8">
            {/* Contact Information */}
            <div className="bg-white rounded-2xl p-8 border shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Contact Information
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-x-4">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-900">Phone</h4>
                    <a
                      href="tel:+2349023558992"
                      className="text-gray-600 text-sm hover:text-emerald-600"
                    >
                      {contactInfo.phone}
                    </a>
                    <p className="text-xs text-gray-500 mt-1">
                      Available during business hours
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-900">
                      WhatsApp
                    </h4>
                    <a
                      href={`https://wa.me/2349023558992`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 text-sm hover:text-emerald-600"
                    >
                      {contactInfo.whatsapp}
                    </a>
                    <p className="text-xs mt-1 text-emerald-500">
                      Fast responses for quick questions
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-900">Email</h4>
                    <a
                      href="mailto:propsafehub@gmail.com"
                      className="text-gray-600 text-sm hover:text-emerald-600"
                    >
                      {contactInfo.email}
                    </a>
                    <p className="text-xs text-gray-500 mt-1">
                      We respond within 24 hours
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-x-4">
                  <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-900">
                      Office Address
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {contactInfo.office}
                    </p>
                    <a
                      href="https://maps.google.com/?q=50+Emerald+Avenue+Sangotedo+Ajah+Lagos"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 mt-1 inline-block"
                    >
                      Get Directions →
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Business Hours
                    </h4>
                    <pre className="text-gray-600 text-sm whitespace-pre-line">
                      {contactInfo.hours}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-red-50 border-l-4 border border-red-400 p-6 rounded-xl">
              <div className="flex items-start gap-3">
                <Phone className="h-6 w-6 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900">
                    Emergency Contact
                  </h4>
                  <p className="text-sm text-red-700 mt-1">
                    For urgent property verification or legal matters
                  </p>
                  <a
                    href="tel:+2349023558992"
                    className="text-lg font-bold text-red-900 hover:text-red-700 block mt-2"
                  >
                    {contactInfo.phone}
                  </a>
                  <p className="text-xs text-red-600 mt-1">
                    Available 24/7 for emergencies
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
