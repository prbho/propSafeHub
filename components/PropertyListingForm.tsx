'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Bath,
  Bed,
  Calendar,
  Camera,
  Clock,
  Coffee,
  DollarSign,
  Home,
  Info,
  Key,
  MapPin,
  Shield,
  Snowflake,
  Square,
  Tv,
  Upload,
  Waves,
  Wifi,
  Wind,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Textarea } from '@/components/ui/textarea'

interface PropertyListingFormProps {
  listingType: 'sale' | 'rent' | 'short-let'
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
  priceUnit: string

  // Details
  bedrooms: string
  bathrooms: string
  area: string
  areaUnit: string

  // Features
  features: string[]

  // Short-Let Specific
  minimumStay?: string
  maximumStay?: string
  instantBooking?: boolean
  checkInTime?: string
  checkOutTime?: string
  cancellationPolicy?: 'flexible' | 'moderate' | 'strict'
  houseRules?: string[]
  availabilityStart?: string
  availabilityEnd?: string

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
    status:
      listingType === 'sale'
        ? 'for-sale'
        : listingType === 'rent'
          ? 'for-rent'
          : 'short-let',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    neighborhood: '',
    price: '',
    currency: 'NGN',
    priceUnit:
      listingType === 'sale'
        ? 'total'
        : listingType === 'rent'
          ? 'monthly'
          : 'daily',
    bedrooms: '',
    bathrooms: '',
    area: '',
    areaUnit: 'sqft',
    features: [],
    instantBooking: false,
    checkInTime: '14:00',
    checkOutTime: '11:00',
    cancellationPolicy: 'moderate',
    houseRules: [],
    minimumStay: '1',
    maximumStay: '30',
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

  // Base features for all property types
  const baseFeaturesList = [
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

  // Additional features specific to short-let
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

  const getPriceLabel = () => {
    switch (listingType) {
      case 'sale':
        return 'Sale Price'
      case 'rent':
        return 'Monthly Rent'
      case 'short-let':
        return 'Daily Rate'
      default:
        return 'Price'
    }
  }

  const getPriceUnitOptions = () => {
    switch (listingType) {
      case 'sale':
        return ['total']
      case 'rent':
        return ['monthly', 'yearly']
      case 'short-let':
        return ['daily', 'weekly', 'monthly']
      default:
        return ['monthly']
    }
  }

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean
  ) => {
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

  const handleHouseRuleToggle = (rule: string) => {
    setFormData((prev) => ({
      ...prev,
      houseRules: prev.houseRules?.includes(rule)
        ? prev.houseRules.filter((r) => r !== rule)
        : [...(prev.houseRules || []), rule],
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
        } else if (key === 'features' || key === 'houseRules') {
          // Append arrays
          const arrayValue = value as string[]
          arrayValue.forEach((item, index) => {
            submitData.append(`${key}[${index}]`, item)
          })
        } else if (key === 'instantBooking') {
          submitData.append(key, value ? 'true' : 'false')
        } else {
          submitData.append(key, value as string)
        }
      })

      // Add listing type
      submitData.append('listingType', listingType)

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
                placeholder={
                  listingType === 'short-let'
                    ? 'e.g., Cozy 2-Bedroom Vacation Home in Lagos'
                    : 'e.g., Beautiful 3-Bedroom Apartment in Lekki'
                }
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
              placeholder={
                listingType === 'short-let'
                  ? 'Describe your short-let property, including nearby attractions, unique features, and what makes it perfect for guests...'
                  : 'Describe your property in detail...'
              }
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">{getPriceLabel()} *</Label>
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
              <Label htmlFor="priceUnit">Price Unit *</Label>
              <Select
                value={formData.priceUnit}
                onValueChange={(value) => handleInputChange('priceUnit', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue />
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
                    <SelectItem value="sqft">m²</SelectItem>
                    <SelectItem value="sqm">m²</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SHORT-LET SPECIFIC SECTION */}
      {listingType === 'short-let' && (
        <>
          {/* Stay Duration & Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Stay Duration & Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minimumStay">Minimum Stay (nights) *</Label>
                  <Input
                    id="minimumStay"
                    type="number"
                    placeholder="1"
                    value={formData.minimumStay}
                    onChange={(e) =>
                      handleInputChange('minimumStay', e.target.value)
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
                    value={formData.maximumStay}
                    onChange={(e) =>
                      handleInputChange('maximumStay', e.target.value)
                    }
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="checkInTime">Check-in Time *</Label>
                  <Select
                    value={formData.checkInTime}
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
                    value={formData.checkOutTime}
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
                    value={formData.availabilityStart}
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
                    value={formData.availabilityEnd}
                    onChange={(e) =>
                      handleInputChange('availabilityEnd', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="instantBooking"
                  checked={formData.instantBooking}
                  onCheckedChange={(checked) =>
                    handleInputChange('instantBooking', checked)
                  }
                />
                <Label htmlFor="instantBooking" className="cursor-pointer">
                  Enable Instant Booking
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
            </CardHeader>
            <CardContent>
              <Select
                value={formData.cancellationPolicy}
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
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {shortLetFeaturesList.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={`shortlet-feature-${feature}`}
                      checked={formData.features.includes(feature)}
                      onCheckedChange={() => handleFeatureToggle(feature)}
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
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {houseRulesList.map((rule) => (
                  <div key={rule} className="flex items-center space-x-2">
                    <Checkbox
                      id={`rule-${rule}`}
                      checked={formData.houseRules?.includes(rule)}
                      onCheckedChange={() => handleHouseRuleToggle(rule)}
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

      {/* Base Features & Amenities (for all types) */}
      <Card>
        <CardHeader>
          <CardTitle>Property Features & Amenities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {baseFeaturesList.map((feature) => (
              <div key={feature} className="flex items-center space-x-2">
                <Checkbox
                  id={`feature-${feature}`}
                  checked={formData.features.includes(feature)}
                  onCheckedChange={() => handleFeatureToggle(feature)}
                />
                <Label
                  htmlFor={`feature-${feature}`}
                  className="text-sm cursor-pointer"
                >
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
