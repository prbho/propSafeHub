'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Property } from '@/types'
import {
  Bath,
  Bed,
  Check,
  ChevronLeft,
  Home,
  MapPin,
  Share2,
  Square,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

import MoreDetails from './properties/MoreDetails'
import PropertySidebar from './properties/PropertySidebar'
import PropertyFavoriteButton from './PropertyFavoriteButton'

interface PropertyDetailsProps {
  property: Property
}

export default function PropertyDetails({ property }: PropertyDetailsProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const { user } = useAuth() // Add this to get the user

  const formatPrice = (price: number, unit: string) => {
    const formatter = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    })

    const formattedPrice = formatter.format(price)

    switch (unit) {
      case 'monthly':
        return `${formattedPrice}/mo`
      case 'yearly':
        return `${formattedPrice}/yr`
      default:
        return formattedPrice
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: property.description,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.error('Link copied to clipboard!')
    }
  }

  const mainImage =
    property.images[activeImageIndex] || '/placeholder-property.jpg'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button className="p-2 border hover:bg-gray-100 bg-transparent rounded-lg transition-colors">
                <Link href="/properties">
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </Link>
              </Button>
              <span className="text-lg text-ellipsis lg:text-2xl font-bold text-gray-900">
                {property.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Share2 className="h-5 w-5 text-gray-600" />
              </button>
              <PropertyFavoriteButton
                property={property}
                userId={user?.$id} // Pass the user ID as prop
                size="md"
              />{' '}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
              <div className="relative aspect-16/10 bg-white">
                <Image
                  src={mainImage}
                  alt={property.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  {property.isFeatured && (
                    <span className="bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg">
                      Featured
                    </span>
                  )}
                  {property.isVerified && (
                    <span className="bg-emerald-600 border border-emerald-300 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Image Thumbnails */}
              {property.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto p-4">
                  {property.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        activeImageIndex === index
                          ? 'border-emerald-500 shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${property.title} - Image ${index + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title and Location */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                {property.title}
              </h1>
              <div className="flex items-start text-gray-600">
                <MapPin className="h-5 w-5 mr-2 mt-0.5 shrink-0 text-emerald-600" />
                <span>
                  {property.address}, {property.neighborhood}, {property.city},{' '}
                  {property.state}
                </span>
              </div>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Bed className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {property.bedrooms}
                </div>
                <div className="text-sm text-gray-600 mt-1">Bedrooms</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Bath className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {property.bathrooms}
                </div>
                <div className="text-sm text-gray-600 mt-1">Bathrooms</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Square className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {property.squareFeet.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 mt-1">Sq Ft</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Home className="h-5 w-5 text-orange-600" />
                </div>
                <div className="text-lg font-bold text-gray-900 capitalize">
                  {property.propertyType}
                </div>
                <div className="text-sm text-gray-600 mt-1">Type</div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                About This Property
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {property.description}
              </p>
            </div>

            <MoreDetails property={property} />

            {/* Features & Amenities */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Features */}
                {property.features.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <div className="w-1 h-6 bg-emerald-500 rounded-full mr-3"></div>
                      Features
                    </h3>
                    <div className="space-y-3">
                      {property.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center text-gray-700"
                        >
                          <Check className="h-4 w-4 text-emerald-500 mr-3 shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Amenities */}
                {property.amenities.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <div className="w-1 h-6 bg-emerald-600 rounded-full mr-3"></div>
                      Amenities
                    </h3>
                    <div className="space-y-3">
                      {property.amenities.map((amenity, index) => (
                        <div
                          key={index}
                          className="flex items-center text-gray-700"
                        >
                          <Check className="h-4 w-4 text-emerald-600 mr-3 shrink-0" />
                          {amenity}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Location Details
              </h2>
              <div className="space-y-3 text-gray-700 mb-5">
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-3 mt-1 shrink-0 text-emerald-600" />
                  <span>{property.address}</span>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-3 mt-1 shrink-0 text-emerald-600" />
                  <span>
                    {property.neighborhood}, {property.city}, {property.state}
                  </span>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-3 mt-1 shrink-0 text-emerald-600" />
                  <span>
                    {property.zipCode}, {property.country}
                  </span>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                <div className="text-center text-gray-500">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MapPin className="h-6 w-6 text-emerald-600" />
                  </div>
                  <p className="font-medium">Interactive Map</p>
                  <p className="text-sm mt-1">
                    Map view will be displayed here
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div
            className="lg:sticky lg:top-24 space-y-6"
            style={{ height: 'fit-content' }}
          >
            {/* Price Card */}
            <PropertySidebar property={property} />
          </div>
        </div>
      </div>
    </div>
  )
}
