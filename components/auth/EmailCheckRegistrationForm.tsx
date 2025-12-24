// components/auth/EmailCheckRegistrationForm.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useRef, useState } from 'react'
import {
  NIGERIAN_CITIES,
  NIGERIAN_STATES,
} from '@/constants/nigerian-locations'
import {
  formatPhoneNumber,
  validatePhoneNumber,
} from '@/utils/auth-validations'
import { Check, Eye, EyeOff, Phone, X } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import ModernImageCropper from '../ModernImageCropper'
import Portal from '../Portal'
import { MainAgentRegistrationForm } from './MainAgentRegistrationForm'

interface EmailCheckRegistrationFormProps {
  initialEmail?: string
  onRegistrationComplete?: () => void
  onBack?: () => void
  showBackButton?: boolean
}

type RegistrationStep = 'basic-info' | 'agent-info'

export function EmailCheckRegistrationForm({
  initialEmail = '',
  onRegistrationComplete,
  onBack,
  showBackButton = true,
}: EmailCheckRegistrationFormProps) {
  const [step, setStep] = useState<RegistrationStep>('basic-info')
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('+234')
  const [userType, setUserType] = useState<'buyer' | 'seller' | 'agent'>(
    'buyer'
  )
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [emailValidated, setEmailValidated] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // Cropping state
  const [showCropper, setShowCropper] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)

  // Agent-specific fields
  const [agency, setAgency] = useState('')
  const [city, setCity] = useState('')
  const [yearsExperience, setYearsExperience] = useState('0')
  const [state, setState] = useState('')
  const [specialty, setSpecialty] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Direct Appwrite email check
  const checkEmailExistsInAppwrite = async (
    emailToCheck: string
  ): Promise<boolean> => {
    try {
      // Try to create a document in a temporary collection or check user existence
      // Since Appwrite doesn't have direct email check API, we can try to list users with this email

      // IMPORTANT: This requires proper setup in your Appwrite project
      // You need to:
      // 1. Create a users collection
      // 2. Ensure email is indexed and searchable
      // 3. Set proper permissions

      // Alternative approach: Try to create account and handle the error
      // But that would create the account prematurely

      // Let's use a more reliable approach with a dedicated users database
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailToCheck }),
      })

      if (!response.ok) {
        throw new Error('Failed to check email')
      }

      const data = await response.json()
      return data.exists === true
    } catch (error) {
      console.error('Error checking email in Appwrite:', error)
      return false
    }
  }

  // Enhanced email validation with debouncing
  useEffect(() => {
    if (!email) {
      setEmailError('')
      setEmailValidated(false)
      return
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address')
      setEmailValidated(false)
      return
    }

    setEmailError('')

    // Debounce the API call
    const timer = setTimeout(async () => {
      setIsCheckingEmail(true)
      try {
        const exists = await checkEmailExistsInAppwrite(email)
        setIsCheckingEmail(false)

        if (exists) {
          setEmailError(
            'An account with this email already exists. Please sign in instead.'
          )
          setEmailValidated(false)
        } else {
          setEmailError('')
          setEmailValidated(true)
        }
      } catch (error) {
        setIsCheckingEmail(false)
        setEmailError('Unable to verify email. Please try again.')
        setEmailValidated(false)
      }
    }, 800) // 800ms debounce to reduce API calls

    return () => clearTimeout(timer)
  }, [email])

  // Create a reliable email check function for form submission
  const validateEmailBeforeSubmit = async (): Promise<boolean> => {
    if (!email) {
      toast.error('Email is required')
      return false
    }

    // Basic format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address')
      return false
    }

    // Show loading while checking
    const checkToast = toast.loading('Verifying email availability...')

    try {
      const exists = await checkEmailExistsInAppwrite(email)
      toast.dismiss(checkToast)

      if (exists) {
        toast.error(
          'An account with this email already exists. Please sign in instead.'
        )
        return false
      }

      return true
    } catch (error) {
      toast.dismiss(checkToast)
      toast.error('Unable to verify email. Please try again.')
      return false
    }
  }

  // Single form submission handler for ALL steps
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!name || !password || !confirmPassword) {
      toast.error('Please fill in all required fields')
      return
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match. Please re-enter your password')
      return
    }

    if (phone && !validatePhoneNumber(phone)) {
      toast.error(
        'Please enter a valid Nigerian phone number (e.g., +2348012345678)'
      )
      return
    }

    // 🎯 CRITICAL: Force email check BEFORE anything else
    const isEmailValid = await validateEmailBeforeSubmit()
    if (!isEmailValid) {
      return // STOP HERE if email check fails
    }

    // Now check step logic
    if (userType === 'agent' && step === 'basic-info') {
      setStep('agent-info')
      toast.info('Please provide your agent information.')
      return
    }

    // Agent validation
    if (userType === 'agent' && step === 'agent-info') {
      if (!agency.trim() || !city.trim()) {
        toast.error('Please fill in all required agent fields')
        return
      }
    }

    // Submit registration
    await submitRegistration()
  }

  // Determine button text based on step and user type
  const getSubmitButtonText = () => {
    if (isLoading) return 'Processing...'

    if (step === 'agent-info') {
      return 'Create Agent Account'
    }

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
  }

  const submitRegistration = async () => {
    setIsLoading(true)

    // Show loading toast
    const loadingToast = toast.loading('Creating your account...')

    try {
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
          agency: agency.trim(),
          city: city.trim(),
          yearsExperience: parseInt(yearsExperience) || 0,
          specialties: specialty ? [specialty] : [],
          languages: ['English'],
          ...(state.trim() && { state: state.trim() }),
        }
        formData.append('agentData', JSON.stringify(agentData))
      }

      console.log('📤 Sending registration with FormData')

      // Send to your API endpoint
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Registration failed')
      }

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

      if (error.message?.includes('already exists') || error.code === 409) {
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
    } finally {
      setIsLoading(false)
    }
  }

  // Render different content based on step
  if (step === 'agent-info') {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">
              Completing agent registration for:
            </span>{' '}
            {name}
          </p>
        </div>

        <MainAgentRegistrationForm
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
            disabled={
              isLoading ||
              !agency.trim() ||
              !city.trim() ||
              !!emailError ||
              !emailValidated
            }
          >
            {getSubmitButtonText()}
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
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="relative">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (emailError) setEmailError('')
              }}
              placeholder="Enter your email address"
              className={`mt-1 h-12 ${emailError ? 'border-red-300 focus:border-red-500' : emailValidated ? 'border-green-300 focus:border-green-500' : ''}`}
              required
              disabled={isLoading || isCheckingEmail}
            />
            {isCheckingEmail && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
              </div>
            )}
            {emailValidated && !isCheckingEmail && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                <Check className="h-4 w-4" />
              </div>
            )}
            {emailError && !isCheckingEmail && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                <X className="h-4 w-4" />
              </div>
            )}
          </div>

          {/* Email status messages */}
          <div className="mt-1 min-h-[20px]">
            {isCheckingEmail && (
              <p className="text-xs text-gray-500 animate-pulse">
                Checking email availability...
              </p>
            )}
            {emailError && !isCheckingEmail && (
              <p className="text-xs text-red-500">{emailError}</p>
            )}
            {emailValidated && !emailError && !isCheckingEmail && (
              <p className="text-xs text-green-500 flex items-center">
                <Check className="h-3 w-3 mr-1" /> Email is available
              </p>
            )}
            {!email && (
              <p className="text-xs text-gray-500">Enter your email address</p>
            )}
          </div>
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

        {/* Add Confirm Password Field */}
        <div>
          <Label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-gray-700"
          >
            Confirm Password *
          </Label>
          <div className="relative mt-1">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className="h-12 pr-10"
              required
              minLength={8}
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {password && confirmPassword && password !== confirmPassword && (
            <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
          )}
          {password && confirmPassword && password === confirmPassword && (
            <p className="text-xs text-green-500 mt-1 flex items-center">
              <Check className="h-3 w-3 mr-1" /> Passwords match
            </p>
          )}
        </div>

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
              isLoading ||
              !name ||
              !email ||
              !password ||
              !confirmPassword ||
              password.length < 8 ||
              password !== confirmPassword ||
              !!emailError || // Can't click if email has error
              !emailValidated || // Can't click if email not validated
              isCheckingEmail || // Can't click while checking
              (userType === 'agent' && (!emailValidated || !!emailError)) // Extra check for agents
            }
          >
            {getSubmitButtonText()}
          </Button>
        </div>
      </form>
    </>
  )
}
