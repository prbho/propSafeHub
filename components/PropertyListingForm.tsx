// components/PropertyListingForm.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Bath,
  Bed,
  Camera,
  DollarSign,
  Home,
  Info,
  MapPin,
  Square,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

interface PropertyListingFormProps {
  listingType: 'sale' | 'rent'
}

interface FormData {
  // Basic Information
  title: string
  description: string
  propertyType: string
  status: string

  // Location
  address: string
  city: string
  state: string
  zipCode: string
  neighborhood: string

  // Pricing
  price: string
  currency: string

  // Details
  bedrooms: string
  bathrooms: string
  area: string
  areaUnit: string

  // Features
  features: string[]

  // Media
  images: File[]
}

export default function PropertyListingForm({
  listingType,
}: PropertyListingFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    propertyType: '',
    status: listingType === 'sale' ? 'for-sale' : 'for-rent',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    neighborhood: '',
    price: '',
    currency: 'NGN',
    bedrooms: '',
    bathrooms: '',
    area: '',
    areaUnit: 'sqft',
    features: [],
    images: [],
  })

  const propertyTypes = [
    'house',
    'apartment',
    'condo',
    'townhouse',
    'villa',
    'land',
    'commercial',
    'office',
  ]

  const featuresList = [
    'Swimming Pool',
    'Garden',
    'Parking',
    'Security',
    'Furnished',
    'Air Conditioning',
    'Balcony',
    'Gym',
    'Pet Friendly',
    'Elevator',
  ]

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFeatureToggle = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...Array.from(files)],
      }))
    }
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Create FormData for file upload
      const submitData = new FormData()

      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'images') {
          // Append each image file
          formData.images.forEach((image, index) => {
            submitData.append(`images[${index}]`, image)
          })
        } else if (key === 'features') {
          // Append features as array
          formData.features.forEach((feature, index) => {
            submitData.append(`features[${index}]`, feature)
          })
        } else {
          submitData.append(key, value as string)
        }
      })

      const response = await fetch('/api/properties', {
        method: 'POST',
        body: submitData,
      })

      if (!response.ok) {
        throw new Error('Failed to create property listing')
      }

      const result = await response.json()

      // Redirect to the new property page or dashboard
      router.push(`/properties/${result.document.$id}`)
    } catch (error) {
      console.error('Error creating property listing:', error)
      toast.error('Failed to create listing. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Property Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Beautiful 3-Bedroom Apartment in Lekki"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="propertyType">Property Type *</Label>
              <Select
                value={formData.propertyType}
                onValueChange={(value) =>
                  handleInputChange('propertyType', value)
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe your property in detail..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Full Address *</Label>
            <Input
              id="address"
              placeholder="Enter complete address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                placeholder="e.g., Lagos"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                placeholder="e.g., Lagos State"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="neighborhood">Neighborhood</Label>
              <Input
                id="neighborhood"
                placeholder="e.g., Lekki Phase 1"
                value={formData.neighborhood}
                onChange={(e) =>
                  handleInputChange('neighborhood', e.target.value)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">
                {listingType === 'sale' ? 'Sale Price' : 'Monthly Rent'} *
              </Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  ₦
                </span>
                <Input
                  id="price"
                  type="number"
                  placeholder="Enter amount"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className="rounded-l-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => handleInputChange('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NGN">NGN (Naira)</SelectItem>
                  <SelectItem value="USD">USD (Dollar)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Property Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedrooms" className="flex items-center gap-2">
                <Bed className="h-4 w-4" />
                Bedrooms *
              </Label>
              <Input
                id="bedrooms"
                type="number"
                placeholder="0"
                value={formData.bedrooms}
                onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                min="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bathrooms" className="flex items-center gap-2">
                <Bath className="h-4 w-4" />
                Bathrooms *
              </Label>
              <Input
                id="bathrooms"
                type="number"
                placeholder="0"
                value={formData.bathrooms}
                onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                min="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="area" className="flex items-center gap-2">
                <Square className="h-4 w-4" />
                Area *
              </Label>
              <div className="flex">
                <Input
                  id="area"
                  type="number"
                  placeholder="0"
                  value={formData.area}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                  min="0"
                  required
                />
                <Select
                  value={formData.areaUnit}
                  onValueChange={(value) =>
                    handleInputChange('areaUnit', value)
                  }
                >
                  <SelectTrigger className="w-24 rounded-l-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sqft">Sq Ft</SelectItem>
                    <SelectItem value="sqm">Sq M</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Features & Amenities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {featuresList.map((feature) => (
              <div key={feature} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`feature-${feature}`}
                  checked={formData.features.includes(feature)}
                  onChange={() => handleFeatureToggle(feature)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor={`feature-${feature}`} className="text-sm">
                  {feature}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Property Images
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <Label htmlFor="images" className="cursor-pointer">
              <span className="text-emerald-600 hover:text-blue-700 font-medium">
                Click to upload
              </span>{' '}
              or drag and drop
            </Label>
            <p className="text-sm text-gray-500 mt-1">
              PNG, JPG, GIF up to 10MB each
            </p>
            <Input
              id="images"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Preview uploaded images */}
          {formData.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative group">
                  <Image
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-emerald-600 hover:bg-blue-700"
        >
          {isSubmitting ? 'Creating Listing...' : 'Create Property Listing'}
        </Button>
      </div>
    </form>
  )
}
