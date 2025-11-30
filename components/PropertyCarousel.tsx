'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Property } from '@/types'
import { ArrowRight, ChevronLeft, ChevronRight, Crown, Zap } from 'lucide-react'

import { Button } from '@/components/ui/button'

import PropertyCard from './PropertyCard'

interface PropertyCarouselProps {
  properties: Property[]
  title?: string
  subtitle?: string
  autoPlay?: boolean
  autoPlayInterval?: number
  userId?: string
  showFeaturedBadge?: boolean
  viewAllLink?: string
}

export default function PropertyCarousel({
  properties,
  title = 'Featured Properties',
  subtitle = 'Discover our hand-picked selection of premium properties',
  autoPlay = true,
  autoPlayInterval = 5000,
  userId,
  showFeaturedBadge = true,
  viewAllLink = '/properties',
}: PropertyCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [cardsToShow, setCardsToShow] = useState(4)
  const carouselRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Enhanced responsive card calculation
  const getCardsToShow = () => {
    if (typeof window === 'undefined') return 4

    const width = window.innerWidth
    if (width < 640) return 1 // mobile
    if (width < 768) return 1.2 // small mobile (partial next card visible)
    if (width < 1024) return 2 // tablet
    if (width < 1280) return 3 // small desktop
    if (width < 1536) return 4 // desktop
    return 4 // large desktop
  }

  useEffect(() => {
    const handleResize = () => {
      setCardsToShow(getCardsToShow())
      // Reset to first slide on resize to avoid layout issues
      setCurrentIndex(0)
    }

    window.addEventListener('resize', handleResize)
    handleResize() // Initialize
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const totalSlides = Math.ceil(properties.length / cardsToShow)

  // Enhanced auto-play with cleanup
  useEffect(() => {
    if (!autoPlay || isPaused || properties.length <= cardsToShow) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      return
    }

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === totalSlides - 1 ? 0 : prevIndex + 1
      )
    }, autoPlayInterval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [
    autoPlay,
    autoPlayInterval,
    isPaused,
    totalSlides,
    cardsToShow,
    properties.length,
  ])

  const nextSlide = () => {
    setCurrentIndex(currentIndex === totalSlides - 1 ? 0 : currentIndex + 1)
  }

  const prevSlide = () => {
    setCurrentIndex(currentIndex === 0 ? totalSlides - 1 : currentIndex - 1)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  // Enhanced touch/swipe support
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      nextSlide() // Swipe left
    }

    if (touchStart - touchEnd < -50) {
      prevSlide() // Swipe right
    }
  }

  if (properties.length === 0) {
    return (
      <section className=" bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="bg-gray-50 rounded-2xl p-12 border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No featured properties available
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Check back soon for new premium listings or browse all available
              properties.
            </p>
            <Button
              asChild
              className="mt-4 bg-emerald-600 hover:bg-emerald-700"
            >
              <Link href="/properties">Browse All Properties</Link>
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-linear-to-b from-white to-gray-50/30">
      <div className="max-w-7xl mx-auto px-4">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12">
          <div className="flex-1 mb-6 lg:mb-0">
            {showFeaturedBadge && (
              <div className="inline-flex items-center gap-2 bg-linear-to-r from-amber-400 to-amber-500 text-white px-4 py-2 rounded-full text-xs font-medium mb-4">
                <Crown className="h-4 w-4 fill-current" />
                Premium
              </div>
            )}
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
              {title}
            </h2>
            <p className="text-gray-600 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Enhanced Navigation */}
          <div className="flex items-center gap-4">
            {/* View All Button */}
            <Button
              asChild
              variant="outline"
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all duration-300 group"
            >
              <a href={viewAllLink} className="flex items-center text-xs gap-2">
                <span>View All</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>

            {/* Navigation Arrows */}
            {properties.length > cardsToShow && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevSlide}
                  className="w-10 h-10 rounded-xl border-gray-300 hover:border-emerald-600 hover:bg-emerald-50 transition-all duration-300"
                  aria-label="Previous properties"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextSlide}
                  className="w-10 h-10 rounded-xl border-gray-300 hover:border-emerald-600 hover:bg-emerald-50 transition-all duration-300"
                  aria-label="Next properties"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Carousel Container */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Gradient Overlays for better UX */}
          <div
            className="hidden lg:absolute lg:left-0 lg:top-0 lg:bottom-0 lg:w-8 lg:bg-linear-to-r lg:from-gray-50 lg:to-transparent 
            lg:z-10 lg:pointer-events-none"
          />
          <div
            className="hidden lg:absolute lg:right-0 lg:top-0 lg:bottom-0 lg:w-8 lg:bg-linear-to-l lg:from-gray-50 lg:to-transparent 
            lg:z-10 lg:pointer-events-none"
          />

          {/* Carousel */}
          <div ref={carouselRef} className="overflow-hidden">
            <div
              className="flex gap-4 transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / cardsToShow)}%)`,
              }}
            >
              {properties.map((property, index) => (
                <div
                  key={property.$id}
                  className="shrink-0 transition-all duration-300 hover:scale-[1.02]"
                  style={{ width: `${100 / cardsToShow}%` }}
                >
                  <PropertyCard
                    property={property}
                    userId={userId}
                    featured={property.isFeatured}
                    priority={index < 4} // Load first 4 images eagerly
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Dot Indicators */}
          {totalSlides > 1 && (
            <div className="flex sm:hidden justify-center items-center gap-2 mt-8">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-emerald-600 w-6'
                      : 'bg-gray-300'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {autoPlay && properties.length > cardsToShow && (
          <div className="mt-8">
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div
                className="bg-emerald-600 h-1 rounded-full transition-all duration-1000 ease-linear"
                style={{
                  width: `${((currentIndex + 1) / totalSlides) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
