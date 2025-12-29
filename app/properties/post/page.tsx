// app/properties/post/page.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { ChevronUp, HelpCircle, MessageSquare, Phone, Zap } from 'lucide-react'
import { toast } from 'sonner'

import PropertyPostForm from '@/components/agents/PropertyPostForm'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function PostPropertyPage() {
  const { user, isLoading } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const mainContentRef = useRef<HTMLDivElement>(null)

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

  // Handle scroll for sticky sidebar and scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Progress calculation (you can make this dynamic based on form completion)
  const [formProgress, setFormProgress] = useState(0)

  // Simulate form progress - in real app, update this based on actual form completion
  useEffect(() => {
    // This is a placeholder - you should update progress based on actual form fields
    const timer = setTimeout(() => {
      setFormProgress(25) // Starting progress
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">
      {/* Header Navigation - Fixed */}
      <div
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-lg shadow-lg py-2'
            : 'bg-white/80 backdrop-blur-md border-b py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Avatar className="h-10 w-10 rounded-md">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-600 text-sm">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span className="font-semibold text-slate-900 block text-sm capitalize">
                    Property {user?.userType}
                  </span>
                  <span className="text-sm text-slate-500">
                    {user?.name || user?.email}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex"
                asChild
              >
                <Link href="#" className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>Help</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Section */}
        <div className="mb-8 lg:mb-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                    List Your Property
                  </h1>
                  <p className="text-gray-600 max-w-3xl">
                    Reach thousands of potential buyers and tenants on
                    Nigeria&apos;s fastest growing real estate platform
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="grid grid-cols-1 lg:grid-cols-4 gap-8"
          ref={mainContentRef}
        >
          {/* Main Content - Form */}
          <div className="lg:col-span-3">
            <div className="relative">
              {/* Form Container with subtle background */}
              <div className="overflow-hidden">
                <div>
                  <PropertyPostForm />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Sticky for desktop */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Success Tips */}
              <Card className="border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="px-6 py-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-linear-to-br from-emerald-100 to-green-100 rounded-xl">
                      <Zap className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Listing Tips</h3>
                      <p className="text-xs text-gray-500">
                        Boost your listing
                      </p>
                    </div>
                  </div>
                  <div className="space-y-5">
                    <div className="flex gap-3 group">
                      <div>
                        <div className="flex gap-3 group">
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">
                            High-Quality Photos
                          </h4>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          Properties with professional photos get 3x more views.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 group">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">
                          Detailed Description
                        </h4>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          Complete descriptions increase inquiries by 47%.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 group">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">
                          Competitive Pricing
                        </h4>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          Correctly priced homes sell 32% faster.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Support Card */}
              <Card className="border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-linear-to-br from-emerald-50 to-green-50">
                <CardContent className="px-6 py-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-linear-to-br from-emerald-100 to-green-100 rounded-xl">
                      <MessageSquare className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Need Help?</h3>
                      <p className="text-xs text-gray-500">
                        We&apos;re here for you
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                    Our support team is ready to help you create the perfect
                    listing.
                  </p>
                  <div className="space-y-3">
                    <Button
                      variant="default"
                      className="w-full justify-start bg-emerald-600 hover:bg-emerald-700"
                      asChild
                    >
                      <Link href="/contact" className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Contact Support
                      </Link>
                    </Button>
                  </div>
                  <div className=" pt-6 border-emerald-200">
                    <p className="text-xs text-emerald-700 font-medium">
                      Available Mon - Fri, 8AM - 6PM WAT
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-3 bg-white border border-slate-200 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-5 h-5 text-slate-700" />
        </button>
      )}

      {/* Bottom Banner */}
      <div className="mt-12 bg-linear-to-r from-emerald-600 to-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold mb-2">
                Ready to reach more buyers?
              </h3>
              <p className="text-emerald-100">
                Premium listings get 5x more visibility and priority placement.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                className="bg-gray-900 hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all"
                asChild
              >
                <Link href={`/profile/${user?.userType}/${user?.$id}`}>
                  Upgrade to Premium
                </Link>
              </Button>
              <Button
                variant="outline"
                className="bg-white/10 text-white hover:bg-white/20 border-white/30"
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
