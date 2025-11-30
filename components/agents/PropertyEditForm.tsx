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
  ArrowLeft,
  Bath,
  Bed,
  Calendar,
  CheckCircle2,
  DollarSign,
  Home,
  Loader2,
  MapPin,
  Square,
  Tag,
  Upload,
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
import { Textarea } from '@/components/ui/textarea'
import { databases } from '@/lib/appwrite'
import { Location } from '@/lib/locations/locationService'

import ImageUpload from '../ui/ImageUpload'
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

    // Media
    images: property.images || [],
    videos: property.videos || [],

    // Listing Details
    listedBy: property.listedBy || 'agent',
    isFeatured: property.isFeatured || false,
    tags: property.tags || [],

    // Payment Options
    originalPrice: property.originalPrice || '',
    paymentOutright: property.paymentOutright || true,
    paymentPlan: property.paymentPlan || false,
    mortgageEligible: property.mortgageEligible || false,
    customPlanAvailable: property.customPlanAvailable || false,
    customPlanDepositPercent: property.customPlanDepositPercent || 30,
    customPlanMonths: property.customPlanMonths || 12,
  })

  // Check authentication and ownership
  useEffect(() => {
    if (!authLoading && user) {
      if (user.userType !== 'agent') {
        router.push('/dashboard')
        return
      }
      if (property.agentId !== user.$id) {
        router.push('/agent/properties')
        return
      }
      setIsLoading(false)

      // Set selected location from existing property data
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
  }, [user, authLoading, router, property])

  // Clean up function to revoke object URLs
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [imagePreviews])

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

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleArrayToggle = (
    field: 'features' | 'amenities' | 'tags',
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }))
  }

  const handleImageChange = (files: File[]) => {
    setUploadedFiles(files)
    imagePreviews.forEach((url) => URL.revokeObjectURL(url))
    const previewUrls = files.map((file) => URL.createObjectURL(file))
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

      toast.success('Property updated successfully!')
      router.push('/agent/properties')
    } catch {
      toast.error('Failed to update property listing')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (
      !confirm(
        'Are you sure you want to delete this property? This action cannot be undone.'
      )
    ) {
      return
    }

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
      router.push('/agent/properties')
    } catch (error) {
      console.error('Error deleting property:', error)
      toast.error('Failed to delete property')
    }
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
    <div className="space-y-6">
      {/* Header */}
      <div className="pt-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push('/agent/properties')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Edit Property
              </h1>
              <p className="text-gray-600">
                Update your property listing details
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4 mb-6">
          <div className="col-span-3 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Update essential details about your property
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
                      onChange={(e) =>
                        handleInputChange('title', e.target.value)
                      }
                      placeholder="Beautiful 3-Bedroom Apartment in Lekki"
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

                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      required
                      value={formData.status}
                      onValueChange={(value) =>
                        handleInputChange('status', value)
                      }
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="for-sale">For Sale</SelectItem>
                        <SelectItem value="for-rent">For Rent</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                        <SelectItem value="rented">Rented</SelectItem>
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
                    >
                      <SelectTrigger id="listedBy">
                        <SelectValue placeholder="Select who listed it" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agent">Agent</SelectItem>
                        <SelectItem value="owner">Owner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    required
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange('description', e.target.value)
                    }
                    placeholder="Describe the property features, neighborhood, and unique selling points..."
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location
                </CardTitle>
                <CardDescription>
                  Update property location details
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
                      onChange={(e) =>
                        handleInputChange('address', e.target.value)
                      }
                      placeholder="Street address, building number, etc."
                    />
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
                          <p className="text-gray-600">City</p>
                          <p className="font-semibold">{formData.city}</p>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg border border-green-100">
                          <p className="text-gray-600">State</p>
                          <p className="font-semibold">{formData.state}</p>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg border border-green-100">
                          <p className="text-gray-600">Country</p>
                          <p className="font-semibold">{formData.country}</p>
                        </div>
                        {formData.neighborhood && (
                          <div className="text-center p-3 bg-white rounded-lg border border-green-100">
                            <p className="text-gray-600">Area</p>
                            <p className="font-semibold">
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
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Pricing
                </CardTitle>
                <CardDescription>
                  Update property pricing information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
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
                    <Label htmlFor="priceUnit">
                      {formData.status === 'for-rent'
                        ? 'Price Unit *'
                        : 'Price Type'}
                    </Label>
                    <Select
                      required
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
                    <Card className="w-full bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <p className="text-sm font-medium text-blue-900">
                          {formData.status === 'for-rent' ? (
                            <>
                              {formData.priceUnit === 'monthly' && 'Monthly: '}
                              {formData.priceUnit === 'yearly' && 'Yearly: '}₦
                              {formData.price.toLocaleString()}
                              {formData.priceUnit === 'monthly' && '/mo'}
                              {formData.priceUnit === 'yearly' && '/yr'}
                            </>
                          ) : (
                            <>Total Price: ₦{formData.price.toLocaleString()}</>
                          )}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="originalPrice">
                    Original Price (Optional)
                  </Label>
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
                  Update property specifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="bedrooms"
                      className="flex items-center gap-2"
                    >
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
                        handleInputChange(
                          'bedrooms',
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="bathrooms"
                      className="flex items-center gap-2"
                    >
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
                    <Label
                      htmlFor="squareFeet"
                      className="flex items-center gap-2"
                    >
                      <Square className="w-4 h-4" />
                      Square Feet *
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
                    <Label
                      htmlFor="yearBuilt"
                      className="flex items-center gap-2"
                    >
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
                  <Label htmlFor="lotSize">Lot Size (sq ft)</Label>
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
                  Update property features and community amenities
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
                        <div
                          key={feature}
                          className="flex items-center space-x-2"
                        >
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
                        <div
                          key={amenity}
                          className="flex items-center space-x-2"
                        >
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

            {/* Payment Options */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Options</CardTitle>
                <CardDescription>
                  Update available payment methods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="paymentOutright"
                    checked={!!formData.paymentOutright}
                    onCheckedChange={(checked) =>
                      handleInputChange('paymentOutright', !!checked)
                    }
                  />
                  <Label htmlFor="paymentOutright" className="cursor-pointer">
                    Outright Purchase Available
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
                    Payment Plan Available
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
                            <Label htmlFor="customPlanMonths">
                              Payment Months
                            </Label>
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

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Property Images
                </CardTitle>
                <CardDescription>
                  Update property photos (existing images will be preserved)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ImageUpload
                  onImagesChange={handleImageChange}
                  maxImages={10}
                  accept="image/*"
                />
                <p className="text-sm text-gray-500">
                  Upload new images to add to existing ones. Maximum 10 images
                  total.
                </p>

                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Existing Images ({existingImages.length} images)
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {existingImages.map((imageUrl, index) => (
                        <div
                          key={index}
                          className="relative aspect-square rounded-lg border border-gray-200 overflow-hidden"
                        >
                          <Image
                            src={imageUrl}
                            alt={`New property image ${index + 1}`}
                            className="object-cover w-full h-full"
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      New Images ({imagePreviews.length} images)
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {imagePreviews.map((previewUrl, index) => (
                        <div
                          key={index}
                          className="relative aspect-square rounded-lg border border-gray-200 overflow-hidden"
                        >
                          <Image
                            src={previewUrl}
                            alt={`New property image ${index + 1}`}
                            className="object-cover w-full h-full"
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

            {/* Additional Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Additional Options
                </CardTitle>
                <CardDescription>Update listing preferences</CardDescription>
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
                    value={formData.tags.join(', ')}
                    onChange={(e) =>
                      handleInputChange(
                        'tags',
                        e.target.value
                          .split(',')
                          .map((tag) => tag.trim())
                          .filter(Boolean)
                      )
                    }
                    placeholder="e.g., luxury, waterfront, new, renovated"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            {/* Action Buttons */}
            <Card className="sticky top-24 md:h-[40vh]">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 space-y-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-linear-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Updating...
                      </div>
                    ) : (
                      'Update Property'
                    )}
                  </Button>

                  <Button
                    type="button"
                    onClick={() => router.push('/agent/properties')}
                    variant="outline"
                    size="lg"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    onClick={handleDelete}
                    variant="destructive"
                    size="lg"
                  >
                    Delete Property
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
