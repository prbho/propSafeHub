'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Property } from '@/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

import PropertyCard from './PropertyCard'

interface PropertyCarouselProps {
  properties: Property[]
  title?: string
  userId: string
  viewAllLink?: string
}

export default function PropertyCarousel({
  properties,
  title = 'Featured Properties',
  userId,
  viewAllLink = '/properties',
}: PropertyCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [columns, setColumns] = useState(4)

  // Responsive columns
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth
      if (width < 640) setColumns(1)
      else if (width < 768) setColumns(2)
      else if (width < 1024) setColumns(3)
      else setColumns(4)
    }

    updateColumns()
    window.addEventListener('resize', updateColumns)
    return () => window.removeEventListener('resize', updateColumns)
  }, [])

  const totalPages = useMemo(
    () => Math.ceil(properties.length / columns),
    [properties.length, columns]
  )

  // Get visible properties with wrap-around
  const visibleProperties = useMemo(() => {
    const start = currentIndex * columns
    const end = start + columns

    // If we need more properties than available, wrap around to beginning
    if (end > properties.length) {
      const needed = end - properties.length
      return [...properties.slice(start), ...properties.slice(0, needed)]
    }

    return properties.slice(start, end)
  }, [properties, currentIndex, columns])

  const hasMultiplePages = properties.length > columns

  const handleNext = () => {
    setCurrentIndex((prev) => {
      if (prev >= totalPages - 1) return 0
      return prev + 1
    })
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => {
      if (prev <= 0) return totalPages - 1
      return prev - 1
    })
  }

  if (properties.length === 0) return null

  return (
    <div className="py-12 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-end md:items-center justify-between mb-8">
          <h2 className="text-lg md:text-2xl font-bold text-gray-900">
            {title}
          </h2>
          <div className="flex items-center flex-col sm:flex-row gap-1 md:gap-4">
            {hasMultiplePages && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrev}
                  className="h-9 w-9 hover:bg-gray-100"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600 min-w-[60px] text-center">
                  {currentIndex + 1} / {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNext}
                  className="h-9 w-9 hover:bg-gray-100"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
            <Button
              asChild
              variant="ghost"
              className="text-gray-700 hover:text-gray-900"
            >
              <Link href={viewAllLink}>View all →</Link>
            </Button>
          </div>
        </div>

        {/* Properties Grid */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`}
        >
          {visibleProperties.map((property) => (
            <PropertyCard
              key={property.$id}
              property={property}
              userId={userId}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
