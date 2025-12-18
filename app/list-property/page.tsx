// app/list-property/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import {
  ArrowRight,
  BadgeCheck,
  Calendar,
  ChevronRight,
  Clock,
  Eye,
  Home,
  Key,
  MapPin,
  Moon,
  Shield,
  Star,
  Tag,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'

import PropertyGrid from '@/components/PropertyGrid'
import { Button } from '@/components/ui/button'

export default function ListPropertyPage() {
  const [selectedType, setSelectedType] = useState<
    'sale' | 'rent' | 'short-let' | null
  >(null)
  const { user } = useAuth()

  // If user has selected a type, show the PropertyGrid with filtered properties
  if (selectedType) {
    return (
      <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Link
                    href="/list-property"
                    className="hover:text-emerald-600 transition-colors"
                  >
                    List Property
                  </Link>
                  <ChevronRight className="h-3 w-3" />
                  <span className="font-medium text-gray-900">
                    Properties for {selectedType === 'sale' ? 'Sale' : 'Rent'}
                  </span>
                </div>
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
                className="border-gray-300 hover:border-emerald-300 hover:bg-emerald-50"
              >
                <Link href="/list-property" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
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
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-linear-to-br from-emerald-900 via-emerald-800 to-emerald-700 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-48 translate-y-48"></div>
        </div>

        <div className="container mx-auto px-4 py-16 lg:py-24 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-emerald-800/30 backdrop-blur-sm border border-emerald-600/30 rounded-full px-4 py-2 mb-6">
              <Zap className="h-4 w-4 text-emerald-300" />
              <span className="text-sm font-medium text-emerald-200">
                Get Your Property Listed Today
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6">
              List Your Property with Confidence
            </h1>
            <p className="md:text-lg text-emerald-100 leading-relaxed mb-8">
              Connect with thousands of qualified buyers and tenants across
              Nigeria. Fast, secure, and hassle-free.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <BadgeCheck className="h-4 w-4 text-emerald-300" />
                <span className="text-sm text-white">Verified Properties</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Shield className="h-4 w-4 text-emerald-300" />
                <span className="text-sm text-white">Secure Transactions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 space-y-20 py-12 lg:py-16">
        {/* How It Works */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Simple steps to get your property listed and connected with
              potential buyers or tenants
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="relative bg-white border p-10 rounded-2xl">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <span className="text-2xl font-bold text-emerald-600">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                List Your Property
              </h3>
              <p className="text-gray-600 text-center">
                Fill out our simple listing form with property details, photos,
                and pricing
              </p>
            </div>

            <div className="relative bg-white border p-10 rounded-2xl">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <span className="text-2xl font-bold text-emerald-600">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                Get Verified
              </h3>
              <p className="text-gray-600 text-center">
                Our team reviews and verifies your listing for maximum trust and
                visibility
              </p>
            </div>

            <div className="relative bg-white border p-10 rounded-2xl">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <span className="text-2xl font-bold text-emerald-600">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                Connect & Close
              </h3>
              <p className="text-gray-600 text-center">
                Receive inquiries, schedule viewings, and close deals with our
                support
              </p>
            </div>
          </div>
        </div>
        <div className="text-center mb-12 max-w-4xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
            Choose Your Listing Type
          </h2>
          <p className="text-gray-600 text-lg">
            Select how you want to list your property. Each option is optimized
            for maximum results in its category.
          </p>

          {/* Optional: Add these benefit badges */}
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              Higher Visibility
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium">
              <Shield className="h-4 w-4" />
              Secure Transactions
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium">
              <BadgeCheck className="h-4 w-4" />
              Verified Users
            </div>
          </div>
        </div>
        {/* Listing Options Grid */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-10 max-w-6xl mx-auto mb-16">
          {/* For Sale Option */}
          <div className="border-gray-100 border rounded-2xl hover:border-emerald-200 group overflow-hidden bg-white">
            <div className="p-8 lg:p-10 relative">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 bg-linear-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Home className="h-7 w-7 text-white" />
                </div>
                <div className="bg-emerald-50 text-emerald-700 text-sm font-medium px-3 py-1 rounded-full">
                  For Sale
                </div>
              </div>

              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">
                Sell Fast, Maximize Value
              </h3>

              <p className="text-gray-600 mb-8 leading-relaxed">
                List your property for sale and reach thousands of serious
                buyers or investors.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Premium Exposure
                    </h4>
                    <p className="text-sm text-gray-600">
                      Featured listings get 3x more views
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <Shield className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Secure Process
                    </h4>
                    <p className="text-sm text-gray-600">
                      Verified buyers & secure transactions
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <Eye className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Virtual Tours
                    </h4>
                    <p className="text-sm text-gray-600">
                      Showcase with 360° virtual tours
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={() => setSelectedType('sale')}
                  className="w-full bg-white text-gray-800 py-6 border-2 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 group"
                  size="lg"
                >
                  <div className="flex items-center justify-center gap-3">
                    Browse Properties for Sale
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full bg-linear-to-r from-emerald-900 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-6 text-sm font-semibold shadow-lg hover:shadow-xl transition-all"
                  size="lg"
                >
                  <Link
                    href={
                      user?.userType === 'agent'
                        ? '/properties/post'
                        : '/list-property/sale'
                    }
                    className="flex items-center justify-center gap-2 hover:text-white"
                  >
                    <Home className="h-5 w-5 text-gray-600 group-hover:text-emerald-600 hover:text-white" />
                    {user?.userType === 'agent'
                      ? 'Post Property for Sale'
                      : 'List Your Property for Sale'}
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* For Rent Option */}
          <div className=" border-gray-100 border hover:border-gray-200 rounded-2xl group overflow-hidden bg-white">
            <div className="p-8 lg:p-10 relative">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 bg-linear-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Key className="h-7 w-7 text-white" />
                </div>
                <div className="bg-blue-50 text-gray-900 text-sm font-medium px-3 py-1 rounded-full">
                  For Rent
                </div>
              </div>

              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">
                Find Perfect Tenants, Fast
              </h3>

              <p className="text-gray-600 mb-8 leading-relaxed">
                Find reliable tenants quickly with our tenant screening, rental
                management tools, and nationwide exposure.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar className="h-4 w-4 text-gary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Quick Placement
                    </h4>
                    <p className="text-sm text-gray-600">
                      Average tenant placement in 7 days
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <BadgeCheck className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Tenant Screening
                    </h4>
                    <p className="text-sm text-gray-600">
                      Background & credit checks included
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Wide Reach
                    </h4>
                    <p className="text-sm text-gray-600">National exposure</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={() => setSelectedType('rent')}
                  className="w-full bg-white text-gray-800 py-6 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 group"
                  size="lg"
                >
                  <div className="flex items-center justify-center gap-3">
                    Browse Properties for Rent
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full bg-linear-to-r from-gray-900 to-gray-700 hover:from-gray-900 hover:to-gray-800 text-white hover:text-white py-6 text-sm font-semibold shadow-lg hover:shadow-xl transition-all"
                  size="lg"
                >
                  <Link
                    href="properties/postt"
                    className="flex items-center justify-center gap-2"
                  >
                    <Key className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
                    List Your Property for Rent
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* ADD THIS: Short-Let Option */}
          <div className="border-gray-100 border rounded-2xl hover:border-purple-200 group overflow-hidden bg-white">
            <div className="p-8 lg:p-10 relative">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 bg-linear-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Moon className="h-7 w-7 text-white" />
                </div>
                <div className="bg-purple-50 text-purple-700 text-sm font-medium px-3 py-1 rounded-full">
                  Short-Let
                </div>
              </div>

              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">
                Earn More with Short-Term Rentals
              </h3>

              <p className="text-gray-600 mb-8 leading-relaxed">
                Rent your property for short stays. Perfect for vacation
                rentals, business trips, or temporary stays.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Flexible Bookings
                    </h4>
                    <p className="text-sm text-gray-600">
                      Daily, weekly, or monthly rentals
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Instant Booking
                    </h4>
                    <p className="text-sm text-gray-600">
                      Get guests can book your property immediately
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <Shield className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Guest Protection
                    </h4>
                    <p className="text-sm text-gray-600">
                      Verified guests & secure payments
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={() => setSelectedType('short-let')}
                  className="w-full bg-white text-gray-800 py-6 border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 group"
                  size="lg"
                >
                  <div className="flex items-center justify-center gap-3">
                    Browse Short-Let Properties
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full bg-linear-to-r from-purple-900 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white hover:text-white py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                  size="lg"
                >
                  <Link
                    href="/properties/post"
                    className="flex items-center justify-center gap-2 text-sm"
                  >
                    <Moon className="h-5 w-5 text-gray-600 group-hover:text-purple-600" />
                    List Your Property for Short-Let
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-6xl mx-auto">
        <div className="border-t border-gray-200 pt-12">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Why Choose PropSafe Hub?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We provide everything you need for a successful property listing
              experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-linear-to-br from-emerald-50 to-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2 text-lg">
                Maximum Exposure
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Reach thousands of active buyers and tenants across Nigeria with
                featured listings
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-linear-to-br from-emerald-50 to-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6 text-emerald-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2 text-lg">
                Verified Platform
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                All listings and users are verified for safety and authenticity
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-linear-to-br from-emerald-50 to-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Tag className="h-6 w-6 text-emerald-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2 text-lg">
                Smart Pricing
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Get real-time market insights and competitive pricing
                recommendations
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 hover:amber-orange-200 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-linear-to-br from-emerald-50 to-amber-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Star className="h-6 w-6 text-emerald-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2 text-lg">
                Premium Support
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Dedicated support team available to help you throughout the
                process
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-12 pt-8 border-t border-gray-200 mb-8">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Ready to Get Started?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Join thousands of property owners who trust PropSafe Hub for
                their real estate needs
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 px-8 border py-6 cursor-pointer"
                  onClick={() => setSelectedType('sale')}
                >
                  Browse Properties
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-8 py-6"
                >
                  <Link href="/contact">Need Help? Contact Us</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
