// app/list-property/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import {
  ArrowRight,
  ChevronRight,
  Home,
  Key,
  Shield,
  Star,
  Users,
} from 'lucide-react'

import PropertyGrid from '@/components/PropertyGrid'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function ListPropertyPage() {
  const [selectedType, setSelectedType] = useState<'sale' | 'rent' | null>(null)
  const { user } = useAuth()

  // If user has selected a type, show the PropertyGrid with filtered properties
  if (selectedType) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Properties for {selectedType === 'sale' ? 'Sale' : 'Rent'}
                </h1>
                <p className="text-gray-600 mt-1">
                  Browse available properties or list your own
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                className="border-gray-300 hover:bg-gray-50"
              >
                <Link href="/list-property">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Back to Options
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Property Grid */}
        <div className="container mx-auto px-4 py-8">
          <PropertyGrid
            initialStatus={selectedType === 'sale' ? 'for-sale' : 'for-rent'}
            showFilters={true}
          />
        </div>
      </div>
    )
  }

  // Main listing choice page
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-linear-to-br from-slate-900 via-slate-800 to-emerald-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>

        <div className="container mx-auto px-4 py-16 lg:py-20 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-4">
              List Your Property
            </h1>
            <p className="md:text-lg text-gray-300 leading-relaxed">
              Connect with qualified buyers and tenants across Nigeria
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 lg:py-16">
        {/* Listing Options Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto mb-12">
          {/* For Sale Option */}
          <Card className="border border-gray-200 hover:border-emerald-200 hover:shadow-xl transition-all group overflow-hidden">
            <CardContent className="p-8">
              <div className="w-16 h-16 mx-auto bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-100 transition-colors">
                <Home className="h-8 w-8 text-emerald-600" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                Sell Your Property
              </h3>

              <p className="text-gray-600 mb-6 leading-relaxed text-center">
                List your property for sale and reach thousands of serious
                buyers with our advanced matching system.
              </p>

              <div className="space-y-3 mb-8 pb-8 text-center">
                <div className="flex items-center gap-3 text-sm text-gray-700 justify-center">
                  <div className="w-6 h-6 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
                    <Star className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <span>Reach qualified buyers instantly</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700 justify-center">
                  <div className="w-6 h-6 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
                    <Shield className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <span>Secure transaction process</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700 justify-center">
                  <div className="w-6 h-6 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
                    <Users className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <span>Professional agent network</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  asChild
                  onClick={() => setSelectedType('sale')}
                  className="w-full cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white py-6 font-semibold"
                  size="lg"
                >
                  <Link href="/properties?type=buy">
                    Browse Properties for Sale
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full py-6 border-gray-300 hover:bg-gray-50"
                  size="lg"
                >
                  <Link
                    href={
                      user?.userType === 'agent'
                        ? '/properties/post'
                        : '/list-property/sale'
                    }
                  >
                    {user?.userType === 'agent'
                      ? 'Post Property for Sale'
                      : 'List Your Property for Sale'}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* For Rent Option */}
          <Card className="border border-gray-200 hover:border-blue-200 hover:shadow-xl transition-all group overflow-hidden">
            <CardContent className="p-8">
              <div className="w-16 h-16 mx-auto bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                <Key className="h-8 w-8 text-emerald-600" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                Rent Your Property
              </h3>

              <p className="text-gray-600 mb-6 leading-relaxed text-center">
                List your rental property and find reliable tenants quickly with
                our tenant screening and management tools.
              </p>

              <div className="space-y-3 mb-8 pb-8 border-b border-gray-100">
                <div className="flex items-center gap-3 text-sm text-gray-700 justify-center">
                  <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                    <Star className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <span>Find qualified tenants in days</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700 justify-center">
                  <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                    <Shield className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <span>Tenant screening included</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700 justify-center">
                  <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                    <Users className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <span>Rental management tools</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  asChild
                  onClick={() => setSelectedType('rent')}
                  className="w-full bg-emerald-600 cursor-pointer hover:bg-emerald-700 text-white py-6 font-semibold"
                  size="lg"
                >
                  <Link href="/properties?type=rent">
                    Browse Properties for Rent
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full py-6 border-gray-300 hover:bg-gray-50"
                  size="lg"
                >
                  <Link href="/list-property/rent">
                    List Your Property for Rent
                  </Link>
                </Button>

                {/* <Button
                  asChild
                  variant="outline"
                  className="w-full py-6 border-gray-300 hover:bg-gray-50"
                  size="lg"
                >
                  <Link
                    href={
                      user?.userType === 'agent'
                        ? '/properties/post'
                        : '/list-property/sale'
                    }
                  >
                    {user?.userType === 'agent'
                      ? 'Post Property for Sale'
                      : 'List Your Property for Sale'}
                  </Link>
                </Button> */}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="max-w-5xl mx-auto">
          <Card className="border border-gray-200 bg-linear-to-br from-gray-50 to-white">
            <CardContent className="p-8 lg:p-12">
              <div className="text-center mb-10">
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                  Why List with PropSafeHub?
                </h3>
                <p className="text-gray-600">
                  Everything you need to successfully list and manage your
                  property
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2 text-lg">
                    Maximum Exposure
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Your property reaches thousands of active buyers and tenants
                    across Nigeria
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Star className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2 text-lg">
                    Professional Tools
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Advanced listing management, analytics, and marketing tools
                    at your fingertips
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2 text-lg">
                    Secure Process
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Safe transactions with verified users and professional
                    support throughout
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
