'use client'

import { useEffect, useState } from 'react'
import { Property } from '@/types'

import PropertyCarousel from './PropertyCarousel'
import PropertyCarouselLoading from './PropertyCarouselLoading'

export default function FeaturedPropertiesCarousel() {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        const response = await fetch('/api/properties?isFeatured=true&limit=12')
        if (response.ok) {
          const data = await response.json()
          setFeaturedProperties(data.documents || [])
        }
      } catch (error) {
        console.error('Error fetching featured properties:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProperties()
  }, [])

  if (loading) {
    return <PropertyCarouselLoading />
  }

  if (featuredProperties.length === 0) {
    return null // Don't show if no featured properties
  }

  return (
    <PropertyCarousel
      properties={featuredProperties}
      title="Featured Properties"
      subtitle="Discover our hand-picked selection of premium properties across Nigeria"
      autoPlay={false}
      autoPlayInterval={5000}
    />
  )
}
