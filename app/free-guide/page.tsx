'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { countries } from '@/types/country'
import { Check, Search, X } from 'lucide-react'

import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export default function LandingPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    intent: [] as string[],
  })
  const [countrySearch, setCountrySearch] = useState('')
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Ref for the country input container
  const countryContainerRef = useRef<HTMLDivElement>(null)

  // Filter countries based on search input
  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase())
  )

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        countryContainerRef.current &&
        !countryContainerRef.current.contains(event.target as Node)
      ) {
        setShowCountryDropdown(false)
        // If no country was selected, clear the search and form country
        if (countrySearch && !form.country) {
          setCountrySearch('')
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [countrySearch, form.country])

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleCountrySelect = (countryName: string) => {
    setForm({ ...form, country: countryName })
    setCountrySearch(countryName)
    setShowCountryDropdown(false)
  }

  const handleCountryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCountrySearch(value)
    setShowCountryDropdown(true)

    // Clear the form country if the user is typing something new
    if (value !== form.country) {
      setForm({ ...form, country: '' })
    }

    // If input is empty, clear the country
    if (value === '') {
      setForm({ ...form, country: '' })
    }
  }

  const handleIntentChange = (value: string) => {
    setForm((prev) => {
      const exists = prev.intent.includes(value)
      return {
        ...prev,
        intent: exists
          ? prev.intent.filter((i) => i !== value)
          : [...prev.intent, value],
      }
    })
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    // Validate that country is selected
    if (!form.country) {
      setMessage('Please select a country from the dropdown')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong')
      }

      const firstName = form.name.split(' ')[0]
      router.push(
        `/thank-you?name=${encodeURIComponent(firstName)}&intent=${form.intent.join(',')}&country=${form.country}`
      )
    } catch (error) {
      console.error('Submission error:', error)
      setMessage('Failed to submit. Please try again.')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-black px-4 py-10">
      <div className="max-w-2xl mx-auto">
        {/* Hero */}
        <h1 className="text-3xl font-bold text-center">
          Avoid Property Scams in Nigeria — Even From Abroad
        </h1>
        <p className="text-center mt-3 text-gray-600">
          Get our free guide + access to verified listings so you never lose
          money.
        </p>

        {/* Benefits */}
        <div className="mt-6 text-sm bg-emerald-50 text-gray-800 rounded-2xl p-6 flex flex-col border border-emerald-100">
          <span className="flex gap-2 item-center">
            <Check className="h-4 w-4 text-emerald-600" /> Learn how to verify
            any property
          </span>
          <span className="flex gap-2 item-center">
            <Check className="h-4 w-4 text-emerald-600" /> Spot scam red flags
            instantly
          </span>
          <span className="flex gap-2 item-center">
            <Check className="h-4 w-4 text-emerald-600" /> Access verified
            listings
          </span>
          <span className="flex gap-2 item-center item-center">
            <Check className="h-4 w-4 text-emerald-600" /> Buy safely from
            anywhere
          </span>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-6 bg-white space-y-6 rounded-2xl p-6 flex flex-col border border-neutral-300 transition-all duration-300"
        >
          <h2 className="text-lg font-bold text-stone-700">
            Get Your Free Property Safety Guide
          </h2>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="form-name">Name</FieldLabel>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Full Name"
                required
                onChange={handleChange}
                className="border-stone-300 shadow-none"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="form-email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Your email address"
                required
                onChange={handleChange}
                className="border-stone-300 shadow-none"
              />
              <FieldDescription className="text-xs mt-0 text-emerald-600">
                We&apos;ll never share your email with anyone.
              </FieldDescription>
            </Field>
            <div className="grid md:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="phone">Phone (WhatsApp)</FieldLabel>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  onChange={handleChange}
                  className="border-stone-300 shadow-none"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="country">Country</FieldLabel>
                <div className="relative" ref={countryContainerRef}>
                  <div className="relative">
                    <Input
                      id="country"
                      name="country"
                      type="text"
                      placeholder="Start typing your country..."
                      value={countrySearch}
                      onChange={handleCountryInputChange}
                      onFocus={() => setShowCountryDropdown(true)}
                      className="border-stone-300 shadow-none pr-8"
                      autoComplete="off"
                      required
                    />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>

                  {showCountryDropdown && filteredCountries.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-stone-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {filteredCountries.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => handleCountrySelect(country.name)}
                          className="w-full text-left px-4 py-2 hover:bg-stone-50 transition-colors focus:bg-stone-50 focus:outline-none"
                        >
                          {country.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {showCountryDropdown &&
                    countrySearch &&
                    filteredCountries.length === 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-stone-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
                        No countries found
                      </div>
                    )}
                </div>
              </Field>
            </div>

            <FieldSet>
              <FieldLegend variant="label">
                What best describes your interest?
              </FieldLegend>
              <FieldDescription>Select all that apply.</FieldDescription>

              <FieldGroup className="gap-3">
                <Field orientation="horizontal">
                  <Checkbox
                    id="personal-use"
                    onCheckedChange={() =>
                      handleIntentChange('Buying for personal use')
                    }
                  />
                  <FieldLabel htmlFor="personal-use" className="font-normal">
                    Buying for personal use
                  </FieldLabel>
                </Field>

                <Field orientation="horizontal">
                  <Checkbox
                    id="property-investment"
                    onCheckedChange={() =>
                      handleIntentChange('Property investment')
                    }
                  />
                  <FieldLabel
                    htmlFor="property-investment"
                    className="font-normal"
                  >
                    Property investment
                  </FieldLabel>
                </Field>

                <Field orientation="horizontal">
                  <Checkbox
                    id="just-researching"
                    onCheckedChange={() =>
                      handleIntentChange('Just researching')
                    }
                  />
                  <FieldLabel
                    htmlFor="just-researching"
                    className="font-normal"
                  >
                    Just researching
                  </FieldLabel>
                </Field>
              </FieldGroup>
            </FieldSet>
            <FieldSeparator />
          </FieldGroup>

          <button
            className={`w-full bg-[#0D2A52] hover:bg-[#061c3a] text-white py-3 mt-auto font-semibold rounded-lg h-11 text-sm transition-all duration-200 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Get Free Guide'}
          </button>

          <p className="text-xs text-gray-500">
            🔒 No spam. Your information is safe.
          </p>

          {message && (
            <p
              className={`text-sm mt-2 ${
                message.includes('please select')
                  ? 'text-red-600'
                  : 'text-green-600'
              }`}
            >
              {message}
            </p>
          )}
        </form>

        {/* Trust */}
        <div className="mt-10 text-sm p-4 bg-slate-50 rounded-xl text-gray-600">
          <h3 className="font-semibold text-lg text-gray-800">
            Why People Lose Money
          </h3>
          <span className="flex gap-2 items-center">
            <X className="w-4 h-4 text-red-500" /> No verification
          </span>
          <span className="flex gap-2 items-center">
            {' '}
            <X className="w-4 h-4 text-red-500" /> Wrong agents
          </span>
          <span className="flex gap-2 items-center">
            {' '}
            <X className="w-4 h-4 text-red-500" /> No inspection
          </span>
        </div>
      </div>
    </div>
  )
}
