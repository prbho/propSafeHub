// app/(auth)/register/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
import { AlertCircle, ArrowLeft, Eye, EyeOff, Phone } from 'lucide-react'
import { toast } from 'sonner'

import { AgentRegistrationForm } from '@/components/auth/AgentRegistrationForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type RegistrationStep = 'email' | 'register' | 'agent-info'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<RegistrationStep>('email')
  const [email, setEmail] = useState('')
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
  const [error, setError] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // Agent-specific fields
  const [agency, setAgency] = useState('')
  const [city, setCity] = useState('')
  const [yearsExperience, setYearsExperience] = useState('0')
  const [state, setState] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [isAgentFormValid, setIsAgentFormValid] = useState(false)

  const { register, checkEmail } = useAuth()

  // Check for email in URL params (if coming from somewhere else)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const emailParam = params.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [])

  const resetForm = () => {
    setStep('email')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setName('')
    setPhone('+234')
    setUserType('buyer')
    setError('')
    setShowPassword(false)
    setShowConfirmPassword(false)
    setAvatarFile(null)
    setAvatarPreview(null)

    // Reset agent fields
    setAgency('')
    setCity('')
    setYearsExperience('0')
    setState('')
    setSpecialty('')
    setIsAgentFormValid(false)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhone(formatted)
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

        toast.error(
          'An account with this email already exists. Please sign in instead.'
        )
        router.push('/login')
        return
      }

      // Email doesn't exist, proceed to registration
      setStep('register')
      toast.info('Please complete your registration.')
    } catch {
      // If check fails, still allow registration but warn
      toast.warning(
        'Unable to verify email. You can still proceed with registration.'
      )
      setStep('register')
      setError('')
      setTimeout(() => {
        setError('')
      }, 3000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
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

    // Validate password match
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
        'Account created successfully! Please check your email to verify your account.'
      if (userType === 'agent') {
        successMessage =
          'Agent account created successfully! Please check your email to verify your account.'
      } else if (userType === 'seller') {
        successMessage =
          'Seller account created! Please check your email to verify your account.'
      } else if (userType === 'buyer') {
        successMessage =
          'Buyer account created! Please check your email to verify your account.'
      }

      toast.success(successMessage, {
        duration: 5000,
        icon: '🎉',
      })

      // Redirect to success page
      router.push('/success?type=registration')
    } catch (error: any) {
      // Dismiss loading toast
      toast.dismiss(loadingToast)

      // Handle specific registration errors
      let errorMessage = 'Registration failed. Please try again.'

      if (error.code === 409) {
        errorMessage =
          'An account with this email already exists. Please sign in instead.'
        router.push('/login')
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

    // Re-validate passwords on agent info submit as well
    if (password !== confirmPassword) {
      toast.error('Passwords do not match. Please check your passwords')
      return
    }

    // Agent-specific validation
    const agentError = validateAgentData(agency, city)
    if (agentError) {
      toast.error(agentError)
      setError(agentError)
      return
    }

    await submitRegistration()
  }

  const renderEmailStep = () => (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Create an Account
        </h2>
      </div>
      <div className="bg-white py-8 px-6 shadow rounded-lg">
        <form onSubmit={handleEmailSubmit} className="space-y-6">
          <div>
            <Label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
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

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full h-12 bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-4 text-base font-semibold rounded-xl transition-all duration-200"
              disabled={isLoading || !email}
            >
              {isLoading ? 'Checking...' : 'Continue'}
            </Button>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-emerald-600 hover:text-emerald-500"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </>
  )

  const renderRegisterStep = () => (
    <>
      <div className="flex items-center mb-6">
        <button
          type="button"
          onClick={() => setStep('email')}
          className="text-emerald-500 w-6 h-6 text-center justify-items-center cursor-pointer hover:text-emerald-900 rounded-full items-center bg-emerald-100"
          disabled={isLoading}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 text-center flex-1">
          Complete Registration
        </h2>
      </div>
      <div className="bg-white py-8 px-6 shadow rounded-lg">
        <form onSubmit={handleRegister} className="space-y-6">
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
            <Label
              htmlFor="phone"
              className="text-sm font-medium text-gray-700"
            >
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
              <p className="text-xs text-red-500 mt-1">
                Passwords do not match
              </p>
            )}
            {password && confirmPassword && password === confirmPassword && (
              <p className="text-xs text-green-500 mt-1">Passwords match ✓</p>
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
                      toast.info(
                        'Agent registration is subject to verification'
                      )
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

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full h-12 bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-4 text-base font-semibold rounded-xl transition-all duration-200"
              disabled={
                isLoading ||
                !name ||
                !password ||
                !confirmPassword ||
                password.length < 8 ||
                password !== confirmPassword
              }
            >
              Continue
            </Button>
          </div>
        </form>
      </div>
    </>
  )

  const renderAgentInfoStep = () => (
    <form onSubmit={handleAgentInfoSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">
            Completing agent registration for:
          </span>{' '}
          {name}
        </p>
      </div>

      <div className="bg-white py-8 px-6 shadow rounded-lg">
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
          onFormValidityChange={setIsAgentFormValid}
        />

        <div className="pt-2">
          <Button
            type="submit"
            className="w-full h-12 bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-4 text-base font-semibold rounded-xl transition-all duration-200"
            disabled={isLoading || !isAgentFormValid}
          >
            {isLoading ? 'Creating Account...' : 'Create Agent Account'}
          </Button>
        </div>
      </div>
    </form>
  )

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Registration Card */}
        <div>
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start">
              <AlertCircle className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Render current step */}
          {step === 'email' && renderEmailStep()}
          {step === 'register' && renderRegisterStep()}
          {step === 'agent-info' && renderAgentInfoStep()}
        </div>

        {/* Terms and Conditions */}
        <p className="text-xs text-gray-500 text-center mt-6">
          By creating an account, you agree to our{' '}
          <Link
            href="/terms"
            className="text-emerald-600 hover:text-emerald-700"
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            href="/privacy"
            className="text-emerald-600 hover:text-emerald-700"
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}
