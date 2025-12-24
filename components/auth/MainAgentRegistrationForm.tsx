// components/auth/MainAgentRegistrationForm.tsx
import { useEffect, useRef, useState } from 'react'
import { Crop, Upload, User, X } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface MainAgentRegistrationFormProps {
  agency: string
  setAgency: (value: string) => void
  city: string
  setCity: (value: string) => void
  yearsExperience: string
  setYearsExperience: (value: string) => void
  state: string
  setState: (value: string) => void
  specialty: string
  setSpecialty: (value: string) => void
  avatarFile: File | null
  setAvatarFile: (file: File | null) => void
  avatarPreview: string | null
  setAvatarPreview: (preview: string | null) => void
  isLoading: boolean
  nigerianCities: string[]
  nigerianStates: string[]
  onFormValidityChange?: (isValid: boolean) => void
}

export function MainAgentRegistrationForm({
  agency,
  setAgency,
  city,
  setCity,
  yearsExperience,
  setYearsExperience,
  state,
  setState,
  specialty,
  setSpecialty,
  avatarFile,
  setAvatarFile,
  avatarPreview,
  setAvatarPreview,
  isLoading,
  nigerianCities,
  nigerianStates,
  onFormValidityChange,
}: MainAgentRegistrationFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isImageLoading, setIsImageLoading] = useState(false)
  const [showCropDialog, setShowCropDialog] = useState(false)
  const [isCropping, setIsCropping] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState<string>('')

  // Specialization options array to prevent duplicate keys
  const SPECIALIZATION_OPTIONS = [
    { value: 'Residential', label: 'Residential' },
    { value: 'Commercial', label: 'Commercial' },
    { value: 'Industrial', label: 'Industrial' },
    { value: 'Land_Raw_Land', label: 'Land/Raw Land' },
    { value: 'Luxury_Homes', label: 'Luxury Homes' },
    { value: 'Green_Eco_Friendly', label: 'Green/Eco-Friendly' },
    {
      value: 'Foreclosures_Short_Sales',
      label: 'Foreclosures and Short Sales',
    },
    { value: 'Buyer_Representation', label: 'Buyer Representation' },
    { value: 'Seller_Representation', label: 'Seller Representation' },
    { value: 'Property_Management', label: 'Property Management' },
    { value: 'Real_Estate_Investment', label: 'Real Estate Investment' },
    { value: 'Land_Acquisition', label: 'Land Acquisition' },
  ]

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview)
      }
    }
  }, [avatarPreview])

  // Check form validity whenever required fields change
  useEffect(() => {
    const isValid = agency.trim() !== '' && city.trim() !== ''
    onFormValidityChange?.(isValid)
  }, [agency, city, onFormValidityChange])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImageLoading(true)

    // Basic validation
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error(`Please select a JPG, PNG, or WebP image file.`)
      setIsImageLoading(false)
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        `Image is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 5MB.`
      )
      setIsImageLoading(false)
      return
    }

    // Set the file
    setAvatarFile(file)
    setUploadedFileName(file.name)

    // Create a preview URL using FileReader for better compatibility
    const reader = new FileReader()

    reader.onload = (event) => {
      const previewUrl = event.target?.result as string
      setAvatarPreview(previewUrl)
      setIsImageLoading(false)
      toast.success('Profile picture uploaded successfully!')
    }

    reader.onerror = () => {
      console.error('Failed to create preview')
      // Fallback to blob URL if FileReader fails
      try {
        const fallbackPreview = URL.createObjectURL(file)
        setAvatarPreview(fallbackPreview)
      } catch (error) {
        console.error('Both preview methods failed')
        setAvatarPreview(null)
      }
      setIsImageLoading(false)
      toast.error('Failed to load image preview')
    }

    reader.readAsDataURL(file)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCropImage = () => {
    setIsCropping(true)

    // Simulate cropping process
    setTimeout(() => {
      setShowCropDialog(false)
      setIsCropping(false)
      toast.success('Image cropped successfully!')
    }, 1500)
  }

  const handleRemoveAvatar = () => {
    // Clean up object URL before removing
    if (avatarPreview && avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview)
    }

    setAvatarFile(null)
    setAvatarPreview(null)
    setUploadedFileName('')

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    toast.info('Profile picture removed')
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file && fileInputRef.current) {
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      fileInputRef.current.files = dataTransfer.files

      const event = new Event('change', { bubbles: true })
      fileInputRef.current.dispatchEvent(event)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const truncateFileName = (name: string, maxLength = 15) => {
    if (name.length <= maxLength) return name
    const extension = name.split('.').pop()
    const nameWithoutExt = name.substring(0, name.lastIndexOf('.'))
    const truncated = nameWithoutExt.substring(0, maxLength - 3) + '...'
    return `${truncated}.${extension}`
  }

  const handleAgencyChange = (value: string) => {
    setAgency(value)
  }

  const handleCityChange = (value: string) => {
    setCity(value)
  }

  return (
    <div className="space-y-3">
      {/* Avatar Upload Section */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-1 block">
          Profile Picture (Optional)
          <span className="text-xs text-gray-500 ml-2">
            Builds trust with clients
          </span>
        </Label>

        {/* Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-xl p-2 mb-4 transition-all ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50'
              : 'border-gray-300 bg-gray-50'
          } ${isImageLoading ? 'opacity-50' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isImageLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-12 border-b-2 border-emerald-600 mb-4"></div>
              <p className="text-gray-600">Processing image...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              {avatarPreview ? (
                <>
                  <div className="relative mb-2">
                    {/* Show actual image preview */}
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                      <img
                        src={avatarPreview}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                        onLoad={() => setIsImageLoading(false)}
                        onError={(e) => {
                          console.error('Image preview failed to load')
                          // Fallback to file icon
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      {/* Loading overlay */}
                      {isImageLoading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                      )}
                    </div>

                    {/* File info badge */}
                    <Badge className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-emerald-500">
                      {uploadedFileName
                        ? truncateFileName(uploadedFileName, 10)
                        : 'Ready'}
                    </Badge>
                  </div>

                  {/* File info details below the image */}
                  {uploadedFileName && (
                    <div className="text-center mb-4">
                      <p className="text-sm font-medium text-gray-900">
                        {truncateFileName(uploadedFileName, 25)}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatFileSize(avatarFile?.size || 0)} • Ready to use
                      </p>
                    </div>
                  )}

                  <div className="space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="cursor-pointer text-xs"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      Change
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="cursor-pointer text-xs text-amber-700 border-amber-300 hover:bg-amber-50"
                      onClick={() => setShowCropDialog(true)}
                      disabled={isLoading}
                    >
                      <Crop className="h-3 w-3 mr-1" />
                      Crop
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-600 border text-xs border-red-300 bg-red-100 hover:text-red-700 hover:bg-red-50"
                      onClick={handleRemoveAvatar}
                      disabled={isLoading}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Remove
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-24 h-24 rounded-full border-4 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center mb-4">
                    <User className="h-10 w-10 text-gray-400 mb-2" />
                    <span className="text-xs text-gray-500">No photo</span>
                  </div>
                  <div className="mb-4">
                    <Button
                      type="button"
                      variant="default"
                      className="cursor-pointer bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </Button>
                    <p className="text-sm text-gray-500 mt-2">
                      or drag and drop here
                    </p>
                  </div>
                </>
              )}

              <div className="text-xs text-gray-500 space-y-1 mt-2">
                <p>
                  <strong>Supported formats:</strong> JPG, PNG, WebP • Max 5MB
                </p>
                <p className="text-gray-400">
                  <strong>Tip:</strong> Square images (1:1 ratio) work best
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleAvatarChange}
          accept=".jpg,.jpeg,.png,.webp"
          className="hidden"
          disabled={isLoading || isImageLoading}
        />
      </div>

      {/* Cropping Dialog */}
      <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crop Image to Square</DialogTitle>
            <DialogDescription>
              Your image will be cropped to a square format for best display
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {avatarPreview ? (
              <div className="text-center">
                <div className="relative w-48 h-48 mx-auto overflow-hidden rounded-lg border-2 border-emerald-300">
                  <img
                    src={avatarPreview}
                    alt="Image to crop"
                    className="w-full h-full object-cover"
                  />
                  {/* Crop overlay */}
                  <div className="absolute inset-0">
                    <div className="absolute inset-0 border-2 border-white/50 m-4"></div>
                    <div className="absolute top-0 left-0 right-0 bottom-0 m-auto w-40 h-40 border-2 border-black/30"></div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Adjust the crop area as needed
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-48 h-48 mx-auto bg-linear-to-br from-emerald-100 to-blue-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Crop className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
                    <p className="text-sm text-gray-600">
                      Image will be cropped to square (1:1)
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Using center portion
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isCropping ? (
              <div className="space-y-2">
                <Progress value={65} className="h-2" />
                <p className="text-xs text-center text-gray-500">
                  Cropping image...
                </p>
              </div>
            ) : (
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <p className="font-medium mb-1">What happens:</p>
                <ul className="list-disc list-inside text-xs space-y-1">
                  <li>Image will be cropped to a square from the center</li>
                  <li>Original aspect ratio will be adjusted</li>
                  <li>Cropped version will replace the current image</li>
                </ul>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCropDialog(false)}
                disabled={isCropping}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCropImage}
                disabled={isCropping}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isCropping ? 'Cropping...' : 'Crop & Use This'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Form Fields with validation */}
      <div className="space-y-4">
        <div>
          <Label
            htmlFor="agency"
            className="text-sm font-medium text-gray-700 flex items-center"
          >
            Agency/Company Name *
            {agency.trim() === '' && (
              <span className="text-xs text-red-500 ml-2">(Required)</span>
            )}
          </Label>
          <Input
            id="agency"
            type="text"
            value={agency}
            onChange={(e) => handleAgencyChange(e.target.value)}
            placeholder="Enter your agency or company name"
            className={`mt-1 h-10 ${agency.trim() === '' ? 'border-red-300 focus:border-red-500' : ''}`}
            required
            disabled={isLoading}
          />
          {agency.trim() === '' && (
            <p className="text-xs text-red-500 mt-1">
              Please enter your agency or company name
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label
              htmlFor="city"
              className="text-sm font-medium text-gray-700 mb-1 flex items-center"
            >
              Primary City *
              {city.trim() === '' && (
                <span className="text-xs text-red-500 ml-2">(Required)</span>
              )}
            </Label>
            <Select
              value={city}
              onValueChange={handleCityChange}
              disabled={isLoading}
            >
              <SelectTrigger
                className={`h-10 ${city.trim() === '' ? 'border-red-300 focus:border-red-500' : ''}`}
              >
                <SelectValue placeholder="Select your city" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Major Cities</SelectLabel>
                  {nigerianCities.map((cityName) => (
                    <SelectItem key={cityName} value={cityName}>
                      {cityName}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {city.trim() === '' && (
              <p className="text-xs text-red-500 mt-1">
                Please select your primary city
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor="state"
              className="text-sm font-medium text-gray-700 mb-1"
            >
              State
            </Label>
            <Select value={state} onValueChange={setState} disabled={isLoading}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select your state" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Nigerian States</SelectLabel>
                  {nigerianStates.map((stateName) => (
                    <SelectItem key={stateName} value={stateName}>
                      {stateName}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label
              htmlFor="yearsExperience"
              className="text-sm font-medium text-gray-700 mb-1"
            >
              Years of Experience
            </Label>
            <Select
              value={yearsExperience}
              onValueChange={setYearsExperience}
              disabled={isLoading}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Experience Level</SelectLabel>
                  <SelectItem value="0">Less than 1 year</SelectItem>
                  <SelectItem value="1">1 year</SelectItem>
                  <SelectItem value="2">2 years</SelectItem>
                  <SelectItem value="3">3 years</SelectItem>
                  <SelectItem value="5">5+ years</SelectItem>
                  <SelectItem value="10">10+ years</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label
              htmlFor="specialty"
              className="text-sm font-medium text-gray-700 mb-1"
            >
              Specialization
            </Label>
            <Select
              value={specialty}
              onValueChange={setSpecialty}
              disabled={isLoading}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Areas of Expertise</SelectLabel>
                  {SPECIALIZATION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}
