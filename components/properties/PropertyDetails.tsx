// components/properties/PropertyDetails.tsx
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
  PlayCircle, // Add this import
  Share2,
  Square,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

import PropertyFavoriteButton from '../PropertyFavoriteButton'
import MoreDetails from './MoreDetails'
import PropertySidebar from './PropertySidebar'

interface PropertyDetailsProps {
  property: Property
}

// Helper function to extract YouTube video ID from URL
const getYouTubeVideoId = (url: string) => {
  if (!url) return null

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/watch\?.*&v=)([^#\&\?]*).*/,
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && (match[1]?.length === 11 || match[2]?.length === 11)) {
      return match[1] || match[2]
    }
  }

  return null
}

// Helper function to get YouTube embed URL
const getYouTubeEmbedUrl = (url: string) => {
  const videoId = getYouTubeVideoId(url)
  if (videoId) {
    // Use youtube-nocookie.com for privacy-enhanced mode
    return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=0`
  }
  return null
}

// Helper function to get YouTube thumbnail
const getYouTubeThumbnail = (url: string) => {
  const videoId = getYouTubeVideoId(url)
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  }
  return null
}

export default function PropertyDetails({ property }: PropertyDetailsProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [showVideo, setShowVideo] = useState(false)
  const { user } = useAuth()

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: property.title,
          text: property.description,
          url: window.location.href,
        })
        toast.success('Shared successfully!')
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Link copied to clipboard!')
      }
    } catch (error) {
      console.log('Error sharing:', error)
    }
  }

  const mainImage =
    property.images[activeImageIndex] || '/placeholder-property.jpg'

  const youtubeEmbedUrl = property.youtubeUrl
    ? getYouTubeEmbedUrl(property.youtubeUrl)
    : null
  const youtubeThumbnail = property.youtubeUrl
    ? getYouTubeThumbnail(property.youtubeUrl)
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" asChild>
                <Link href="/properties">
                  <ChevronLeft className="h-5 w-5" />
                </Link>
              </Button>
              <span className="text-lg text-ellipsis lg:text-2xl font-bold text-gray-900">
                {property.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
              <PropertyFavoriteButton
                property={property}
                userId={user?.$id}
                size="md"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery with Video Option */}
            <div className="bg-white rounded-xl overflow-hidden border border-white-200">
              {!showVideo ? (
                <>
                  <div className="relative aspect-16/10 bg-white-100">
                    <Image
                      src={mainImage}
                      alt={property.title}
                      fill
                      className="object-cover"
                      priority
                    />

                    {/* YouTube Video Button - Show if property has YouTube URL */}
                    {youtubeEmbedUrl && (
                      <button
                        onClick={() => setShowVideo(true)}
                        className="absolute inset-0 w-full h-full group flex items-center justify-center"
                      >
                        <div className="relative">
                          {/* Play button overlay */}
                          <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl transform transition-transform group-hover:scale-110">
                            <PlayCircle className="w-12 h-12 text-white fill-white" />
                          </div>
                          <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-white font-medium bg-black/50 px-3 py-1 rounded-full text-sm whitespace-nowrap">
                            Watch Video Tour
                          </span>
                        </div>
                      </button>
                    )}

                    <div className="absolute top-4 left-4 flex gap-2">
                      {property.isFeatured && (
                        <span className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg">
                          Featured
                        </span>
                      )}
                      {property.isVerified && (
                        <span className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Image Thumbnails */}
                  {property.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto p-4 bg-white-50">
                      {property.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setActiveImageIndex(index)
                            setShowVideo(false)
                          }}
                          className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            activeImageIndex === index && !showVideo
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

                      {/* YouTube thumbnail in thumbnails */}
                      {youtubeThumbnail && (
                        <button
                          onClick={() => setShowVideo(true)}
                          className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all relative ${
                            showVideo
                              ? 'border-red-500 shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Image
                            src={youtubeThumbnail}
                            alt="Video tour"
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to medium quality thumbnail
                              const videoId = getYouTubeVideoId(
                                property.youtubeUrl || ''
                              )
                              if (videoId) {
                                e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
                              }
                            }}
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <PlayCircle className="w-8 h-8 text-white" />
                          </div>
                        </button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                // Video Player
                <div className="relative aspect-16/10 bg-black">
                  {youtubeEmbedUrl && (
                    <iframe
                      src={youtubeEmbedUrl}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}

                  {/* Close video button */}
                  <button
                    onClick={() => setShowVideo(false)}
                    className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors z-10"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
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
                <div className="text-sm text-gray-600 mt-1">m²</div>
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
          <div className="space-y-6">
            <PropertySidebar property={property} />
          </div>
        </div>
      </div>
    </div>
  )
}
