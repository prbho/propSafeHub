/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useRef, useState } from 'react'
import {
  NIGERIAN_CITIES,
  NIGERIAN_STATES,
} from '@/constants/nigerian-locations'
import {
  formatPhoneNumber,
  validatePhoneNumber,
} from '@/utils/auth-validations'
import { Eye, EyeOff, Phone } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import ModernImageCropper from '../ModernImageCropper'
import Portal from '../Portal'
import { AgentRegistrationForm } from './AgentRegistrationForm'

interface RegistrationFormProps {
  initialEmail?: string
  onRegistrationComplete?: () => void
  onBack?: () => void
  showBackButton?: boolean
}

type RegistrationStep = 'basic-info' | 'agent-info'

export function RegistrationForm({
  initialEmail = '',
  onRegistrationComplete,
  onBack,
  showBackButton = true,
}: RegistrationFormProps) {
  const [step, setStep] = useState<RegistrationStep>('basic-info')
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('+234')
  const [userType, setUserType] = useState<'buyer' | 'seller' | 'agent'>(
    'buyer'
  )
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // Cropping state
  const [showCropper, setShowCropper] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)

  // Agent-specific fields
  const [licenseNumber, setLicenseNumber] = useState('')
  const [agency, setAgency] = useState('')
  const [city, setCity] = useState('')
  const [yearsExperience, setYearsExperience] = useState('0')
  const [state, setState] = useState('')
  const [specialty, setSpecialty] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Determine button text based on user type
  const getSubmitButtonText = () => {
    if (isLoading) return 'Processing...'
    return userType === 'agent' ? 'Continue' : 'Create Account'
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhone(formatted)
  }

  const checkImageAspectRatio = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new window.Image()
      const url = URL.createObjectURL(file)

      img.onload = () => {
        URL.revokeObjectURL(url)
        const aspectRatio = img.width / img.height
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

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPEG, PNG, etc.)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    // Check aspect ratio
    const isSquare = await checkImageAspectRatio(file)
    if (!isSquare) {
      toast.error('Please upload a square image (1:1 aspect ratio)')
      return
    }

    // Show cropper instead of directly setting the file
    const reader = new FileReader()
    reader.onloadend = () => {
      const imageDataUrl = reader.result as string
      setImageToCrop(imageDataUrl)
      setShowCropper(true)
    }
    reader.readAsDataURL(file)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCropComplete = (croppedImageBlob: Blob) => {
    // Create a File from the Blob
    const croppedFile = new File([croppedImageBlob], 'avatar.jpg', {
      type: 'image/jpeg',
      lastModified: Date.now(),
    })

    setAvatarFile(croppedFile)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(croppedFile)

    toast.success('Image cropped successfully!')
    setError('')
  }

  const handleBasicInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!name || !password) {
      toast.error('Please fill in all required fields')
      return
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    if (phone && !validatePhoneNumber(phone)) {
      toast.error(
        'Please enter a valid Nigerian phone number (e.g., +2348012345678)'
      )
      return
    }

    // If user type is agent, show agent info step
    if (userType === 'agent') {
      setStep('agent-info')
      toast.info('Please provide your agent information.')
      return
    }

    // For non-agents, proceed with registration
    await submitRegistration()
  }

  const submitRegistration = async () => {
    setIsLoading(true)
    setError('')

    // Show loading toast
    const loadingToast = toast.loading('Creating your account...')

    try {
      // You'll need to import your register function from AuthContext
      // For now, I'll leave this as a placeholder
      // const { register } = useAuth()

      // Create FormData for registration
      const formData = new FormData()
      formData.append('name', name)
      formData.append('email', email)
      formData.append('password', password)
      formData.append('userType', userType)

      if (phone && phone !== '+234') {
        formData.append('phone', phone)
      }

      // Add avatar if selected
      if (avatarFile) {
        formData.append('avatar', avatarFile)
      }

      // Add agent data if userType is agent
      if (userType === 'agent') {
        const agentData = {
          licenseNumber: licenseNumber.trim(),
          agency: agency.trim(),
          city: city.trim(),
          yearsExperience: parseInt(yearsExperience) || 0,
          specialties: specialty ? [specialty] : [],
          languages: ['English'],
          ...(state.trim() && { state: state.trim() }),
          ...(specialty.trim() && { specialty: specialty.trim() }),
        }
        formData.append('agentData', JSON.stringify(agentData))
      }

      console.log('📤 Sending registration with FormData')
      // Uncomment when you have register function available
      // await register(formData)

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast)

      let successMessage =
        'Account created successfully! Welcome to PropSafe Hub.'
      if (userType === 'agent') {
        successMessage =
          'Agent account created successfully! You can now list properties.'
      } else if (userType === 'seller') {
        successMessage =
          'Seller account created! You can now list your properties for sale.'
      } else if (userType === 'buyer') {
        successMessage = 'Buyer account created! Start browsing properties now.'
      }

      toast.success(successMessage, {
        duration: 5000,
        icon: '🎉',
      })

      if (onRegistrationComplete) {
        onRegistrationComplete()
      }
    } catch (error: any) {
      // Dismiss loading toast
      toast.dismiss(loadingToast)

      // Handle specific registration errors
      let errorMessage = 'Registration failed. Please try again.'

      if (error.code === 409) {
        errorMessage =
          'An account with this email already exists. Please sign in instead.'
      } else if (error.code === 400) {
        if (error.message?.includes('password')) {
          errorMessage = 'Password is too weak. Please use a stronger password.'
        } else if (error.message?.includes('email')) {
          errorMessage =
            'Invalid email format. Please check your email address.'
        } else if (error.message?.includes('phone')) {
          errorMessage =
            'Invalid phone number format. Please use Nigerian format (+234XXXXXXXXXX).'
        }
      } else if (error.message?.includes('license')) {
        errorMessage =
          'Invalid license number. Please check your real estate license.'
      }

      toast.error(errorMessage, {
        duration: 5000,
        icon: '❌',
      })

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAgentInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitRegistration()
  }

  // Update the button text in the agent info step as well
  const getAgentSubmitButtonText = () => {
    if (isLoading) return 'Creating Account...'
    return 'Create Agent Account'
  }

  if (step === 'agent-info') {
    return (
      <form onSubmit={handleAgentInfoSubmit} className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">
              Completing agent registration for:
            </span>{' '}
            {name}
          </p>
        </div>

        <AgentRegistrationForm
          agency={agency}
          setAgency={setAgency}
          city={city}
          setCity={setCity}
          yearsExperience={yearsExperience}
          setYearsExperience={setYearsExperience}
          state={state}
          setState={setState}
          specialty={specialty}
          setSpecialty={setSpecialty}
          avatarFile={avatarFile}
          setAvatarFile={setAvatarFile}
          avatarPreview={avatarPreview}
          setAvatarPreview={setAvatarPreview}
          isLoading={isLoading}
          nigerianCities={NIGERIAN_CITIES}
          nigerianStates={NIGERIAN_STATES}
        />

        <div className="flex space-x-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-12 border-gray-300 hover:bg-emerald-50 py-4 text-base font-semibold rounded-xl transition-all duration-200"
            onClick={() => {
              setStep('basic-info')
              toast.info('Returning to registration')
            }}
            disabled={isLoading}
          >
            Back
          </Button>
          <Button
            type="submit"
            className="flex-1 h-12 bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-4 text-base font-semibold rounded-xl transition-all duration-200"
            disabled={isLoading}
          >
            {getAgentSubmitButtonText()}
          </Button>
        </div>

        {/* Image Cropper Modal */}
        {showCropper && imageToCrop && (
          <Portal>
            <ModernImageCropper
              image={imageToCrop}
              onClose={() => {
                setShowCropper(false)
                setImageToCrop(null)
                toast.info('Image cropping cancelled')
              }}
              onCropComplete={handleCropComplete}
              aspectRatio={1}
            />
          </Portal>
        )}
      </form>
    )
  }

  return (
    <>
      <form onSubmit={handleBasicInfoSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
            Full Name *
          </Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            className="mt-1 h-12"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email Address *
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="mt-1 h-12"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
            Phone Number (Optional)
          </Label>
          <div className="relative mt-1">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="+2348012345678"
              className="h-12 pl-10"
              disabled={isLoading}
              maxLength={14}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Format: +234 followed by your 10-digit number
          </p>
        </div>

        <div>
          <Label
            htmlFor="password"
            className="text-sm font-medium text-gray-700"
          >
            Create Password *
          </Label>
          <div className="relative mt-1">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password (min. 8 characters)"
              className="h-12 pr-10"
              required
              minLength={8}
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Password must be at least 8 characters long
          </p>
        </div>

        {/* Avatar Upload Section */}

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            I want to *
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {(['buyer', 'seller', 'agent'] as const).map((type) => (
              <button
                key={type}
                type="button"
                className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                  userType === type
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                }`}
                onClick={() => {
                  setUserType(type)
                  if (type === 'agent') {
                    toast.info('Agent registration is subject to verification')
                  }
                }}
                disabled={isLoading}
              >
                {type === 'buyer' && 'Buy'}
                {type === 'seller' && 'Sell'}
                {type === 'agent' && 'Agent'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex space-x-3 pt-2">
          {showBackButton && (
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-12 border-gray-300 hover:bg-emerald-50 py-4 text-base font-semibold rounded-xl transition-all duration-200"
              onClick={onBack}
              disabled={isLoading}
            >
              Back
            </Button>
          )}
          <Button
            type="submit"
            className={`${showBackButton ? 'flex-1' : 'w-full'} h-12 bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-4 text-base font-semibold rounded-xl transition-all duration-200`}
            disabled={
              isLoading || !name || !email || !password || password.length < 8
            }
          >
            {getSubmitButtonText()}
          </Button>
        </div>
      </form>

      {/* Image Cropper Modal */}
      {showCropper && imageToCrop && (
        <Portal>
          <ModernImageCropper
            image={imageToCrop}
            onClose={() => {
              setShowCropper(false)
              setImageToCrop(null)
              toast.info('Image cropping cancelled')
            }}
            onCropComplete={handleCropComplete}
            aspectRatio={1}
          />
        </Portal>
      )}
    </>
  )
}
