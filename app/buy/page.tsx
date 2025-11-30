// app/buy/page.tsx
'use client'

import { useState } from 'react'
import { Shield, TrendingUp, Users } from 'lucide-react'

import PropertyGrid from '@/components/PropertyGrid'
import SearchFilters from '@/components/SearchFilters'
import { Button } from '@/components/ui/button'

export default function BuyPage() {
  const [showFeatured, setShowFeatured] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-linear-to-r from-emerald-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Find Your Dream Home</h1>
            <p className="text-xl mb-8 opacity-90">
              Discover thousands of properties for sale across Nigeria. From
              luxury villas to affordable apartments, find the perfect place to
              call home.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">10,000+</div>
                <div className="text-blue-100">Properties Listed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">25+</div>
                <div className="text-blue-100">Cities Covered</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">98%</div>
                <div className="text-blue-100">Customer Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Filters Section */}
      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <SearchFilters />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Featured Properties Toggle */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Properties for Sale
            </h2>
            <p className="text-gray-600 mt-2">
              Browse through our curated selection of properties
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              variant={showFeatured ? 'outline' : 'default'}
              onClick={() => setShowFeatured(false)}
              className={
                showFeatured
                  ? 'bg-white text-gray-700'
                  : 'bg-emerald-600 text-white'
              }
            >
              All Properties
            </Button>
            <Button
              variant={showFeatured ? 'default' : 'outline'}
              onClick={() => setShowFeatured(true)}
              className={
                showFeatured
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-700'
              }
            >
              Featured Only
            </Button>
          </div>
        </div>

        {/* Property Grid */}
        <PropertyGrid
          initialStatus="for-sale"
          showFilters={false} // Filters are already shown above
        />
      </div>

      {/* Why Choose Us Section */}
      <div className="bg-white border-t">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Buy with PropSafeHub?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make finding and buying your dream home simple, secure, and
              stress-free.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Verified Properties
              </h3>
              <p className="text-gray-600">
                Every property is thoroughly verified to ensure accurate
                listings and protect your investment.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Market Insights
              </h3>
              <p className="text-gray-600">
                Get real-time market data and pricing trends to make informed
                buying decisions.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Expert Support
              </h3>
              <p className="text-gray-600">
                Connect with trusted real estate agents and get professional
                guidance throughout your journey.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-emerald-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Find Your Dream Home?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of happy homeowners who found their perfect
              property through PropSafeHub.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-emerald-600 hover:bg-gray-100"
              >
                Browse All Properties
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-blue-700"
              >
                Contact an Agent
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
