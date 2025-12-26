// app/properties/post/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import {
  ArrowLeft,
  Camera,
  FileText,
  HelpCircle,
  Home,
  MessageSquare,
  Phone,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'

import PropertyPostForm from '@/components/agents/PropertyPostForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function PostPropertyPage() {
  const { user, isLoading } = useAuth()

  // Check if user is authenticated and is an agent or seller
  useEffect(() => {
    if (!isLoading && user) {
      // Allow both agents and sellers
      if (user.userType !== 'agent' && user.userType !== 'seller') {
        toast.error('Only agents and property sellers can post properties')
        window.location.href = '/'
      }
    } else if (!isLoading && !user) {
      toast.error('Please sign in to post a property')
      window.location.href = '/login'
    }
  }, [user, isLoading])

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">
      {/* Header Navigation */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Link>
              <div className="h-6 w-px bg-slate-200" />
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-emerald-600" />
                <span className="font-medium text-slate-900">
                  List Property
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                  user?.userType === 'agent'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-blue-50 text-blue-700'
                }`}
              >
                <Zap className="w-3 h-3" />
                <span>
                  {user?.userType === 'agent' ? 'Agent Tools' : 'Seller Tools'}
                </span>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/agent/support">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                List Your Property
              </h1>
              <p className="text-gray-600 max-w-3xl">
                Reach thousands of potential buyers and tenants on
                Nigeria&apos;s fastest growing real estate platform. Complete
                the form to get your property listed in minutes.
              </p>
            </div>
            <div className="lg:w-64"></div>
          </div>
        </div>
        {/* Form Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">
                Fill out all required fields to publish your listing
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content - Form */}
          <div className="lg:col-span-3">
            <div className=" overflow-hidden">
              {/* Form Container */}
              <div>
                <PropertyPostForm />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Success Tips */}
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Zap className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Listing Tips</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Camera className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm mb-1">
                        High-Quality Photos
                      </h4>
                      <p className="text-xs text-gray-600">
                        Properties with professional photos get 3x more views.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <FileText className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm mb-1">
                        Detailed Description
                      </h4>
                      <p className="text-xs text-gray-600">
                        Complete descriptions increase inquiries by 47%.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm mb-1">
                        Competitive Pricing
                      </h4>
                      <p className="text-xs text-gray-600">
                        Correctly priced homes sell 32% faster.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support Card */}
            <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-emerald-50 to-green-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Need Help?</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Our support team is here to help you create the perfect
                  listing.
                </p>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/agent/support/chat">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Live Chat Support
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    asChild
                  >
                    <a href="tel:+2348000000000">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Support
                    </a>
                  </Button>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-xs text-gray-500">
                    Available Monday - Friday, 8AM - 6PM WAT
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom Banner */}
      <div className="mt-12 bg-linear-to-r from-emerald-600 to-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold mb-2">
                Ready to reach more buyers?
              </h3>
              <p className="text-blue-100">
                Premium listings get 5x more visibility and priority placement.
              </p>
            </div>
            <div className="flex gap-3">
              <Button className="bg-gray-900 text-white" asChild>
                <Link href={`/profile/${user?.userType}/${user?.$id}`}>
                  Upgrade to Premium
                </Link>
              </Button>
              <Button
                variant="outline"
                className="bg-white/10 text-white hover:bg-white/20"
                asChild
              >
                <Link href={`/profile/${user?.userType}/${user?.$id}`}>
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
