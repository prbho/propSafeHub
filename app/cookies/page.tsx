'use client'

import { useState } from 'react'
import {
  CheckCircle,
  Cookie,
  Eye,
  Settings,
  Shield,
  Target,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

export default function CookiePolicyPage() {
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true,
    analytics: true,
    marketing: false,
    personalization: true,
  })

  const cookieTypes = [
    {
      name: 'Essential Cookies',
      description: 'Required for basic site functionality',
      examples: ['Session management', 'Security features', 'Load balancing'],
      necessary: true,
      storage: 'Up to 24 months',
    },
    {
      name: 'Analytics Cookies',
      description: 'Help us understand how visitors interact',
      examples: ['Visitor counts', 'Page views', 'Bounce rates'],
      necessary: false,
      storage: 'Up to 24 months',
    },
    {
      name: 'Marketing Cookies',
      description: 'Used to deliver relevant advertisements',
      examples: ['Retargeting', 'Ad performance', 'Conversion tracking'],
      necessary: false,
      storage: 'Up to 12 months',
    },
    {
      name: 'Personalization Cookies',
      description: 'Remember your preferences and settings',
      examples: ['Language settings', 'Display preferences', 'Saved searches'],
      necessary: false,
      storage: 'Up to 12 months',
    },
  ]

  const handleToggle = (cookieType: string) => {
    setCookiePreferences((prev) => ({
      ...prev,
      [cookieType]: !prev[cookieType as keyof typeof prev],
    }))
  }

  const handleAcceptAll = () => {
    setCookiePreferences({
      essential: true,
      analytics: true,
      marketing: true,
      personalization: true,
    })
  }

  const handleEssentialOnly = () => {
    setCookiePreferences({
      essential: true,
      analytics: false,
      marketing: false,
      personalization: false,
    })
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50">
      {/* Hero */}
      <section className="bg-linear-to-r from-emerald-600 to-emerald-700 text-white py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex p-4 bg-white/10 rounded-2xl mb-6">
              <Cookie className="h-12 w-12" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              Cookie Policy
            </h1>
            <p className="text-xl text-emerald-100">
              Understanding how we use cookies and similar technologies
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-5xl py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                What Are Cookies?
              </h2>
              <div className="prose prose-lg text-gray-700 max-w-none">
                <p>
                  Cookies are small text files that are placed on your device
                  when you visit our website. They help us provide you with a
                  better experience by remembering your preferences,
                  understanding how you use our site, and showing you relevant
                  content.
                </p>
                <p className="mt-4">
                  This policy explains what cookies are, how we use them, the
                  types of cookies we use, and how you can manage your cookie
                  preferences.
                </p>
              </div>
            </section>

            {/* How We Use Cookies */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                How We Use Cookies
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border">
                  <div className="flex items-center gap-3 mb-4">
                    <Settings className="h-6 w-6 text-emerald-600" />
                    <h3 className="font-semibold text-gray-900">
                      Site Functionality
                    </h3>
                  </div>
                  <p className="text-gray-600">
                    Enable basic functions like page navigation and access to
                    secure areas
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl border">
                  <div className="flex items-center gap-3 mb-4">
                    <Eye className="h-6 w-6 text-emerald-600" />
                    <h3 className="font-semibold text-gray-900">Analytics</h3>
                  </div>
                  <p className="text-gray-600">
                    Understand how visitors interact with our platform to
                    improve it
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl border">
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="h-6 w-6 text-emerald-600" />
                    <h3 className="font-semibold text-gray-900">
                      Personalization
                    </h3>
                  </div>
                  <p className="text-gray-600">
                    Remember your preferences to provide a tailored experience
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl border">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="h-6 w-6 text-emerald-600" />
                    <h3 className="font-semibold text-gray-900">Security</h3>
                  </div>
                  <p className="text-gray-600">
                    Protect your account and prevent fraudulent activities
                  </p>
                </div>
              </div>
            </section>

            {/* Cookie Types */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Types of Cookies We Use
              </h2>
              <div className="space-y-6">
                {cookieTypes.map((cookie, idx) => (
                  <div key={idx} className="bg-white rounded-xl border p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {cookie.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {cookie.description}
                        </p>
                        <div className="text-xs text-gray-500">
                          Storage Duration: {cookie.storage}
                          {cookie.necessary && (
                            <span className="ml-2 text-emerald-600">
                              • Always Active
                            </span>
                          )}
                        </div>
                      </div>
                      {!cookie.necessary && (
                        <Switch
                          checked={
                            cookiePreferences[
                              cookie.name
                                .toLowerCase()
                                .split(' ')[0] as keyof typeof cookiePreferences
                            ]
                          }
                          onCheckedChange={() =>
                            handleToggle(
                              cookie.name.toLowerCase().split(' ')[0]
                            )
                          }
                        />
                      )}
                    </div>
                    <div className="mt-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        Examples:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {cookie.examples.map((example, eIdx) => (
                          <span
                            key={eIdx}
                            className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                          >
                            {example}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Third-Party Cookies */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Third-Party Cookies
              </h2>
              <div className="prose prose-lg text-gray-700 max-w-none">
                <p>
                  We may also use cookies from trusted third-party services such
                  as:
                </p>
                <ul className="mt-4 space-y-2">
                  <li>
                    <strong>Google Analytics:</strong> For website traffic
                    analysis
                  </li>
                  <li>
                    <strong>Facebook Pixel:</strong> For marketing and
                    advertising insights
                  </li>
                  <li>
                    <strong>Payment Processors:</strong> For secure transaction
                    processing
                  </li>
                  <li>
                    <strong>Map Services:</strong> For property location
                    displays
                  </li>
                </ul>
                <p className="mt-6">
                  These third-party cookies are subject to the respective
                  privacy policies of these services.
                </p>
              </div>
            </section>

            {/* Managing Cookies */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Managing Your Cookie Preferences
              </h2>
              <div className="bg-white rounded-xl border p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Browser Settings
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Most web browsers allow you to control cookies through
                      their settings. You can usually find these settings in the
                      &quot;Options&quot; or &quot;Preferences&quot; menu.
                    </p>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                        <span>Delete existing cookies</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                        <span>Block future cookies</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                        <span>Set preferences for specific sites</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Our Cookie Manager
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Use the control panel to the right to customize your
                      cookie preferences.
                    </p>
                    <div className="space-y-3">
                      <Button onClick={handleAcceptAll} className="w-full">
                        Accept All Cookies
                      </Button>
                      <Button
                        onClick={handleEssentialOnly}
                        variant="outline"
                        className="w-full"
                      >
                        Essential Cookies Only
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Updates */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Updates to This Policy
              </h2>
              <div className="prose prose-lg text-gray-700 max-w-none">
                <p>
                  We may update this Cookie Policy from time to time to reflect
                  changes in our practices or for other operational, legal, or
                  regulatory reasons.
                </p>
                <p className="mt-4">
                  We encourage you to review this policy periodically to stay
                  informed about how we use cookies.
                </p>
              </div>
              {/* Contact Info */}
              <div className="mt-8 bg-emerald-50 border border-emerald-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Questions About Cookies?
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  If you have any questions about our use of cookies, please
                  contact us:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Cookie className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">
                      Email: privacy@propsafehub.com
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">
                      Subject: Cookie Policy Inquiry
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar - Cookie Preferences */}
          <div className="lg:col-span-1">
            <div className="top-24 sticky bg-white rounded-2xl border shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Cookie Preferences
              </h3>

              <div className="space-y-3 mb-8">
                {Object.entries(cookiePreferences).map(([key, value]) => {
                  const cookieType = cookieTypes.find(
                    (c) => c.name.toLowerCase().split(' ')[0] === key
                  )
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium text-gray-900">
                          {cookieType?.name ||
                            key.charAt(0).toUpperCase() + key.slice(1)}
                        </div>
                        {/* <div className="text-sm text-gray-500">
                          {cookieType?.description || 'Cookie type description'}
                        </div> */}
                      </div>
                      <Switch
                        checked={value}
                        onCheckedChange={() => handleToggle(key)}
                        disabled={key === 'essential'}
                      />
                    </div>
                  )
                })}
              </div>

              <div className="space-y-4">
                <Button
                  onClick={handleAcceptAll}
                  className="w-full bg-[#0D2A52] hover:bg-[#061c3a]"
                >
                  Save Preferences
                </Button>
                <Button
                  onClick={handleEssentialOnly}
                  variant="outline"
                  className="w-full"
                >
                  Reset to Default
                </Button>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Your Current Settings
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Essential Cookies
                    </span>
                    <span
                      className={`text-sm font-medium ${cookiePreferences.essential ? 'text-emerald-600' : 'text-red-600'}`}
                    >
                      {cookiePreferences.essential ? 'Allowed' : 'Blocked'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Analytics Cookies
                    </span>
                    <span
                      className={`text-sm font-medium ${cookiePreferences.analytics ? 'text-emerald-600' : 'text-red-600'}`}
                    >
                      {cookiePreferences.analytics ? 'Allowed' : 'Blocked'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Marketing Cookies
                    </span>
                    <span
                      className={`text-sm font-medium ${cookiePreferences.marketing ? 'text-emerald-600' : 'text-red-600'}`}
                    >
                      {cookiePreferences.marketing ? 'Allowed' : 'Blocked'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Personalization Cookies
                    </span>
                    <span
                      className={`text-sm font-medium ${cookiePreferences.personalization ? 'text-emerald-600' : 'text-red-600'}`}
                    >
                      {cookiePreferences.personalization
                        ? 'Allowed'
                        : 'Blocked'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
