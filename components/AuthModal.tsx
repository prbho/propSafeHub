// components/AuthModal.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { AlertCircle, Eye, EyeOff, Mail, Phone, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

type AuthStep = 'initial' | 'email' | 'password' | 'register'

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

  const { login, register, checkEmail } = useAuth()

  const resetForm = () => {
    setStep('initial')
    setEmail('')
    setPassword('')
    setName('')
    setPhone('+234')
    setError('')
    setShowPassword(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  // Format phone number with +234 prefix
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters except +
    const cleaned = value.replace(/[^\d+]/g, '')

    // Ensure it starts with +234
    if (!cleaned.startsWith('+234')) {
      return '+234' + cleaned.replace(/^\+?234?/, '')
    }

    return cleaned
  }

  // Validate phone number format
  const validatePhoneNumber = (phoneNumber: string) => {
    if (!phoneNumber) return true // Optional field

    const phoneRegex = /^\+234[789][01]\d{8}$/
    return phoneRegex.test(phoneNumber)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhone(formatted)
  }

  // In your AuthModal component
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError('Please enter your email address')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await checkEmail(email)

      if (result.exists) {
        if (result.user && !result.user.isActive) {
          setError('This account has been deactivated. Please contact support.')
          return
        }

        setStep('password')
      } else {
        setStep('register')
      }
    } catch {
      setStep('register')
      setError(
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
      setError('Please enter your password')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await login({ email, password })
      handleClose()
    } catch {
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !password) {
      setError('Please fill in all required fields')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    // Validate phone number if provided
    if (phone && !validatePhoneNumber(phone)) {
      setError(
        'Please enter a valid Nigerian phone number (e.g., +2348012345678)'
      )
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await register({
        name,
        email,
        password,
        phone: phone || undefined,
        userType,
      })
      handleClose()
    } catch {
    } finally {
      setIsLoading(false)
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case 'initial':
        return 'Welcome to PropSafeHub'
      case 'email':
        return 'Sign in or create account'
      case 'password':
        return 'Enter your password'
      case 'register':
        return 'Create your account'
      default:
        return 'Welcome to PropSafeHub'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0 bg-white rounded-2xl overflow-hidden">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between p-6 border-b">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {getStepTitle()}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8 rounded-full hover:bg-gray-100"
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
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

          {/* Initial Step */}
          {step === 'initial' && (
            <div className="space-y-4">
              <p className="text-gray-600 text-center mb-6">
                Sign in to save properties, get personalized recommendations,
                and more.
              </p>

              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 border-gray-300 hover:bg-gray-50"
                  onClick={() => setStep('email')}
                  disabled={isLoading}
                >
                  <Mail className="h-5 w-5 mr-3 text-gray-600" />
                  Continue with Email
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                By continuing, you agree to our Terms of Service and Privacy
                Policy.
              </p>
            </div>
          )}

          {/* Email Step */}
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
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
                  className="flex-1"
                  onClick={() => setStep('initial')}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-blue-700"
                  disabled={isLoading || !email}
                >
                  {isLoading ? 'Checking...' : 'Continue'}
                </Button>
              </div>
            </form>
          )}

          {/* Password Step */}
          {step === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password for {email}
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
                  className="flex-1 bg-emerald-600 hover:bg-blue-700"
                  disabled={isLoading || !password}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </div>
            </form>
          )}

          {/* Register Step */}
          {step === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700"
                >
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
                    maxLength={14} // +2348012345678
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
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400 text-gray-700'
                      }`}
                      onClick={() => setUserType(type)}
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
                  className="flex-1"
                  onClick={() => setStep('email')}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-blue-700"
                  disabled={
                    isLoading || !name || !password || password.length < 8
                  }
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
