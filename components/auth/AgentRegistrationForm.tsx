// components/auth/AgentRegistrationForm.tsx
import { useEffect, useRef, useState } from 'react'
import { AlertCircle, Upload, User, X } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AgentRegistrationFormProps {
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
}

export function AgentRegistrationForm({
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
}: AgentRegistrationFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [aspectRatioError, setAspectRatioError] = useState<string | null>(null)

  useEffect(() => {
    // Cleanup function
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview)
      }
    }
  }, [avatarPreview])

  const checkImageAspectRatio = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image()
      const url = URL.createObjectURL(file)

      img.onload = () => {
        URL.revokeObjectURL(url)
        const aspectRatio = img.width / img.height
        // Check if aspect ratio is approximately 1:1 (allow small tolerance)
        const isSquare = Math.abs(aspectRatio - 1) < 0.05 // 5% tolerance
        resolve(isSquare)
      }

      img.onerror = () => {
        URL.revokeObjectURL(url)
        resolve(false)
      }

      img.src = url
    })
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, or WebP)')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    // Check aspect ratio
    setAspectRatioError(null)
    const isSquare = await checkImageAspectRatio(file)

    if (!isSquare) {
      setAspectRatioError(
        'Profile picture must be square (1:1 aspect ratio). Please upload a square image.'
      )
      toast.error(
        'Image must be square. Please upload a square image or crop it before uploading.'
      )
      return
    }

    // Image is valid and square
    setAvatarFile(file)
    const previewUrl = URL.createObjectURL(file)
    setAvatarPreview(previewUrl)
    toast.success('Square image uploaded successfully!')

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveAvatar = () => {
    setAvatarFile(null)
    if (avatarPreview) {
      if (avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview)
      }
      setAvatarPreview(null)
    }
    setAspectRatioError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    toast.info('Profile picture removed')
  }

  return (
    <div className="space-y-4">
      {/* Avatar Upload Section */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Profile Picture (Optional)
          <span className="text-xs text-gray-500 ml-2">
            Builds trust with clients
          </span>
        </Label>

        {/* Aspect Ratio Warning */}
        {aspectRatioError && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm flex items-start">
            <AlertCircle className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
            <div>
              <span className="font-medium">Square Image Required</span>
              <p className="mt-1">{aspectRatioError}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <a
                  href="https://www.befunky.com/create/resize-image/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-amber-600 hover:text-amber-800 underline"
                >
                  Online Image Cropper ↗
                </a>
                <a
                  href="https://www.adobe.com/express/feature/image/resize"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-amber-600 hover:text-amber-800 underline"
                >
                  Adobe Express ↗
                </a>
                <a
                  href="https://www.canva.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-amber-600 hover:text-amber-800 underline"
                >
                  Canva ↗
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Square Image Guide */}
        {/* <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <Info className="h-4 w-4 text-blue-600 mr-2 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-blue-800">
                <strong>Tip:</strong> Upload a square image (1:1 aspect ratio)
                for best results. Examples: 500×500, 800×800, 1000×1000 pixels.
              </p>
              <div className="mt-2 flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg border border-gray-300 flex items-center justify-center">
                    <span className="text-xs text-gray-600">✓ Good</span>
                  </div>
                  <span className="text-xs text-gray-600 mt-1">Square</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-24 h-16 bg-gray-200 rounded-lg border border-gray-300 flex items-center justify-center">
                    <span className="text-xs text-gray-600">✗ Avoid</span>
                  </div>
                  <span className="text-xs text-gray-600 mt-1">Rectangle</span>
                </div>
              </div>
            </div>
          </div>
        </div> */}

        <div className="flex items-center space-x-4">
          {/* Avatar Preview */}
          <div className="relative">
            {avatarPreview ? (
              <>
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-emerald-200 bg-emerald-50">
                  <img
                    src={avatarPreview}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={isLoading}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
                <User className="h-10 w-10 text-gray-400" />
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div className="flex-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              disabled={isLoading}
            />

            <Button
              type="button"
              variant="outline"
              className="w-full cursor-pointer border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 text-emerald-700 py-3"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {avatarFile ? 'Change Photo' : 'Upload Photo'}
            </Button>

            <p className="text-xs text-gray-500 mt-2">
              <strong>Requirements:</strong> Square image • Max 5MB • JPG, PNG,
              or WebP
            </p>
            {avatarFile && (
              <p className="text-xs text-emerald-600 mt-1">
                ✓ Image uploaded and ready!
              </p>
            )}
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="agency" className="text-sm font-medium text-gray-700">
          Agency/Company Name *
        </Label>
        <Input
          id="agency"
          type="text"
          value={agency}
          onChange={(e) => setAgency(e.target.value)}
          placeholder="Enter your agency or company name"
          className="mt-1 h-12"
          required
          disabled={isLoading}
        />
      </div>
      <div className="flex gap-6">
        <div>
          <Label
            htmlFor="city"
            className="text-sm font-medium text-gray-700 mb-1"
          >
            Primary City *
          </Label>
          <Select value={city} onValueChange={setCity} disabled={isLoading}>
            <SelectTrigger className="h-12">
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
        </div>

        <div>
          <Label
            htmlFor="state"
            className="text-sm font-medium text-gray-700 mb-1"
          >
            State
          </Label>
          <Select value={state} onValueChange={setState} disabled={isLoading}>
            <SelectTrigger className="h-12">
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

      <div className="flex gap-6 space-y-6">
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
            <SelectTrigger className="h-12">
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
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select specialization" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Areas of Expertise</SelectLabel>
                <SelectItem value="Residential">Residential</SelectItem>
                <SelectItem value="Commercial">Commercial</SelectItem>
                <SelectItem value="Luxury Homes">Luxury Homes</SelectItem>
                <SelectItem value="Property Management">
                  Property Management
                </SelectItem>
                <SelectItem value="Real Estate Investment">
                  Real Estate Investment
                </SelectItem>
                <SelectItem value="Land Acquisition">
                  Land Acquisition
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
