// app/properties/post/page.tsx
'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import PropertyPostForm from '@/components/agents/PropertyPostForm'

export default function PostPropertyPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 mb-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/agent/dashboard"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                List Your Property
              </h1>
              <p className="text-gray-600 max-w-2xl">
                Reach thousands of potential buyers and tenants on Nigeria&aposs
                fastest growing real estate platform.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content - Form */}
          <div className="flex-1">
            <div className="rounded-2xl overflow-hidden">
              {/* Form Container */}
              <div>
                <PropertyPostForm />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 space-y-6 ">
            {/* Success Tips */}
            <div className=" bg-emerald-50 rounded-2xl border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
                Tips for a Successful Listing
              </h2>
              <div className="grid gap-6">
                <div className="text-center p-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📸</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    High-Quality Photos
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Use clear, well-lit photos from different angles to showcase
                    your property.
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📝</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Detailed Description
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Be specific about features, location advantages, and unique
                    selling points.
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💰</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Competitive Pricing
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Research similar properties in your area to set a
                    competitive price.
                  </p>
                </div>
              </div>
            </div>

            {/* Support Card */}
            <div className="bg-linear-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white sticky top-24">
              <h3 className="font-semibold mb-2">Need Help?</h3>
              <p className="text-green-100 text-sm mb-4">
                Our support team is here to help you with your listing.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-300 rounded-full" />
                  <span>Live chat support</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-300 rounded-full" />
                  <span>Phone: +234 800 000 0000</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-300 rounded-full" />
                  <span>Email: support@propsafehub.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
