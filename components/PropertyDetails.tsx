'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Property } from '@/types'
import {
  Bath,
  Bed,
  Calendar,
  Check,
  CheckCircle2Icon,
  ChevronLeft,
  Clock,
  Home,
  Key,
  MapPin,
  Moon,
  PlayCircle,
  Share2,
  Shield,
  Square,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

import MoreDetails from './properties/MoreDetails'
import PropertyMap from './properties/PropertyMap'
import PropertySidebar from './properties/PropertySidebar'
import PropertyFavoriteButton from './PropertyFavoriteButton'
import { SimpleHtmlDisplay } from './ui/SimpleHtmlDisplay'

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
    return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=0`
  }
  return null
}

// Helper function to get YouTube thumbnail with fallback
const getYouTubeThumbnail = (
  url: string,
  quality: 'maxresdefault' | 'mqdefault' | 'hqdefault' = 'mqdefault'
) => {
  const videoId = getYouTubeVideoId(url)
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`
  }
  return null
}

export default function PropertyDetails({ property }: PropertyDetailsProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [showVideo, setShowVideo] = useState(false)
  const [thumbnailError, setThumbnailError] = useState(false)
  const { user } = useAuth()

  const isShortLet = property.status === 'short-let'

  // Debug for YouTube URL
  useEffect(() => {
    console.log('🎥 YouTube URL:', property.youtubeUrl)
    if (property.youtubeUrl) {
      console.log('🎬 Video ID:', getYouTubeVideoId(property.youtubeUrl))
    }
  }, [property.youtubeUrl])

  const formatPrice = (price: number, unit: string) => {
    const formatter = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    })

    const formattedPrice = formatter.format(price)

    switch (unit) {
      case 'daily':
        return `${formattedPrice}/night`
      case 'weekly':
        return `${formattedPrice}/week`
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
      toast.success('Link copied to clipboard!')
    }
  }

  const mainImage =
    property.images[activeImageIndex] || '/placeholder-property.jpg'

  const youtubeEmbedUrl = property.youtubeUrl
    ? getYouTubeEmbedUrl(property.youtubeUrl)
    : null

  // Get thumbnail with fallback logic
  const getVideoThumbnail = () => {
    if (!property.youtubeUrl) return null

    if (thumbnailError) {
      // If maxresdefault failed, try mqdefault
      return getYouTubeThumbnail(property.youtubeUrl, 'mqdefault')
    }
    // Try maxresdefault first
    return getYouTubeThumbnail(property.youtubeUrl, 'maxresdefault')
  }

  const youtubeThumbnail = getVideoThumbnail()

  const formatAppwriteTime = (dateTime: string | undefined): string => {
    if (!dateTime) return ''

    try {
      const date = new Date(dateTime)
      const hours = date.getUTCHours().toString().padStart(2, '0')
      const minutes = date.getUTCMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    } catch (error) {
      console.error('Error formatting Appwrite time:', error)
      return ''
    }
  }

  // Helper function to get status badge
  const getStatusBadge = () => {
    switch (property.status) {
      case 'for-sale':
        return (
          <span className="bg-red-600 text-red-50 border border-red-700 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg">
            For Sale
          </span>
        )
      case 'for-rent':
        return (
          <span className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg flex items-center gap-1">
            <Key className="h-3 w-3" />
            For Rent
          </span>
        )
      case 'short-let':
        return (
          <span className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg flex items-center gap-1">
            <Moon className="h-3 w-3" />
            Short-Let
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="hover:bg-gray-100"
                asChild
              >
                <Link href="/properties">
                  <ChevronLeft className="h-5 w-5" />
                </Link>
              </Button>
              <span className="text-lg truncate lg:text-2xl font-bold text-gray-900">
                {property.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Share property"
              >
                <Share2 className="h-5 w-5 text-gray-600" />
              </button>
              <PropertyFavoriteButton
                property={property}
                userId={user?.$id}
                size="md"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery with Video Option */}
            <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
              {!showVideo ? (
                <>
                  <div className="relative aspect-16/10 bg-white">
                    <Image
                      src={mainImage}
                      alt={property.title}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                    />

                    {/* YouTube Video Button - Bottom Right Position */}
                    {youtubeEmbedUrl && (
                      <button
                        onClick={() => setShowVideo(true)}
                        className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-lg transition-all shadow-lg group"
                      >
                        <PlayCircle className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">Watch Video</span>
                      </button>
                    )}

                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                      {getStatusBadge()}
                      {property.isFeatured && (
                        <span className="bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg">
                          Featured
                        </span>
                      )}
                      {property.isVerified && (
                        <span className="bg-emerald-600 border border-emerald-700 text-emerald-50 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Verified
                        </span>
                      )}
                      {/* Short-Let Specific Badges */}
                      {isShortLet && property.instantBooking && (
                        <span className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Instant Book
                        </span>
                      )}
                      {isShortLet && property.minimumStay && (
                        <span className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Min {property.minimumStay} night
                          {property.minimumStay > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Image and Video Thumbnails */}
                  {(property.images.length > 1 || youtubeThumbnail) && (
                    <div className="flex gap-2 overflow-x-auto p-4">
                      {/* Image Thumbnails */}
                      {property.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setActiveImageIndex(index)
                            setShowVideo(false)
                          }}
                          className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            activeImageIndex === index && !showVideo
                              ? isShortLet
                                ? 'border-purple-500 shadow-md'
                                : 'border-emerald-500 shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          aria-label={`View image ${index + 1}`}
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

                      {/* YouTube Video Thumbnail with multiple fallbacks */}
                      {youtubeThumbnail && (
                        <button
                          onClick={() => setShowVideo(true)}
                          className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all relative ${
                            showVideo
                              ? 'border-red-500 shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          aria-label="Watch video tour"
                        >
                          <img
                            src={youtubeThumbnail}
                            alt="Video tour thumbnail"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const videoId = getYouTubeVideoId(
                                property.youtubeUrl || ''
                              )
                              const target = e.currentTarget

                              // Chain of fallbacks: maxresdefault -> mqdefault -> hqdefault -> default
                              if (target.src.includes('maxresdefault')) {
                                target.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
                              } else if (target.src.includes('mqdefault')) {
                                target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                              } else if (target.src.includes('hqdefault')) {
                                target.src = `https://img.youtube.com/vi/${videoId}/default.jpg`
                              } else {
                                // If all thumbnails fail, show a placeholder
                                target.src = '/video-placeholder.jpg' // Make sure this exists in your public folder
                              }
                              setThumbnailError(true)
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
                      title={`${property.title} - Video Tour`}
                    />
                  )}

                  {/* Close video button */}
                  <button
                    onClick={() => setShowVideo(false)}
                    className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors z-10"
                    aria-label="Close video"
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

                  {/* Video indicator */}
                  <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg flex items-center gap-1">
                    <PlayCircle className="h-3 w-3" />
                    Video Tour
                  </div>
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
                <span className="text-sm md:text-base">
                  {property.address}, {property.neighborhood}, {property.city},{' '}
                  {property.state}
                </span>
              </div>
            </div>

            {/* SHORT-LET AVAILABILITY SECTION */}
            {isShortLet && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="bg-emerald-50 p-2 rounded-xl mr-2">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                  </span>
                  Availability & Booking
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">
                      Stay Duration
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="text-sm text-purple-700">
                          Minimum Stay
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {property.minimumStay || 1} night
                          {property.minimumStay && property.minimumStay > 1
                            ? 's'
                            : ''}
                        </div>
                      </div>
                      {property.maximumStay && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-700">
                            Maximum Stay
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            {property.maximumStay} nights
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">
                      Check-in/Out Times
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-sm text-green-700">Check-in</div>
                        <div className="text-lg font-bold text-gray-900">
                          {formatAppwriteTime(property.checkInTime) || '14:00'}
                        </div>
                      </div>
                      <div className="p-3 bg-red-50 rounded-lg">
                        <div className="text-sm text-red-700">Check-out</div>
                        <div className="text-lg font-bold text-gray-900">
                          {formatAppwriteTime(property.checkOutTime) || '11:00'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Availability Dates */}
                {(property.availabilityStart || property.availabilityEnd) && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center text-emerald-800 font-medium mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      Availability Period
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {property.availabilityStart && (
                        <div>
                          <div className="text-sm text-gray-600">
                            Available from
                          </div>
                          <div className="font-medium">
                            {new Date(
                              property.availabilityStart
                            ).toLocaleDateString('en-NG', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </div>
                        </div>
                      )}
                      {property.availabilityEnd && (
                        <div>
                          <div className="text-sm text-gray-600">
                            Available until
                          </div>
                          <div className="font-medium">
                            {new Date(
                              property.availabilityEnd
                            ).toLocaleDateString('en-NG', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Cancellation Policy */}
                {property.cancellationPolicy && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center text-gray-800 font-medium mb-2">
                      <Shield className="h-4 w-4 mr-2" />
                      Cancellation Policy:{' '}
                      {property.cancellationPolicy.charAt(0).toUpperCase() +
                        property.cancellationPolicy.slice(1)}
                    </div>
                    <p className="text-sm text-gray-600">
                      {property.cancellationPolicy === 'flexible' &&
                        'Full refund up to 24 hours before check-in'}
                      {property.cancellationPolicy === 'moderate' &&
                        'Full refund up to 5 days before check-in'}
                      {property.cancellationPolicy === 'strict' &&
                        '50% refund up to 7 days before check-in'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Key Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white rounded-xl border border-gray-200 p-5">
              <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Bed className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {property.bedrooms}
                </div>
                <div className="text-sm text-gray-600 mt-1">Bedrooms</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Bath className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {property.bathrooms}
                </div>
                <div className="text-sm text-gray-600 mt-1">Bathrooms</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Square className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {property.squareFeet.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Square meter (m²)
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                  {isShortLet ? (
                    <Moon className="h-5 w-5 text-purple-600" />
                  ) : (
                    <Home className="h-5 w-5 text-orange-600" />
                  )}
                </div>
                <div className="text-lg font-semibold text-gray-900 capitalize">
                  {isShortLet ? 'Short-Let' : property.propertyType}
                </div>
                <div className="text-sm text-gray-600 mt-1">Type</div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                About This {isShortLet ? 'Short-Let' : 'Property'}
              </h3>
              <SimpleHtmlDisplay
                html={property.description}
                emptyMessage={`No description available for this ${isShortLet ? 'short-let' : 'property'}.`}
              />
            </div>

            {/* Title Documents - Only show for non-short-let properties and if titles exist */}
            {property.status !== 'short-let' &&
              property.titles &&
              property.titles.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Title Documents
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {property.titles.map((title, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 border border-emerald-200"
                      >
                        <CheckCircle2Icon className="w-4 h-4 mr-1" />
                        {title}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            <MoreDetails property={property} />

            {/* Features & Amenities */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Features */}
                {property.features.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <div className="w-1 h-6 bg-emerald-500 rounded-full mr-3"></div>
                      {isShortLet ? 'Property Features' : 'Features'}
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

              {/* Short-Let House Rules */}
              {isShortLet &&
                property.houseRules &&
                property.houseRules.length > 0 && (
                  <div className="mt-8 pt-8 border-t">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-purple-600" />
                      House Rules
                    </h3>
                    <div className="space-y-2">
                      {property.houseRules.map((rule, index) => (
                        <div
                          key={index}
                          className="flex items-center text-gray-700"
                        >
                          <Check className="h-4 w-4 text-purple-500 mr-3 shrink-0" />
                          {rule}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Location Details
              </h3>

              <div className="space-y-3 text-gray-700 mb-5">
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-3 mt-1 shrink-0 text-emerald-600" />
                  <span className="font-medium">
                    {property.address || 'Address not specified'}
                  </span>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-3 mt-1 shrink-0 text-emerald-600" />
                  <span>
                    {property.neighborhood && `${property.neighborhood}, `}
                    {property.city}, {property.state}
                  </span>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-3 mt-1 shrink-0 text-emerald-600" />
                  <span>
                    {property.zipCode && `${property.zipCode}, `}
                    {property.country || 'Nigeria'}
                  </span>
                </div>
              </div>

              {/* Map Component */}
              <PropertyMap
                latitude={property.latitude}
                longitude={property.longitude}
                address={property.address}
                city={property.city}
                state={property.state}
                country={property.country}
              />
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
