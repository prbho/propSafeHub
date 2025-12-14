// app/become-agent
'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  BadgeCheck,
  Camera,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
  UserCircle,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { usePageLoad } from '@/hooks/usePageLoad'

export default function BecomeAgentPage() {
  usePageLoad()

  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>(user?.avatar || '')
  const [showAvatarError, setShowAvatarError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    licenseNumber: '',
    agency: '',
    specialties: [] as string[],
    yearsExperience: '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    officePhone: '',
    mobilePhone: '',
    website: '',
    avatar: '',
    languages: ['English'],
    city: '',
    specialty: '',
    verificationDocuments: [] as string[],
  })

  const specialties = [
    'Residential',
    'Commercial',
    'Luxury Homes',
    'Rentals',
    'Investment Properties',
    'Land',
    'New Construction',
    'Industrial',
    'Agricultural',
  ]

  const cities = [
    'Lagos',
    'Abuja',
    'Port Harcourt',
    'Kano',
    'Ibadan',
    'Benin City',
    'Enugu',
    'Kaduna',
    'Warri',
    'Abeokuta',
  ]

  useEffect(() => {
    // Check if user is loaded and handle redirects
    if (user) {
      if (user.userType === 'agent') {
        router.push('/profile?message=already_agent')
        return
      }
      // Set avatar preview from existing user avatar
      if (user.avatar) {
        setAvatarPreview(user.avatar)
      }
      setIsLoading(false)
    }
  }, [user, router])

  const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    setAvatarFile(file)
    setShowAvatarError(false)

    // Create preview
    const imageUrl = URL.createObjectURL(file)
    setAvatarPreview(imageUrl)
  }

  const removeAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...prev.specialties, specialty],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate avatar
    if (!avatarPreview) {
      setShowAvatarError(true)
      toast.error('Professional photo is required to become an agent')
      return
    }

    if (!user) return

    setIsSubmitting(true)
    try {
      const formDataToSend = new FormData()

      // Append all form data
      formDataToSend.append('userId', user.$id)
      formDataToSend.append('name', user.name)
      formDataToSend.append('email', user.email)
      formDataToSend.append('licenseNumber', formData.licenseNumber)
      formDataToSend.append('agency', formData.agency)
      formDataToSend.append('specialties', JSON.stringify(formData.specialties))
      formDataToSend.append('yearsExperience', formData.yearsExperience)
      formDataToSend.append('bio', formData.bio)
      formDataToSend.append('phone', formData.phone)
      formDataToSend.append('officePhone', formData.officePhone)
      formDataToSend.append('mobilePhone', formData.mobilePhone)
      formDataToSend.append('website', formData.website)
      formDataToSend.append('languages', JSON.stringify(formData.languages))
      formDataToSend.append('city', formData.city)
      formDataToSend.append('specialty', formData.specialties[0] || '')

      // Append avatar file if new one was selected
      if (avatarFile) {
        formDataToSend.append('avatar', avatarFile)
      } else if (user.avatar) {
        // Send existing avatar URL
        formDataToSend.append('existingAvatar', user.avatar)
      }

      const response = await fetch('/api/agents/become-agent', {
        method: 'POST',
        body: formDataToSend, // Use FormData instead of JSON
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upgrade to agent')
      }

      // Refresh user data to get new userType
      await refreshUser()

      // Redirect to profile with success message
      router.push('/profile?upgrade=success')
    } catch {
      toast.error('Failed to upgrade to agent. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // User not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Sign In Required
          </h2>
          <p className="text-gray-600 mb-4">
            Please sign in to become an agent
          </p>
          <button
            onClick={() => router.push('/login')}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Become a Real Estate Agent
          </h1>
          <p className="text-gray-600">
            Upgrade your account to start listing properties and growing your
            business
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          {/* Header */}
          <div className="bg-linear-to-r from-slate-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-900 text-lg">
              Your Profile Information
            </h3>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Avatar Section */}
              {user.phone && (
                <div className="shrink-0">
                  <div className="relative">
                    <Avatar className="w-24 h-24 border-4 border-gray-100 shadow-md">
                      <AvatarImage src={user.avatar} alt={user.name} />
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white"></div>
                  </div>
                </div>
              )}

              {/* Info Section */}
              <div className="flex-1 space-y-4">
                <div className="flex items-start gap-3 group">
                  <div className=" bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                    <UserCircle className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-semibold">{user.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 group">
                  <div className=" bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                    <Mail className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-semibold break-all">
                      {user.email}
                    </p>
                  </div>
                </div>

                {user.phone && (
                  <div className="flex items-start gap-3 group">
                    <div className=" bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                      <Phone className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-semibold">
                        {user.phone}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-3">Agent Benefits</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-center gap-2">
              <BadgeCheck className="w-4 h-4" />
              List unlimited properties
            </li>
            <li className="flex items-center gap-2">
              <BadgeCheck className="w-4 h-4" />
              Get featured in agent directory
            </li>
            <li className="flex items-center gap-2">
              <BadgeCheck className="w-4 h-4" />
              Receive direct inquiries from buyers
            </li>
            <li className="flex items-center gap-2">
              <BadgeCheck className="w-4 h-4" />
              Access advanced analytics
            </li>
          </ul>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Professional Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Professional Photo *
                {showAvatarError && (
                  <span className="text-red-600 ml-2">
                    (Required for agent profile)
                  </span>
                )}
              </label>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-gray-200 overflow-hidden border-2 border-gray-300">
                    {avatarPreview ? (
                      <Image
                        src={avatarPreview}
                        alt="Profile preview"
                        width={96}
                        height={96}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={removeAvatar}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    {avatarPreview ? 'Change Photo' : 'Upload Photo'}
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    A professional headshot helps build trust with clients. Max
                    file size: 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* License Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Real Estate License Number *
              </label>
              <input
                type="text"
                required
                value={formData.licenseNumber}
                onChange={(e) =>
                  setFormData({ ...formData, licenseNumber: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your license number"
              />
            </div>

            {/* Agency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agency/Brokerage *
              </label>
              <input
                type="text"
                required
                value={formData.agency}
                onChange={(e) =>
                  setFormData({ ...formData, agency: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your agency name"
              />
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years of Experience *
              </label>
              <select
                required
                value={formData.yearsExperience}
                onChange={(e) =>
                  setFormData({ ...formData, yearsExperience: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select years</option>
                <option value="1">1 year</option>
                <option value="2">2 years</option>
                <option value="3">3 years</option>
                <option value="4">4 years</option>
                <option value="5">5 years</option>
                <option value="6">6-10 years</option>
                <option value="11">11-15 years</option>
                <option value="16">16+ years</option>
              </select>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Primary City *
              </label>
              <select
                required
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select your city</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Specialties */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialties *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {specialties.map((specialty) => (
                  <button
                    key={specialty}
                    type="button"
                    onClick={() => handleSpecialtyToggle(specialty)}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      formData.specialties.includes(specialty)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {specialty}
                  </button>
                ))}
              </div>
              {formData.specialties.length === 0 && (
                <p className="text-sm text-red-600 mt-1">
                  Please select at least one specialty
                </p>
              )}
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Office Phone
                </label>
                <input
                  type="tel"
                  value={formData.officePhone}
                  onChange={(e) =>
                    setFormData({ ...formData, officePhone: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Office phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Mobile Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.mobilePhone}
                  onChange={(e) =>
                    setFormData({ ...formData, mobilePhone: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Mobile phone number"
                />
              </div>
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="w-4 h-4 inline mr-1" />
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://yourwebsite.com"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Professional Bio *
              </label>
              <textarea
                required
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tell clients about your experience, expertise, and approach to real estate..."
                maxLength={1000}
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.bio.length}/1000 characters
              </p>
            </div>

            {/* Terms */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  required
                  className="mt-1 rounded border-gray-300 text-emerald-600 focus:ring-blue-500"
                />
                <div className="text-sm text-gray-600">
                  <p>
                    I confirm that I hold a valid real estate license and agree
                    to abide by professional standards and terms of service. I
                    understand that misrepresentation may result in account
                    suspension and legal action.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                isSubmitting ||
                formData.specialties.length === 0 ||
                !avatarPreview
              }
              className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Upgrading to Agent...
                </>
              ) : (
                <>
                  <BadgeCheck className="w-5 h-5" />
                  Become an Agent
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
