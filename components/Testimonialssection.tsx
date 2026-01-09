'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react'

interface Testimonial {
  id: number
  name: string
  role: string
  location: string
  content: string
  rating: number
  date: string
  image: string
  propertyType?: string
  investmentAmount?: string
  roi?: string
  verified?: boolean
}

interface TestimonialsSectionProps {
  className?: string
}

export default function TestimonialsSection({
  className = '',
}: TestimonialsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Adebayo Johnson',
      role: 'Tech Entrepreneur',
      location: 'Lagos, Nigeria',
      content:
        'PropSafe Hub completely changed how I invest in real estate. The verification process gave me confidence to purchase a property in Lekki Phase 1. Their due diligence saved me from a fraudulent transaction!',
      rating: 5,
      date: '2024-02-15',
      image: '/testimonials/adebayo.png',
      propertyType: 'Luxury Apartment',
      investmentAmount: '₦85,000,000',
      roi: '28% in 18 months',
      verified: true,
    },
    {
      id: 2,
      name: 'Chiamaka Okoro',
      role: 'Diaspora Investor',
      location: 'London, UK',
      content:
        'As someone living abroad, I was always nervous about investing in Nigeria. PropSafe Hub handled everything - virtual tours, document verification, and secure payment. My duplex in Abuja is now yielding excellent rental income.',
      rating: 5,
      date: '2024-01-20',
      image: '/testimonials/chiamaka.png',
      propertyType: 'Duplex',
      investmentAmount: '₦120,000,000',
      roi: '32% annual yield',
      verified: true,
    },
    {
      id: 3,
      name: 'Emeka Nwankwo',
      role: 'Business Owner',
      location: 'Port Harcourt',
      content:
        'The PropSafe Score™ system is brilliant. I compared multiple properties and chose one with a 92% safety score. Their advisory team helped me structure the investment for maximum returns. Zero regrets!',
      rating: 5,
      date: '2024-03-10',
      image: '/testimonials/nwankwo.png',
      propertyType: 'Commercial Property',
      investmentAmount: '₦200,000,000',
      roi: '35% projected',
      verified: true,
    },
    {
      id: 4,
      name: 'Fatima Bello',
      role: 'Medical Doctor',
      location: 'Kaduna, Nigeria',
      content:
        'I used their verification service for a plot of land I wanted to buy. They discovered encumbrances that would have cost me millions. Their integrity is unmatched in the Nigerian real estate market.',
      rating: 5,
      date: '2024-02-28',
      image: '/testimonials/fatima.png',
      propertyType: 'Serviced Plot',
      investmentAmount: '₦25,000,000',
      roi: 'Land value doubled',
      verified: true,
    },
    {
      id: 5,
      name: 'David Chen',
      role: 'International Investor',
      location: 'Hong Kong',
      content:
        'The diaspora services are exceptional. They provided weekly construction updates for my investment property. The escrow service gave me peace of mind. PropSafe Hub makes cross-border investing seamless.',
      rating: 5,
      date: '2024-01-15',
      image: '/testimonials/david.png',
      propertyType: 'Luxury Villa',
      investmentAmount: '₦180,000,000',
      roi: '40% in 2 years',
      verified: true,
    },
  ]

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    )
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <section
      className={`py-20 bg-linear-to-b from-white to-slate-50 ${className}`}
    >
      <div className="mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 rounded-full mb-6">
            <Quote className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Trusted by Investors Nationwide
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Real stories from our community of satisfied investors and property
            owners
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Testimonial Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl transition-all duration-300 overflow-hidden border border-gray-100">
              <div className="p-8">
                {/* Quote Icon */}
                <Quote className="w-12 h-12 text-emerald-100 mb-6" />

                {/* Content */}
                <p className="text-gray-700 text-lg leading-relaxed mb-8 italic">
                  &quot;{currentTestimonial.content}&quot;
                </p>

                {/* Divider */}
                <div className="border-t border-gray-100 pt-8">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className="relative">
                        <div className="relative w-14 h-14 rounded-full overflow-hidden mr-4 border-2 border-emerald-100">
                          <Image
                            src={currentTestimonial.image}
                            alt={currentTestimonial.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        {currentTestimonial.verified && (
                          <div className="absolute -bottom-1 right-3 bg-emerald-500 text-white rounded-full p-1">
                            <div className="w-4 h-4 flex items-center justify-center">
                              <span className="text-xs font-bold">✓</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">
                          {currentTestimonial.name}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          {currentTestimonial.role}
                        </p>
                        <div className="flex items-center mt-1">
                          <span className="text-gray-500 text-xs">
                            {currentTestimonial.location}
                          </span>
                          <span className="mx-2 text-gray-300">•</span>
                          <span className="text-gray-500 text-xs">
                            {new Date(
                              currentTestimonial.date
                            ).toLocaleDateString('en-US', {
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center bg-emerald-50 px-3 py-2 rounded-lg">
                      <div className="flex items-center mr-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < currentTestimonial.rating
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold text-emerald-700">
                        5.0
                      </span>
                    </div>
                  </div>
                </div>

                {/* Investment Details */}
                {(currentTestimonial.propertyType ||
                  currentTestimonial.investmentAmount ||
                  currentTestimonial.roi) && (
                  <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                    <div className="grid grid-cols-3 gap-4">
                      {currentTestimonial.propertyType && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Property Type
                          </p>
                          <p className="font-semibold text-gray-900">
                            {currentTestimonial.propertyType}
                          </p>
                        </div>
                      )}
                      {currentTestimonial.investmentAmount && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Investment
                          </p>
                          <p className="font-semibold text-gray-900">
                            {currentTestimonial.investmentAmount}
                          </p>
                        </div>
                      )}
                      {currentTestimonial.roi && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            ROI / Value Growth
                          </p>
                          <p className="font-semibold text-emerald-600">
                            {currentTestimonial.roi}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Controls */}
          </div>

          {/* Sidebar - Testimonial Stats & Highlights */}
          <div className="space-y-9">
            {/* Stats Card */}
            <div className="bg-linear-to-br from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white">
              <h3 className="text-xl font-bold mb-4">Investor Satisfaction</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-emerald-100">
                      Verified Properties
                    </span>
                    <span className="font-bold">15,000+</span>
                  </div>
                  <div className="w-full bg-emerald-500/30 rounded-full h-2">
                    <div className="bg-white rounded-full h-2 w-4/5"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-emerald-100">Average ROI</span>
                    <span className="font-bold">28.5%</span>
                  </div>
                  <div className="w-full bg-emerald-500/30 rounded-full h-2">
                    <div className="bg-white rounded-full h-2 w-3/4"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-emerald-100">Satisfaction Rate</span>
                    <span className="font-bold">98%</span>
                  </div>
                  <div className="w-full bg-emerald-500/30 rounded-full h-2">
                    <div className="bg-white rounded-full h-2 w-[98%]"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Card */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
              <div className="text-center pb-6">
                <h4 className="font-bold text-gray-900 mb-2">
                  Share Your Experience
                </h4>
                <p className="text-sm text-gray-600 mb-6">
                  Invested with PropSafe Hub? Share your success story
                </p>
                <Link
                  href="/contact"
                  className="w-full px-20 bg-[#0D2A52]  text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Submit Testimonial
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center mt-8 space-x-4">
          <button
            onClick={prevTestimonial}
            className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-emerald-600 w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextTestimonial}
            className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </section>
  )
}
