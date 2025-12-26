/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  Property,
  PROPERTY_AMENITIES,
  PROPERTY_FEATURES,
  PROPERTY_TYPES,
} from '@/types'
import {
  AlertTriangle,
  Bath,
  Bed,
  Calendar,
  CheckCircle2,
  DollarSign,
  Home,
  Key,
  Loader2,
  MapPin,
  Moon,
  Settings,
  Shield,
  ShieldAlert,
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
import { databases } from '@/lib/appwrite'
import { Location } from '@/lib/locations/locationService'

import ImageUpload from '../ui/ImageUpload'
import { SafeRichTextEditor } from '../ui/SafeRichTextEditor'
import { Switch } from '../ui/switch'
import LocationSearch from './LocationSearch'

interface PropertyEditFormProps {
  property: Property
}

export default function PropertyEditForm({ property }: PropertyEditFormProps) {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  )
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<string[]>(
    property.images || []
  )
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(
    null
  )
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const [formData, setFormData] = useState({
    // Basic Information
    title: property.title || '',
    description: property.description || '',
    propertyType: property.propertyType || 'house',
    status: property.status || 'for-sale',
    price: property.price || 0,
    priceUnit: property.priceUnit || 'total',

    // Location
    address: property.address || '',
    city: property.city || '',
    state: property.state || '',
    zipCode: property.zipCode || '',
    country: property.country || 'Nigeria',
    neighborhood: property.neighborhood || '',

    // Property Details
    bedrooms: property.bedrooms || 1,
    bathrooms: property.bathrooms || 1,
    squareFeet: property.squareFeet || 0,
    lotSize: property.lotSize || undefined,
    yearBuilt: property.yearBuilt || new Date().getFullYear(),

    // Features & Amenities
    features: property.features || [],
    amenities: property.amenities || [],

    // titles
    titles: property.titles || [],

    // Media
    images: property.images || [],
    videos: property.videos || [],

    // Listing Details
    listedBy: property.listedBy || 'agent',
    isFeatured: property.isFeatured || false,
    tags: property.tags || [],

    // Payment Options
    originalPrice: property.originalPrice,
    paymentOutright: property.paymentOutright || true,
    paymentPlan: property.paymentPlan || false,
    mortgageEligible: property.mortgageEligible || false,
    customPlanAvailable: property.customPlanAvailable || false,
    customPlanDepositPercent: property.customPlanDepositPercent || 30,
    customPlanMonths: property.customPlanMonths || 12,

    // Short-Let Specific Fields (initialize with defaults)
    minimumStay: property.minimumStay || 1,
    maximumStay: property.maximumStay || 30,
    instantBooking: property.instantBooking || false,
    checkInTime: property.checkInTime || '14:00',
    checkOutTime: property.checkOutTime || '11:00',
    cancellationPolicy: property.cancellationPolicy || 'moderate',
    houseRules: property.houseRules || [],
    availabilityStart: property.availabilityStart || '',
    availabilityEnd: property.availabilityEnd || '',
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

  // Check authentication and ownership - UPDATED FIX
  useEffect(() => {
    if (!authLoading && user) {
      // Allow both agents and sellers
      if (user.userType !== 'agent' && user.userType !== 'seller') {
        router.push('/dashboard')
        return
      }

      // Fetch agent profile ID for agents
      const checkOwnership = async () => {
        let agentProfileIdForCheck = ''

        if (user.userType === 'agent') {
          try {
            const response = await fetch(
              `/api/agents/get-by-user?userId=${user.$id}`
            )
            if (response.ok) {
              const agentProfile = await response.json()
              agentProfileIdForCheck = agentProfile.$id
            }
          } catch (error) {
            console.error('Error fetching agent profile:', error)
          }
        }

        // Check ownership with correct IDs
        let canEdit = false

        // Always check userId first
        if (property.userId === user.$id) {
          canEdit = true
          console.log('✅ Can edit: userId matches')
        }

        // For agents: check if agentId matches agentProfileId
        if (
          user.userType === 'agent' &&
          property.agentId === agentProfileIdForCheck
        ) {
          canEdit = true
          console.log('✅ Can edit: agentId matches agentProfileId')
        }

        // For sellers: check if ownerId matches
        if (user.userType === 'seller' && property.ownerId === user.$id) {
          canEdit = true
          console.log('✅ Can edit: ownerId matches')
        }

        // Allow admins
        if (user.userType === 'admin') {
          canEdit = true
          console.log('✅ Can edit: user is admin')
        }

        if (!canEdit) {
          console.log('❌ Cannot edit:', {
            userType: user.userType,
            userId: user.$id,
            propertyUserId: property.userId,
            propertyAgentId: property.agentId,
            agentProfileId: agentProfileIdForCheck,
            propertyOwnerId: property.ownerId,
          })
          router.push('/dashboard')
          return
        }

        setIsLoading(false)

        // Set location
        if (property.city && property.state) {
          setSelectedLocation({
            name: property.city,
            state: property.state,
            lga: property.neighborhood,
            latitude: property.latitude,
            longitude: property.longitude,
          } as Location)
        }
      }

      checkOwnership()
    }
  }, [user, authLoading, router, property])

  // Clean up function to revoke object URLs
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [imagePreviews])

  // Handle unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue =
          'You have unsaved changes. Are you sure you want to leave?'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  const markChanges = () => {
    setHasUnsavedChanges(true)
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }
    const timer = setTimeout(() => {
      toast.info('Auto-saving in 30 seconds...')
    }, 30000)
    setAutoSaveTimer(timer)
  }

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
    markChanges()
  }, [])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    markChanges()
  }

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

  const handleImageChange = (files: File[]) => {
    setUploadedFiles(files)
    imagePreviews.forEach((url) => URL.revokeObjectURL(url))
    const previewUrls = files.map((file) => URL.createObjectURL(file))
    setImagePreviews(previewUrls)
    markChanges()
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedLocation) {
      toast.error('Please select a valid location')
      return
    }

    setIsSubmitting(true)

    try {
      let imageUrls = [...existingImages]

      // Upload new images if any
      if (uploadedFiles.length > 0) {
        const newImageUrls = await uploadImagesToStorage(uploadedFiles)
        imageUrls = [...imageUrls, ...newImageUrls]
      }

      // Update property data
      const updateData = {
        ...formData,
        images: imageUrls,
        lastUpdated: new Date().toISOString(),
      }

      const databaseId =
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'propertyDB'
      const propertiesCollectionId =
        process.env.NEXT_PUBLIC_APPWRITE_PROPERTIES_TABLE_ID || 'properties'

      await databases.updateDocument(
        databaseId,
        propertiesCollectionId,
        property.$id,
        updateData
      )

      setHasUnsavedChanges(false)
      setLastSaved(new Date())
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer)
        setAutoSaveTimer(null)
      }

      toast.success('Property updated successfully!')
      if (user) {
        router.push(`/dashboard/${user.userType}/${user.$id}/properties`)
      }
    } catch {
      toast.error('Failed to update property listing')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    try {
      const databaseId =
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'propertyDB'
      const propertiesCollectionId =
        process.env.NEXT_PUBLIC_APPWRITE_PROPERTIES_TABLE_ID || 'properties'

      await databases.deleteDocument(
        databaseId,
        propertiesCollectionId,
        property.$id
      )

      toast.success('Property deleted successfully!')
      if (user) {
        router.push(`/dashboard/${user.userType}/${user.$id}/properties`)
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error deleting property:', error)
      toast.error('Failed to delete property')
    }
  }

  const handleSaveDraft = async () => {
    if (!selectedLocation) {
      toast.error('Please select a valid location to save draft')
      return
    }

    setIsSubmitting(true)

    try {
      const databaseId =
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'propertyDB'
      const propertiesCollectionId =
        process.env.NEXT_PUBLIC_APPWRITE_PROPERTIES_TABLE_ID || 'properties'

      const draftData = {
        ...formData,
        isActive: false, // Mark as draft
        lastUpdated: new Date().toISOString(),
      }

      await databases.updateDocument(
        databaseId,
        propertiesCollectionId,
        property.$id,
        draftData
      )

      setHasUnsavedChanges(false)
      setLastSaved(new Date())
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer)
        setAutoSaveTimer(null)
      }

      toast.success('Draft saved successfully!')
    } catch (error) {
      console.error('Error saving draft:', error)
      toast.error('Failed to save draft')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePublish = async () => {
    if (!selectedLocation) {
      toast.error('Please select a valid location to publish')
      return
    }

    setIsSubmitting(true)

    try {
      const databaseId =
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'propertyDB'
      const propertiesCollectionId =
        process.env.NEXT_PUBLIC_APPWRITE_PROPERTIES_TABLE_ID || 'properties'

      const publishData = {
        ...formData,
        isActive: true, // Mark as published
        lastUpdated: new Date().toISOString(),
      }

      await databases.updateDocument(
        databaseId,
        propertiesCollectionId,
        property.$id,
        publishData
      )

      setHasUnsavedChanges(false)
      setLastSaved(new Date())
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer)
        setAutoSaveTimer(null)
      }

      toast.success('Property published successfully!')
      if (user) {
        router.push(`/dashboard/${user.userType}/${user.$id}/properties`)
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error publishing property:', error)
      toast.error('Failed to publish property')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRequiredFieldsStatus = () => {
    const requiredFields = [
      { label: 'Title', value: formData.title, ok: !!formData.title },
      {
        label: 'Description',
        value: formData.description,
        ok: !!formData.description,
      },
      { label: 'Price', value: formData.price, ok: formData.price > 0 },
      { label: 'Address', value: formData.address, ok: !!formData.address },
      { label: 'City', value: formData.city, ok: !!formData.city },
      { label: 'State', value: formData.state, ok: !!formData.state },
      {
        label: 'Bedrooms',
        value: formData.bedrooms,
        ok: formData.bedrooms > 0,
      },
      {
        label: 'Bathrooms',
        value: formData.bathrooms,
        ok: formData.bathrooms > 0,
      },
      {
        label: 'Square Meter',
        value: formData.squareFeet,
        ok: formData.squareFeet > 0,
      },
    ]

    const completed = requiredFields.filter((f) => f.ok).length
    const total = requiredFields.length

    return { completed, total, fields: requiredFields }
  }

  const getCompletionPercentage = () => {
    const status = getRequiredFieldsStatus()
    return Math.round((status.completed / status.total) * 100)
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
        <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
      </div>
    )
  }

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="sticky top-0 z-10">
        <div className="">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {property.title}{' '}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {hasUnsavedChanges && (
                <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm">
                  <AlertTriangle className="w-3 h-3" />
                  Unsaved changes
                </div>
              )}
              <div>
                <div className="text-sm text-gray-500 hidden md:block">
                  Created: {new Date(property.$createdAt).toLocaleDateString()}
                </div>
                {lastSaved && (
                  <div className="text-sm text-gray-500 hidden md:block">
                    Last saved:{' '}
                    {property.lastUpdated
                      ? new Date(property.lastUpdated).toLocaleDateString()
                      : 'Never'}{' '}
                    {lastSaved.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content - 3/4 width */}
          <div className="lg:col-span-3 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Home className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                    <CardDescription>
                      Essential details about your property
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="flex items-center gap-1">
                      Property Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      required
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange('title', e.target.value)
                      }
                      placeholder="Beautiful 3-Bedroom Apartment in Lekki"
                      className={
                        !formData.title
                          ? 'border-red-300 focus:border-red-500'
                          : ''
                      }
                    />
                    {!formData.title && (
                      <p className="text-xs text-red-500">
                        This field is required
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="propertyType"
                      className="flex items-center gap-1"
                    >
                      Property Type <span className="text-red-500">*</span>
                    </Label>
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

                  <div className="space-y-2">
                    <Label htmlFor="status">Listing Type *</Label>
                    <Select
                      required
                      value={formData.status}
                      onValueChange={(value) =>
                        handleInputChange('status', value)
                      }
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
                    onChange={(value) =>
                      handleInputChange('description', value)
                    }
                    placeholder={
                      formData.status === 'short-let'
                        ? 'Describe your short-let property, nearby attractions, unique features...'
                        : 'Describe the property features, neighborhood, and unique selling points...'
                    }
                  />
                  <p className="text-sm text-gray-500">
                    Write an engaging description. Formatting will be preserved
                    when displayed.
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
                        <Label htmlFor="minimumStay">
                          Minimum Stay (nights) *
                        </Label>
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
                        <Label htmlFor="maximumStay">
                          Maximum Stay (nights)
                        </Label>
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
                        <Label htmlFor="availabilityStart">
                          Available From
                        </Label>
                        <Input
                          id="availabilityStart"
                          type="date"
                          value={formData.availabilityStart || ''}
                          onChange={(e) =>
                            handleInputChange(
                              'availabilityStart',
                              e.target.value
                            )
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
                      <Label
                        htmlFor="instantBooking"
                        className="cursor-pointer"
                      >
                        Enable Instant Booking (Guests can book immediately
                        without approval)
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
                        <div
                          key={feature}
                          className="flex items-center space-x-2"
                        >
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
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Location</CardTitle>
                    <CardDescription>
                      Where is your property located?
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    Search Location <span className="text-red-500">*</span>
                  </Label>
                  <LocationSearch
                    onLocationSelect={handleLocationSelect}
                    placeholder="Type area, city, or state..."
                    showMapFeatures={true}
                    selectedLocation={selectedLocation}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="address"
                      className="flex items-center gap-1"
                    >
                      Full Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="address"
                      required
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange('address', e.target.value)
                      }
                      placeholder="Street address, building number, etc."
                      className={
                        !formData.address
                          ? 'border-red-300 focus:border-red-500'
                          : ''
                      }
                    />
                    {!formData.address && (
                      <p className="text-xs text-red-500">
                        This field is required
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) =>
                        handleInputChange('zipCode', e.target.value)
                      }
                      placeholder="e.g., 100001"
                    />
                  </div>
                </div>

                {selectedLocation && (
                  <Card className="bg-linear-to-r from-green-50 to-emerald-50 border-green-200">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-green-900">
                            Location Confirmed
                          </h4>
                          <p className="text-sm text-green-700">
                            All location details are set
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center p-3 bg-white rounded-lg border border-green-100 shadow-sm">
                          <p className="text-gray-600">City</p>
                          <p className="font-semibold text-green-900">
                            {formData.city}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg border border-green-100 shadow-sm">
                          <p className="text-gray-600">State</p>
                          <p className="font-semibold text-green-900">
                            {formData.state}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg border border-green-100 shadow-sm">
                          <p className="text-gray-600">Country</p>
                          <p className="font-semibold text-green-900">
                            {formData.country}
                          </p>
                        </div>
                        {formData.neighborhood && (
                          <div className="text-center p-3 bg-white rounded-lg border border-green-100 shadow-sm">
                            <p className="text-gray-600">Area</p>
                            <p className="font-semibold text-green-900">
                              {formData.neighborhood}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Pricing</CardTitle>
                    <CardDescription>Set your property price</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="flex items-center gap-1">
                      Price <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        ₦
                      </span>
                      <Input
                        id="price"
                        type="number"
                        required
                        min="0"
                        value={formData.price || ''}
                        onChange={(e) =>
                          handleInputChange(
                            'price',
                            e.target.value === ''
                              ? 0
                              : parseFloat(e.target.value)
                          )
                        }
                        className={`pl-8 ${formData.price <= 0 ? 'border-red-300 focus:border-red-500' : ''}`}
                      />
                    </div>
                    {formData.price <= 0 && (
                      <p className="text-xs text-red-500">
                        Price must be greater than 0
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priceUnit">
                      {formData.status === 'for-rent'
                        ? 'Price Unit'
                        : 'Price Type'}
                    </Label>
                    <Select
                      value={formData.priceUnit}
                      onValueChange={(value) =>
                        handleInputChange('priceUnit', value)
                      }
                    >
                      <SelectTrigger id="priceUnit">
                        <SelectValue
                          placeholder={
                            formData.status === 'for-rent'
                              ? 'Select price unit'
                              : 'Total Price'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.status === 'for-rent' ? (
                          <>
                            <SelectItem value="monthly">
                              Monthly Rent
                            </SelectItem>
                            <SelectItem value="yearly">Yearly Rent</SelectItem>
                          </>
                        ) : (
                          <SelectItem value="total">Total Price</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Card className="w-full bg-linear-to-r from-purple-50 to-indigo-50 border-purple-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="p-1 bg-white rounded">
                            <DollarSign className="w-3 h-3 text-purple-600" />
                          </div>
                          <p className="text-sm font-medium text-purple-900">
                            {formData.status === 'for-rent' ? (
                              <>
                                {formData.priceUnit === 'monthly' &&
                                  'Monthly: '}
                                {formData.priceUnit === 'yearly' && 'Yearly: '}₦
                                {formData.price.toLocaleString()}
                                {formData.priceUnit === 'monthly' && '/mo'}
                                {formData.priceUnit === 'yearly' && '/yr'}
                              </>
                            ) : (
                              <>
                                Total Price: ₦{formData.price.toLocaleString()}
                              </>
                            )}
                          </p>
                        </div>
                        {formData.originalPrice &&
                          formData.originalPrice > formData.price && (
                            <p className="text-xs text-gray-500 line-through">
                              Was: ₦{formData.originalPrice.toLocaleString()}
                            </p>
                          )}
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="originalPrice">
                    Original Price (Optional)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      ₦
                    </span>
                    <Input
                      id="originalPrice"
                      type="number"
                      min="0"
                      value={formData.originalPrice || ''}
                      onChange={(e) =>
                        handleInputChange(
                          'originalPrice',
                          e.target.value
                            ? parseFloat(e.target.value)
                            : undefined
                        )
                      }
                      placeholder="Original price if discounted"
                      className="pl-8"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Settings className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Property Details</CardTitle>
                    <CardDescription>
                      Specifications and measurements
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Bed className="w-4 h-4 text-blue-600" />
                      </div>
                      <Label htmlFor="bedrooms" className="font-medium">
                        Bedrooms <span className="text-red-500">*</span>
                      </Label>
                    </div>
                    <Input
                      id="bedrooms"
                      type="number"
                      required
                      min="0"
                      max="20"
                      value={formData.bedrooms}
                      onChange={(e) =>
                        handleInputChange(
                          'bedrooms',
                          parseInt(e.target.value) || 0
                        )
                      }
                      className={
                        formData.bedrooms <= 0
                          ? 'border-red-300 focus:border-red-500'
                          : ''
                      }
                    />
                    {formData.bedrooms <= 0 && (
                      <p className="text-xs text-red-500">
                        Must have at least 1 bedroom
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Bath className="w-4 h-4 text-green-600" />
                      </div>
                      <Label htmlFor="bathrooms" className="font-medium">
                        Bathrooms <span className="text-red-500">*</span>
                      </Label>
                    </div>
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
                      className={
                        formData.bathrooms <= 0
                          ? 'border-red-300 focus:border-red-500'
                          : ''
                      }
                    />
                    {formData.bathrooms <= 0 && (
                      <p className="text-xs text-red-500">
                        Must have at least 1 bathroom
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Square className="w-4 h-4 text-purple-600" />
                      </div>
                      <Label htmlFor="squareFeet" className="font-medium">
                        Square Meter <span className="text-red-500">*</span>
                      </Label>
                    </div>
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
                      className={
                        formData.squareFeet <= 0
                          ? 'border-red-300 focus:border-red-500'
                          : ''
                      }
                    />
                    {formData.squareFeet <= 0 && (
                      <p className="text-xs text-red-500">
                        Must have square footage
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <Calendar className="w-4 h-4 text-red-600" />
                      </div>
                      <Label htmlFor="yearBuilt" className="font-medium">
                        Year Built
                      </Label>
                    </div>
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
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Tag className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      Features & Amenities
                    </CardTitle>
                    <CardDescription>
                      Select available features and community amenities
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Features */}
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b">
                      Property Features ({formData.features.length} selected)
                    </h3>
                    <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto pr-2">
                      {PROPERTY_FEATURES.map((feature) => (
                        <div
                          key={feature}
                          className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Checkbox
                            id={`feature-${feature}`}
                            checked={formData.features.includes(feature)}
                            onCheckedChange={() =>
                              handleArrayToggle('features', feature)
                            }
                            className="h-4 w-4"
                          />
                          <Label
                            htmlFor={`feature-${feature}`}
                            className="text-sm font-normal cursor-pointer flex-1"
                          >
                            {feature}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Amenities */}
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b">
                      Community Amenities ({formData.amenities.length} selected)
                    </h3>
                    <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto pr-2">
                      {PROPERTY_AMENITIES.map((amenity) => (
                        <div
                          key={amenity}
                          className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Checkbox
                            id={`amenity-${amenity}`}
                            checked={formData.amenities.includes(amenity)}
                            onCheckedChange={() =>
                              handleArrayToggle('amenities', amenity)
                            }
                            className="h-4 w-4"
                          />
                          <Label
                            htmlFor={`amenity-${amenity}`}
                            className="text-sm font-normal cursor-pointer flex-1"
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

            {/* Images */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <Upload className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Property Images</CardTitle>
                    <CardDescription>
                      Upload new photos (existing images preserved)
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ImageUpload
                  onImagesChange={handleImageChange}
                  maxImages={10 - existingImages.length}
                  accept="image/*"
                />
                <p className="text-sm text-gray-500">
                  Upload new images to add to existing ones. You can upload up
                  to {10 - existingImages.length} more images.
                </p>

                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Existing Images ({existingImages.length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {existingImages.map((imageUrl, index) => (
                        <div
                          key={index}
                          className="relative group aspect-square rounded-lg border border-gray-200 overflow-hidden shadow-sm"
                        >
                          <Image
                            src={imageUrl}
                            alt={`Property image ${index + 1}`}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                          <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {index + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      New Images ({imagePreviews.length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {imagePreviews.map((previewUrl, index) => (
                        <div
                          key={index}
                          className="relative group aspect-square rounded-lg border border-gray-200 overflow-hidden shadow-sm"
                        >
                          <Image
                            src={previewUrl}
                            alt={`New image ${index + 1}`}
                            className="object-cover w-full h-full"
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/0 to-black/0" />
                          <div className="absolute bottom-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                            New
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Options */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Payment Options</CardTitle>
                    <CardDescription>Available payment methods</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    className={`space-y-4 p-4 rounded-lg border transition-colors ${
                      formData.paymentOutright
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="paymentOutright"
                          checked={!!formData.paymentOutright}
                          onCheckedChange={(checked) =>
                            handleInputChange('paymentOutright', !!checked)
                          }
                          className="h-5 w-5"
                        />
                        <Label
                          htmlFor="paymentOutright"
                          className="font-medium cursor-pointer"
                        >
                          Outright Purchase
                        </Label>
                      </div>
                      {formData.paymentOutright && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Full payment for immediate ownership
                    </p>
                  </div>

                  <div
                    className={`space-y-4 p-4 rounded-lg border transition-colors ${
                      formData.paymentPlan
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="paymentPlan"
                          checked={formData.paymentPlan}
                          onCheckedChange={(checked) =>
                            handleInputChange('paymentPlan', checked)
                          }
                          className="h-5 w-5"
                        />
                        <Label
                          htmlFor="paymentPlan"
                          className="font-medium cursor-pointer"
                        >
                          Payment Plan
                        </Label>
                      </div>
                      {formData.paymentPlan && (
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Flexible installment payments
                    </p>
                  </div>

                  <div
                    className={`space-y-4 p-4 rounded-lg border transition-colors ${
                      formData.mortgageEligible
                        ? 'bg-purple-50 border-purple-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="mortgageEligible"
                          checked={formData.mortgageEligible}
                          onCheckedChange={(checked) =>
                            handleInputChange('mortgageEligible', checked)
                          }
                          className="h-5 w-5"
                        />
                        <Label
                          htmlFor="mortgageEligible"
                          className="font-medium cursor-pointer"
                        >
                          Mortgage
                        </Label>
                      </div>
                      {formData.mortgageEligible && (
                        <CheckCircle2 className="w-5 h-5 text-purple-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Bank financing available
                    </p>
                  </div>
                </div>

                {formData.paymentPlan && (
                  <Card className="mt-6 bg-linear-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="p-6 space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <Settings className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-900">
                            Payment Plan Details
                          </h4>
                          <p className="text-sm text-blue-700">
                            Configure your custom payment plan
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-blue-100">
                        <Checkbox
                          id="customPlanAvailable"
                          checked={formData.customPlanAvailable}
                          onCheckedChange={(checked) =>
                            handleInputChange('customPlanAvailable', checked)
                          }
                          className="h-5 w-5"
                        />
                        <div>
                          <Label
                            htmlFor="customPlanAvailable"
                            className="font-medium cursor-pointer"
                          >
                            Enable Custom Payment Plan
                          </Label>
                          <p className="text-sm text-gray-600">
                            Set custom terms for installment payments
                          </p>
                        </div>
                      </div>

                      {formData.customPlanAvailable && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="customPlanDepositPercent">
                              Initial Deposit (%)
                            </Label>
                            <div className="flex items-center gap-3">
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
                                className="flex-1"
                              />
                              <div className="w-20 px-3 py-2 bg-blue-100 text-blue-800 rounded text-center font-medium">
                                {formData.customPlanDepositPercent}%
                              </div>
                            </div>
                            <p className="text-xs text-gray-500">
                              Percentage of total price paid upfront
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="customPlanMonths">
                              Payment Period (Months)
                            </Label>
                            <div className="flex items-center gap-3">
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
                                className="flex-1"
                              />
                              <div className="w-20 px-3 py-2 bg-blue-100 text-blue-800 rounded text-center font-medium">
                                {formData.customPlanMonths} mos
                              </div>
                            </div>
                            <p className="text-xs text-gray-500">
                              Duration to complete payments
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 1/4 width */}
          <div className="lg:col-span-1 space-y-6">
            {/* Action Panel */}
            <Card className="sticky top-24 shadow-lg border-0">
              <CardContent className="p-6 space-y-4">
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        property.isActive ? 'bg-green-500' : 'bg-yellow-500'
                      }`}
                    />
                    <span className="text-sm font-medium">
                      {property.isActive ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                    ID: {property.$id.substring(0, 8)}
                  </span>
                </div>

                {/* Progress Summary */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Completion
                    </span>
                    <span className="text-sm font-bold text-blue-600">
                      {getCompletionPercentage()}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-linear-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                      style={{ width: `${getCompletionPercentage()}%` }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {getRequiredFieldsStatus().completed} of{' '}
                    {getRequiredFieldsStatus().total} required fields completed
                  </div>
                </div>

                {/* Missing Fields */}
                {getCompletionPercentage() < 100 && (
                  <Card className="bg-amber-50 border-amber-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <h4 className="text-sm font-semibold text-amber-800">
                          Required Fields Missing
                        </h4>
                      </div>
                      <ul className="space-y-1">
                        {getRequiredFieldsStatus().fields.map(
                          (field, index) =>
                            !field.ok && (
                              <li
                                key={index}
                                className="text-xs text-amber-700 flex items-center gap-1"
                              >
                                <div className="w-1 h-1 bg-amber-600 rounded-full" />
                                {field.label}
                              </li>
                            )
                        )}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={isSubmitting || getCompletionPercentage() === 0}
                    className="w-full bg-linear-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </div>
                    ) : (
                      'Save as Draft'
                    )}
                  </Button>

                  <Button
                    type="button"
                    onClick={handlePublish}
                    disabled={isSubmitting || getCompletionPercentage() < 100}
                    className="w-full bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Publishing...
                      </div>
                    ) : (
                      'Publish Changes'
                    )}
                  </Button>

                  <Button
                    type="button"
                    onClick={() => {
                      if (hasUnsavedChanges) {
                        if (
                          !confirm(
                            'You have unsaved changes. Are you sure you want to cancel?'
                          )
                        ) {
                          return
                        }
                      }
                      router.push('/agent/properties')
                    }}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    Cancel
                  </Button>
                </div>

                {/* Delete Section */}
                <div className="pt-6 border-t">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    <h4 className="text-sm font-semibold text-gray-900">
                      Danger Zone
                    </h4>
                  </div>

                  {showDeleteConfirm ? (
                    <Card className="bg-red-50 border-red-200">
                      <CardContent className="p-4">
                        <p className="text-sm font-medium text-red-800 mb-3">
                          Are you sure? This cannot be undone.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={() => setShowDeleteConfirm(false)}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            onClick={handleDelete}
                            variant="destructive"
                            size="sm"
                            className="flex-1"
                          >
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      variant="outline"
                      className="w-full border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800 hover:border-red-400"
                      size="lg"
                    >
                      Delete Property
                    </Button>
                  )}
                </div>

                {/* Last Saved */}
                {lastSaved && (
                  <div className="text-center pt-4 border-t">
                    <p className="text-xs text-gray-500">
                      Last saved at{' '}
                      {lastSaved.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
