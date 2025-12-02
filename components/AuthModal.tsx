// components/AuthModal.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useRef, useState } from 'react'
// Import our new components and utilities
import {
  NIGERIAN_CITIES,
  NIGERIAN_STATES,
} from '@/constants/nigerian-locations'
import { useAuth } from '@/contexts/AuthContext'
import {
  formatPhoneNumber,
  validateAgentData,
  validateEmail,
  validatePhoneNumber,
} from '@/utils/auth-validations'
import { AlertCircle, Eye, EyeOff, LockIcon, Phone } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { AgentRegistrationForm } from './auth/AgentRegistrationForm'
import ModernImageCropper from './ModernImageCropper'
import Portal from './Portal'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

type AuthStep = 'initial' | 'email' | 'password' | 'register' | 'agent-info'

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [step, setStep] = useState<AuthStep>('initial')
  const [email, setEmail] = useState('')
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

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Agent-specific fields
  const [licenseNumber, setLicenseNumber] = useState('')
  const [agency, setAgency] = useState('')
  const [city, setCity] = useState('')
  const [yearsExperience, setYearsExperience] = useState('0')
  const [state, setState] = useState('')
  const [specialty, setSpecialty] = useState('')

  const { login, register, checkEmail } = useAuth()

  const resetForm = () => {
    setStep('initial')
    setEmail('')
    setPassword('')
    setName('')
    setPhone('+234')
    setUserType('buyer')
    setError('')
    setShowPassword(false)
    setAvatarFile(null)
    setAvatarPreview('')
    setShowCropper(false)
    setImageToCrop(null)

    // Reset agent fields
    setLicenseNumber('')
    setAgency('')
    setCity('')
    setYearsExperience('0')
    setState('')
    setSpecialty('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhone(formatted)
  }
  const checkImageAspectRatio = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image()
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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Show cropper instead of directly setting the file
    const reader = new FileReader()
    reader.onloadend = () => {
      const imageDataUrl = reader.result as string
      setImageToCrop(imageDataUrl)
      setShowCropper(true)
    }
    reader.readAsDataURL(file)

    // Reset file input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle cropped image
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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await checkEmail(email)

      if (result.exists) {
        if (result.user && !result.user.isActive) {
          toast.error(
            'This account has been deactivated. Please contact support.'
          )
          return
        }

        setStep('password')
        toast.info('Email verified! Please enter your password.')
      } else {
        setStep('register')
        toast.info('New user detected. Please complete registration.')
      }
    } catch {
      setStep('register')
      toast.warning(
        'Unable to verify email. You can still proceed with registration.'
      )
      setTimeout(() => {
        setError('')
      }, 3000)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) {
      toast.error('Please enter your password')
      return
    }

    setIsLoading(true)
    setError('')

    // Show loading toast
    const loadingToast = toast.loading('Signing you in...')

    try {
      await login({ email, password })

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast)
      toast.success('Welcome back! Successfully signed in.', {
        duration: 3000,
        icon: '✅',
      })

      handleClose()
    } catch (error: any) {
      // Dismiss loading toast
      toast.dismiss(loadingToast)

      // Handle specific Appwrite errors
      let errorMessage = 'Failed to sign in. Please try again.'

      if (error.code === 400) {
        errorMessage = 'Invalid email or password. Please try again.'
      } else if (error.code === 401) {
        errorMessage =
          'Invalid credentials. Please check your email and password.'
      } else if (error.code === 429) {
        errorMessage = 'Too many attempts. Please try again later.'
      } else if (error.message?.includes('password')) {
        errorMessage = 'Incorrect password. Please try again.'
      } else if (error.message?.includes('email')) {
        errorMessage = 'Email not found. Please check your email address.'
      }

      toast.error(errorMessage, {
        duration: 5000,
        icon: '❌',
      })

      // Clear password field on error
      setPassword('')
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
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
      // Create FormData for registration (supports file upload)
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
      await register(formData)

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

      handleClose()
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

    // Agent-specific validation
    const agentError = validateAgentData(licenseNumber, agency, city)
    if (agentError) {
      toast.error(agentError)
      setError(agentError)
      return
    }

    await submitRegistration()
  }

  const getStepTitle = () => {
    switch (step) {
      case 'initial':
        return 'Welcome to PropSafe Hub'
      case 'email':
        return 'Sign in or create an account'
      case 'password':
        return 'Enter your password'
      case 'register':
        return 'Create your account'
      case 'agent-info':
        return 'Agent Information'
      default:
        return 'Welcome to PropSafe Hub'
    }
  }

  // Add avatar upload section to register step
  // Update the renderAvatarUpload function in AuthModal:

  // In AuthModal.tsx, update the renderAvatarUpload function:

  // Render functions for each step
  const renderInitialStep = () => (
    <div className="space-y-4">
      <p className="text-gray-600 text-center mb-6">
        Sign in to save properties, get personalized recommendations, and more.
      </p>

      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          className="w-full h-12 hover:text-emerald-50 cursor-pointer border-gray-300 bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-4 text-base font-semibold rounded-xl transition-all duration-200"
          onClick={() => setStep('email')}
          disabled={isLoading}
        >
          Continue with Email
        </Button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  )

  const renderEmailStep = () => (
    <form onSubmit={handleEmailSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email Address
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

      <div className="flex space-x-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1 h-12 border-gray-300 cursor-pointer hover:bg-emerald-50 py-4 text-base font-semibold rounded-xl transition-all duration-200"
          onClick={() => setStep('initial')}
          disabled={isLoading}
        >
          Back
        </Button>
        <Button
          type="submit"
          className="flex-1 disabled:cursor-alias hover:cursor-pointer h-12 bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-4 text-base font-semibold rounded-xl transition-all duration-200"
          disabled={isLoading || !email}
        >
          {isLoading ? 'Checking...' : 'Continue'}
        </Button>
      </div>
    </form>
  )

  const renderPasswordStep = () => (
    <form onSubmit={handlePasswordSubmit} className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Signing in as:</span> {email}
        </p>
      </div>

      <div>
        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
          Password
        </Label>
        <div className="relative mt-1">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="h-12 pr-10"
            required
            disabled={isLoading}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => {
              setShowPassword(!showPassword)
              toast.info(showPassword ? 'Password hidden' : 'Password visible')
            }}
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          <button
            type="button"
            className="text-slate-700 hover:text-blue-700 hover:underline flex gap-2 items-center justify-end"
            onClick={() => toast.info('Password reset feature coming soon!')}
          >
            <LockIcon className="w-4 h-4" />
            <span>Forgot password?</span>
          </button>
        </p>
      </div>

      <div className="flex space-x-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => setStep('email')}
          disabled={isLoading}
        >
          Back
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          disabled={isLoading || !password}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </div>
    </form>
  )

  const renderRegisterStep = () => (
    <form onSubmit={handleRegister} className="space-y-4">
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
        <Label
          htmlFor="email-display"
          className="text-sm font-medium text-gray-700"
        >
          Email Address
        </Label>
        <Input
          id="email-display"
          type="email"
          value={email}
          className="mt-1 h-12 bg-gray-50"
          disabled
        />
        <p className="text-xs text-gray-500 mt-1">
          This email will be used for your account
        </p>
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
        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
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
            onClick={() => {
              setShowPassword(!showPassword)
              toast.info(showPassword ? 'Password hidden' : 'Password visible')
            }}
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
        <Button
          type="button"
          variant="outline"
          className="flex-1 h-12 border-gray-300 hover:bg-emerald-50 py-4 text-base font-semibold rounded-xl transition-all duration-200"
          onClick={() => setStep('email')}
          disabled={isLoading}
        >
          Back
        </Button>
        <Button
          type="submit"
          className="flex-1 h-12 bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-4 text-base font-semibold rounded-xl transition-all duration-200"
          disabled={isLoading || !name || !password || password.length < 8}
        >
          Continue
        </Button>
      </div>
    </form>
  )

  // AgentRegistrationForm section:

  const renderAgentInfoStep = () => (
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
            setStep('register')
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
            isLoading || !licenseNumber.trim() || !agency.trim() || !city.trim()
          }
        >
          {isLoading ? 'Creating Account...' : 'Create Agent Account'}
        </Button>
      </div>
    </form>
  )

  const renderStepContent = () => {
    switch (step) {
      case 'initial':
        return renderInitialStep()
      case 'email':
        return renderEmailStep()
      case 'password':
        return renderPasswordStep()
      case 'register':
        return renderRegisterStep()
      case 'agent-info':
        return renderAgentInfoStep()
      default:
        return null
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md p-0 gap-0 bg-white rounded-2xl overflow-hidden">
          {/* Header */}
          <DialogHeader className="flex flex-row items-center justify-between py-4 px-6 border-b">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {getStepTitle()}
            </DialogTitle>
          </DialogHeader>

          {/* Content */}
          <div className="p-6">
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start">
                <AlertCircle className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {renderStepContent()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
