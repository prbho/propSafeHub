// components/agents/PropertyPostForm.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  PROPERTY_AMENITIES,
  PROPERTY_FEATURES,
  PROPERTY_TYPES,
  PropertyFormData,
  TITLE_DOCUMENTS,
} from '@/types'
import {
  Bath,
  Bed,
  Building2,
  Calendar,
  CheckCircle2,
  DollarSign,
  Globe,
  Home,
  Key,
  Loader2,
  Map,
  MapPin,
  Moon,
  Navigation,
  Shield,
  Square,
  Tag,
  Upload,
  Wifi,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Location } from '@/lib/locations/locationService'
import { clientPropertyService } from '@/lib/properties/clientPropertyService'

import ImageUpload from '../ui/ImageUpload'
import { SafeRichTextEditor } from '../ui/SafeRichTextEditor'
import LocationSearch from './LocationSearch'

interface PropertyPostFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function PropertyPostForm({
  onSuccess,
  onCancel,
}: PropertyPostFormProps) {
  // Get params inside component
  const params = useParams()
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  )
  const userType = params.userType as string
  // const userId = params.id as string

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [agentProfileId, setAgentProfileId] = useState<string>('')
  const [fetchingAgentProfile, setFetchingAgentProfile] = useState(false)
  const [tagsInput, setTagsInput] = useState<string>('')

  const [formData, setFormData] = useState<PropertyFormData>({
    // Basic Information
    title: '',
    description: '',
    propertyType: 'house',
    status: 'for-sale',
    price: 0,
    priceUnit: 'total',

    // Location
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Nigeria',
    neighborhood: '',

    // Property Details
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 0,
    lotSize: undefined,
    yearBuilt: new Date().getFullYear(),

    // Features & Amenities
    features: [],
    amenities: [],

    // titles
    titles: [],

    // Media
    images: [],
    videos: [],

    // Listing Details
    listedBy: 'agent',
    isFeatured: false,
    tags: [],

    // Payment Options
    paymentOutright: true,
    paymentPlan: false,
    mortgageEligible: false,
    customPlanAvailable: false,
    customPlanDepositPercent: 30,
    customPlanMonths: 12,

    // Short-Let Specific Fields (initialize with defaults)
    minimumStay: 1,
    maximumStay: 30,
    instantBooking: false,
    checkInTime: '14:00',
    checkOutTime: '11:00',
    cancellationPolicy: 'moderate',
    houseRules: [],
    availabilityStart: '',
    availabilityEnd: '',
  })

  // House rules for short-let
  const houseRulesList = [
    'No smoking',
    'No parties or events',
    'No pets',
    'No loud noise after 10 PM',
    'No extra guests without approval',
    'Shoes off inside',
    'Keep the property clean',
    'Report any damages immediately',
    'Check-in after 2 PM',
    'Check-out before 11 AM',
  ]

  // Additional short-let features
  const shortLetFeaturesList = [
    'Free WiFi',
    'Coffee Maker',
    'Smart TV',
    'Netflix',
    'Kitchenette',
    'Washing Machine',
    'Dryer',
    'Iron',
    'Hair Dryer',
    'Hot Water',
    'BBQ Grill',
    'Fireplace',
    'Jacuzzi',
    'Beach Access',
    'Mountain View',
    'City View',
    'Private Entrance',
    'Self Check-in',
    '24/7 Support',
    'Breakfast Included',
  ]

  // Fetch agent profile when user is loaded
  useEffect(() => {
    const fetchAgentProfile = async () => {
      if (user && user.userType === 'agent') {
        setFetchingAgentProfile(true)
        try {
          console.log('🔍 Fetching agent profile for user:', user.$id)

          // Try to get agent profile by user ID
          const response = await fetch(
            `/api/agents/get-by-user?userId=${user.$id}`
          )

          if (response.ok) {
            const agentProfile = await response.json()
            console.log('✅ Agent profile found:', {
              agentId: agentProfile.$id,
              userId: user.$id,
              name: agentProfile.name,
            })
            setAgentProfileId(agentProfile.$id)
          } else {
            console.warn('⚠️ No agent profile found by userId, trying email...')

            // Try by email as fallback
            const emailResponse = await fetch(
              `/api/agents/get-by-user?email=${encodeURIComponent(user.email)}`
            )
            if (emailResponse.ok) {
              const agentProfile = await emailResponse.json()
              console.log('✅ Agent profile found by email:', agentProfile.$id)
              setAgentProfileId(agentProfile.$id)

              // Update agent profile with userId for future reference
              try {
                await fetch('/api/agents/update-user-id', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    agentId: agentProfile.$id,
                    userId: user.$id,
                  }),
                })
                console.log('✅ Linked user ID to agent profile')
              } catch {
                console.log('⚠️ Could not update agent profile with userId')
              }
            } else {
              console.error('❌ No agent profile found for user:', user.$id)
              toast.error('Agent profile not found. Please contact support.')
            }
          }
        } catch (error) {
          console.error('❌ Error fetching agent profile:', error)
          toast.error('Failed to load agent profile. Please refresh the page.')
        } finally {
          setFetchingAgentProfile(false)
          setPageLoading(false) // ⭐ ADD THIS LINE
        }
      }
    }

    if (!authLoading) {
      if (!user) {
        router.push('/login?redirect=/agent/properties/new')
      } else if (user.userType !== 'agent' && user.userType !== 'seller') {
        // Allow both agents and sellers
        router.push('/dashboard')
      } else {
        // For sellers, set default listedBy to 'owner'
        if (user.userType === 'seller') {
          setFormData((prev) => ({
            ...prev,
            listedBy: 'owner',
          }))
          setPageLoading(false) // ⭐ SET LOADING TO FALSE IMMEDIATELY FOR SELLERS
        }

        // Only fetch agent profile for agents
        if (user.userType === 'agent') {
          fetchAgentProfile()
        }
      }
    }
  }, [user, authLoading, router])

  // Clean up function to revoke object URLs
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [imagePreviews])

  // Update price unit based on status
  useEffect(() => {
    if (formData.status === 'short-let') {
      setFormData((prev) => ({
        ...prev,
        priceUnit: 'daily',
      }))
    } else if (formData.status === 'for-rent') {
      setFormData((prev) => ({
        ...prev,
        priceUnit: 'monthly',
      }))
    } else if (formData.status === 'for-sale') {
      setFormData((prev) => ({
        ...prev,
        priceUnit: 'total',
      }))
    }
  }, [formData.status])

  const handleLocationSelect = useCallback((location: Location) => {
    setSelectedLocation(location)
    setFormData((prev) => ({
      ...prev,
      city: location.name,
      state: location.state,
      neighborhood: location.lga || location.name,
      latitude: location.latitude ? Number(location.latitude) : undefined,
      longitude: location.longitude ? Number(location.longitude) : undefined,
    }))
  }, [])

  const handleInputChange = (field: keyof PropertyFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleTagsInputChange = (value: string) => {
    setTagsInput(value) // Store raw input
    // Only update formData.tags when we're done typing
    const tagsArray = value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
    setFormData((prev) => ({ ...prev, tags: tagsArray }))
  }

  // Initialize tagsInput when formData loads
  useEffect(() => {
    if (formData.tags.length > 0) {
      setTagsInput(formData.tags.join(', '))
    }
  }, [])

  const handleArrayToggle = (
    field: 'features' | 'titles' | 'amenities' | 'tags' | 'houseRules',
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field]?.includes(value)
        ? prev[field]?.filter((item) => item !== value)
        : [...(prev[field] || []), value],
    }))
  }

  const handleImageChange = async (files: File[]) => {
    setUploadedFiles(files)

    // Clean up old URLs
    imagePreviews.forEach((url) => URL.revokeObjectURL(url))

    // Convert files to base64 data URLs
    const previewPromises = files.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          resolve(reader.result as string)
        }
        reader.readAsDataURL(file)
      })
    })

    const previewUrls = await Promise.all(previewPromises)
    setImagePreviews(previewUrls)
  }

  const uploadImagesToStorage = async (files: File[]): Promise<string[]> => {
    const uploadedImageUrls: string[] = []

    for (const file of files) {
      try {
        const formData = new FormData()
        formData.append('image', file)

        const response = await fetch('/api/properties/upload-image', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(
            errorData.error || `Failed to upload image: ${response.statusText}`
          )
        }

        const result = await response.json()
        uploadedImageUrls.push(result.fileUrl || result.fileId)
      } catch (error) {
        console.error('Error uploading image:', error)
        throw new Error(`Failed to upload image: ${file.name}`)
      }
    }

    return uploadedImageUrls
  }

  const getPriceLabel = () => {
    switch (formData.status) {
      case 'for-sale':
        return 'Total Price'
      case 'for-rent':
        return 'Monthly Rent'
      case 'short-let':
        return 'Daily Rate'
      default:
        return 'Price'
    }
  }

  const getPriceUnitOptions = () => {
    switch (formData.status) {
      case 'for-sale':
        return ['total']
      case 'for-rent':
        return ['monthly', 'yearly']
      case 'short-let':
        return ['daily', 'weekly', 'monthly']
      default:
        return ['monthly']
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate agent profile is loaded only for agents
    if (user?.userType === 'agent' && !agentProfileId) {
      toast.error(
        'Agent profile not loaded. Please refresh the page and try again.'
      )
      return
    }

    if (uploadedFiles.length === 0) {
      toast.error('Please upload at least one property image')
      return
    }

    if (!selectedLocation) {
      toast.error('Please select a valid location')
      return
    }

    setIsSubmitting(true)

    try {
      const imageUrls = await uploadImagesToStorage(uploadedFiles)

      // Prepare property data based on user type
      const propertyData = {
        ...formData,
        // Add user-specific data
        userId: user?.$id,
        userType: user?.userType,
        // For agents, use agentProfileId; for sellers, use seller ID
        ...(user?.userType === 'agent' && {
          agentId: agentProfileId,
          agentName: user?.name,
        }),
        ...(user?.userType === 'seller' && {
          sellerId: user?.$id,
          sellerName: user?.name,
        }),
        listedBy: formData.listedBy,
        phone: user?.phone || '',
        images: imageUrls,
        propertyId: `property_${Date.now()}`,
      }

      console.log('📤 Creating property with:', {
        status: formData.status,
        userType: user?.userType,
        agentId: user?.userType === 'agent' ? agentProfileId : 'seller',
        priceUnit: formData.priceUnit,
      })

      const result = await clientPropertyService.createProperty(propertyData)
      toast.success('Property created successfully!')
      onSuccess?.()
      router.push(`/dashboard/${userType}/${user?.$id || ''}?success=true`)
    } catch (error: any) {
      console.error('❌ Error creating property:', error)
      toast.error(error.message || 'Failed to create property listing')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (
    authLoading ||
    pageLoading ||
    (user?.userType === 'agent' && fetchingAgentProfile)
  ) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
        <h2 className="text-xl font-semibold text-gray-900">
          {user?.userType === 'agent' && fetchingAgentProfile
            ? 'Loading agent profile...'
            : 'Loading...'}
        </h2>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Show agent profile warning only for agents */}
      {user?.userType === 'agent' && !agentProfileId && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-yellow-800">
            ⚠️ Agent profile not found. Properties cannot be created without an
            agent profile. Please contact support or try refreshing the page.
          </p>
        </div>
      )}

      {/* Show seller confirmation message */}
      {user?.userType === 'seller' && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 mb-4">
          <p className="text-emerald-800">
            Seller/owner. You&apos;ll be listed as the property owner.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* IMAGES FIRST - Better UX */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Property Images *
            </CardTitle>
            <CardDescription>
              Upload high-quality photos to showcase your property (First
              impression matters!)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageUpload
              onImagesChange={handleImageChange}
              maxImages={10}
              accept="image/*"
            />
            <p className="text-sm text-gray-500">
              Upload at least one image. Maximum 10 images allowed. Recommended:
              5+ images for best results.
            </p>

            {imagePreviews.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Image Previews ({imagePreviews.length} images)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagePreviews.map((previewUrl, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg border border-gray-200 overflow-hidden"
                    >
                      <Image
                        src={previewUrl}
                        alt={`Property image ${index + 1}`}
                        className="w-full h-full object-cover"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Basic Information - UPDATED WITH SHORT-LET */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Provide essential details about your property
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Property Title *</Label>
                <Input
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder={
                    formData.status === 'short-let'
                      ? 'Cozy 2-Bedroom Vacation Home with WiFi & Pool'
                      : formData.status === 'for-rent'
                        ? 'Modern 3-Bedroom Apartment in Lekki'
                        : 'Beautiful 4-Bedroom House for Sale'
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyType">Property Type *</Label>
                <Select
                  required
                  value={formData.propertyType}
                  onValueChange={(value) =>
                    handleInputChange('propertyType', value)
                  }
                >
                  <SelectTrigger id="propertyType">
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* UPDATED STATUS FIELD */}
              <div className="space-y-2">
                <Label htmlFor="status">Listing Type *</Label>
                <Select
                  required
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select listing type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="for-sale">
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        For Sale
                      </div>
                    </SelectItem>
                    <SelectItem value="for-rent">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4" />
                        For Rent
                      </div>
                    </SelectItem>
                    <SelectItem value="short-let">
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4" />
                        Short-Let
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="listedBy">Listed By *</Label>
                <Select
                  required
                  value={formData.listedBy}
                  onValueChange={(value) =>
                    handleInputChange('listedBy', value)
                  }
                  disabled={user?.userType === 'seller'}
                >
                  <SelectTrigger id="listedBy">
                    <SelectValue placeholder="Select who listed it" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                  </SelectContent>
                </Select>
                {user?.userType === 'seller' && (
                  <p className="text-sm text-gray-500 mt-1">
                    As a seller, you&apos;re listed as the property owner
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <SafeRichTextEditor
                value={formData.description}
                onChange={(value) => handleInputChange('description', value)}
                placeholder={
                  formData.status === 'short-let'
                    ? 'Describe your short-let property, nearby attractions, unique features...'
                    : 'Describe the property features, neighborhood, and unique selling points...'
                }
              />
              <p className="text-sm text-gray-500">
                Write an engaging description. Formatting will be preserved when
                displayed.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* SHORT-LET SPECIFIC SECTION */}
        {formData.status === 'short-let' && (
          <>
            {/* Stay Duration & Availability */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Stay Duration & Availability
                </CardTitle>
                <CardDescription>
                  Configure booking options for your short-let property
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minimumStay">Minimum Stay (nights) *</Label>
                    <Input
                      id="minimumStay"
                      type="number"
                      placeholder="1"
                      value={formData.minimumStay || 1}
                      onChange={(e) =>
                        handleInputChange(
                          'minimumStay',
                          parseInt(e.target.value) || 1
                        )
                      }
                      min="1"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maximumStay">Maximum Stay (nights)</Label>
                    <Input
                      id="maximumStay"
                      type="number"
                      placeholder="30"
                      value={formData.maximumStay || 30}
                      onChange={(e) =>
                        handleInputChange(
                          'maximumStay',
                          parseInt(e.target.value) || 30
                        )
                      }
                      min="1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="checkInTime">Check-in Time *</Label>
                    <Select
                      value={formData.checkInTime || '14:00'}
                      onValueChange={(value) =>
                        handleInputChange('checkInTime', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12:00">12:00 PM</SelectItem>
                        <SelectItem value="13:00">1:00 PM</SelectItem>
                        <SelectItem value="14:00">2:00 PM</SelectItem>
                        <SelectItem value="15:00">3:00 PM</SelectItem>
                        <SelectItem value="16:00">4:00 PM</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="checkOutTime">Check-out Time *</Label>
                    <Select
                      value={formData.checkOutTime || '11:00'}
                      onValueChange={(value) =>
                        handleInputChange('checkOutTime', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10:00">10:00 AM</SelectItem>
                        <SelectItem value="11:00">11:00 AM</SelectItem>
                        <SelectItem value="12:00">12:00 PM</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="availabilityStart">Available From</Label>
                    <Input
                      id="availabilityStart"
                      type="date"
                      value={formData.availabilityStart || ''}
                      onChange={(e) =>
                        handleInputChange('availabilityStart', e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="availabilityEnd">Available Until</Label>
                    <Input
                      id="availabilityEnd"
                      type="date"
                      value={formData.availabilityEnd || ''}
                      onChange={(e) =>
                        handleInputChange('availabilityEnd', e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="instantBooking"
                    checked={formData.instantBooking || false}
                    onCheckedChange={(checked) =>
                      handleInputChange('instantBooking', checked)
                    }
                  />
                  <Label htmlFor="instantBooking" className="cursor-pointer">
                    Enable Instant Booking (Guests can book immediately without
                    approval)
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Cancellation Policy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Cancellation Policy
                </CardTitle>
                <CardDescription>
                  Choose how flexible you want to be with cancellations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={formData.cancellationPolicy || 'moderate'}
                  onValueChange={(value) =>
                    handleInputChange('cancellationPolicy', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select cancellation policy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flexible">
                      <div className="flex flex-col">
                        <span className="font-medium">Flexible</span>
                        <span className="text-sm text-gray-500">
                          Full refund up to 24 hours before check-in
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="moderate">
                      <div className="flex flex-col">
                        <span className="font-medium">Moderate</span>
                        <span className="text-sm text-gray-500">
                          Full refund up to 5 days before check-in
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="strict">
                      <div className="flex flex-col">
                        <span className="font-medium">Strict</span>
                        <span className="text-sm text-gray-500">
                          50% refund up to 7 days before check-in
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Short-Let Specific Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="h-5 w-5" />
                  Short-Let Features & Amenities
                </CardTitle>
                <CardDescription>
                  Select amenities that are important for short-term stays
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {shortLetFeaturesList.map((feature) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <Checkbox
                        id={`shortlet-feature-${feature}`}
                        checked={formData.features.includes(feature)}
                        onCheckedChange={() =>
                          handleArrayToggle('features', feature)
                        }
                      />
                      <Label
                        htmlFor={`shortlet-feature-${feature}`}
                        className="text-sm cursor-pointer"
                      >
                        {feature}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* House Rules */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  House Rules
                </CardTitle>
                <CardDescription>
                  Set clear rules for your guests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {houseRulesList.map((rule) => (
                    <div key={rule} className="flex items-center space-x-2">
                      <Checkbox
                        id={`rule-${rule}`}
                        checked={formData.houseRules?.includes(rule)}
                        onCheckedChange={() =>
                          handleArrayToggle('houseRules', rule)
                        }
                      />
                      <Label
                        htmlFor={`rule-${rule}`}
                        className="text-sm cursor-pointer"
                      >
                        {rule}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location
            </CardTitle>
            <CardDescription>
              Help {formData.status === 'short-let' ? 'guests' : 'buyers'} find
              your property
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Search Location *</Label>
              <LocationSearch
                onLocationSelect={handleLocationSelect}
                placeholder="Type area, city, or state..."
                showMapFeatures={true}
                selectedLocation={selectedLocation}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Full Address *</Label>
                <Input
                  id="address"
                  required
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder={
                    formData.status === 'short-let'
                      ? 'Exact address for GPS navigation'
                      : 'Street address, building number, etc.'
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  placeholder="e.g., 100001"
                />
              </div>
            </div>

            {selectedLocation && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-green-900">
                      Location Confirmed
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center p-3 bg-white rounded-lg border border-green-100">
                      <Building2 className="w-4 h-4 text-green-600 mx-auto mb-1" />
                      <p className="text-gray-600">City</p>
                      <p className="font-semibold">{formData.city}</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-green-100">
                      <Map className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                      <p className="text-gray-600">State</p>
                      <p className="font-semibold">{formData.state}</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-green-100">
                      <Globe className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                      <p className="text-gray-600">Country</p>
                      <p className="font-semibold">{formData.country}</p>
                    </div>
                    {formData.neighborhood && (
                      <div className="text-center p-3 bg-white rounded-lg border border-green-100">
                        <Navigation className="w-4 h-4 text-orange-600 mx-auto mb-1" />
                        <p className="text-gray-600">Area</p>
                        <p className="font-semibold">{formData.neighborhood}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Pricing - UPDATED FOR SHORT-LET */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Pricing
            </CardTitle>
            <CardDescription>
              Set competitive pricing for your property
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">{getPriceLabel()} *</Label>
                <Input
                  id="price"
                  type="number"
                  required
                  min="0"
                  value={formData.price || ''}
                  onChange={(e) =>
                    handleInputChange(
                      'price',
                      e.target.value === '' ? 0 : parseFloat(e.target.value)
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priceUnit">Price Unit *</Label>
                <Select
                  required
                  value={formData.priceUnit}
                  onValueChange={(value) =>
                    handleInputChange('priceUnit', value)
                  }
                >
                  <SelectTrigger id="priceUnit">
                    <SelectValue placeholder="Select price unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {getPriceUnitOptions().map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit.charAt(0).toUpperCase() + unit.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Card className="w-full bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-blue-900">
                      {formData.status === 'for-sale' && (
                        <>Total Price: ₦{formData.price.toLocaleString()}</>
                      )}
                      {formData.status === 'for-rent' && (
                        <>
                          {formData.priceUnit === 'monthly' && 'Monthly: '}
                          {formData.priceUnit === 'yearly' && 'Yearly: '}₦
                          {formData.price.toLocaleString()}
                          {formData.priceUnit === 'monthly' && '/mo'}
                          {formData.priceUnit === 'yearly' && '/yr'}
                        </>
                      )}
                      {formData.status === 'short-let' && (
                        <>
                          {formData.priceUnit === 'daily' && 'Daily: '}
                          {formData.priceUnit === 'weekly' && 'Weekly: '}
                          {formData.priceUnit === 'monthly' && 'Monthly: '}₦
                          {formData.price.toLocaleString()}
                          {formData.priceUnit === 'daily' && '/night'}
                          {formData.priceUnit === 'weekly' && '/week'}
                          {formData.priceUnit === 'monthly' && '/month'}
                        </>
                      )}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="originalPrice">Original Price (Optional)</Label>
              <Input
                id="originalPrice"
                type="number"
                min="0"
                value={formData.originalPrice || ''}
                onChange={(e) =>
                  handleInputChange(
                    'originalPrice',
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )
                }
                placeholder="Original price if discounted"
              />
            </div>
          </CardContent>
        </Card>

        {/* Property Details */}
        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
            <CardDescription>
              Specify the physical characteristics of your property
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedrooms" className="flex items-center gap-2">
                  <Bed className="w-4 h-4" />
                  Bedrooms *
                </Label>
                <Input
                  id="bedrooms"
                  type="number"
                  required
                  min="0"
                  max="20"
                  value={formData.bedrooms}
                  onChange={(e) =>
                    handleInputChange('bedrooms', parseInt(e.target.value) || 0)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bathrooms" className="flex items-center gap-2">
                  <Bath className="w-4 h-4" />
                  Bathrooms *
                </Label>
                <Input
                  id="bathrooms"
                  type="number"
                  required
                  min="0"
                  max="20"
                  value={formData.bathrooms}
                  onChange={(e) =>
                    handleInputChange(
                      'bathrooms',
                      parseInt(e.target.value) || 0
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="squareFeet" className="flex items-center gap-2">
                  <Square className="w-4 h-4" />
                  Square Meter *
                </Label>
                <Input
                  id="squareFeet"
                  type="number"
                  required
                  min="0"
                  value={formData.squareFeet}
                  onChange={(e) =>
                    handleInputChange(
                      'squareFeet',
                      parseInt(e.target.value) || 0
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearBuilt" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Year Built
                </Label>
                <Input
                  id="yearBuilt"
                  type="number"
                  min="1800"
                  max={new Date().getFullYear()}
                  value={formData.yearBuilt || ''}
                  onChange={(e) =>
                    handleInputChange(
                      'yearBuilt',
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lotSize">Lot Size (m²)</Label>
              <Input
                id="lotSize"
                type="number"
                min="0"
                value={formData.lotSize || ''}
                onChange={(e) =>
                  handleInputChange(
                    'lotSize',
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
                placeholder="Land area for houses/land"
              />
            </div>
          </CardContent>
        </Card>

        {/* Features & Amenities */}
        <Card>
          <CardHeader>
            <CardTitle>Features & Amenities</CardTitle>
            <CardDescription>
              Select the features and amenities that make your property stand
              out
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Features */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Property Features
                </h3>
                <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                  {PROPERTY_FEATURES.map((feature) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <Checkbox
                        id={`feature-${feature}`}
                        checked={formData.features.includes(feature)}
                        onCheckedChange={() =>
                          handleArrayToggle('features', feature)
                        }
                      />
                      <Label
                        htmlFor={`feature-${feature}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {feature}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Community Amenities
                </h3>
                <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                  {PROPERTY_AMENITIES.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={`amenity-${amenity}`}
                        checked={formData.amenities.includes(amenity)}
                        onCheckedChange={() =>
                          handleArrayToggle('amenities', amenity)
                        }
                      />
                      <Label
                        htmlFor={`amenity-${amenity}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Title Documents - Only show for non-short-let properties */}
        {formData.status !== 'short-let' && (
          <Card>
            <CardHeader>
              <CardTitle>Title Documents</CardTitle>
              <CardDescription>
                Select the applicable Title Documents for the property
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
                {/* Features */}
                <div>
                  <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                    {TITLE_DOCUMENTS.map((title) => (
                      <div key={title} className="flex items-center space-x-2">
                        <Checkbox
                          id={`title-${title}`}
                          checked={formData.titles.includes(title)}
                          onCheckedChange={() =>
                            handleArrayToggle('titles', title)
                          }
                        />
                        <Label
                          htmlFor={`title-${title}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {title}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Options */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Options</CardTitle>
            <CardDescription>
              Configure available payment methods for{' '}
              {formData.status === 'short-let' ? 'guests' : 'buyers'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="paymentOutright"
                checked={formData.paymentOutright}
                onCheckedChange={(checked) =>
                  handleInputChange('paymentOutright', checked)
                }
              />
              <Label htmlFor="paymentOutright" className="cursor-pointer">
                {formData.status === 'short-let'
                  ? 'Full Payment Required'
                  : 'Outright Purchase Available'}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="paymentPlan"
                checked={formData.paymentPlan}
                onCheckedChange={(checked) =>
                  handleInputChange('paymentPlan', checked)
                }
              />
              <Label htmlFor="paymentPlan" className="cursor-pointer">
                {formData.status === 'short-let'
                  ? 'Deposit + Installment'
                  : 'Payment Plan Available'}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="mortgageEligible"
                checked={formData.mortgageEligible}
                onCheckedChange={(checked) =>
                  handleInputChange('mortgageEligible', checked)
                }
              />
              <Label htmlFor="mortgageEligible" className="cursor-pointer">
                Mortgage Eligible
              </Label>
            </div>

            {formData.paymentPlan && (
              <Card className="bg-gray-50">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="customPlanAvailable"
                      checked={formData.customPlanAvailable}
                      onCheckedChange={(checked) =>
                        handleInputChange('customPlanAvailable', checked)
                      }
                    />
                    <Label
                      htmlFor="customPlanAvailable"
                      className="cursor-pointer"
                    >
                      Custom Payment Plan
                    </Label>
                  </div>

                  {formData.customPlanAvailable && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="customPlanDepositPercent">
                          Deposit Percentage
                        </Label>
                        <Input
                          id="customPlanDepositPercent"
                          type="number"
                          min="0"
                          max="100"
                          value={formData.customPlanDepositPercent}
                          onChange={(e) =>
                            handleInputChange(
                              'customPlanDepositPercent',
                              parseInt(e.target.value) || 0
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customPlanMonths">Payment Months</Label>
                        <Input
                          id="customPlanMonths"
                          type="number"
                          min="1"
                          max="60"
                          value={formData.customPlanMonths}
                          onChange={(e) =>
                            handleInputChange(
                              'customPlanMonths',
                              parseInt(e.target.value) || 0
                            )
                          }
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Additional Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Additional Options
            </CardTitle>
            <CardDescription>
              Enhance your listing with additional features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isFeatured"
                checked={formData.isFeatured}
                onCheckedChange={(checked) =>
                  handleInputChange('isFeatured', checked)
                }
              />
              <Label htmlFor="isFeatured" className="cursor-pointer">
                Feature this property (additional cost may apply)
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={tagsInput} // Use the raw input state
                onChange={(e) => handleTagsInputChange(e.target.value)}
                placeholder="e.g., luxury, waterfront, new, renovated"
              />
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  (user?.userType === 'agent' && !agentProfileId)
                }
                className="flex-1 bg-linear-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                size="lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Publishing...
                  </div>
                ) : user?.userType === 'agent' && !agentProfileId ? (
                  'Agent Profile Required'
                ) : formData.status === 'short-let' ? (
                  'Publish Short-Let'
                ) : (
                  'Publish Property'
                )}
              </Button>

              {onCancel && (
                <Button
                  type="button"
                  onClick={onCancel}
                  variant="outline"
                  size="lg"
                >
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
